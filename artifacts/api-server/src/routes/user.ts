import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  userProfileRepository,
  attendanceRepository,
  kycRepository,
  affiliateRepository,
  walletRepository,
  plansRepository,
} from "@workspace/db";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "thinkatic-user-secret-2026";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function requireUserAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string; email: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

// -----------------------------------------------------------------------------
// User Authentication (Signup, Login, Profile)
// -----------------------------------------------------------------------------

router.post("/user/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, referralCode } = req.body as {
      email: string;
      password: string;
      fullName?: string;
      referralCode?: string;
    };

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
    });

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
    res.status(201).json({ token, profile: safeProfile });
  } catch (err: any) {
    console.error("User signup error:", err);
    res.status(500).json({ error: "Signup failed", details: err?.message });
  }
});

router.post("/user/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password?: string };
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    let profile = await userProfileRepository.getByEmail(email);

    if (!profile) {
      // If no password was passed and this is a first-time quick login, create account
      if (!password) {
        profile = await userProfileRepository.create({
          email,
          fullName: email.split("@")[0],
        });
        await walletRepository.getOrCreate(profile.id);
      } else {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    } else if (password && profile.passwordHash) {
      const valid = await bcrypt.compare(password, profile.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    }

    // Ensure wallet is created
    await walletRepository.getOrCreate(profile.id);

    const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash: _, ...safeProfile } = profile;
    res.json({ token, profile: safeProfile });
  } catch (err: any) {
    console.error("User login error:", err);
    res.status(500).json({ error: "Login failed", details: err?.message });
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

    const updated = await userProfileRepository.selectPlan(req.user!.id, planServiceId);
    res.json({ success: true, plan, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to select plan", details: err?.message });
  }
});

// -----------------------------------------------------------------------------
// Attendance
// -----------------------------------------------------------------------------

router.post("/user/attendance/check-in", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body as { notes?: string };
    const record = await attendanceRepository.checkIn(req.user!.id, notes);
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: "Check-in failed", details: err?.message });
  }
});

router.post("/user/attendance/check-out", requireUserAuth, async (req: AuthRequest, res: Response) => {
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

router.get("/user/attendance", requireUserAuth, async (req: AuthRequest, res: Response) => {
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

router.post("/user/kyc", requireUserAuth, async (req: AuthRequest, res: Response) => {
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

router.get("/user/kyc", requireUserAuth, async (req: AuthRequest, res: Response) => {
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

router.get("/user/affiliate", requireUserAuth, async (req: AuthRequest, res: Response) => {
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

router.get("/user/wallet", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletRepository.getOrCreate(req.user!.id);
    res.json(wallet);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load wallet", details: err?.message });
  }
});

router.get("/user/wallet/transactions", requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await walletRepository.getTransactions(req.user!.id);
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load transactions", details: err?.message });
  }
});

router.post("/user/wallet/withdraw", requireUserAuth, async (req: AuthRequest, res: Response) => {
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
