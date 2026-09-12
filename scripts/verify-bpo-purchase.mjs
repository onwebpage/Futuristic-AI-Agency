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

async function verifyPurchase() {
  try {
    // Verify purchase
    const purchaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/purchases?id=eq.2&select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );
    const purchases = await purchaseResponse.json();
    console.log("Purchase Record:");
    console.log(JSON.stringify(purchases[0], null, 2));

    // Verify user plan
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.bc95c590-d145-4230-9375-26b44131f2c9&select=id,email,full_name,selected_plan`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );
    const users = await userResponse.json();
    console.log("\nUser Record:");
    console.log(JSON.stringify(users[0], null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

verifyPurchase();
