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

type PayPalPackage = {
  id: string;
  name: string;
  amount: string;
  currency: "USD";
};
type PaymentRecord = PayPalPackage & {
  orderId: string;
  status: "CREATED" | "COMPLETED";
  captureId?: string;
};

const PAYPAL_PACKAGES: Record<string, PayPalPackage> = {
  "ai-agent-pro": { id: "ai-agent-pro", name: "AI Agent Pro", amount: "7500.00", currency: "USD" },
  "ai-automation": { id: "ai-automation", name: "AI Automation", amount: "5000.00", currency: "USD" },
  "ai-voice-pro": { id: "ai-voice-pro", name: "AI Voice Pro", amount: "6500.00", currency: "USD" },
  "private-ai-brain": { id: "private-ai-brain", name: "Private AI Brain", amount: "7500.00", currency: "USD" },
  "ai-sales-engine": { id: "ai-sales-engine", name: "AI Sales Engine", amount: "6500.00", currency: "USD" },
};

const payments = new Map<string, PaymentRecord>();
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

  const environment = (process.env.PAYPAL_ENVIRONMENT ?? (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase();
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

export async function createPaypalOrder(req: Request, res: Response) {
  try {
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
  payments.set(order.id, { ...product, orderId: order.id, status: "CREATED" });
    return res.status(httpResponse.statusCode).json({ id: order.id, packageId: product.id, amount: product.amount, currency: product.currency });
  } catch (error) {
    console.error("PayPal create order failed:", errorMessage(error));
    return res.status(502).json({ error: "Unable to start payment. Please try again." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  const orderId = typeof req.params.orderID === "string" ? req.params.orderID : "";
  if (!orderId) return res.status(400).json({ error: "Invalid PayPal order ID." });
  const record = payments.get(orderId);
  if (!record) return res.status(404).json({ error: "Payment session not found or expired." });
  if (record.status === "COMPLETED") return res.status(409).json({ error: "Payment has already been completed." });
  try {
    const { ordersController } = getControllers();
    const { body: orderBody } = await ordersController.getOrder({ id: orderId });
    const approvedOrder = parseBody(orderBody);
    const approvedUnit = approvedOrder.purchase_units?.[0];
    const approvedAmount = approvedUnit?.amount;
    if (
      approvedOrder.status !== "APPROVED" ||
      approvedUnit?.custom_id !== record.id ||
      approvedAmount?.value !== record.amount ||
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
  order.status !== "COMPLETED" ||
  capture?.status !== "COMPLETED" ||
  unit?.custom_id !== record.id ||
      capturedAmount !== record.amount ||
      capturedCurrency !== record.currency
    ) {
      console.error("PayPal capture verification failed", { orderId, status: order.status, captureStatus: capture?.status });
      return res.status(502).json({ error: "Payment could not be verified." });
    }
  record.status = "COMPLETED";
  record.captureId = capture.id;
  payments.set(orderId, record);
    return res.status(httpResponse.statusCode).json({
      success: true,
      status: "COMPLETED",
      orderId,
  captureId: capture.id,
  packageId: record.id,
  amount: record.amount,
      currency: record.currency,
    });
  } catch (error) {
    console.error("PayPal capture failed:", errorMessage(error));
    return res.status(502).json({ error: "Payment could not be completed. Please try again." });
  }
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
