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

const EMAIL = "aliyaanmohd42@gmail.com";

async function verifyWalletBalance() {
  try {
    console.log(`[Verify] Querying wallet balance for ${EMAIL}...`);

    // Get user
    const findUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(EMAIL)}&select=id,email,full_name`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const users = await findUserResponse.json();
    const user = users[0];
    const userId = user.id;

    // Get wallet
    const findWalletResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallets?user_id=eq.${encodeURIComponent(userId)}&select=id,balance,currency,created_at,updated_at`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const wallets = await findWalletResponse.json();
    const wallet = wallets[0];

    // Get transactions
    const findTxResponse = await fetch(
      `${supabaseUrl}/rest/v1/wallet_transactions?wallet_id=eq.${wallet.id}&select=id,type,amount,status,description,created_at&order=created_at.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const transactions = await findTxResponse.json();

    console.log(`
================================================================================
✓ WALLET VERIFICATION COMPLETE
================================================================================
User Email:          ${user.email}
User Name:           ${user.full_name || "N/A"}
User ID:             ${userId}
Wallet ID:           ${wallet.id}
Current Balance:     $${wallet.balance.toFixed(2)} ${wallet.currency}
Wallet Created:      ${wallet.created_at}
Wallet Updated:      ${wallet.updated_at}

Recent Transactions:
${transactions.map((tx, i) => `  ${i + 1}. [${tx.type.toUpperCase()}] $${tx.amount.toFixed(2)} (${tx.status}) - ${tx.description}`).join("\n")}
================================================================================
`);
  } catch (err) {
    console.error("[Error] Failed to verify wallet balance:", err.message);
    process.exit(1);
  }
}

verifyWalletBalance();
