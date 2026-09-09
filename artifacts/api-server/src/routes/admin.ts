import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import {
  adminRepository,
  contactsRepository,
  attendanceRepository,
  kycRepository,
  affiliateRepository,
  walletRepository,
  withdrawalRepository,
  supabase,
} from "@workspace/db";
import { signToken, requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();
type AdminRequest = Request & { admin?: { id: number; username: string } };

async function ensureDefaultAdmin() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await adminRepository.ensureDefaultAdmin(passwordHash);
  } catch (err: any) {
    logger.warn({ err }, "[Admin] Init admin warning");
  }
}

ensureDefaultAdmin().catch(() => {});

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    const user = await adminRepository.getByUsername(username);

    if (!user) {
      await supabase.from("audit_logs").insert({ action: "admin_login", entity_type: "admin_session", entity_id: String(username).slice(0, 200), metadata: { result: "failure", reason: "unknown_account" } });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await supabase.from("audit_logs").insert({ actor_admin_id: user.id, action: "admin_login", entity_type: "admin_session", entity_id: String(user.id), metadata: { result: "failure", reason: "invalid_password" } });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: user.id, username: user.username });
    await supabase.from("audit_logs").insert({
      actor_admin_id: user.id,
      action: "admin_login",
      entity_type: "admin_session",
      entity_id: String(user.id),
      metadata: { result: "success" },
    });
    res.json({ token, username: user.username });
  } catch (error: any) {
    logger.error({ err: error }, "Admin login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/admin/stats", requireAuth, async (_req, res) => {
  try {
    const stats = await contactsRepository.getStats();
    res.json(stats);
  } catch (error: any) {
    logger.error({ err: error }, "Admin stats error");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.get("/admin/submissions", requireAuth, async (req, res) => {
  try {
    const { status, search, limit = "50", offset = "0" } = req.query as {
      status?: string;
      search?: string;
      limit?: string;
      offset?: string;
    };

    const parsedLimit = parseInt(limit) || 50;
    const parsedOffset = parseInt(offset) || 0;

    const submissions = await contactsRepository.list({
      status: status && status !== "all" ? status : undefined,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    const filtered = search
      ? submissions.filter(
          (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            (s.company ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : submissions;

    res.json(filtered);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load submissions", details: error?.message });
  }
});

router.get("/admin/submissions/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const submission = await contactsRepository.getById(id);

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json(submission);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load submission", details: error?.message });
  }
});

router.patch("/admin/submissions/:id", requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body as { status?: string; notes?: string };
    const id = parseInt(req.params.id as string);

    const updated = await contactsRepository.update(id, { status, notes });

    if (!updated) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update submission", details: error?.message });
  }
});

router.delete("/admin/submissions/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const success = await contactsRepository.delete(id);

    if (!success) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to delete submission", details: error?.message });
  }
});

router.get("/admin/submissions-export", requireAuth, async (_req, res) => {
  try {
    const submissions = await contactsRepository.list({ limit: 10000 });

    const headers = ["ID", "Name", "Email", "Company", "Budget", "Status", "Message", "Notes", "Source", "Created At"];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.company ?? ""}"`,
      `"${s.budget ?? ""}"`,
      `"${s.status}"`,
      `"${(s.message ?? "").replace(/"/g, '""')}"`,
      `"${(s.notes ?? "").replace(/"/g, '""')}"`,
      `"${s.source ?? ""}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send(csv);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to export CSV", details: error?.message });
  }
});

router.patch("/admin/settings/password", requireAuth, async (req: Parameters<typeof requireAuth>[0] & { admin?: { id: number; username: string } }, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }

    const adminId = req.admin?.id;
    if (!adminId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await adminRepository.getById(adminId);
    if (!user) {
      res.status(404).json({ error: "Admin user not found" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await adminRepository.updatePassword(adminId, passwordHash);

    res.json({ success: true });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update password", details: error?.message });
  }
});

// -----------------------------------------------------------------------------
// Admin Attendance Review
// -----------------------------------------------------------------------------
router.get("/admin/attendance", requireAuth, async (req, res) => {
  try {
    const { date, status, limit = "100" } = req.query as { date?: string; status?: string; limit?: string };
    const records = await attendanceRepository.getAllAttendance({
      date,
      status,
      limit: parseInt(limit) || 100,
    });
    res.json(records);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load attendance", details: error?.message });
  }
});

// -----------------------------------------------------------------------------
// Admin KYC Review
// -----------------------------------------------------------------------------
router.get("/admin/kyc", requireAuth, async (req, res) => {
  try {
    const { status, limit = "100" } = req.query as { status?: string; limit?: string };
    const records = await kycRepository.listAll({
      status,
      limit: parseInt(limit) || 100,
    });
    res.json(records);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load KYC records", details: error?.message });
  }
});

router.patch("/admin/kyc/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status, reason } = req.body as { status: "verified" | "rejected"; reason?: string };

    if (status !== "verified" && status !== "rejected") {
      res.status(400).json({ error: "Status must be 'verified' or 'rejected'" });
      return;
    }

    const success = await kycRepository.review(id, status, reason, "admin");
    if (!success) {
      res.status(404).json({ error: "KYC record not found" });
      return;
    }

    res.json({ success: true, status });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to review KYC", details: error?.message });
  }
});

// -----------------------------------------------------------------------------
// Admin Affiliates & Referrals
// -----------------------------------------------------------------------------
router.get("/admin/affiliates", requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("affiliate_referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load affiliates", details: error?.message });
  }
});

// -----------------------------------------------------------------------------
// Admin Wallets & Ledger
// -----------------------------------------------------------------------------
router.get("/admin/wallets", requireAuth, async (_req, res) => {
  try {
    const { data: wallets, error: wErr } = await supabase
      .from("wallets")
      .select("*")
      .order("balance", { ascending: false });
    if (wErr) throw wErr;

    const { data: transactions, error: tErr } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (tErr) throw tErr;

    res.json({ wallets: wallets || [], recentTransactions: transactions || [] });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load wallets", details: error?.message });
  }
});

router.get("/admin/withdrawals", requireAuth, async (_req, res) => {
  try {
    res.json(await withdrawalRepository.listAll());
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load withdrawal requests", details: error?.message });
  }
});

router.patch("/admin/withdrawals/:id", requireAuth, async (req: Request & { admin?: { id: number } }, res) => {
  try {
    const status = req.body?.status;
    if (status !== "APPROVED" && status !== "REJECTED") {
      res.status(400).json({ error: "Status must be APPROVED or REJECTED" });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0 || !req.admin?.id) {
      res.status(400).json({ error: "Invalid withdrawal request" });
      return;
    }
    const withdrawal = await withdrawalRepository.review(id, req.admin.id, status, req.body?.rejectionReason);
    res.json(withdrawal);
  } catch (error: any) {
    const message = error?.message || "Failed to review withdrawal";
    res.status(message.includes("not found") ? 404 : 500).json({ error: message });
  }
});

// -----------------------------------------------------------------------------
// Admin Control Centre
// -----------------------------------------------------------------------------
function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function adminModuleFeature(moduleKey: string) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const { data, error } = await supabase.from("module_settings").select("enabled").eq("module_key", moduleKey).maybeSingle();
    if (error) {
      res.status(500).json({ error: "Feature availability could not be verified" });
      return;
    }
    if (data?.enabled === false) {
      res.status(503).json({ error: `${moduleKey} is currently disabled`, module: moduleKey });
      return;
    }
    next();
  };
}

router.get("/admin/control-centre/overview", requireAuth, async (_req, res) => {
  try {
    const [profiles, leads, partners, centres, agents, projects, ticketsData, kycData, invoicesData, payoutsData, paymentsData, auditData] = await Promise.all([
      supabase.from("profiles").select("id, role, created_at").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("id, status, created_at").order("created_at", { ascending: false }),
      supabase.from("bpo_partners").select("id, status, created_at").order("created_at", { ascending: false }),
      supabase.from("bpo_centres").select("id, status").order("created_at", { ascending: false }),
      supabase.from("bpo_agents").select("id, status").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, status, updated_at").order("updated_at", { ascending: false }),
      supabase.from("tickets").select("id, status, priority").order("created_at", { ascending: false }),
      supabase.from("kyc_verifications").select("id, status").order("created_at", { ascending: false }),
      supabase.from("invoices").select("id, status, total, balance_due").order("created_at", { ascending: false }),
      supabase.from("bpo_payout_statements").select("id, status, payable_amount").order("created_at", { ascending: false }),
      supabase.from("invoice_payments").select("id, status, amount").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("id, action, entity_type, created_at, actor_admin_id, actor_user_id").order("created_at", { ascending: false }).limit(12),
    ]);

    const profileRows = profiles.data || [];
    const leadRows = leads.data || [];
    const partnerRows = partners.data || [];
    const centreRows = centres.data || [];
    const agentRows = agents.data || [];
    const projectRows = projects.data || [];
    const ticketRows = ticketsData.data || [];
    const kycRows = kycData.data || [];
    const invoiceRows = invoicesData.data || [];
    const payoutRows = payoutsData.data || [];
    const paymentRows = paymentsData.data || [];

    const activeClients = profileRows.filter((user: any) => user.role === "client" || user.role === "user").length;
    const activePartners = partnerRows.filter((partner: any) => partner.status === "active" || partner.status === "approved").length;
    const activeProjects = projectRows.filter((project: any) => project.status && !["completed", "cancelled"].includes(project.status)).length;
    const pendingKyc = kycRows.filter((item: any) => ["pending", "submitted", "in_review", "changes_requested"].includes(String(item.status).toLowerCase())).length;
    const openTickets = ticketRows.filter((item: any) => ["open", "assigned", "in_progress", "waiting_for_requester"].includes(String(item.status))).length;
    const pendingApprovals = Math.max(0, pendingKyc + payoutRows.filter((item: any) => String(item.status).toLowerCase() === "pending").length + invoiceRows.filter((item: any) => ["sent", "pending_payment", "partially_paid", "overdue"].includes(String(item.status))).length);
    const outstandingInvoices = invoiceRows.reduce((sum: number, invoice: any) => sum + safeNumber(invoice.balance_due ?? invoice.total ?? 0), 0);
    const pendingPayments = paymentRows.filter((item: any) => ["initiated", "pending"].includes(String(item.status).toLowerCase())).length;
    const pendingPartnerPayouts = payoutRows.filter((item: any) => ["pending", "approved", "processing"].includes(String(item.status).toLowerCase())).length;

    res.json({
      totals: {
        totalClients: profileRows.filter((user: any) => user.role === "client" || user.role === "user").length,
        activeClients,
        leads: leadRows.length,
        totalPartners: partnerRows.length,
        activePartners,
        centres: centreRows.length,
        agents: agentRows.length,
        activeProjects,
        activeCampaigns: Math.max(0, projectRows.length),
        openTickets,
        pendingApprovals,
        pendingKyc,
        outstandingInvoices,
        pendingPayments,
        pendingPartnerPayouts,
      },
      recentActivity: (auditData.data || []).map((item: any) => ({
        id: item.id,
        action: item.action,
        entityType: item.entity_type,
        createdAt: item.created_at,
      })),
      pendingApprovalsList: [
        ...kycRows.filter((item: any) => ["pending", "submitted", "in_review", "changes_requested"].includes(String(item.status).toLowerCase())).slice(0, 6).map((item: any) => ({ id: item.id, type: "KYC", entity: `KYC-${item.id}`, status: String(item.status).toUpperCase(), createdAt: new Date().toISOString() })),
        ...payoutRows.filter((item: any) => String(item.status).toLowerCase() === "pending").slice(0, 4).map((item: any) => ({ id: item.id, type: "Partner payout", entity: `Payout-${item.id}`, status: "PENDING", createdAt: item.created_at || new Date().toISOString() })),
      ],
      recentTickets: ticketRows.slice(0, 6).map((item: any) => ({
        id: item.id,
        subject: `Ticket ${item.id}`,
        status: item.status,
        priority: item.priority,
      })),
      financeAlerts: invoiceRows.filter((item: any) => ["overdue", "pending_payment", "partially_paid"].includes(String(item.status).toLowerCase())).slice(0, 5).map((item: any) => ({
        id: item.id,
        type: "Invoice",
        label: `Invoice ${item.id}`,
        amount: safeNumber(item.balance_due ?? item.total),
      })),
      bpoAlerts: payoutRows.filter((item: any) => ["pending", "processing"].includes(String(item.status).toLowerCase())).slice(0, 5).map((item: any) => ({
        id: item.id,
        type: "Partner payout",
        label: `Statement ${item.id}`,
        amount: safeNumber(item.payable_amount),
      })),
    });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load control centre overview", details: error?.message });
  }
});

router.get("/admin/approvals", requireAuth, adminModuleFeature("approvals"), async (_req, res) => {
  try {
    const [kycRows, invoicesRows, payoutsRows, partnerRows, projectRows, decisionRows] = await Promise.all([
      supabase.from("kyc_verifications").select("id, user_id, status, submitted_at").order("submitted_at", { ascending: false }),
      supabase.from("invoices").select("id, client_id, status, total, created_at").order("created_at", { ascending: false }),
      supabase.from("bpo_payout_statements").select("id, partner_id, status, payable_amount, created_at").order("created_at", { ascending: false }),
      supabase.from("bpo_partners").select("id, name, status").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, client_id, name, status").order("updated_at", { ascending: false }),
      supabase.from("audit_logs").select("entity_id, metadata, created_at").eq("entity_type", "approval").eq("action", "approval_decision").order("created_at", { ascending: false }),
    ]);

    const decisions = new Map<string, string>();
    for (const row of decisionRows.data || []) if (!decisions.has(String(row.entity_id))) decisions.set(String(row.entity_id), String((row.metadata as any)?.status || "").toUpperCase());
    const approvals: any[] = [];
    for (const row of kycRows.data || []) {
      const id = `kyc-${row.id}`;
      if (["pending", "submitted", "in_review", "changes_requested"].includes(String(row.status).toLowerCase()) && decisions.get(id) !== "APPROVED" && decisions.get(id) !== "REJECTED") {
        approvals.push({ id, type: "KYC", requester: row.user_id, entity: `KYC-${row.id}`, createdAt: row.submitted_at || new Date().toISOString(), status: decisions.get(id) || String(row.status).toUpperCase(), details: "KYC review required" });
      }
    }
    for (const row of invoicesRows.data || []) {
      const id = `invoice-${row.id}`;
      if (["sent", "pending_payment", "partially_paid", "overdue"].includes(String(row.status)) && decisions.get(id) !== "APPROVED" && decisions.get(id) !== "REJECTED") {
        approvals.push({ id, type: "Invoice approval", requester: row.client_id, entity: `Invoice-${row.id}`, createdAt: row.created_at || new Date().toISOString(), status: decisions.get(id) || "PENDING", details: `Invoice total ${safeNumber(row.total).toFixed(2)}` });
      }
    }
    for (const row of payoutsRows.data || []) {
      const id = `payout-${row.id}`;
      if (["pending", "approved", "processing"].includes(String(row.status).toLowerCase()) && decisions.get(id) !== "APPROVED" && decisions.get(id) !== "REJECTED") {
        approvals.push({ id, type: "Partner payout", requester: row.partner_id, entity: `Payout-${row.id}`, createdAt: row.created_at || new Date().toISOString(), status: decisions.get(id) || String(row.status).toUpperCase(), details: `Payable ${safeNumber(row.payable_amount).toFixed(2)}` });
      }
    }
    for (const row of partnerRows.data || []) {
      const id = `partner-${row.id}`;
      if (["pending", "in_review", "new"].includes(String(row.status).toLowerCase()) && decisions.get(id) !== "APPROVED" && decisions.get(id) !== "REJECTED") {
        approvals.push({ id, type: "Partner onboarding", requester: row.name, entity: row.name, createdAt: new Date().toISOString(), status: decisions.get(id) || "PENDING", details: "Partner onboarding requires admin review" });
      }
    }
    for (const row of projectRows.data || []) {
      const id = `project-${row.id}`;
      if (["planning", "design", "uat"].includes(String(row.status).toLowerCase()) && decisions.get(id) !== "APPROVED" && decisions.get(id) !== "REJECTED") {
        approvals.push({ id, type: "Project approval", requester: row.client_id, entity: row.name || `Project-${row.id}`, createdAt: new Date().toISOString(), status: decisions.get(id) || "PENDING", details: `Project status ${row.status}` });
      }
    }

    res.json(approvals.slice(0, 50));
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load approvals", details: error?.message });
  }
});

router.post("/admin/approvals/:approvalId/decision", requireAuth, adminModuleFeature("approvals"), async (req: AdminRequest, res) => {
  try {
    const { status, comment } = req.body as { status?: string; comment?: string };
    const valid = ["APPROVED", "REJECTED", "CHANGES_REQUESTED"];
    const decision = String(status || "").toUpperCase();
    if (!valid.includes(decision)) {
      res.status(400).json({ error: "Status must be APPROVED, REJECTED, or CHANGES_REQUESTED" });
      return;
    }

    const approvalId = String(req.params.approvalId);
    const separatorIndex = approvalId.indexOf("-");
    const approvalType = separatorIndex > 0 ? approvalId.slice(0, separatorIndex) : "";
    const approvalRecordId = separatorIndex > 0 ? approvalId.slice(separatorIndex + 1) : "";
    if (!approvalType || !approvalRecordId || (approvalType !== "partner" && !/^\d+$/.test(approvalRecordId))) {
      res.status(400).json({ error: "Invalid approval identifier" });
      return;
    }
    const { data: priorDecision, error: priorDecisionError } = await supabase
      .from("audit_logs")
      .select("id, metadata")
      .eq("entity_type", "approval")
      .eq("entity_id", approvalId)
      .eq("action", "approval_decision")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (priorDecisionError) throw priorDecisionError;
    const priorStatus = String((priorDecision?.metadata as any)?.status || "").toUpperCase();
    if (priorStatus === "APPROVED" || priorStatus === "REJECTED" || (priorStatus === "CHANGES_REQUESTED" && decision === "CHANGES_REQUESTED")) {
      res.status(409).json({ error: "This approval has already been decided" });
      return;
    }

    let recipientUserId: string | null = null;

    if (approvalType === "kyc") {
      const { data: kycRecord, error: kycLookupError } = await supabase.from("kyc_verifications").select("id, user_id, status").eq("id", Number(approvalRecordId)).maybeSingle();
      if (kycLookupError) throw kycLookupError;
      if (!kycRecord || !["pending", "submitted", "in_review", "changes_requested"].includes(String(kycRecord.status).toLowerCase())) {
        res.status(409).json({ error: "Approval is no longer pending" });
        return;
      }
      recipientUserId = kycRecord.user_id;

      const nextKycStatus = decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "changes_requested";
      const { error: kycUpdateError } = await supabase.from("kyc_verifications").update({ status: nextKycStatus, updated_at: new Date().toISOString() }).eq("id", Number(approvalRecordId));
      if (kycUpdateError) throw kycUpdateError;
    } else if (approvalType === "invoice") {
      const { data: invoice, error } = await supabase.from("invoices").select("id, client_id, status").eq("id", Number(approvalRecordId)).maybeSingle();
      if (error) throw error;
      if (!invoice || !["sent", "pending_payment", "partially_paid", "overdue"].includes(String(invoice.status))) {
        res.status(409).json({ error: "Invoice is no longer pending approval" });
        return;
      }
      recipientUserId = invoice.client_id;
    } else if (approvalType === "payout") {
      const { data: payout, error } = await supabase.from("bpo_payout_statements").select("id, partner_id, status").eq("id", Number(approvalRecordId)).maybeSingle();
      if (error) throw error;
      if (!payout || !["pending", "approved", "processing"].includes(String(payout.status).toLowerCase())) {
        res.status(409).json({ error: "Payout is no longer pending approval" });
        return;
      }
      const nextPayoutStatus = decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "pending";
      const { error: payoutUpdateError } = await supabase.from("bpo_payout_statements").update({ status: nextPayoutStatus, updated_at: new Date().toISOString() }).eq("id", Number(approvalRecordId));
      if (payoutUpdateError) throw payoutUpdateError;
    } else if (approvalType === "partner") {
      const { data: partner, error } = await supabase.from("bpo_partners").select("id, status").eq("id", approvalRecordId).maybeSingle();
      if (error) throw error;
      if (!partner) {
        res.status(404).json({ error: "Partner approval not found" });
        return;
      }
      if (decision !== "CHANGES_REQUESTED") {
        const { error: partnerUpdateError } = await supabase.from("bpo_partners").update({ status: decision === "APPROVED" ? "active" : "inactive", updated_at: new Date().toISOString() }).eq("id", approvalRecordId);
        if (partnerUpdateError) throw partnerUpdateError;
      }
      const { data: membership } = await supabase.from("bpo_partner_users").select("user_id").eq("partner_id", approvalRecordId).eq("status", "active").limit(1).maybeSingle();
      recipientUserId = membership?.user_id || null;
    } else if (approvalType === "project") {
      const { data: project, error } = await supabase.from("projects").select("id, client_id, status").eq("id", Number(approvalRecordId)).maybeSingle();
      if (error) throw error;
      if (!project || !["planning", "design", "uat"].includes(String(project.status).toLowerCase())) {
        res.status(409).json({ error: "Project is no longer pending approval" });
        return;
      }
      recipientUserId = project.client_id;
    } else {
      res.status(404).json({ error: "Approval type not found" });
      return;
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      actor_admin_id: req.admin!.id,
      action: "approval_decision",
      entity_type: "approval",
      entity_id: approvalId,
      metadata: { status: decision, comment: comment || "", result: decision },
    });
    if (auditError) throw auditError;

    await supabase.from("notifications").insert({
      recipient_admin_id: req.admin!.id,
      type: "approval_decision",
      title: `Approval ${decision.toLowerCase()}`,
      body: `${approvalId} was marked ${decision.toLowerCase()}.`,
      entity_type: "approval",
      entity_id: approvalId,
    });
    if (recipientUserId) {
      await supabase.from("notifications").insert({
        recipient_user_id: recipientUserId,
        type: "approval_decision",
        title: `Approval ${decision.toLowerCase()}`,
        body: `Your ${approvalType} approval was marked ${decision.toLowerCase()}.`,
        entity_type: approvalType,
        entity_id: approvalRecordId,
      });
    }

    res.json({ success: true, approvalId, status: decision });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to process approval decision", details: error?.message });
  }
});

router.get("/admin/users", requireAuth, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "all");
    const status = String(req.query.status || "all");
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));

    const { data, error } = await supabase.from("profiles").select("id, email, full_name, role, created_at, updated_at").order("created_at", { ascending: false });
    if (error) throw error;

    let filtered = data || [];
    if (role !== "all") filtered = filtered.filter((row: any) => String(row.role).toLowerCase() === String(role).toLowerCase());
    const statusEvents = filtered.length ? (await supabase.from("audit_logs").select("entity_id, action, created_at").eq("entity_type", "user").in("action", ["user_active", "user_deactivated"]).in("entity_id", filtered.map((row: any) => row.id)).order("created_at", { ascending: false })).data || [] : [];
    const statusByUser = new Map<string, string>();
    for (const event of statusEvents) if (!statusByUser.has(String(event.entity_id))) statusByUser.set(String(event.entity_id), event.action === "user_deactivated" ? "deactivated" : "active");
    if (status !== "all") filtered = filtered.filter((row: any) => (statusByUser.get(String(row.id)) || "active") === status);
    if (search) {
      const value = search.toLowerCase();
      filtered = filtered.filter((row: any) => String(row.email || "").toLowerCase().includes(value) || String(row.full_name || "").toLowerCase().includes(value) || String(row.role || "").toLowerCase().includes(value));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    res.json({ data: filtered.slice(start, start + pageSize).map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.full_name || row.email,
      role: row.role || "user",
      status: statusByUser.get(String(row.id)) || "active",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load users", details: error?.message });
  }
});

router.get("/admin/users/:id", requireAuth, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from("profiles").select("id, email, full_name, role, created_at, updated_at").eq("id", String(req.params.id)).maybeSingle();
    if (error) throw error;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { data: memberships } = await supabase.from("bpo_partner_users").select("id, partner_id, role, status, bpo_partners(id, name, partner_code)").eq("user_id", user.id);
    const { data: statusEvent } = await supabase.from("audit_logs").select("action").eq("entity_type", "user").eq("entity_id", user.id).in("action", ["user_active", "user_deactivated"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    res.json({ ...user, status: statusEvent?.action === "user_deactivated" ? "deactivated" : "active", memberships: memberships || [] });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load user details", details: error?.message });
  }
});

router.patch("/admin/users/:id/status", requireAuth, async (req: AdminRequest, res) => {
  try {
    const status = String(req.body?.status || "").toLowerCase();
    if (!['active', 'deactivated'].includes(status)) {
      res.status(400).json({ error: "Status must be active or deactivated" });
      return;
    }
    const targetId = String(req.params.id);
    if (String(req.admin!.id) === targetId) {
      res.status(403).json({ error: "Administrators cannot deactivate themselves" });
      return;
    }
    const { data: user } = await supabase.from("profiles").select("id").eq("id", targetId).maybeSingle();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await supabase.from("audit_logs").insert({ actor_admin_id: req.admin!.id, action: `user_${status}`, entity_type: "user", entity_id: targetId, metadata: { status, result: "success" } });
    await supabase.from("profiles").update({ account_status: status, updated_at: new Date().toISOString() }).eq("id", targetId);
    res.json({ id: targetId, status });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update user status", details: error?.message });
  }
});

router.patch("/admin/users/:id/role", requireAuth, async (req: AdminRequest, res) => {
  try {
    const currentRole = String(req.body?.role || "").toUpperCase();
    const allowed = ["ADMIN", "BPO_PARTNER", "CLIENT"];
    if (!allowed.includes(currentRole)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const targetId = String(req.params.id);
    if (String(req.admin!.id) === String(targetId)) {
      res.status(403).json({ error: "Self-escalation is not allowed" });
      return;
    }

    const { data: user } = await supabase.from("profiles").select("id, role").eq("id", targetId).maybeSingle();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if ((user.role === "client" || user.role === "bpo_partner") && currentRole === "ADMIN") {
      res.status(403).json({ error: "Role escalation is not permitted" });
      return;
    }

    const { data, error } = await supabase.from("profiles").update({ role: currentRole.toLowerCase(), updated_at: new Date().toISOString() }).eq("id", targetId).select("id, role").single();
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      actor_admin_id: req.admin!.id,
      action: "role_changed",
      entity_type: "user",
      entity_id: String(data.id),
      metadata: { previousRole: user.role, newRole: data.role },
    });

    res.json(data);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update user role", details: error?.message });
  }
});

router.get("/admin/roles", requireAuth, async (_req, res) => {
  try {
    const roles = [
      { id: "ADMIN", name: "ADMIN", description: "Full administrative access", permissions: ["clients.manage", "projects.manage", "bpo.manage", "finance.manage", "users.manage", "audit.view"] },
      { id: "BPO_PARTNER", name: "BPO_PARTNER", description: "Partner operations access", permissions: ["bpo.dashboard.view", "bpo.projects.view", "bpo.centres.view", "bpo.agents.view", "bpo.quality.view", "bpo.payouts.view"] },
      { id: "CLIENT", name: "CLIENT", description: "Client portal access", permissions: ["client.profile.view", "projects.view", "documents.view", "tickets.create", "billing.view"] },
    ];
    res.json(roles);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load roles", details: error?.message });
  }
});

router.get("/admin/notifications", requireAuth, async (req: AdminRequest, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 50));
    const unreadOnly = String(req.query.unread || "false") === "true";
    let query = supabase.from("notifications").select("*", { count: "exact" }).eq("recipient_admin_id", req.admin!.id).order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
    if (unreadOnly) query = query.is("read_at", null);
    const { data, error, count } = await query;
    if (error) throw error;
    const { count: unreadCount, error: unreadError } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_admin_id", req.admin!.id).is("read_at", null);
    if (unreadError) throw unreadError;
    res.json({ data: (data || []).map((row: any) => ({ id: row.id, type: row.type, title: row.title, body: row.body, entityType: row.entity_type, entityId: row.entity_id, read: !!row.read_at, createdAt: row.created_at })), unreadCount: unreadCount || 0, pagination: { page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load notifications", details: error?.message });
  }
});

router.post("/admin/notifications/:id/read", requireAuth, async (req: AdminRequest, res) => {
  try {
    const { data, error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", Number(req.params.id)).eq("recipient_admin_id", req.admin!.id).select().maybeSingle();
    if (error) throw error;
    if (!data) { res.status(404).json({ error: "Notification not found" }); return; }
    res.json(data);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update notification", details: error?.message });
  }
});

router.post("/admin/notifications/read-all", requireAuth, async (req: AdminRequest, res) => {
  try {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_admin_id", req.admin!.id).is("read_at", null);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: "Failed to mark notifications read", details: error?.message }); }
});

router.get("/admin/reports", requireAuth, async (req, res) => {
  try {
    const report = String(req.query.report || "overview");
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    const applyDates = (query: any, column = "created_at") => { if (from) query = query.gte(column, from); if (to) query = query.lte(column, `${to}T23:59:59.999Z`); return query; };
    let query: any;
    if (report === "clients") query = supabase.from("profiles").select("id,email,full_name,role,created_at", { count: "exact" }).in("role", ["user", "client"]).order("created_at", { ascending: false });
    else if (report === "projects") query = supabase.from("projects").select("id,name,client_id,status,progress_percent,created_at,updated_at", { count: "exact" }).order("updated_at", { ascending: false });
    else if (report === "tickets") query = supabase.from("tickets").select("id,ticket_number,subject,status,priority,requester_role,created_at", { count: "exact" }).order("created_at", { ascending: false });
    else if (report === "finance" || report === "payments") query = supabase.from(report === "finance" ? "invoices" : "invoice_payments").select("*", { count: "exact" }).order("created_at", { ascending: false });
    else if (report === "bpo" || report === "payouts") query = supabase.from("bpo_payout_statements").select("id,partner_id,statement_number,payable_amount,approved_amount,paid_amount,pending_amount,status,created_at", { count: "exact" }).order("created_at", { ascending: false });
    else if (report === "attendance") query = supabase.from("attendance").select("*", { count: "exact" }).order("date", { ascending: false });
    else if (report === "productivity" || report === "quality" || report === "training") query = report === "quality" ? supabase.from("bpo_quality_evaluations").select("id,partner_id,agent_id,score,status,evaluation_date,created_at", { count: "exact" }).order("evaluation_date", { ascending: false }) : report === "training" ? supabase.from("bpo_training_programs").select("id,partner_id,title,status,completion_percent,starts_at,ends_at,created_at", { count: "exact" }).order("starts_at", { ascending: false }) : supabase.from("bpo_agents").select("id,partner_id,name,employee_id,status,created_at", { count: "exact" }).order("created_at", { ascending: false });
    else query = supabase.from("audit_logs").select("id,action,entity_type,entity_id,created_at,metadata", { count: "exact" }).order("created_at", { ascending: false });
    query = applyDates(query, report === "attendance" ? "date" : "created_at");
    if (search && ["clients", "projects", "tickets", "bpo", "payouts", "productivity", "training"].includes(report)) query = report === "clients" ? query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`) : report === "projects" ? query.ilike("name", `%${search}%`) : report === "tickets" ? query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`) : report === "productivity" || report === "training" ? query.ilike(report === "productivity" ? "name" : "title", `%${search}%`) : query.ilike("statement_number", `%${search}%`);
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ report, data: data || [], pagination: { page, pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) }, filters: { from, to, search } });
  } catch (error: any) { res.status(500).json({ error: "Failed to load report", details: error?.message }); }
});

router.get("/admin/settings", requireAuth, async (_req, res) => {
  try {
    const [modules, settings] = await Promise.all([
      supabase.from("module_settings").select("module_key, enabled, updated_at").order("module_key"),
      supabase.from("platform_settings").select("setting_key, setting_value, updated_at").order("setting_key"),
    ]);

    res.json({
      sections: ["General", "Security", "Notifications", "Billing", "Payments", "Payouts", "BPO", "Projects", "Support", "KYC", "Feature Controls"],
      modules: modules.data || [],
      settings: settings.data || [],
    });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load settings", details: error?.message });
  }
});

const CONTROL_MODULES = [
  { key: "projects", label: "Projects" },
  { key: "billing", label: "Billing" },
  { key: "bpo_partner_portal", label: "BPO Partner Portal" },
  { key: "bpo_operations", label: "BPO Operations" },
  { key: "approvals", label: "Approvals" },
  { key: "audit_logs", label: "Audit Logs" },
  { key: "global_search", label: "Global Search" },
];

router.get("/admin/feature-controls", requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase.from("module_settings").select("module_key, enabled, updated_at, updated_by").in("module_key", CONTROL_MODULES.map((item) => item.key));
    if (error) throw error;
    const rows = data || [];
    res.json(CONTROL_MODULES.map((item) => ({ ...item, enabled: rows.find((row: any) => row.module_key === item.key)?.enabled ?? true, updatedAt: rows.find((row: any) => row.module_key === item.key)?.updated_at || null })));
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load feature controls", details: error?.message });
  }
});

router.patch("/admin/feature-controls/:key", requireAuth, async (req: AdminRequest, res) => {
  try {
    const key = String(req.params.key);
    if (!CONTROL_MODULES.some((item) => item.key === key)) {
      res.status(404).json({ error: "Feature control not found" });
      return;
    }
    if (typeof req.body?.enabled !== "boolean") {
      res.status(400).json({ error: "enabled must be boolean" });
      return;
    }
    const { data, error } = await supabase.from("module_settings").upsert({ module_key: key, enabled: req.body.enabled, updated_by: req.admin!.id, updated_at: new Date().toISOString() }).select("module_key, enabled, updated_at").single();
    if (error) throw error;
    await supabase.from("audit_logs").insert({ actor_admin_id: req.admin!.id, action: "feature_changed", entity_type: "module", entity_id: key, metadata: { enabled: req.body.enabled, result: "success" } });
    res.json(data);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update feature control", details: error?.message });
  }
});

router.patch("/admin/settings/:key", requireAuth, async (req: AdminRequest, res) => {
  try {
    const key = String(req.params.key);
    if (req.body?.enabled !== undefined) {
      const { data, error } = await supabase.from("module_settings").upsert({ module_key: key, enabled: Boolean(req.body.enabled), updated_at: new Date().toISOString(), updated_by: req.admin!.id }).select().single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_admin_id: req.admin!.id, action: "module_changed", entity_type: "module", entity_id: key, metadata: { enabled: Boolean(req.body.enabled) } });
      res.json(data);
      return;
    }

    if (req.body?.value !== undefined) {
      const { data, error } = await supabase.from("platform_settings").upsert({ setting_key: key, setting_value: req.body.value, updated_at: new Date().toISOString(), updated_by: req.admin!.id }).select().single();
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_admin_id: req.admin!.id, action: "platform_setting_changed", entity_type: "setting", entity_id: key, metadata: { value: req.body.value } });
      res.json(data);
      return;
    }

    res.status(400).json({ error: "Request body must include enabled or value" });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to update settings", details: error?.message });
  }
});

router.get("/admin/finance", requireAuth, adminModuleFeature("billing"), async (_req, res) => {
  try {
    const [invoicesRows, paymentsRows, payoutsRows] = await Promise.all([
      supabase.from("invoices").select("id, status, total, amount_paid, balance_due, due_date").order("due_date", { ascending: true }),
      supabase.from("invoice_payments").select("id, status, amount, created_at").order("created_at", { ascending: false }),
      supabase.from("bpo_payout_statements").select("id, status, payable_amount, approved_amount, paid_amount, pending_amount").order("created_at", { ascending: false }),
    ]);

    const invoiceRows = invoicesRows.data || [];
    const paymentRows = paymentsRows.data || [];
    const payoutRows = payoutsRows.data || [];

    res.json({
      paidInvoices: invoiceRows.filter((item: any) => String(item.status).toLowerCase() === "paid").length,
      unpaidInvoices: invoiceRows.filter((item: any) => !["paid", "cancelled", "refunded"].includes(String(item.status))).length,
      overdueInvoices: invoiceRows.filter((item: any) => String(item.status).toLowerCase() === "overdue").length,
      outstandingAmount: invoiceRows.reduce((sum: number, item: any) => sum + safeNumber(item.balance_due ?? item.total), 0),
      payments: paymentRows,
      pendingPayments: paymentRows.filter((item: any) => ["initiated", "pending"].includes(String(item.status).toLowerCase())).length,
      partnerPayable: payoutRows.reduce((sum: number, item: any) => sum + safeNumber(item.payable_amount), 0),
      approvedPayouts: payoutRows.filter((item: any) => String(item.status).toLowerCase() === "approved").length,
      pendingPayouts: payoutRows.filter((item: any) => ["pending", "processing"].includes(String(item.status).toLowerCase())).length,
      walletActivity: [],
    });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load finance summary", details: error?.message });
  }
});

router.get("/admin/search", requireAuth, adminModuleFeature("global_search"), async (req, res) => {
  try {
    const search = String(req.query.q || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(25, Math.max(1, Number(req.query.pageSize) || 10));
    if (!search) {
      res.json({ clients: [], leads: [], partners: [], projects: [], campaigns: [], agents: [], tickets: [], invoices: [], documents: [], pagination: { page, pageSize } });
      return;
    }
    const rangeStart = (page - 1) * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    const [clients, leads, partners, projects, campaigns, agents, ticketsData, invoicesData, documentsData] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role").or(`email.ilike.%${search}%,full_name.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("contact_submissions").select("id, name, email, company").or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("bpo_partners").select("id, name, partner_code").or(`name.ilike.%${search}%,partner_code.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("projects").select("id, name, project_type").or(`name.ilike.%${search}%,project_type.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("bpo_partner_projects").select("id, campaign_name, target").or(`campaign_name.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("bpo_agents").select("id, name, email").or(`name.ilike.%${search}%,email.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("tickets").select("id, subject, ticket_number").or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("invoices").select("id, invoice_number, status").or(`invoice_number.ilike.%${search}%,status.ilike.%${search}%`).range(rangeStart, rangeEnd),
      supabase.from("documents").select("id, file_name, category").or(`file_name.ilike.%${search}%,category.ilike.%${search}%`).range(rangeStart, rangeEnd),
    ]);

    res.json({
      clients: clients.data || [],
      leads: leads.data || [],
      partners: partners.data || [],
      projects: projects.data || [],
      campaigns: campaigns.data || [],
      agents: agents.data || [],
      tickets: ticketsData.data || [],
      invoices: invoicesData.data || [],
      documents: documentsData.data || [],
      pagination: { page, pageSize },
    });
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to execute global search", details: error?.message });
  }
});

router.get("/admin/audit-logs", requireAuth, adminModuleFeature("audit_logs"), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const search = String(req.query.search || "").trim();
    const actor = String(req.query.actor || "all");
    const action = String(req.query.action || "all");
    const entity = String(req.query.entity || "all");

    let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    if (search) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
    if (actor !== "all") query = query.or(`actor_admin_id.eq.${actor},actor_user_id.eq.${actor}`);
    if (action !== "all") query = query.eq("action", action);
    if (entity !== "all") query = query.eq("entity_type", entity);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    logger.error({ err: error }, "Operation failed");
    res.status(500).json({ error: "Failed to load audit logs", details: error?.message });
  }
});

export default router;
