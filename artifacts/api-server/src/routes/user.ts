import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  userProfileRepository,
  attendanceRepository,
  kycRepository,
  affiliateRepository,
  walletRepository,
  plansRepository,
  purchaseRepository,
  withdrawalRepository,
  supabase,
} from "@workspace/db";

const router: IRouter = Router();
const JWT_SECRET = process.env.USER_SESSION_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("USER_SESSION_SECRET must be set in production"); })() : "thinkatic-user-secret-2026");

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

function authError(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message, error: message });
}

// Simple in-memory cache for auth validation (5-minute TTL)
const authCache = new Map<string, { profile: any; timestamp: number }>();
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function requireUserAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    // Check cache first
    const cacheKey = payload.id;
    const cached = authCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < AUTH_CACHE_TTL) {
      // Use cached profile validation
      req.user = payload;
      next();
      return;
    }
    
    // Cache miss or expired - do database lookup
    const profile = await userProfileRepository.getById(payload.id);
    
    // Basic profile checks (skip expensive audit log queries for standard auth)
    if (!profile || profile.isActive === false || profile.bpoStatus === "REJECTED") {
      res.status(401).json({ error: "User account is not active" });
      return;
    }
    
    // Cache the successful validation
    authCache.set(cacheKey, { profile, timestamp: now });
    
    // Clean up old cache entries periodically
    if (authCache.size > 1000) {
      for (const [key, value] of authCache.entries()) {
        if ((now - value.timestamp) > AUTH_CACHE_TTL) {
          authCache.delete(key);
        }
      }
    }
    
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

async function requireBpoWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id || !(await purchaseRepository.hasPaidBpo(req.user.id))) {
      res.status(403).json({ error: "BPO purchase required for withdrawal access" });
      return;
    }
    next();
  } catch (error: any) {
    res.status(500).json({ error: "Unable to verify withdrawal eligibility", details: error?.message });
  }
}

// Cache for module settings (10-minute TTL)
const moduleCache = new Map<string, { enabled: boolean; timestamp: number }>();
const MODULE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function requireFeature(moduleKey: string) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Check cache first
      const cached = moduleCache.get(moduleKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < MODULE_CACHE_TTL) {
        if (cached.enabled === false) {
          res.status(503).json({ success: false, message: `${moduleKey.replaceAll("_", " ")} is currently disabled` });
          return;
        }
        next();
        return;
      }
      
      // Cache miss or expired - query database
      const { data, error } = await supabase.from("module_settings").select("enabled").eq("module_key", moduleKey).maybeSingle();
      if (error) throw error;
      
      const enabled = data?.enabled !== false; // Default to enabled if not found
      
      // Cache the result
      moduleCache.set(moduleKey, { enabled, timestamp: now });
      
      if (!enabled) {
        res.status(503).json({ success: false, message: `${moduleKey.replaceAll("_", " ")} is currently disabled` });
        return;
      }
      next();
    } catch (error: any) {
      console.error(`[Feature] ${moduleKey} check failed:`, error?.message);
      res.status(500).json({ success: false, message: "Feature availability could not be verified" });
    }
  };
}

// Cache for all module settings (5-minute TTL)
let allModulesCache: { data: any; timestamp: number } | null = null;
const ALL_MODULES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

router.get("/user/modules", requireUserAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const now = Date.now();
    
    // Check cache first
    if (allModulesCache && (now - allModulesCache.timestamp) < ALL_MODULES_CACHE_TTL) {
      res.json(allModulesCache.data);
      return;
    }
    
    // Cache miss or expired - query database
    const { data, error } = await supabase.from("module_settings").select("module_key,enabled").order("module_key");
    if (error) throw error;
    
    const result = data || [];
    
    // Cache the result
    allModulesCache = { data: result, timestamp: now };
    
    // Update individual module cache entries as well
    result.forEach((item: { module_key: string; enabled: boolean }) => {
      moduleCache.set(item.module_key, { enabled: item.enabled, timestamp: now });
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load feature settings", details: error?.message });
  }
});

const encryptionKey = () => crypto.createHash("sha256").update(process.env.WITHDRAWAL_ENCRYPTION_KEY || JWT_SECRET).digest();
function encryptPayoutDetails(value: object) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

// -----------------------------------------------------------------------------
// User Authentication (Signup, Login, Profile)
// -----------------------------------------------------------------------------

router.post("/user/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, referralCode, accountType = "USER", phone, companyName, companyDetails, documentDetails } = req.body as {
      email: string;
      password: string;
      fullName?: string;
      referralCode?: string;
      accountType?: "USER" | "BPO";
      phone?: string;
      companyName?: string;
      companyDetails?: string;
      documentDetails?: string;
    };

    if (accountType !== "USER" && accountType !== "BPO") return authError(res, 400, "A valid account type is required");

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required" });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await userProfileRepository.getByEmail(email);
    if (existing) {
      res.status(400).json({ error: "An account with this email already exists" });
      return;
    }

    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await userProfileRepository.getByReferralCode(referralCode.trim());
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profile = await userProfileRepository.create({
      email,
      passwordHash,
      fullName: fullName || email.split("@")[0],
      referredBy: referredById,
      role: accountType === "BPO" ? "bpo_partner" : "user",
      accountType,
      bpoStatus: accountType === "BPO" ? "PENDING" : "APPROVED",
      bpoApplicationDetails: accountType === "BPO" ? { phone: phone || "", companyName: companyName || "", companyDetails: companyDetails || "", documentDetails: documentDetails || "" } : {},
    });

    if (accountType === "BPO") {
      const partnerCode = `BPO-${profile.id.slice(0, 8).toUpperCase()}`;
      const { data: partner, error: partnerError } = await supabase.from("bpo_partners").insert({
        partner_code: partnerCode,
        name: companyName || profile.fullName || email.split("@")[0],
        legal_name: companyName || null,
        contact_name: profile.fullName,
        email: profile.email,
        phone: phone || null,
        status: "active",
      }).select("id").single();
      if (partnerError) throw partnerError;
      const { data: membership, error: membershipError } = await supabase.from("bpo_partner_users").insert({ partner_id: partner.id, user_id: profile.id, role: "partner_admin", status: "active" }).select("id").single();
      if (membershipError) throw membershipError;
      const { data: permissions, error: permissionsError } = await supabase.from("bpo_permissions").select("permission_key");
      if (permissionsError) throw permissionsError;
      if (permissions?.length) {
        const { error } = await supabase.from("bpo_partner_user_permissions").insert(permissions.map((item: { permission_key: string }) => ({ partner_user_id: membership.id, permission_key: item.permission_key })));
        if (error) throw error;
      }
    }

    // Auto-create wallet
    await walletRepository.getOrCreate(profile.id);

    // Record affiliate referral linkage if referred
    if (referredById && referralCode) {
      try {
        await affiliateRepository.registerReferral(
          referredById,
          profile.id,
          referralCode.trim()
        );
      } catch (affErr) {
        console.warn("[Affiliate] Referral record warning:", affErr);
      }
    }

    const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash: _, ...safeProfile } = profile;
    return res.status(201).json({ token, profile: safeProfile });
  } catch (err: any) {
    console.error("User signup error:", err);
    return res.status(500).json({ error: "Signup failed", details: err?.message });
  }
});

router.post("/user/auth/login", async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const accountType = req.body?.accountType === "BPO" ? "BPO" : req.body?.accountType === "USER" ? "USER" : null;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authError(res, 400, "A valid email address is required");
    if (!password) return authError(res, 400, "Password is required");

    const profile = await userProfileRepository.getByEmail(email);

    if (!profile) {
      return authError(res, 401, "Invalid email or password");
    }
    const actualAccountType = profile.accountType || (profile.role === "partner" || profile.role === "bpo_partner" ? "BPO" : "USER");
    if (!accountType || actualAccountType !== accountType) return authError(res, 403, "This account is registered under a different account type");
    if (!profile.passwordHash || !(await bcrypt.compare(password, profile.passwordHash))) {
      return authError(res, 401, "Invalid email or password");
    }

    if (actualAccountType === "BPO" && profile.bpoStatus === "REJECTED") return authError(res, 403, "Your BPO account application has been rejected. Your account has been disabled. Please contact support if you believe this was a mistake.");
    if (profile.isActive === false) return authError(res, 403, "This account has been disabled. Please contact support.");

    try {
      await walletRepository.getOrCreate(profile.id);
    } catch (walletError: any) {
      console.error("User login wallet provisioning error:", walletError);
      return authError(res, 503, "Your account is valid, but account services are temporarily unavailable. Please try again.");
    }

    const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash: _, ...safeProfile } = profile;
    return res.json({ success: true, message: "Login successful", token, profile: safeProfile });
  } catch (err: any) {
    console.error("User login error:", err);
    return authError(res, 500, "Login service is temporarily unavailable. Please try again.");
  }
});

router.get("/user/profile", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userProfileRepository.getById(req.user!.id);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const { passwordHash: _, ...safeProfile } = profile;
    res.json(safeProfile);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load profile", details: err?.message });
  }
});

router.patch("/user/profile", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, avatarUrl } = req.body as { fullName?: string; avatarUrl?: string };
    const updated = await userProfileRepository.update(req.user!.id, {
      fullName,
      avatarUrl,
    });
    if (!updated) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const { passwordHash: _, ...safeProfile } = updated;
    res.json(safeProfile);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update profile", details: err?.message });
  }
});

router.get("/user/purchases", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const purchases = await purchaseRepository.listForUser(req.user!.id);
    res.json(purchases);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load purchases", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// Plan Selection
// -----------------------------------------------------------------------------

router.post("/user/plans/select", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { planServiceId } = req.body as { planServiceId: string };
    if (!planServiceId) {
      res.status(400).json({ error: "Plan service ID is required" });
      return;
    }

    const plan = await plansRepository.getByServiceId(planServiceId);
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const paidPurchase = (await purchaseRepository.listForUser(req.user!.id)).find(
      (purchase) => purchase.packageId === planServiceId && purchase.status === "PAID",
    );
    if (!paidPurchase) {
      res.status(402).json({ error: "Complete verified payment before activating this plan" });
      return;
    }

    const updated = await userProfileRepository.selectPlan(req.user!.id, planServiceId);
    res.json({ success: true, plan, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to select plan", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// Attendance
// -----------------------------------------------------------------------------

router.post("/user/attendance/check-in", requireUserAuth, requireFeature("attendance"), async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body as { notes?: string };
    const record = await attendanceRepository.checkIn(req.user!.id, notes);
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: "Check-in failed", details: err?.message });
  }
});

router.post("/user/attendance/check-out", requireUserAuth, requireFeature("attendance"), async (req: AuthRequest, res: Response) => {
  try {
    const record = await attendanceRepository.checkOut(req.user!.id);
    if (!record) {
      res.status(404).json({ error: "No active check-in found for today" });
      return;
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: "Check-out failed", details: err?.message });
  }
});

router.get("/user/attendance", requireUserAuth, requireFeature("attendance"), async (req: AuthRequest, res: Response) => {
  try {
    const records = await attendanceRepository.getUserAttendance(req.user!.id);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load attendance", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// KYC Verification
// -----------------------------------------------------------------------------

router.post("/user/kyc", requireUserAuth, requireFeature("kyc"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      dateOfBirth,
      country,
      documentType,
      documentNumber,
      documentFrontUrl,
      documentBackUrl,
      selfieUrl,
    } = req.body;

    if (!fullName || !documentType || !documentNumber) {
      res.status(400).json({ error: "Full name, document type, and document number are required" });
      return;
    }

    const kyc = await kycRepository.submit({
      userId: req.user!.id,
      fullName,
      dateOfBirth,
      country: country || "US",
      documentType,
      documentNumber,
      documentFrontUrl,
      documentBackUrl,
      selfieUrl,
    });

    res.json(kyc);
  } catch (err: any) {
    res.status(500).json({ error: "KYC submission failed", details: err?.message });
  }
});

router.get("/user/kyc", requireUserAuth, requireFeature("kyc"), async (req: AuthRequest, res: Response) => {
  try {
    const kyc = await kycRepository.getByUserId(req.user!.id);
    res.json(kyc || { status: "unsubmitted" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load KYC status", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// Affiliate & Referrals
// -----------------------------------------------------------------------------

router.get("/user/affiliate", requireUserAuth, requireFeature("affiliate"), async (req: AuthRequest, res: Response) => {
  try {
    const profile = await userProfileRepository.getById(req.user!.id);
    const referrals = await affiliateRepository.getUserReferrals(req.user!.id);
    const totalEarned = referrals.reduce((sum, r) => sum + r.totalReward, 0);

    const refCode = profile?.referralCode || "THINK-" + req.user!.id.slice(0, 6).toUpperCase();

    res.json({
      referralCode: refCode,
      referralLink: `${req.protocol}://${req.get("host")}?ref=${refCode}`,
      totalReferrals: referrals.length,
      totalEarned,
      referrals,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load affiliate details", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// Wallet & Transactions
// -----------------------------------------------------------------------------

router.get("/user/wallet", requireUserAuth, requireFeature("wallet"), async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletRepository.getOrCreate(req.user!.id);
    res.json(wallet);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load wallet", details: err?.message });
  }
});

router.get("/user/wallet/transactions", requireUserAuth, requireFeature("wallet"), async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await walletRepository.getTransactions(req.user!.id);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load transactions", details: err?.message });
  }
});

router.get("/user/withdrawals/access", requireUserAuth, requireFeature("bpo_withdrawals"), requireBpoWithdrawal, async (_req, res) => {
  res.json({ eligible: true, minimumAmount: Number(process.env.MIN_WITHDRAWAL_AMOUNT || 50) });
});

router.get("/user/payout-details", requireUserAuth, requireFeature("bpo_withdrawals"), requireBpoWithdrawal, async (req: AuthRequest, res: Response) => {
  try {
    res.json(await withdrawalRepository.listPayoutDetails(req.user!.id));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load payout details", details: err?.message });
  }
});

router.post("/user/payout-details", requireUserAuth, requireFeature("bpo_withdrawals"), requireBpoWithdrawal, async (req: AuthRequest, res: Response) => {
  try {
    const { method, paypalEmail, accountHolderName, bankName, accountNumber, ifscCode, accountType } = req.body ?? {};
    if (method === "paypal") {
      if (typeof paypalEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
        res.status(400).json({ error: "A valid PayPal email is required" });
        return;
      }
      const detail = await withdrawalRepository.savePayoutDetail({ userId: req.user!.id, method, encrypted: encryptPayoutDetails({ paypalEmail }), displayLabel: `PayPal ending ${paypalEmail.slice(-Math.min(18, paypalEmail.length))}` });
      res.json(detail);
      return;
    }
    if (method !== "indian_bank" || typeof accountHolderName !== "string" || accountHolderName.trim().length < 2 || typeof bankName !== "string" || bankName.trim().length < 2 || typeof accountNumber !== "string" || !/^\d{9,18}$/.test(accountNumber) || typeof ifscCode !== "string" || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase()) || !["savings", "current"].includes(accountType)) {
      res.status(400).json({ error: "Valid Indian bank account holder, bank name, account number, IFSC code, and account type are required" });
      return;
    }
    const detail = await withdrawalRepository.savePayoutDetail({ userId: req.user!.id, method, encrypted: encryptPayoutDetails({ accountHolderName: accountHolderName.trim(), bankName: bankName.trim(), accountNumber, ifscCode: ifscCode.toUpperCase(), accountType }), displayLabel: `${bankName.trim()} account ending ${accountNumber.slice(-4)}` });
    res.json(detail);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save payout details", details: err?.message });
  }
});

router.get("/user/withdrawals", requireUserAuth, requireFeature("bpo_withdrawals"), requireBpoWithdrawal, async (req: AuthRequest, res: Response) => {
  try {
    res.json(await withdrawalRepository.listForUser(req.user!.id));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load withdrawal history", details: err?.message });
  }
});

router.post("/user/withdrawals", requireUserAuth, requireFeature("bpo_withdrawals"), requireBpoWithdrawal, async (req: AuthRequest, res: Response) => {
  try {
    const amount = Number(req.body?.amount);
    const payoutDetailsId = Number(req.body?.payoutDetailsId);
    const minimumAmount = Number(process.env.MIN_WITHDRAWAL_AMOUNT || 50);
    if (!Number.isFinite(amount) || amount < minimumAmount) {
      res.status(400).json({ error: `Minimum withdrawal amount is ${minimumAmount.toFixed(2)}` });
      return;
    }
    if (!Number.isInteger(payoutDetailsId) || payoutDetailsId <= 0) {
      res.status(400).json({ error: "A saved payout method is required" });
      return;
    }
    const detail = await withdrawalRepository.getPayoutDetail(req.user!.id, payoutDetailsId);
    if (!detail) {
      res.status(400).json({ error: "Invalid payout method" });
      return;
    }
    const withdrawal = await withdrawalRepository.create(req.user!.id, Math.round(amount * 100) / 100, "USD", detail.method, payoutDetailsId);
    res.status(201).json(withdrawal);
  } catch (err: any) {
    const message = err?.message || "Withdrawal failed";
    res.status(message.includes("Insufficient") || message.includes("already pending") ? 400 : 500).json({ error: message });
  }
});

router.post("/user/wallet/withdraw", requireUserAuth, requireBpoWithdrawal, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, destination } = req.body as { amount: number; destination: string };
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "A valid positive withdrawal amount is required" });
      return;
    }

    const wallet = await walletRepository.getOrCreate(req.user!.id);
    if (wallet.balance < amount) {
      res.status(400).json({ error: "Insufficient wallet balance" });
      return;
    }

    const tx = await walletRepository.addTransaction({
      walletId: wallet.id,
      userId: req.user!.id,
      type: "withdrawal",
      amount,
      description: `Withdrawal request to ${destination || "bank/paypal"}`,
    });

    res.json({ success: true, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: "Withdrawal failed", details: err?.message });
  }
});

export default router;
