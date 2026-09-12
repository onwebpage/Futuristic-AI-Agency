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

// Use direct REST API call
const EMAIL = "aliyaanmohd42@gmail.com";
const AMOUNT_TO_ADD = 500;
const CURRENCY = "USD";

async function addWalletBalance() {
  try {
    console.log("[Wallet] Connecting to Supabase database...");

    // Step 1: Find user by email
    console.log(`[Wallet] Finding user with email: ${EMAIL}`);
    const findUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(EMAIL)}&select=id,email,full_name`,
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
    console.log(`[Wallet] Found user: ${user.full_name || user.email} (ID: ${userId})`);

    // Step 2: Check if wallet exists
    console.log(`[Wallet] Checking for existing wallet...`);
    const findWalletResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallets?user_id=eq.${encodeURIComponent(userId)}&select=id,balance`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const wallets = await findWalletResponse.json();
    let walletId;
    let currentBalance;

    if (wallets.length === 0) {
      // Step 3: Create wallet if it doesn't exist
      console.log(`[Wallet] Creating new wallet for user...`);
      const createWalletResponse = await fetch(
        `${supabaseUrl}/rest/v1/wallets`,
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
            balance: AMOUNT_TO_ADD,
            currency: CURRENCY,
          }),
        }
      );

      if (!createWalletResponse.ok) {
        const error = await createWalletResponse.text();
        throw new Error(`Failed to create wallet: ${error}`);
      }

      const newWallets = await createWalletResponse.json();
      const newWallet = Array.isArray(newWallets) ? newWallets[0] : newWallets;
      walletId = newWallet.id;
      currentBalance = newWallet.balance;
      console.log(`[Wallet] Wallet created with ID: ${walletId}`);
    } else {
      const wallet = wallets[0];
      walletId = wallet.id;
      currentBalance = wallet.balance;
      console.log(`[Wallet] Found existing wallet (ID: ${walletId}) with balance: $${currentBalance.toFixed(2)}`);

      // Step 4: Update wallet balance
      console.log(`[Wallet] Adding $${AMOUNT_TO_ADD}.00 USD to wallet...`);
      const updateWalletResponse = await fetch(
        `${supabaseUrl}/rest/v1/wallets?id=eq.${walletId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            balance: currentBalance + AMOUNT_TO_ADD,
          }),
        }
      );

      if (!updateWalletResponse.ok) {
        const error = await updateWalletResponse.text();
        throw new Error(`Failed to update wallet: ${error}`);
      }

      const updatedWallets = await updateWalletResponse.json();
      const updatedWallet = Array.isArray(updatedWallets) ? updatedWallets[0] : updatedWallets;
      currentBalance = updatedWallet.balance;
    }

    // Step 5: Record the transaction
    console.log(`[Wallet] Recording transaction in wallet_transactions...`);
    const createTxResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallet_transactions`,
      {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          wallet_id: walletId,
          user_id: userId,
          type: "credit",
          amount: AMOUNT_TO_ADD,
          status: "completed",
          description: `Admin credit: $${AMOUNT_TO_ADD} USD`,
        }),
      }
    );

    if (!createTxResponse.ok) {
      console.warn(`[Warning] Failed to record transaction: ${createTxResponse.statusText}`);
    } else {
      const txs = await createTxResponse.json();
      const tx = Array.isArray(txs) ? txs[0] : txs;
      console.log(`[Wallet] Transaction recorded (ID: ${tx.id})`);
    }

    console.log(`
================================================================================
✓ WALLET BALANCE SUCCESSFULLY ADDED
================================================================================
User Email:          ${user.email}
User Name:           ${user.full_name || "N/A"}
User ID:             ${userId}
Wallet ID:           ${walletId}
Amount Added:        $${AMOUNT_TO_ADD}.00 ${CURRENCY}
New Balance:         $${currentBalance.toFixed(2)} ${CURRENCY}
Previous Balance:    $${(currentBalance - AMOUNT_TO_ADD).toFixed(2)} ${CURRENCY}
Currency:            ${CURRENCY}
Timestamp:           ${new Date().toISOString()}
================================================================================
`);
  } catch (err) {
    console.error("[Error] Failed to add wallet balance:", err.message);
    process.exit(1);
  }
}

addWalletBalance();
