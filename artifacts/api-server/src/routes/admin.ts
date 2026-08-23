import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminUsersTable, contactSubmissionsTable } from "@workspace/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";

const router: IRouter = Router();

async function ensureDefaultAdmin() {
  const existing = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, "admin"))
    .limit(1);

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsersTable).values({ username: "admin", passwordHash });
  }
}

ensureDefaultAdmin().catch(() => {});

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, username))
    .limit(1);

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
});

router.get("/admin/stats", requireAuth, async (_req, res) => {
  const [totalResult] = await db.select({ count: count() }).from(contactSubmissionsTable);

  const statusCounts = await db
    .select({ status: contactSubmissionsTable.status, count: count() })
    .from(contactSubmissionsTable)
    .groupBy(contactSubmissionsTable.status);

  const budgetCounts = await db
    .select({ budget: contactSubmissionsTable.budget, count: count() })
    .from(contactSubmissionsTable)
    .groupBy(contactSubmissionsTable.budget);

  const recentToday = await db
    .select({ count: count() })
    .from(contactSubmissionsTable)
    .where(sql`created_at >= now() - interval '24 hours'`);

  const recentWeek = await db
    .select({ count: count() })
    .from(contactSubmissionsTable)
    .where(sql`created_at >= now() - interval '7 days'`);

  res.json({
    total: totalResult.count,
    today: recentToday[0].count,
    thisWeek: recentWeek[0].count,
    byStatus: statusCounts,
    byBudget: budgetCounts,
  });
});

router.get("/admin/submissions", requireAuth, async (req, res) => {
  const { status, search, limit = "50", offset = "0" } = req.query as {
    status?: string;
    search?: string;
    limit?: string;
    offset?: string;
  };

  const submissions = await (status && status !== "all"
    ? db
        .select()
        .from(contactSubmissionsTable)
        .where(eq(contactSubmissionsTable.status, status))
        .orderBy(desc(contactSubmissionsTable.createdAt))
        .limit(parseInt(limit))
        .offset(parseInt(offset))
    : db
        .select()
        .from(contactSubmissionsTable)
        .orderBy(desc(contactSubmissionsTable.createdAt))
        .limit(parseInt(limit))
        .offset(parseInt(offset)));

  const filtered = search
    ? submissions.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          (s.company ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : submissions;

  res.json(filtered);
});

router.get("/admin/submissions/:id", requireAuth, async (req, res) => {
  const [submission] = await db
    .select()
    .from(contactSubmissionsTable)
    .where(eq(contactSubmissionsTable.id, parseInt(req.params.id as string)))
    .limit(1);

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json(submission);
});

router.patch("/admin/submissions/:id", requireAuth, async (req, res) => {
  const { status, notes } = req.body as { status?: string; notes?: string };
  const id = parseInt(req.params.id as string);

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const [updated] = await db
    .update(contactSubmissionsTable)
    .set(updates)
    .where(eq(contactSubmissionsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json(updated);
});

router.delete("/admin/submissions/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);

  const [deleted] = await db
    .delete(contactSubmissionsTable)
    .where(eq(contactSubmissionsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json({ success: true });
});

router.get("/admin/submissions-export", requireAuth, async (_req, res) => {
  const submissions = await db
    .select()
    .from(contactSubmissionsTable)
    .orderBy(desc(contactSubmissionsTable.createdAt));

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
    `"${s.createdAt.toISOString()}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.send(csv);
});

router.patch("/admin/settings/password", requireAuth, async (req: Parameters<typeof requireAuth>[0] & { admin?: { id: number; username: string } }, res) => {
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

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, adminId))
    .limit(1);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db
    .update(adminUsersTable)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsersTable.id, adminId));

  res.json({ success: true });
});

export default router;
