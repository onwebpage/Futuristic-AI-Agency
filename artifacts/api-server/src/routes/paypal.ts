import { Router } from "express";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "../lib/paypal.js";

const router = Router();

router.get("/paypal/setup", async (req, res) => {
  try {
    await loadPaypalDefault(req, res);
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status ?? 500;
    console.error("PayPal setup error:", err?.message ?? err);
    res.status(status).json({ error: "PayPal initialisation failed" });
  }
});

router.post("/paypal/order", async (req, res) => {
  try {
    await createPaypalOrder(req, res);
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status ?? 500;
    console.error("PayPal create order error:", err?.message ?? err);
    res.status(status).json({ error: "Failed to create PayPal order" });
  }
});

router.post("/paypal/order/:orderID/capture", async (req, res) => {
  try {
    await capturePaypalOrder(req, res);
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status ?? 500;
    console.error("PayPal capture error:", err?.message ?? err);
    res.status(status).json({ error: "Failed to capture PayPal order" });
  }
});

export default router;
