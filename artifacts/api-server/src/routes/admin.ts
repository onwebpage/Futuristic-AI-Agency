import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import {
  adminRepository,
  contactsRepository,
  attendanceRepository,
  kycRepository,
  affiliateRepository,
  walletRepository,
  supabase,
} from "@workspace/db";
import { signToken, requireAuth } from "../lib/auth.js";

const router: IRouter = Router();

async function ensureDefaultAdmin() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await adminRepository.ensureDefaultAdmin(passwordHash);
  } catch (err: any) {
    console.warn("[Admin] Init admin warning:", err?.message || err);
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
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: user.id, username: user.username });
    res.json({ token, username: user.username });
  } catch (error: any) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed", details: error?.message });
  }
});

router.get("/admin/stats", requireAuth, async (_req, res) => {
  try {
    const stats = await contactsRepository.getStats();
    res.json(stats);
  } catch (error: any) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to load stats", details: error?.message });
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
    console.error("Admin submissions error:", error);
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
    console.error("Admin get submission error:", error);
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
    console.error("Admin update submission error:", error);
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
    console.error("Admin delete submission error:", error);
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
    console.error("Admin CSV export error:", error);
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
    console.error("Update password error:", error);
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
    console.error("Admin attendance error:", error);
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
    console.error("Admin KYC error:", error);
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
    console.error("Admin review KYC error:", error);
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
    console.error("Admin affiliates error:", error);
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
    console.error("Admin wallets error:", error);
    res.status(500).json({ error: "Failed to load wallets", details: error?.message });
  }
});

export default router;
