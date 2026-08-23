import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/contacts", async (req, res) => {
  const { name, email, company, budget, message, source } = req.body as {
    name: string;
    email: string;
    company?: string;
    budget?: string;
    message: string;
    source?: string;
  };

  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email, and message are required" });
    return;
  }

  const [submission] = await db
    .insert(contactSubmissionsTable)
    .values({ name, email, company, budget, message, source: source ?? "contact_form" })
    .returning();

  res.status(201).json(submission);
});

export default router;
