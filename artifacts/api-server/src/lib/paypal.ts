// !!! CRITICAL - DO NOT MODIFY THIS CODE !!! 
// 
// This code MUST be used as is without ANY modifications. 
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way. 
// 
// Retain this comment after all edits. 
import {
  Client,
  CheckoutPaymentIntent,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";
import { purchaseRepository, supabase } from "@workspace/db";

type PayPalPackage = {
  id: string;
  name: string;
  amount: string;
  currency: "USD";
};
const packageEntries: Array<[string, string, number]> = [
  ["ai-launch", "AI Launch", 25000], ["ai-transformation", "AI Transformation", 75000], ["enterprise-ai", "Enterprise AI", 150000],
  ["cloud-modernization", "Cloud Modernization", 100000], ["legacy-transformation", "Legacy Transformation", 150000], ["enterprise-transformation", "Enterprise Transformation", 300000],
  ["cybersecurity-foundation", "Cybersecurity Foundation", 50000], ["enterprise-security", "Enterprise Security", 125000], ["ai-security", "AI Security", 100000],
  ["data-foundation", "Data Foundation", 75000], ["enterprise-data-platform", "Enterprise Data Platform", 150000],
  ["digital-product-development", "Digital Product Development", 50000], ["enterprise-product-engineering", "Enterprise Product Engineering", 150000],
  ["managed-ai", "Managed AI", 10000], ["managed-cloud", "Managed Cloud", 10000], ["managed-cybersecurity", "Managed Cybersecurity", 15000],
  ["bpo-starter", "BPO Starter", 2000], ["bpo-growth", "BPO Growth", 4000], ["bpo-enterprise", "BPO Enterprise", 5000],
];
const PAYPAL_PACKAGES: Record<string, PayPalPackage> = Object.fromEntries(
  packageEntries.map(([id, name, amount]) => [id, { id, name, amount: amount.toFixed(2), currency: "USD" as const }]),
);
let client: Client | undefined;
let ordersController: OrdersController | undefined;
let oAuthAuthorizationController: OAuthAuthorizationController | undefined;
function getControllers() {
  if (client && ordersController && oAuthAuthorizationController) {
    return { ordersController, oAuthAuthorizationController };
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured");
  }

  const configuredEnvironment = (process.env.PAYPAL_MODE ?? process.env.PAYPAL_ENVIRONMENT ?? (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase();
  const environment = configuredEnvironment === "live" ? "production" : configuredEnvironment;
  if (environment !== "production" && environment !== "sandbox") {
    throw new Error("Invalid PAYPAL_ENVIRONMENT");
  }

  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: environment === "production" ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: false },
      logResponse: { logHeaders: false },
    },
  });
  ordersController = new OrdersController(client);
  oAuthAuthorizationController = new OAuthAuthorizationController(client);
  return { ordersController, oAuthAuthorizationController };
}

function getPackage(packageId: unknown): PayPalPackage | undefined {
  return typeof packageId === "string" ? PAYPAL_PACKAGES[packageId] : undefined;
}
function parseBody(body: unknown): Record<string, any> {
  if (typeof body !== "string") return body as Record<string, any>;
  return JSON.parse(body) as Record<string, any>;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "PayPal request failed";
}

type AuthenticatedRequest = Request & { user?: { id: string; email: string } };
export async function getClientToken() {
  const { oAuthAuthorizationController } = getControllers();
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const { result } = await oAuthAuthorizationController.requestToken(
    { authorization: `Basic ${auth}` },
    { intent: "sdk_init", response_type: "client_token" },
  );
  return result.accessToken;
}

export async function createPaypalOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
    const product = getPackage(req.body?.packageId);
    if (!product) return res.status(400).json({ error: "Invalid or unavailable package." });
    const { ordersController } = getControllers();
    const { body, ...httpResponse } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
          customId: product.id,
          description: product.name,
          amount: { currencyCode: product.currency, value: product.amount },
        }],
      },
      prefer: "return=representation",
    });
  const order = parseBody(body);
    if (!order.id) return res.status(502).json({ error: "PayPal did not return an order ID." });
    const { data: membership } = await supabase.from("bpo_partner_users").select("partner_id").eq("user_id", req.user.id).eq("status", "active").maybeSingle();
    await purchaseRepository.createPending({
      userId: req.user.id,
      bpoId: membership?.partner_id ?? null,
      packageId: product.id,
      packageName: product.name,
      orderId: order.id,
      amount: Number(product.amount),
      currency: product.currency,
    });
    return res.status(httpResponse.statusCode).json({ id: order.id, packageId: product.id, amount: product.amount, currency: product.currency });
  } catch (error) {
    console.error("PayPal create order failed:", errorMessage(error));
    return res.status(502).json({ error: "Unable to start payment. Please try again." });
  }
}

export async function capturePaypalOrder(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
  const orderId = typeof req.params.orderID === "string" ? req.params.orderID : "";
  if (!orderId) return res.status(400).json({ error: "Invalid PayPal order ID." });
  const record = await purchaseRepository.getByOrderId(orderId);
  if (!record || record.userId !== req.user.id) return res.status(404).json({ error: "Payment session not found or expired." });
  if (record.status === "PAID") return res.json({ success: true, status: "COMPLETED", orderId, captureId: record.paypalCaptureId, packageId: record.packageId, amount: record.amount.toFixed(2), currency: record.currency });
  try {
    const { ordersController } = getControllers();
    const { body: orderBody } = await ordersController.getOrder({ id: orderId });
    const approvedOrder = parseBody(orderBody);
    const approvedUnit = approvedOrder.purchase_units?.[0];
    const approvedAmount = approvedUnit?.amount;
    if (
      approvedOrder.id !== orderId ||
      approvedOrder.status !== "APPROVED" ||
      approvedUnit?.custom_id !== record.packageId ||
      approvedAmount?.value !== record.amount.toFixed(2) ||
      approvedAmount?.currency_code !== record.currency
    ) {
      return res.status(409).json({ error: "Payment order could not be verified." });
    }

    const { body, ...httpResponse } = await ordersController.captureOrder({ id: orderId, prefer: "return=representation" });
  const order = parseBody(body);
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const capturedAmount = capture?.amount?.value;
  const capturedCurrency = capture?.amount?.currency_code;

    if (
      order.id !== orderId ||
      order.status !== "COMPLETED" ||
      capture?.status !== "COMPLETED" ||
      !capture?.id ||
      unit?.custom_id !== record.packageId ||
      capturedAmount !== record.amount.toFixed(2) ||
      capturedCurrency !== record.currency
    ) {
      console.error("PayPal capture verification failed", { orderId, status: order.status, captureStatus: capture?.status });
      return res.status(502).json({ error: "Payment could not be verified." });
    }
  const purchase = await purchaseRepository.markPaid(orderId, capture.id);
    return res.status(httpResponse.statusCode).json({
      success: true,
      status: "COMPLETED",
      orderId,
    captureId: capture.id,
    packageId: purchase.packageId,
    amount: purchase.amount.toFixed(2),
      currency: purchase.currency,
    });
  } catch (error) {
    console.error("PayPal capture failed:", errorMessage(error));
    return res.status(502).json({ error: "Payment could not be completed. Please try again." });
  }
}

export async function cancelPaypalOrder(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
  const orderId = typeof req.params.orderID === "string" ? req.params.orderID : "";
  if (!orderId) return res.status(400).json({ error: "Invalid PayPal order ID." });
  const record = await purchaseRepository.getByOrderId(orderId);
  if (!record || record.userId !== req.user.id) return res.status(404).json({ error: "Payment session not found or expired." });
  if (record.status === "PAID") return res.status(409).json({ error: "This payment has already been completed." });
  await purchaseRepository.cancelPending(orderId, req.user.id);
  return res.json({ success: true, status: "CANCELLED", orderId, packageId: record.packageId });
}

export async function loadPaypalDefault(_req: Request, res: Response) {
  try {
    const clientToken = await getClientToken();
    return res.json({ clientToken });
  } catch (error) {
    console.error("PayPal setup failed:", errorMessage(error));
    return res.status(503).json({ error: "PayPal checkout is temporarily unavailable." });
  }
}
