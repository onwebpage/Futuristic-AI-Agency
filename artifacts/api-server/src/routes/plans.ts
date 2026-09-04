import { Router } from "express";
import { plansRepository } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const SEED_PLANS = [
  // ─── A. AI & AUTOMATION ───────────────────────────────────────────────────
  {
    serviceId: "ai-launch",
    serviceNumber: "01",
    category: "AI & Automation",
    name: "AI Launch",
    price: 25000,
    tag: "Targeted Entry",
    description: "For companies ready to introduce AI into one important business function.",
    features: [
      "AI readiness assessment",
      "AI strategy & roadmap",
      "1 AI-powered workflow",
      "Custom AI application/agent",
      "LLM integration",
      "Knowledge base / RAG",
      "Business system integration",
      "Security baseline",
      "Analytics dashboard",
      "Deployment",
      "30 days post-launch support",
    ],
    popular: false,
    sortOrder: 0,
  },
  {
    serviceId: "ai-transformation",
    serviceNumber: "02",
    category: "AI & Automation",
    name: "AI Transformation",
    price: 75000,
    tag: "Most Popular",
    description: "For companies looking to automate multiple business processes with AI.",
    features: [
      "Everything in AI Launch",
      "3–5 AI agents/workflows",
      "CRM/ERP integrations",
      "Advanced automation",
      "Document intelligence",
      "Customer-service automation",
      "Sales automation",
      "Internal AI copilot",
      "Advanced analytics",
      "Role-based access",
      "AI governance framework",
      "Production infrastructure",
      "90 days optimization & support",
    ],
    popular: true,
    sortOrder: 1,
  },
  {
    serviceId: "enterprise-ai",
    serviceNumber: "03",
    category: "AI & Automation",
    name: "Enterprise AI",
    price: 150000,
    tag: "Enterprise Scale",
    description: "For enterprises and organizations with complex technology environments.",
    features: [
      "Enterprise AI strategy",
      "AI architecture",
      "Multi-agent AI systems",
      "Private AI environment",
      "Enterprise RAG",
      "Multiple business integrations",
      "Custom AI applications",
      "AI governance",
      "Security architecture",
      "Data pipelines",
      "Model evaluation",
      "Monitoring",
      "Compliance-ready architecture",
      "Cloud deployment",
      "Dedicated engineering team",
      "6 months optimization",
    ],
    popular: false,
    sortOrder: 2,
  },

  // ─── B. CLOUD & MODERNIZATION ──────────────────────────────────────────────
  {
    serviceId: "cloud-modernization",
    serviceNumber: "04",
    category: "Cloud & Modernization",
    name: "Cloud Modernization",
    price: 100000,
    tag: "Infrastructure Scale",
    description: "Migrate, re-architect, and optimize workloads across AWS, Azure, and Google Cloud.",
    features: [
      "Infrastructure assessment",
      "Cloud strategy",
      "AWS / Azure / Google Cloud architecture",
      "Application migration",
      "Database migration",
      "API modernization",
      "DevOps implementation",
      "CI/CD",
      "Infrastructure automation",
      "Security hardening",
      "Monitoring",
      "Disaster recovery",
      "Performance optimization",
    ],
    popular: false,
    sortOrder: 3,
  },
  {
    serviceId: "legacy-transformation",
    serviceNumber: "05",
    category: "Cloud & Modernization",
    name: "Legacy Transformation",
    price: 150000,
    tag: "System Modernization",
    description: "Deconstruct monoliths, modernize legacy codebases, and eliminate critical technical debt.",
    features: [
      "Legacy application audit",
      "Architecture redesign",
      "Code modernization",
      "Database modernization",
      "API development",
      "Cloud migration",
      "UI modernization",
      "Testing automation",
      "Security modernization",
      "AI integration",
      "Deployment",
      "Knowledge transfer",
      "Long-term support",
    ],
    popular: false,
    sortOrder: 4,
  },
  {
    serviceId: "enterprise-transformation",
    serviceNumber: "06",
    category: "Cloud & Modernization",
    name: "Enterprise Transformation",
    price: 300000,
    tag: "Flagship Strategic Engagement",
    description: "For organizations requiring a complete technology transformation.",
    features: [
      "Technology assessment",
      "Digital transformation strategy",
      "Legacy modernization",
      "Cloud transformation",
      "AI implementation",
      "Data modernization",
      "Cybersecurity",
      "Enterprise integrations",
      "DevOps",
      "Custom software engineering",
      "Technology governance",
      "Dedicated transformation team",
      "12-month roadmap",
    ],
    popular: true,
    sortOrder: 5,
  },

  // ─── C. CYBERSECURITY ──────────────────────────────────────────────────────
  {
    serviceId: "cybersecurity-foundation",
    serviceNumber: "07",
    category: "Cybersecurity",
    name: "Cybersecurity Foundation",
    price: 50000,
    tag: "Essential Defense",
    description: "Establish essential enterprise security controls, IAM, and risk posture.",
    features: [
      "Security assessment",
      "Vulnerability assessment",
      "IAM",
      "Endpoint security",
      "Network security",
      "Cloud security",
      "Security policies",
      "Risk assessment",
      "Security roadmap",
    ],
    popular: false,
    sortOrder: 6,
  },
  {
    serviceId: "enterprise-security",
    serviceNumber: "08",
    category: "Cybersecurity",
    name: "Enterprise Security",
    price: 125000,
    tag: "Zero Trust Architecture",
    description: "Implement complete Zero Trust architecture, SIEM integration, and incident response.",
    features: [
      "Zero Trust architecture",
      "Cloud security",
      "Identity & access management",
      "SIEM",
      "Security monitoring",
      "Vulnerability management",
      "Incident response",
      "Security automation",
      "Compliance support",
      "Security operations",
    ],
    popular: false,
    sortOrder: 7,
  },
  {
    serviceId: "ai-security",
    serviceNumber: "09",
    category: "Cybersecurity",
    name: "AI Security",
    price: 100000,
    tag: "LLM & GenAI Defense",
    description: "Harden LLMs, agents, and generative systems against prompt injection and data leaks.",
    features: [
      "AI security assessment",
      "LLM security",
      "Data-leakage prevention",
      "Prompt-injection protection",
      "AI access controls",
      "Model security",
      "AI monitoring",
      "AI governance",
      "Security testing",
      "Enterprise AI security architecture",
    ],
    popular: false,
    sortOrder: 8,
  },

  // ─── D. DATA & ANALYTICS ────────────────────────────────────────────────────
  {
    serviceId: "data-foundation",
    serviceNumber: "10",
    category: "Data & Analytics",
    name: "Data Foundation",
    price: 75000,
    tag: "Single Source of Truth",
    description: "Unify fragmented data sources into a modern data warehouse with automated ETL.",
    features: [
      "Data architecture",
      "Data warehouse",
      "Data pipelines",
      "ETL/ELT",
      "Data integration",
      "Data quality",
      "Business dashboards",
      "Reporting",
    ],
    popular: false,
    sortOrder: 9,
  },
  {
    serviceId: "enterprise-data-platform",
    serviceNumber: "11",
    category: "Data & Analytics",
    name: "Enterprise Data Platform",
    price: 150000,
    tag: "Lakehouse & Real-Time",
    description: "Build an AI-ready data lakehouse capable of real-time analytics and predictive ML pipelines.",
    features: [
      "Data lake/lakehouse",
      "Real-time data",
      "Enterprise data warehouse",
      "Data governance",
      "Data engineering",
      "Advanced analytics",
      "BI",
      "AI-ready data architecture",
      "Cloud data infrastructure",
    ],
    popular: false,
    sortOrder: 10,
  },

  // ─── E. PRODUCT ENGINEERING ────────────────────────────────────────────────
  {
    serviceId: "digital-product-development",
    serviceNumber: "12",
    category: "Product Engineering",
    name: "Digital Product Development",
    price: 50000,
    tag: "Full-Lifecycle Build",
    description: "Engineer mission-critical digital products from architecture through production deployment.",
    features: [
      "Product strategy",
      "UX/UI",
      "Architecture",
      "Web application",
      "Mobile application",
      "Backend",
      "APIs",
      "Cloud infrastructure",
      "QA",
      "Security",
      "Deployment",
    ],
    popular: false,
    sortOrder: 11,
  },
  {
    serviceId: "enterprise-product-engineering",
    serviceNumber: "13",
    category: "Product Engineering",
    name: "Enterprise Product Engineering",
    price: 150000,
    tag: "Dedicated Squad",
    description: "Deploy a dedicated senior engineering team to architect and build complex systems.",
    features: [
      "Product discovery",
      "Enterprise architecture",
      "UX/UI",
      "Web & mobile",
      "Backend systems",
      "API ecosystem",
      "Cloud",
      "Data",
      "AI integration",
      "Cybersecurity",
      "DevOps",
      "QA automation",
      "Dedicated engineering team",
    ],
    popular: false,
    sortOrder: 12,
  },

  // ─── F. MANAGED SERVICES ───────────────────────────────────────────────────
  {
    serviceId: "managed-ai",
    serviceNumber: "14",
    category: "Managed Services",
    name: "Managed AI",
    price: 10000,
    tag: "Continuous AI Ops ($10k/mo)",
    description: "Ongoing AI agent optimization, model management, infrastructure, and latency monitoring.",
    features: [
      "AI monitoring",
      "Agent optimization",
      "Model management",
      "AI infrastructure",
      "Performance monitoring",
      "Security monitoring",
      "Continuous improvements",
      "Support",
    ],
    popular: false,
    sortOrder: 13,
  },
  {
    serviceId: "managed-cloud",
    serviceNumber: "15",
    category: "Managed Services",
    name: "Managed Cloud",
    price: 10000,
    tag: "24/7 Cloud Operations ($10k/mo)",
    description: "24/7 cloud monitoring, infrastructure management, disaster recovery, and cost governance.",
    features: [
      "Cloud monitoring",
      "Infrastructure management",
      "DevOps",
      "Security",
      "Backup",
      "Disaster recovery",
      "Cost optimization",
      "24/7 monitoring",
    ],
    popular: false,
    sortOrder: 14,
  },
  {
    serviceId: "managed-cybersecurity",
    serviceNumber: "16",
    category: "Managed Services",
    name: "Managed Cybersecurity",
    price: 15000,
    tag: "SOC & Threat Hunting ($15k/mo)",
    description: "Continuous security monitoring, threat detection, vulnerability management, and incident response.",
    features: [
      "Security monitoring",
      "Threat detection",
      "Vulnerability management",
      "Incident response",
      "Security reporting",
      "Security operations",
      "Continuous risk assessment",
    ],
    popular: false,
    sortOrder: 15,
  },
];

let seedPromise: Promise<void> | undefined;

function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = plansRepository.seedIfEmpty(SEED_PLANS).catch((error) => {
      seedPromise = undefined;
      console.warn("[Plans] Seed data check warning:", error?.message || error);
    });
  }
  return seedPromise;
}

ensureSeedData().catch(() => {});

router.get("/plans", async (_req, res) => {
  try {
    await ensureSeedData();
    const plans = await plansRepository.getAll();
    res.json(plans);
  } catch (error: any) {
    console.error("Plans query failed:", error);
    res.status(503).json({ error: "Plans are temporarily unavailable.", details: error?.message });
  }
});

router.get("/admin/plans", requireAuth, async (_req, res) => {
  try {
    await ensureSeedData();
    const plans = await plansRepository.getAll();
    res.json(plans);
  } catch (error: any) {
    console.error("Admin plans query failed:", error);
    res.status(503).json({ error: "Plans are temporarily unavailable.", details: error?.message });
  }
});

router.post("/admin/plans", requireAuth, async (req, res) => {
  try {
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

    const plan = await plansRepository.create({
      serviceId,
      serviceNumber: serviceNumber || "00",
      category: category || "Other",
      name,
      price: Number(price),
      tag,
      description,
      features: features ?? [],
      popular: popular ?? false,
      sortOrder: sortOrder ?? 0,
    });

    res.status(201).json(plan);
  } catch (error: any) {
    console.error("Create plan error:", error);
    res.status(500).json({ error: "Failed to create plan", details: error?.message });
  }
});

router.patch("/admin/plans/:id", requireAuth, async (req, res) => {
  try {
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

    const plan = await plansRepository.update(id, {
      name,
      price: price !== undefined ? Number(price) : undefined,
      tag,
      description,
      features,
      popular,
      sortOrder,
      serviceId,
      serviceNumber,
      category,
    });

    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    res.json(plan);
  } catch (error: any) {
    console.error("Update plan error:", error);
    res.status(500).json({ error: "Failed to update plan", details: error?.message });
  }
});

router.delete("/admin/plans/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const success = await plansRepository.delete(id);
    if (!success) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete plan error:", error);
    res.status(500).json({ error: "Failed to delete plan", details: error?.message });
  }
});

export default router;
