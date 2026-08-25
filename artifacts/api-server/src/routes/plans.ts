import { Router } from "express";
import { db, withDbRetry } from "@workspace/db";
import { plansTable } from "@workspace/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const SEED_PLANS = [
  // ─── PDF 1: AI Development Packages (2026 U.S. Market) ─────────────────────
  {
    serviceId: "ai-agent-pro",
    serviceNumber: "01",
    category: "AI Agent Development",
    name: "AI Agent Pro",
    price: 7500,
    tag: "Best Overall",
    description: "Build a custom AI agent that performs a specific business function — from qualifying leads to running internal operations.",
    features: [
      "1 custom AI agent",
      "Business workflow design",
      "OpenAI / LLM integration",
      "CRM integration",
      "Email integration",
      "Automated task execution",
      "Human approval workflow",
      "Dashboard & analytics",
      "30-day optimization",
    ],
    popular: true,
    sortOrder: 0,
  },
  {
    serviceId: "ai-automation",
    serviceNumber: "02",
    category: "Business Process Automation",
    name: "AI Automation",
    price: 5000,
    tag: "SMBs & Operations",
    description: "Turn repetitive manual processes into automated AI workflows that run end-to-end without hands-on effort.",
    features: [
      "Up to 3 automated workflows",
      "AI document processing",
      "Email automation",
      "CRM automation",
      "Data extraction",
      "Notifications",
      "API integrations",
      "Human approval steps",
      "Workflow dashboard",
      "Monthly optimization",
    ],
    popular: false,
    sortOrder: 1,
  },
  {
    serviceId: "ai-voice-pro",
    serviceNumber: "03",
    category: "AI Voice & Customer Support",
    name: "AI Voice Pro",
    price: 6500,
    tag: "High-volume Call",
    description: "An AI voice agent that answers, qualifies, routes, and books calls — around the clock, without added headcount.",
    features: [
      "AI phone agent",
      "Inbound call handling",
      "Lead qualification",
      "Appointment booking",
      "FAQ handling",
      "CRM integration",
      "Call summaries & recordings",
      "Human transfer",
      "Analytics dashboard",
    ],
    popular: false,
    sortOrder: 2,
  },
  {
    serviceId: "private-ai-brain",
    serviceNumber: "04",
    category: "RAG / Knowledge AI",
    name: "Private AI Brain",
    price: 7500,
    tag: "ChatGPT for Company",
    description: "Give employees an AI assistant trained on the company's own knowledge — with cited sources for every answer.",
    features: [
      "Private AI knowledge base",
      "RAG architecture",
      "Document ingestion",
      "Source citations",
      "User authentication",
      "Admin dashboard",
      "Access controls",
      "Analytics",
      "Continuous knowledge updates",
    ],
    popular: false,
    sortOrder: 3,
  },
  {
    serviceId: "ai-sales-engine",
    serviceNumber: "05",
    category: "CRM & Sales Automation",
    name: "AI Sales Engine",
    price: 6500,
    tag: "Sales Team in a Box",
    description: "Automate the sales process from lead to meeting — qualification, personalization, follow-up, and booking.",
    features: [
      "Lead qualification",
      "Lead enrichment",
      "AI personalization",
      "Email sequences & follow-ups",
      "CRM integration",
      "AI sales assistant",
      "Meeting booking",
      "Lead scoring",
      "Sales dashboard",
    ],
    popular: false,
    sortOrder: 4,
  },

  // ─── PDF 2: Thinkatic ScaleOS (Managed BPO Partnership) ───────────────────
  {
    serviceId: "scaleos-starter",
    serviceNumber: "06",
    category: "ScaleOS Managed BPO",
    name: "ScaleOS Starter (5–10 seats)",
    price: 6000, // Equivalent in USD for checkout representation (~ ₹5,00,000)
    tag: "5–10 seats",
    description: "5–10 seats · 11-month partnership · ₹0 renewal fee — the low-risk entry point into managed outsourcing.",
    features: [
      "Build: Process discovery, mapping & SOP creation",
      "Build Team: BPO partner allocation & candidate screening",
      "Build Ops: CRM/workflow setup, KPI & QA framework",
      "Launch: Go-live support & monthly performance review",
      "Full 17-project portfolio access",
    ],
    popular: false,
    sortOrder: 5,
  },
  {
    serviceId: "scaleos-growth",
    serviceNumber: "07",
    category: "ScaleOS Managed BPO",
    name: "ScaleOS Growth (10–50 seats)",
    price: 9000, // Equivalent in USD for checkout representation (~ ₹7,50,000)
    tag: "10–50 seats (Most Popular)",
    description: "10–50 seats · 11-month partnership · ₹0 renewal fee — turn outsourcing into a scalable operating engine.",
    features: [
      "Advanced Operations & Dedicated account manager",
      "Technology: Automated reporting & productivity dashboards",
      "People: Structured recruitment pipeline & training framework",
      "Growth: Capacity planning & expansion up to 50 seats",
      "Weekly performance reporting & continuous optimization",
    ],
    popular: true,
    sortOrder: 6,
  },
  {
    serviceId: "scaleos-enterprise",
    serviceNumber: "08",
    category: "ScaleOS Managed BPO",
    name: "ScaleOS Enterprise (50–500 seats)",
    price: 12000, // Equivalent in USD for checkout representation (~ ₹10,00,000)
    tag: "50–500 seats",
    description: "50–500 seats · 11-month contract · lifetime strategic support · ₹0 renewal fee.",
    features: [
      "Enterprise multi-process & multi-shift implementation",
      "Workflow automation & AI-assisted QA",
      "Dedicated enterprise account team & priority escalation",
      "Lifetime Strategic Support with ₹0 renewal fee",
      "Scale-up support up to 500 seats",
    ],
    popular: false,
    sortOrder: 7,
  },
];

let seedPromise: Promise<void> | undefined;

function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = withDbRetry(async () => {
      await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(873421)`);
        const existing = await tx.select({ id: plansTable.id }).from(plansTable).limit(1);
        if (existing.length === 0) {
          await tx.insert(plansTable).values(SEED_PLANS);
        }
      });
    }, "Plan seed initialization").catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}

ensureSeedData().catch((error) => console.error("Plan seed initialization failed:", error));

router.get("/plans", async (_req, res) => {
  try {
    await ensureSeedData();
    const plans = await withDbRetry(
      () => db.select().from(plansTable).orderBy(asc(plansTable.serviceNumber), asc(plansTable.sortOrder)),
      "Plans query",
    );

    const groupMap = new Map<string, { id: string; number: string; category: string; plans: typeof plans }>();
    for (const plan of plans) {
      if (!groupMap.has(plan.serviceId)) {
        groupMap.set(plan.serviceId, {
          id: plan.serviceId,
          number: plan.serviceNumber,
          category: plan.category,
          plans: [],
        });
      }
      groupMap.get(plan.serviceId)!.plans.push(plan);
    }
    res.json(Array.from(groupMap.values()));
  } catch (error) {
    console.error("Plans query failed:", error);
    res.status(503).json({ error: "Plans are temporarily unavailable." });
  }
});

router.get("/admin/plans", requireAuth, async (_req, res) => {
  try {
    await ensureSeedData();
    const plans = await withDbRetry(
      () => db.select().from(plansTable).orderBy(asc(plansTable.serviceNumber), asc(plansTable.sortOrder)),
      "Admin plans query",
    );
    res.json(plans);
  } catch (error) {
    console.error("Admin plans query failed:", error);
    res.status(503).json({ error: "Plans are temporarily unavailable." });
  }
});

router.post("/admin/plans", requireAuth, async (req, res) => {
  const { serviceId, serviceNumber, category, name, price, tag, description, features, popular, sortOrder } = req.body as {
    serviceId: string;
    serviceNumber: string;
    category: string;
    name: string;
    price: number;
    tag: string;
    description: string;
    features: string[];
    popular?: boolean;
    sortOrder?: number;
  };

  if (!serviceId || !name || !price || !tag || !description) {
    res.status(400).json({ error: "serviceId, name, price, tag, and description are required" });
    return;
  }

  const [plan] = await db
    .insert(plansTable)
    .values({ serviceId, serviceNumber: serviceNumber || "00", category: category || "Other", name, price: Number(price), tag, description, features: features ?? [], popular: popular ?? false, sortOrder: sortOrder ?? 0 })
    .returning();

  res.status(201).json(plan);
});

router.patch("/admin/plans/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { name, price, tag, description, features, popular, sortOrder, serviceId, serviceNumber, category } = req.body as Partial<{
    name: string;
    price: number;
    tag: string;
    description: string;
    features: string[];
    popular: boolean;
    sortOrder: number;
    serviceId: string;
    serviceNumber: string;
    category: string;
  }>;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = Number(price);
  if (tag !== undefined) updates.tag = tag;
  if (description !== undefined) updates.description = description;
  if (features !== undefined) updates.features = features;
  if (popular !== undefined) updates.popular = popular;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (serviceId !== undefined) updates.serviceId = serviceId;
  if (serviceNumber !== undefined) updates.serviceNumber = serviceNumber;
  if (category !== undefined) updates.category = category;

  const [plan] = await db
    .update(plansTable)
    .set(updates)
    .where(eq(plansTable.id, id))
    .returning();

  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  res.json(plan);
});

router.delete("/admin/plans/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [deleted] = await db.delete(plansTable).where(eq(plansTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
