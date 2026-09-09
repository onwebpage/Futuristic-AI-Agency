import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { supabase } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
import { requireUserAuth } from "./user.js";
import {
  Client,
  CheckoutPaymentIntent,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";

// Billing-specific PayPal controller — independent of the plan-purchase paypal.ts
// (paypal.ts must NOT be modified per project constraints)
let _billingOrdersController: OrdersController | undefined;
function getBillingPayPalController(): OrdersController {
  if (_billingOrdersController) return _billingOrdersController;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal is not configured");
  const env = (process.env.PAYPAL_ENVIRONMENT ?? (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase();
  if (env !== "production" && env !== "sandbox") throw new Error("Invalid PAYPAL_ENVIRONMENT");
  const ppClient = new Client({
    clientCredentialsAuthCredentials: { oAuthClientId: clientId, oAuthClientSecret: clientSecret },
    timeout: 0,
    environment: env === "production" ? Environment.Production : Environment.Sandbox,
    logging: { logLevel: LogLevel.Info, logRequest: { logBody: false }, logResponse: { logHeaders: false } },
  });
  _billingOrdersController = new OrdersController(ppClient);
  return _billingOrdersController;
}

const router: IRouter = Router();

// ─── Constants ────────────────────────────────────────────────────────────────
const INVOICE_STATUSES = ["draft", "sent", "pending_payment", "partially_paid", "paid", "overdue", "cancelled", "refunded"] as const;
const PAYABLE_STATUSES: string[] = ["sent", "pending_payment", "partially_paid", "overdue"];
const EDITABLE_STATUSES: string[] = ["draft"];
const SENDABLE_STATUSES: string[] = ["draft"];
const CANCELLABLE_STATUSES: string[] = ["draft", "sent", "pending_payment", "partially_paid", "overdue"];
const PAYMENT_METHODS = ["paypal", "manual", "bank_transfer", "wallet", "other"] as const;
const CURRENCIES = ["USD"] as const; // extend when multi-currency is needed

type UserRequest = Request & { user?: { id: string; email: string } };
type AdminRequest = Request & { admin?: { id: number; username: string } };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fail(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, error: message, message });
}

function numId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function safeDecimal(value: unknown, allowZero = true): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!allowZero && n <= 0) return null;
  if (n < 0) return null;
  return n;
}

async function billingModuleGuard(_req: Request, res: Response, next: NextFunction) {
  try {
    const { data } = await supabase.from("module_settings").select("enabled").eq("module_key", "billing").maybeSingle();
    if (data?.enabled === false) return fail(res, 503, "Billing is currently disabled");
    return next();
  } catch {
    return res.status(500).json({ error: "Unable to verify billing module" });
  }
}

async function clientBillingGuard(req: UserRequest, res: Response, next: NextFunction) {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", req.user!.id).maybeSingle();
  if (error) return res.status(500).json({ error: "Unable to verify billing access" });
  if (data?.role === "partner" || data?.role === "bpo_partner") return fail(res, 403, "Partner users cannot access client billing data");
  return next();
}

async function audit(
  actor: { userId?: string; adminId?: number },
  action: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("audit_logs").insert({
    actor_user_id: actor.userId ?? null,
    actor_admin_id: actor.adminId ?? null,
    action,
    entity_type: "invoice",
    entity_id: entityId,
    metadata,
  }).throwOnError();
}

async function notifyUser(userId: string, type: string, title: string, body: string, entityId: string) {
  await supabase.from("notifications").insert({
    recipient_user_id: userId,
    type,
    title,
    body,
    entity_type: "invoice",
    entity_id: entityId,
  });
}

async function notifyAdmins(type: string, title: string, body: string, entityId: string) {
  const { data } = await supabase.from("admin_users").select("id");
  if (data?.length) {
    await supabase.from("notifications").insert(
      data.map((a: any) => ({
        recipient_admin_id: a.id,
        type,
        title,
        body,
        entity_type: "invoice",
        entity_id: entityId,
      }))
    );
  }
}

// Recalculate invoice totals server-side (calls the DB function)
async function recalcTotals(invoiceId: number) {
  await supabase.rpc("recalculate_invoice_totals", { p_invoice_id: invoiceId });
}

// Mark overdue invoices (called on every list fetch)
async function markOverdue() {
  await supabase.rpc("mark_overdue_invoices");
}

// Fetch a complete invoice (with items + payments) scoped to a client
async function getClientInvoice(invoiceId: number, clientId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), invoice_payments(*), invoice_receipts(*)")
    .eq("id", invoiceId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Fetch a complete invoice (admin — no client scope)
async function getAdminInvoice(invoiceId: number) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), invoice_payments(*), invoice_receipts(*)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Strip internal_notes from a client-facing invoice object
function clientSafeInvoice(inv: any) {
  if (!inv) return inv;
  const { internal_notes: _internal, ...safe } = inv;
  return safe;
}

// Generate a unique receipt number: RCP-YYYY-XXXXXXXX
function makeReceiptNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 1e8).toString().padStart(8, "0");
  return `RCP-${year}-${rand}`;
}

// After a payment is recorded as successful, recalculate amount_paid on the invoice
// and transition status accordingly, then create a receipt
async function finalizePayment(invoiceId: number, paymentId: number, amount: number, clientId: string) {
  // Sum all successful payments
  const { data: payments } = await supabase
    .from("invoice_payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .eq("status", "successful");

  const totalPaid = (payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);

  const { data: inv } = await supabase
    .from("invoices")
    .select("total, status")
    .eq("id", invoiceId)
    .single();

  if (!inv) return;

  const total = Number(inv.total);
  let newStatus: string;
  if (totalPaid >= total) {
    newStatus = "paid";
  } else if (totalPaid > 0) {
    newStatus = "partially_paid";
  } else {
    newStatus = inv.status;
  }

  const paidAt = newStatus === "paid" ? new Date().toISOString() : undefined;

  await supabase
    .from("invoices")
    .update({
      amount_paid: totalPaid,
      status: newStatus,
      ...(paidAt ? { paid_at: paidAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  // Create receipt for this payment
  let receiptNumber = makeReceiptNumber();
  // Retry on unlikely collision
  for (let i = 0; i < 3; i++) {
    const { data: receipt, error: rErr } = await supabase
      .from("invoice_receipts")
      .insert({
        receipt_number: receiptNumber,
        invoice_id: invoiceId,
        payment_id: paymentId,
        client_id: clientId,
        amount,
        currency: "USD",
      })
      .select()
      .single();
    if (!rErr && receipt) break;
    receiptNumber = makeReceiptNumber();
  }

  return newStatus;
}

// ─── User / Client Routes ─────────────────────────────────────────────────────

// GET /invoices — list client's own invoices
router.get("/invoices", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    await markOverdue();
    let query = supabase
      .from("invoices")
      .select("id,invoice_number,project_id,invoice_date,due_date,currency,subtotal,tax_amount,discount_amount,total,amount_paid,balance_due,status,sent_at,paid_at,notes,created_at")
      .eq("client_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (typeof req.query.status === "string" && INVOICE_STATUSES.includes(req.query.status as any)) {
      query = query.eq("status", req.query.status);
    }
    if (typeof req.query.projectId === "string" && numId(req.query.projectId)) {
      query = query.eq("project_id", numId(req.query.projectId)!);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load invoices", details: e?.message });
  }
});

// GET /invoices/summary — billing summary cards for the client
router.get("/invoices/summary", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    await markOverdue();
    const { data, error } = await supabase
      .from("invoices")
      .select("total,amount_paid,balance_due,status")
      .eq("client_id", req.user!.id);
    if (error) throw error;

    const rows = data || [];
    const summary = {
      totalBilled: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      outstandingBalance: 0,
      invoiceCount: rows.length,
    };

    for (const r of rows) {
      const total = Number(r.total);
      const paid = Number(r.amount_paid);
      const balance = Number(r.balance_due);
      if (r.status !== "cancelled" && r.status !== "draft") {
        summary.totalBilled += total;
        summary.totalPaid += paid;
      }
      if (r.status === "overdue") summary.totalOverdue += balance;
      if (["sent", "pending_payment", "partially_paid"].includes(r.status)) summary.totalPending += balance;
      if (!["cancelled", "paid", "refunded", "draft"].includes(r.status)) summary.outstandingBalance += balance;
    }

    res.json(summary);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load billing summary", details: e?.message });
  }
});

// GET /invoices/:id — invoice detail (client)
router.get("/invoices/:id", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");
    const inv = await getClientInvoice(invoiceId, req.user!.id);
    if (!inv) return fail(res, 404, "Invoice not found");
    res.json(clientSafeInvoice(inv));
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load invoice", details: e?.message });
  }
});

// GET /invoices/:id/payments — payment history for an invoice (client)
router.get("/invoices/:id/payments", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");
    // IDOR: verify ownership first
    const inv = await getClientInvoice(invoiceId, req.user!.id);
    if (!inv) return fail(res, 404, "Invoice not found");

    const { data, error } = await supabase
      .from("invoice_payments")
      .select("id,amount,currency,payment_method,gateway,gateway_order_id,reference,status,paid_at,notes,created_at")
      .eq("invoice_id", invoiceId)
      .eq("client_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load payment history", details: e?.message });
  }
});

// GET /invoices/:id/receipts — receipts for an invoice (client)
router.get("/invoices/:id/receipts", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");
    const inv = await getClientInvoice(invoiceId, req.user!.id);
    if (!inv) return fail(res, 404, "Invoice not found");

    const { data, error } = await supabase
      .from("invoice_receipts")
      .select("*")
      .eq("invoice_id", invoiceId)
      .eq("client_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load receipts", details: e?.message });
  }
});

// GET /receipts/:id — single receipt (client)
router.get("/receipts/:id", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const receiptId = numId(req.params.id);
    if (!receiptId) return fail(res, 400, "Invalid receipt ID");
    const { data, error } = await supabase
      .from("invoice_receipts")
      .select("*, invoices(invoice_number,invoice_date,due_date,notes), invoice_payments(payment_method,gateway,reference,paid_at)")
      .eq("id", receiptId)
      .eq("client_id", req.user!.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(res, 404, "Receipt not found");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load receipt", details: e?.message });
  }
});

// POST /invoices/:id/pay/paypal — initiate a PayPal payment for an invoice
router.post("/invoices/:id/pay/paypal", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");

    // IDOR + ownership
    const inv = await getClientInvoice(invoiceId, req.user!.id);
    if (!inv) return fail(res, 404, "Invoice not found");
    if (!PAYABLE_STATUSES.includes(inv.status)) return fail(res, 409, `Invoice cannot be paid in status: ${inv.status}`);
    if (Number(inv.balance_due) <= 0) return fail(res, 409, "Invoice balance is already zero");
    if (inv.currency !== "USD") return fail(res, 422, "Only USD invoices can be paid via PayPal");

    // Amount to pay — either full balance_due or partial amount from body
    const bodyAmount = safeDecimal(req.body?.amount, false);
    const payableAmount = bodyAmount !== null
      ? Math.min(bodyAmount, Number(inv.balance_due))
      : Number(inv.balance_due);

    if (payableAmount <= 0) return fail(res, 400, "Payment amount must be greater than zero");
    if (payableAmount > Number(inv.balance_due)) return fail(res, 422, "Payment amount exceeds invoice balance");

    // Try to use PayPal
    let ordersController: OrdersController;
    try {
      ordersController = getBillingPayPalController();
    } catch {
      return fail(res, 503, "PayPal is not configured. Please use manual payment or contact support.");
    }

    const { body: orderBody, statusCode } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
          customId: `inv-${inv.id}`,
          description: `Invoice ${inv.invoice_number}`,
          amount: {
            currencyCode: "USD",
            value: payableAmount.toFixed(2),
          },
        }],
      },
      prefer: "return=representation",
    });

    const order = typeof orderBody === "string" ? JSON.parse(orderBody) : orderBody;
    if (!order?.id) return fail(res, 502, "PayPal did not return an order ID");

    // Create initiated payment record
    const { data: payment, error: pErr } = await supabase
      .from("invoice_payments")
      .insert({
        invoice_id: invoiceId,
        client_id: req.user!.id,
        amount: payableAmount,
        currency: "USD",
        payment_method: "paypal",
        gateway: "paypal",
        gateway_order_id: order.id,
        status: "initiated",
      })
      .select()
      .single();
    if (pErr) throw pErr;

    await audit({ userId: req.user!.id }, "payment_initiated", String(invoiceId), {
      paymentId: payment.id,
      orderId: order.id,
      amount: payableAmount,
    });

    res.status(statusCode ?? 201).json({
      orderId: order.id,
      paymentId: payment.id,
      amount: payableAmount.toFixed(2),
      currency: "USD",
    });
  } catch (e: any) {
    console.error("[billing] PayPal initiate error:", e?.message);
    res.status(502).json({ error: "Unable to initiate payment. Please try again.", details: e?.message });
  }
});

// POST /invoices/:id/pay/paypal/:orderId/capture — capture a PayPal payment for an invoice
router.post("/invoices/:id/pay/paypal/:orderId/capture", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    const orderId = typeof req.params.orderId === "string" ? req.params.orderId : "";
    if (!invoiceId || !orderId) return fail(res, 400, "Invalid invoice or order ID");

    // IDOR
    const inv = await getClientInvoice(invoiceId, req.user!.id);
    if (!inv) return fail(res, 404, "Invoice not found");

    // Find the pending payment record — must belong to this invoice + client + orderId
    const { data: payment, error: pErr } = await supabase
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .eq("client_id", req.user!.id)
      .eq("gateway_order_id", orderId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!payment) return fail(res, 404, "Payment record not found");

    // Idempotency — already captured
    if (payment.status === "successful") {
      return res.json({ success: true, status: "successful", paymentId: payment.id, alreadyCaptured: true });
    }
    if (payment.status === "failed" || payment.status === "cancelled") {
      return fail(res, 409, `Payment is already in status: ${payment.status}`);
    }

    let ordersController: OrdersController;
    try {
      ordersController = getBillingPayPalController();
    } catch {
      return fail(res, 503, "PayPal is not configured");
    }

    // Verify the PayPal order before capturing
    const { body: orderBody } = await ordersController.getOrder({ id: orderId });
    const approvedOrder = typeof orderBody === "string" ? JSON.parse(orderBody) : orderBody;
    const unit = approvedOrder?.purchase_units?.[0];

    if (
      approvedOrder?.status !== "APPROVED" ||
      unit?.custom_id !== `inv-${inv.id}` ||
      unit?.amount?.value !== Number(payment.amount).toFixed(2) ||
      unit?.amount?.currency_code !== "USD"
    ) {
      await supabase.from("invoice_payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
      return fail(res, 409, "Payment order verification failed");
    }

    // Capture
    const { body: captureBody } = await ordersController.captureOrder({ id: orderId, prefer: "return=representation" });
    const captured = typeof captureBody === "string" ? JSON.parse(captureBody) : captureBody;
    const captureUnit = captured?.purchase_units?.[0];
    const captureRecord = captureUnit?.payments?.captures?.[0];

    if (
      captured?.status !== "COMPLETED" ||
      captureRecord?.status !== "COMPLETED" ||
      captureUnit?.custom_id !== `inv-${inv.id}` ||
      captureRecord?.amount?.value !== Number(payment.amount).toFixed(2) ||
      captureRecord?.amount?.currency_code !== "USD"
    ) {
      await supabase.from("invoice_payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", payment.id);
      await audit({ userId: req.user!.id }, "payment_failed", String(invoiceId), { paymentId: payment.id, orderId });
      await notifyUser(req.user!.id, "payment_failed", "Payment failed", `Payment for invoice ${inv.invoice_number} could not be completed`, String(invoiceId));
      return fail(res, 502, "Payment capture verification failed");
    }

    // Mark payment successful
    const now = new Date().toISOString();
    await supabase.from("invoice_payments").update({
      status: "successful",
      gateway_capture_id: captureRecord.id,
      paid_at: now,
      updated_at: now,
    }).eq("id", payment.id);

    // Update invoice totals + status + create receipt
    const newStatus = await finalizePayment(invoiceId, payment.id, Number(payment.amount), req.user!.id);

    await audit({ userId: req.user!.id }, "payment_successful", String(invoiceId), {
      paymentId: payment.id,
      amount: payment.amount,
      captureId: captureRecord.id,
    });

    await notifyUser(req.user!.id, "payment_successful", "Payment successful", `Payment of $${Number(payment.amount).toFixed(2)} received for invoice ${inv.invoice_number}`, String(invoiceId));
    await notifyAdmins("payment_received", "Payment received", `$${Number(payment.amount).toFixed(2)} received for invoice ${inv.invoice_number}`, String(invoiceId));

    res.json({
      success: true,
      status: "successful",
      paymentId: payment.id,
      captureId: captureRecord.id,
      amount: Number(payment.amount).toFixed(2),
      invoiceStatus: newStatus,
    });
  } catch (e: any) {
    console.error("[billing] PayPal capture error:", e?.message);
    res.status(502).json({ error: "Payment capture failed. Please contact support.", details: e?.message });
  }
});

// GET /billing/payments — payment history across all invoices for authenticated client
router.get("/billing/payments", requireUserAuth, clientBillingGuard, billingModuleGuard, async (req: UserRequest, res) => {
  try {
    const { data, error } = await supabase
      .from("invoice_payments")
      .select("id,invoice_id,amount,currency,payment_method,gateway,gateway_order_id,reference,status,paid_at,notes,created_at,invoices(invoice_number)")
      .eq("client_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load payment history", details: e?.message });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /admin/invoices — list all invoices with filters
router.get("/admin/invoices", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    await markOverdue();
    let query = supabase
      .from("invoices")
      .select("id,invoice_number,client_id,project_id,invoice_date,due_date,currency,subtotal,tax_amount,discount_amount,total,amount_paid,balance_due,status,sent_at,paid_at,created_at,created_by_admin_id")
      .order("created_at", { ascending: false });

    if (typeof req.query.clientId === "string") query = query.eq("client_id", req.query.clientId);
    if (typeof req.query.projectId === "string" && numId(req.query.projectId)) query = query.eq("project_id", numId(req.query.projectId)!);
    if (typeof req.query.status === "string" && INVOICE_STATUSES.includes(req.query.status as any)) query = query.eq("status", req.query.status);
    if (typeof req.query.search === "string" && req.query.search.trim()) query = query.ilike("invoice_number", `%${req.query.search.trim()}%`);
    if (typeof req.query.from === "string") query = query.gte("invoice_date", req.query.from);
    if (typeof req.query.to === "string") query = query.lte("invoice_date", req.query.to);

    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load invoices", details: e?.message });
  }
});

// GET /admin/invoices/metrics — billing dashboard metrics
router.get("/admin/invoices/metrics", requireAuth, billingModuleGuard, async (_req: AdminRequest, res) => {
  try {
    await markOverdue();
    const { data, error } = await supabase
      .from("invoices")
      .select("total,amount_paid,balance_due,status");
    if (error) throw error;

    const rows = data || [];
    const metrics = {
      totalInvoiced: 0,
      totalCollected: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      partiallyPaidCount: 0,
      draftCount: 0,
      paidCount: 0,
      cancelledCount: 0,
    };

    for (const r of rows) {
      const total = Number(r.total);
      const paid = Number(r.amount_paid);
      const balance = Number(r.balance_due);
      if (!["draft", "cancelled"].includes(r.status)) metrics.totalInvoiced += total;
      if (["paid", "partially_paid"].includes(r.status)) metrics.totalCollected += paid;
      if (["sent", "pending_payment", "partially_paid"].includes(r.status)) metrics.pendingAmount += balance;
      if (r.status === "overdue") { metrics.overdueAmount += balance; metrics.pendingAmount += balance; }
      if (r.status === "partially_paid") metrics.partiallyPaidCount++;
      if (r.status === "draft") metrics.draftCount++;
      if (r.status === "paid") metrics.paidCount++;
      if (r.status === "cancelled") metrics.cancelledCount++;
    }

    // Recent payments
    const { data: recentPayments } = await supabase
      .from("invoice_payments")
      .select("id,invoice_id,client_id,amount,currency,payment_method,status,paid_at,created_at,invoices(invoice_number)")
      .eq("status", "successful")
      .order("paid_at", { ascending: false })
      .limit(10);

    // Failed payments
    const { data: failedPayments } = await supabase
      .from("invoice_payments")
      .select("id,invoice_id,client_id,amount,currency,payment_method,status,created_at,invoices(invoice_number)")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(10);

    res.json({ ...metrics, recentPayments: recentPayments || [], failedPayments: failedPayments || [] });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load billing metrics", details: e?.message });
  }
});

// GET /admin/invoices/report — billing report with filters
router.get("/admin/invoices/report", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    await markOverdue();
    let invQuery = supabase
      .from("invoices")
      .select("id,invoice_number,client_id,project_id,invoice_date,due_date,total,amount_paid,balance_due,status,currency");

    if (typeof req.query.clientId === "string") invQuery = invQuery.eq("client_id", req.query.clientId);
    if (typeof req.query.projectId === "string" && numId(req.query.projectId)) invQuery = invQuery.eq("project_id", numId(req.query.projectId)!);
    if (typeof req.query.status === "string" && INVOICE_STATUSES.includes(req.query.status as any)) invQuery = invQuery.eq("status", req.query.status);
    if (typeof req.query.from === "string") invQuery = invQuery.gte("invoice_date", req.query.from);
    if (typeof req.query.to === "string") invQuery = invQuery.lte("invoice_date", req.query.to);

    const { data: invoices, error } = await invQuery.order("invoice_date", { ascending: false }).limit(500);
    if (error) throw error;

    const rows = invoices || [];
    const totals = {
      invoicedAmount: rows.reduce((s, r) => s + Number(r.total), 0),
      collectedAmount: rows.reduce((s, r) => s + Number(r.amount_paid), 0),
      outstandingAmount: rows.filter(r => !["paid","cancelled","refunded"].includes(r.status)).reduce((s, r) => s + Number(r.balance_due), 0),
      overdueAmount: rows.filter(r => r.status === "overdue").reduce((s, r) => s + Number(r.balance_due), 0),
    };

    res.json({ totals, invoices: rows });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to generate billing report", details: e?.message });
  }
});

// GET /admin/invoices/:id — full invoice detail (admin)
router.get("/admin/invoices/:id", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");
    const inv = await getAdminInvoice(invoiceId);
    if (!inv) return fail(res, 404, "Invoice not found");
    res.json(inv);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load invoice", details: e?.message });
  }
});

// POST /admin/invoices — create a new invoice
router.post("/admin/invoices", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const {
      clientId,
      projectId,
      invoiceDate,
      dueDate,
      currency = "USD",
      taxRate = 0,
      discountAmount = 0,
      notes,
      terms,
      internalNotes,
      items = [],
      relatedTicketId,
      purchaseId,
    } = req.body ?? {};

    // Validate client
    if (typeof clientId !== "string" || !clientId) return fail(res, 400, "Client ID is required");
    const { data: clientProfile } = await supabase.from("profiles").select("id,full_name,email").eq("id", clientId).maybeSingle();
    if (!clientProfile) return fail(res, 404, "Client not found");

    // Validate dates
    if (!invoiceDate || !dueDate) return fail(res, 400, "Invoice date and due date are required");
    if (new Date(dueDate) < new Date(invoiceDate)) return fail(res, 400, "Due date must be on or after invoice date");

    // Validate currency
    if (!CURRENCIES.includes(currency)) return fail(res, 422, "Only USD invoices are supported");

    // Validate tax / discount
    const taxRateNum = safeDecimal(taxRate);
    if (taxRateNum === null || taxRateNum > 1) return fail(res, 400, "Tax rate must be between 0 and 1 (e.g. 0.1 for 10%)");
    const discountNum = safeDecimal(discountAmount);
    if (discountNum === null) return fail(res, 400, "Discount must be a non-negative number");

    // Validate items
    if (!Array.isArray(items) || items.length === 0) return fail(res, 400, "At least one line item is required");
    for (const item of items) {
      if (!item.description?.trim()) return fail(res, 400, "Each line item must have a description");
      if (safeDecimal(item.quantity, false) === null) return fail(res, 400, "Each line item must have a positive quantity");
      if (safeDecimal(item.unitPrice) === null) return fail(res, 400, "Each line item must have a valid unit price");
    }

    // Validate project ownership
    if (projectId) {
      const projId = numId(projectId);
      if (!projId) return fail(res, 400, "Invalid project ID");
      const { data: project } = await supabase.from("projects").select("id,client_id").eq("id", projId).maybeSingle();
      if (!project) return fail(res, 404, "Project not found");
      if (project.client_id !== clientId) return fail(res, 403, "Project does not belong to the specified client");
    }

    // Create the invoice (totals will be calculated below)
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        client_id: clientId,
        project_id: numId(projectId) ?? null,
        related_ticket_id: numId(relatedTicketId) ?? null,
        purchase_id: numId(purchaseId) ?? null,
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency,
        tax_rate: taxRateNum,
        discount_amount: discountNum,
        notes: notes?.trim() || null,
        terms: terms?.trim() || null,
        internal_notes: internalNotes?.trim() || null,
        status: "draft",
        created_by_admin_id: req.admin!.id,
        updated_by_admin_id: req.admin!.id,
      })
      .select()
      .single();
    if (invErr) throw invErr;

    // Insert line items
    const itemRows = items.map((item: any, index: number) => ({
      invoice_id: invoice.id,
      sort_order: index,
      description: String(item.description).trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice),
      line_total: Math.round(Number(item.quantity) * Number(item.unitPrice) * 100) / 100,
    }));
    const { error: itemErr } = await supabase.from("invoice_items").insert(itemRows);
    if (itemErr) throw itemErr;

    // Server-side total recalculation via DB function
    await recalcTotals(invoice.id);

    const created = await getAdminInvoice(invoice.id);
    await audit({ adminId: req.admin!.id }, "invoice_created", String(invoice.id), {
      clientId,
      invoiceNumber: invoice.invoice_number,
    });

    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to create invoice", details: e?.message });
  }
});

// PATCH /admin/invoices/:id — edit a draft invoice
router.patch("/admin/invoices/:id", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");

    const { data: existing } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
    if (!existing) return fail(res, 404, "Invoice not found");
    if (!EDITABLE_STATUSES.includes(existing.status)) return fail(res, 409, `Cannot edit invoice in status: ${existing.status}`);

    const { dueDate, invoiceDate, taxRate, discountAmount, notes, terms, internalNotes, items } = req.body ?? {};

    const patch: Record<string, unknown> = { updated_by_admin_id: req.admin!.id };
    if (invoiceDate !== undefined) patch.invoice_date = invoiceDate;
    if (dueDate !== undefined) {
      const effectiveInvoiceDate = invoiceDate ?? existing.invoice_date;
      if (new Date(dueDate) < new Date(effectiveInvoiceDate)) return fail(res, 400, "Due date must be on or after invoice date");
      patch.due_date = dueDate;
    }
    if (taxRate !== undefined) {
      const r = safeDecimal(taxRate);
      if (r === null || r > 1) return fail(res, 400, "Tax rate must be between 0 and 1");
      patch.tax_rate = r;
    }
    if (discountAmount !== undefined) {
      const d = safeDecimal(discountAmount);
      if (d === null) return fail(res, 400, "Discount must be non-negative");
      patch.discount_amount = d;
    }
    if (notes !== undefined) patch.notes = notes?.trim() || null;
    if (terms !== undefined) patch.terms = terms?.trim() || null;
    if (internalNotes !== undefined) patch.internal_notes = internalNotes?.trim() || null;

    const { error: invoiceUpdateError } = await supabase.from("invoices").update(patch).eq("id", invoiceId);
    if (invoiceUpdateError) throw invoiceUpdateError;

    // Replace line items if provided
    if (Array.isArray(items)) {
      if (items.length === 0) return fail(res, 400, "At least one line item is required");
      for (const item of items) {
        if (!item.description?.trim()) return fail(res, 400, "Each item must have a description");
        if (safeDecimal(item.quantity, false) === null) return fail(res, 400, "Each item must have a positive quantity");
        if (safeDecimal(item.unitPrice) === null) return fail(res, 400, "Each item must have a valid unit price");
      }
      const { error: deleteItemsError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
      if (deleteItemsError) throw deleteItemsError;
      const { error: insertItemsError } = await supabase.from("invoice_items").insert(
        items.map((item: any, i: number) => ({
          invoice_id: invoiceId,
          sort_order: i,
          description: String(item.description).trim(),
          quantity: Number(item.quantity),
          unit_price: Number(item.unitPrice),
          line_total: Math.round(Number(item.quantity) * Number(item.unitPrice) * 100) / 100,
        }))
      );
      if (insertItemsError) throw insertItemsError;
    }

    await recalcTotals(invoiceId);
    const updated = await getAdminInvoice(invoiceId);
    await audit({ adminId: req.admin!.id }, "invoice_updated", String(invoiceId), { changes: Object.keys(patch) });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to update invoice", details: e?.message });
  }
});

// POST /admin/invoices/:id/send — send a draft invoice to the client
router.post("/admin/invoices/:id/send", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");

    const { data: existing } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
    if (!existing) return fail(res, 404, "Invoice not found");
    if (!SENDABLE_STATUSES.includes(existing.status)) return fail(res, 409, `Invoice is already in status: ${existing.status}`);
    if (Number(existing.total) <= 0) return fail(res, 422, "Cannot send an invoice with zero total");

    const now = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_at: now,
        updated_by_admin_id: req.admin!.id,
        updated_at: now,
      })
      .eq("id", invoiceId)
      .select()
      .single();
    if (error) throw error;

    await notifyUser(
      existing.client_id,
      "invoice_sent",
      "New invoice",
      `Invoice ${existing.invoice_number} for $${Number(existing.total).toFixed(2)} is ready for payment. Due: ${existing.due_date}`,
      String(invoiceId)
    );

    await audit({ adminId: req.admin!.id }, "invoice_sent", String(invoiceId), { invoiceNumber: existing.invoice_number });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to send invoice", details: e?.message });
  }
});

// POST /admin/invoices/:id/cancel — cancel an invoice
router.post("/admin/invoices/:id/cancel", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");

    const { data: existing } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
    if (!existing) return fail(res, 404, "Invoice not found");
    if (!CANCELLABLE_STATUSES.includes(existing.status)) return fail(res, 409, `Cannot cancel invoice in status: ${existing.status}`);

    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : null;
    const now = new Date().toISOString();
    await supabase.from("invoices").update({
      status: "cancelled",
      cancelled_at: now,
      cancellation_reason: reason,
      updated_by_admin_id: req.admin!.id,
      updated_at: now,
    }).eq("id", invoiceId);

    await notifyUser(
      existing.client_id,
      "invoice_cancelled",
      "Invoice cancelled",
      `Invoice ${existing.invoice_number} has been cancelled`,
      String(invoiceId)
    );

    await audit({ adminId: req.admin!.id }, "invoice_cancelled", String(invoiceId), { reason });
    res.json({ success: true, invoiceId, status: "cancelled" });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to cancel invoice", details: e?.message });
  }
});

// POST /admin/invoices/:id/payments — record a manual / offline payment
router.post("/admin/invoices/:id/payments", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");

    const { data: existing } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
    if (!existing) return fail(res, 404, "Invoice not found");
    if (!PAYABLE_STATUSES.includes(existing.status)) return fail(res, 409, `Invoice cannot receive payments in status: ${existing.status}`);
    if (Number(existing.balance_due) <= 0) return fail(res, 409, "Invoice balance is already zero");

    const amount = safeDecimal(req.body?.amount, false);
    if (amount === null) return fail(res, 400, "Payment amount must be a positive number");
    if (amount > Number(existing.balance_due)) return fail(res, 422, `Amount ($${amount}) exceeds balance due ($${existing.balance_due})`);

    const paymentMethod = req.body?.paymentMethod ?? "manual";
    if (!PAYMENT_METHODS.includes(paymentMethod)) return fail(res, 400, "Invalid payment method");
    const reference = typeof req.body?.reference === "string" ? req.body.reference.trim() || null : null;
    const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() || null : null;

    const { data: payment, error: pErr } = await supabase
      .from("invoice_payments")
      .insert({
        invoice_id: invoiceId,
        client_id: existing.client_id,
        amount,
        currency: existing.currency,
        payment_method: paymentMethod,
        reference,
        status: "successful",
        paid_at: new Date().toISOString(),
        recorded_by_admin_id: req.admin!.id,
        notes,
      })
      .select()
      .single();
    if (pErr) throw pErr;

    const newStatus = await finalizePayment(invoiceId, payment.id, amount, existing.client_id);

    await notifyUser(
      existing.client_id,
      "payment_recorded",
      "Payment recorded",
      `A payment of $${amount.toFixed(2)} has been recorded for invoice ${existing.invoice_number}`,
      String(invoiceId)
    );
    await audit({ adminId: req.admin!.id }, "manual_payment_recorded", String(invoiceId), {
      paymentId: payment.id,
      amount,
      paymentMethod,
    });

    res.status(201).json({ payment, invoiceStatus: newStatus });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to record payment", details: e?.message });
  }
});

// GET /admin/invoices/:id/payments — all payments for an invoice (admin)
router.get("/admin/invoices/:id/payments", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const invoiceId = numId(req.params.id);
    if (!invoiceId) return fail(res, 400, "Invalid invoice ID");
    const inv = await getAdminInvoice(invoiceId);
    if (!inv) return fail(res, 404, "Invoice not found");

    const { data, error } = await supabase
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load payments", details: e?.message });
  }
});

// GET /admin/payments — all payments across all invoices
router.get("/admin/payments", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    let query = supabase
      .from("invoice_payments")
      .select("id,invoice_id,client_id,amount,currency,payment_method,gateway,reference,status,paid_at,created_at,invoices(invoice_number)")
      .order("created_at", { ascending: false });

    if (typeof req.query.status === "string") query = query.eq("status", req.query.status);
    if (typeof req.query.clientId === "string") query = query.eq("client_id", req.query.clientId);
    if (typeof req.query.method === "string") query = query.eq("payment_method", req.query.method);

    const limit = Math.min(Number(req.query.limit) || 100, 500);
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load payments", details: e?.message });
  }
});

// GET /admin/receipts/:id — get a receipt (admin)
router.get("/admin/receipts/:id", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const receiptId = numId(req.params.id);
    if (!receiptId) return fail(res, 400, "Invalid receipt ID");
    const { data, error } = await supabase
      .from("invoice_receipts")
      .select("*, invoices(invoice_number,invoice_date,due_date,notes,client_id), invoice_payments(payment_method,gateway,reference,paid_at)")
      .eq("id", receiptId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(res, 404, "Receipt not found");
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load receipt", details: e?.message });
  }
});

// GET /admin/billing/client/:clientId — full billing history for a specific client
router.get("/admin/billing/client/:clientId", requireAuth, billingModuleGuard, async (req: AdminRequest, res) => {
  try {
    const clientId = req.params.clientId;
    if (!clientId) return fail(res, 400, "Client ID required");

    await markOverdue();
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("id,invoice_number,project_id,invoice_date,due_date,total,amount_paid,balance_due,status,currency,sent_at,paid_at,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: payments } = await supabase
      .from("invoice_payments")
      .select("id,invoice_id,amount,currency,payment_method,status,paid_at,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(50);

    const summary = {
      totalInvoiced: (invoices || []).filter(i => i.status !== "draft" && i.status !== "cancelled").reduce((s, i) => s + Number(i.total), 0),
      totalPaid: (invoices || []).reduce((s, i) => s + Number(i.amount_paid), 0),
      outstanding: (invoices || []).filter(i => !["paid","cancelled","refunded","draft"].includes(i.status)).reduce((s, i) => s + Number(i.balance_due), 0),
    };

    res.json({ summary, invoices: invoices || [], payments: payments || [] });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to load client billing history", details: e?.message });
  }
});

export default router;
