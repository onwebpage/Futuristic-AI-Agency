#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Error] Missing Supabase credentials in .env");
  process.exit(1);
}

const EMAIL = "aliyaanmohd42@gmail.com";
const PACKAGE_ID = "bpo-starter";
const PACKAGE_NAME = "BPO Starter";
const AMOUNT = 99;
const CURRENCY = "USD";
const STATUS = "PAID";

async function addBPOPurchase() {
  try {
    console.log("[BPO Purchase] Connecting to Supabase database...");

    // Step 1: Find user by email
    console.log(`[BPO Purchase] Finding user with email: ${EMAIL}`);
    const findUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(EMAIL)}&select=id,email,full_name,selected_plan`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!findUserResponse.ok) {
      throw new Error(`Failed to fetch user: ${findUserResponse.statusText}`);
    }

    const users = await findUserResponse.json();
    if (users.length === 0) {
      console.error(`[Error] No user found with email: ${EMAIL}`);
      process.exit(1);
    }

    const user = users[0];
    const userId = user.id;
    console.log(`[BPO Purchase] Found user: ${user.full_name || user.email} (ID: ${userId})`);
    console.log(`[BPO Purchase] Current plan: ${user.selected_plan || "None"}`);

    // Step 2: Create purchase record
    console.log(`[BPO Purchase] Creating purchase record...`);
    const createPurchaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/purchases`,
      {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          user_id: userId,
          package_id: PACKAGE_ID,
          package_name: PACKAGE_NAME,
          paypal_order_id: `BPO-${Date.now()}-MANUAL`,
          paypal_capture_id: `BPO-CAPTURE-${Date.now()}`,
          amount: AMOUNT,
          currency: CURRENCY,
          status: STATUS,
          purchased_at: new Date().toISOString(),
        }),
      }
    );

    if (!createPurchaseResponse.ok) {
      const error = await createPurchaseResponse.text();
      throw new Error(`Failed to create purchase: ${error}`);
    }

    const purchases = await createPurchaseResponse.json();
    const purchase = Array.isArray(purchases) ? purchases[0] : purchases;
    const purchaseId = purchase.id;
    console.log(`[BPO Purchase] Purchase created with ID: ${purchaseId}`);
    console.log(`[BPO Purchase] Purchase details:`, purchase);

    // Step 3: Update user's selected_plan
    console.log(`[BPO Purchase] Updating user's selected_plan to: ${PACKAGE_ID}`);
    const updateUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          selected_plan: PACKAGE_ID,
        }),
      }
    );

    if (!updateUserResponse.ok) {
      const error = await updateUserResponse.text();
      throw new Error(`Failed to update user plan: ${error}`);
    }

    const updatedUsers = await updateUserResponse.json();
    const updatedUser = Array.isArray(updatedUsers) ? updatedUsers[0] : updatedUsers;
    console.log(`[BPO Purchase] User plan updated successfully`);

    // Step 4: Verify the purchase was created
    console.log(`[BPO Purchase] Verifying purchase...`);
    const verifyResponse = await fetch(
      `${supabaseUrl}/rest/v1/purchases?id=eq.${purchaseId}&select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const verifyPurchases = await verifyResponse.json();
    const verifiedPurchase = Array.isArray(verifyPurchases) ? verifyPurchases[0] : verifyPurchases;

    console.log(`
================================================================================
✓ BPO PLAN PURCHASE SUCCESSFULLY ADDED
================================================================================
User Email:          ${user.email}
User Name:           ${user.full_name || "N/A"}
User ID:             ${userId}
Package ID:          ${PACKAGE_ID}
Package Name:        ${PACKAGE_NAME}
Purchase ID:         ${purchaseId}
Amount:              $${AMOUNT}.00 ${CURRENCY}
Status:              ${STATUS}
Previous Plan:       ${user.selected_plan || "None"}
New Plan:            ${PACKAGE_ID}
Purchase Date:       ${new Date().toISOString()}
PayPal Order ID:     ${purchase.paypal_order_id}
PayPal Capture ID:   ${purchase.paypal_capture_id}
================================================================================
Verified Purchase Details:
${JSON.stringify(verifiedPurchase, null, 2)}
================================================================================
`);

  } catch (err) {
    console.error("[Error] Failed to add BPO purchase:", err.message);
    process.exit(1);
  }
}

addBPOPurchase();
