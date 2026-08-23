// Exact 99.99% data model matching PDF 1 (AI Development Packages) & PDF 2 (Thinkatic ScaleOS)

export interface AIPackage {
  id: string;
  packageNumber: string;
  name: string;
  subtitle: string;
  setupPrice: number;
  monthlyPrice: number;
  setupPriceFormatted: string;
  monthlyPriceFormatted: string;
  isRecommended?: boolean;
  tag?: string;
  description: string;
  includes: string[];
  exampleAgents?: string[];
  exampleWorkflow?: string[];
  useCases?: string[];
  connectsTo?: string[];
  exampleQuery?: string;
  workflowSteps?: string[];
  idealCustomer: string;
  bestOutcome?: string;
  recommendedPlanBadge?: string;
}

export interface EngagementTier {
  id: string;
  name: string;
  startingPrice: string;
  description: string;
  isPopular?: boolean;
}

export interface CatalogOverviewItem {
  id: number;
  package: string;
  isBestOverall?: boolean;
  coreService: string;
  setupPrice: string;
  monthlyPrice: string;
  bestFor: string;
}

export interface ScaleOSTier {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  seats: string;
  contract: string;
  renewal: string;
  isMostPopular?: boolean;
  subtitle: string;
  description: string;
  pillars: {
    title: string;
    items: string[];
  }[];
  summaryQuote: string;
  summaryPrice: string;
  lifetimeSupportNote?: string;
}

export interface ScaleOSComparisonRow {
  feature: string;
  starter: string;
  growth: string;
  enterprise: string;
  isCheckmark?: boolean;
}

export interface PortfolioProject {
  id: number;
  project: string;
  region: "USA" | "UK" | "INDIA";
  payout: string;
  cycle: string;
  typeNotes: string;
}

export interface AlternativeComparisonRow {
  traditional: string;
  scaleOS: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF 1: AI DEVELOPMENT PACKAGES (2026 EDITION — U.S. MARKET PRICING)
// ─────────────────────────────────────────────────────────────────────────────

export const AI_CATALOG_OVERVIEW: CatalogOverviewItem[] = [
  {
    id: 1,
    package: "AI Agent Pro",
    isBestOverall: true,
    coreService: "AI Agent Development",
    setupPrice: "$7,500",
    monthlyPrice: "$1,500",
    bestFor: "Companies wanting an AI employee",
  },
  {
    id: 2,
    package: "AI Automation",
    coreService: "Business Process Automation",
    setupPrice: "$5,000",
    monthlyPrice: "$1,000",
    bestFor: "SMBs reducing manual work",
  },
  {
    id: 3,
    package: "AI Voice Pro",
    coreService: "AI Voice & Customer Support",
    setupPrice: "$6,500",
    monthlyPrice: "$1,500",
    bestFor: "High-volume call businesses",
  },
  {
    id: 4,
    package: "Private AI Brain",
    coreService: "RAG / Knowledge AI",
    setupPrice: "$7,500",
    monthlyPrice: "$1,500",
    bestFor: "Companies with large internal knowledge",
  },
  {
    id: 5,
    package: "AI Sales Engine",
    coreService: "CRM & Sales Automation",
    setupPrice: "$6,500",
    monthlyPrice: "$1,500",
    bestFor: "Sales-driven businesses",
  },
];

export const AI_PACKAGES: AIPackage[] = [
  {
    id: "ai-agent-pro",
    packageNumber: "PACKAGE 01 · RECOMMENDED",
    name: "AI Agent Pro",
    subtitle: "Your AI Employee",
    setupPrice: 7500,
    monthlyPrice: 1500,
    setupPriceFormatted: "$7,500",
    monthlyPriceFormatted: "$1,500/mo",
    isRecommended: true,
    tag: "Best Overall",
    description:
      "Build a custom AI agent that performs a specific business function — from qualifying leads to running internal operations.",
    includes: [
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
    exampleAgents: [
      "AI SDR",
      "AI Recruiter",
      "AI Operations Agent",
      "AI Customer Service Agent",
      "AI Research Agent",
    ],
    idealCustomer: "SMBs & startups",
    recommendedPlanBadge: "★ Best overall",
  },
  {
    id: "ai-automation",
    packageNumber: "PACKAGE 02",
    name: "AI Automation",
    subtitle: "Eliminate Repetitive Work",
    setupPrice: 5000,
    monthlyPrice: 1000,
    setupPriceFormatted: "$5,000",
    monthlyPriceFormatted: "$1,000/mo",
    description:
      "Turn repetitive manual processes into automated AI workflows that run end-to-end without hands-on effort.",
    includes: [
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
    exampleWorkflow: [
      "Email",
      "AI reads request",
      "extracts info",
      "updates CRM",
      "creates task",
      "notifies employee",
    ],
    idealCustomer: "5–100 employees",
    bestOutcome: "Less manual admin work",
  },
  {
    id: "ai-voice-pro",
    packageNumber: "PACKAGE 03",
    name: "AI Voice Pro",
    subtitle: "24/7 AI Phone Agent",
    setupPrice: 6500,
    monthlyPrice: 1500,
    setupPriceFormatted: "$6,500",
    monthlyPriceFormatted: "$1,500/mo",
    description:
      "An AI voice agent that answers, qualifies, routes, and books calls — around the clock, without added headcount.",
    includes: [
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
    useCases: [
      "Medical & home services",
      "Solar & real estate",
      "Insurance & automotive",
      "Restaurants & B2B services",
    ],
    idealCustomer: "500+ calls / month",
    bestOutcome: "More calls, same headcount",
  },
  {
    id: "private-ai-brain",
    packageNumber: "PACKAGE 04",
    name: "Private AI Brain",
    subtitle: "ChatGPT for Your Company",
    setupPrice: 7500,
    monthlyPrice: 1500,
    setupPriceFormatted: "$7,500",
    monthlyPriceFormatted: "$1,500/mo",
    description:
      "Give employees an AI assistant trained on the company's own knowledge — with cited sources for every answer.",
    includes: [
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
    connectsTo: [
      "PDFs, SOPs & internal documents",
      "Website & knowledge bases",
      "Google Drive & SharePoint",
      "Databases",
    ],
    exampleQuery:
      "\"What's our refund policy for enterprise customers?\" — the AI searches company documents and answers with the relevant source.",
    idealCustomer: "20–500 employee companies",
  },
  {
    id: "ai-sales-engine",
    packageNumber: "PACKAGE 05",
    name: "AI Sales Engine",
    subtitle: "AI Sales Team in a Box",
    setupPrice: 6500,
    monthlyPrice: 1500,
    setupPriceFormatted: "$6,500",
    monthlyPriceFormatted: "$1,500/mo",
    description:
      "Automate the sales process from lead to meeting — qualification, personalization, follow-up, and booking.",
    includes: [
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
    workflowSteps: [
      "Lead",
      "Research",
      "Score",
      "Personalized Outreach",
      "Follow-up",
      "Qualification",
      "Meeting",
      "CRM",
    ],
    idealCustomer: "Agencies, SaaS, B2B",
    bestOutcome: "More qualified opportunities",
  },
];

export const AI_ENGAGEMENT_TIERS: EngagementTier[] = [
  {
    id: "starter",
    name: "STARTER",
    startingPrice: "From $5,000",
    description: "For businesses automating one important process.",
  },
  {
    id: "growth",
    name: "★ GROWTH",
    startingPrice: "From $7,500",
    description: "For companies deploying a complete AI workflow or agent.",
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    startingPrice: "From $25,000",
    description:
      "Multiple AI agents, integrations, private AI infrastructure, and ongoing optimization.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PDF 2: THINKATIC SCALEOS (OUTSOURCING PARTNERSHIP PROPOSAL)
// ─────────────────────────────────────────────────────────────────────────────

export const SCALEOS_OVERVIEW = {
  title: "Thinkatic ScaleOS",
  subtitle: "Outsourcing Partnership Proposal",
  pitch:
    "One investment. One partner. 11 months of operational support — from process design and BPO deployment to recruitment, training, technology, quality and performance management.",
  motto: "Outsource. Scale. Operate.",
  location: "Magarpatta City, Hadapsar, Pune, India",
  companyLine: "Thinkatic · A Healweal Group Company",
  quote:
    "\"Thinkatic is not charging you a monthly consulting or renewal fee. You make one strategic investment and we build and support your outsourcing operation for the full 11-month engagement.\"",
  stats: [
    { value: "11", label: "MONTH LAUNCH & MANAGED SUPPORT COMMITMENT" },
    { value: "₹0", label: "ANNUAL RENEWAL OR CONTRACT RENEWAL FEE" },
    { value: "3", label: "SCALE TIERS — 5 TO 500 SEATS" },
  ],
  pipeline: [
    "Project",
    "Trained Team",
    "Technology",
    "Operations",
    "Quality Control",
    "Ongoing Support",
  ],
};

export const SCALEOS_TIERS: ScaleOSTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹5,00,000",
    priceNumeric: 500000,
    seats: "5–10 seats",
    contract: "11-month partnership",
    renewal: "₹0 renewal fee",
    subtitle: "FOR BUSINESSES STARTING THEIR OUTSOURCING JOURNEY",
    description:
      "5–10 seats · 11-month partnership · ₹0 renewal fee — the low-risk entry point into managed outsourcing.",
    pillars: [
      {
        title: "BUILD",
        items: [
          "Process discovery",
          "Process mapping",
          "SOP creation",
          "Workflow design",
          "Outsourcing roadmap",
        ],
      },
      {
        title: "BUILD THE TEAM",
        items: [
          "BPO partner allocation",
          "Recruitment coordination",
          "Candidate screening support",
          "Agent onboarding",
          "Training coordination",
        ],
      },
      {
        title: "BUILD THE OPERATION",
        items: [
          "CRM / workflow setup",
          "Basic technology configuration",
          "KPI framework",
          "QA framework",
          "Reporting structure & escalation matrix",
        ],
      },
      {
        title: "LAUNCH",
        items: [
          "Go-live support",
          "Initial performance monitoring",
          "Process stabilization",
          "Monthly performance review",
        ],
      },
    ],
    summaryQuote: "Start outsourcing without building an outsourcing department.",
    summaryPrice: "₹5 lakh one-time investment for an 11-month partnership.",
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹7,50,000",
    priceNumeric: 750000,
    seats: "10–50 seats",
    contract: "11-month partnership",
    renewal: "₹0 renewal fee",
    isMostPopular: true,
    subtitle: "FOR BUSINESSES READY TO BUILD A SERIOUS OUTSOURCED OPERATION",
    description:
      "10–50 seats · 11-month partnership · ₹0 renewal fee — turn outsourcing into a scalable operating engine.",
    pillars: [
      {
        title: "ADVANCED OPERATIONS",
        items: [
          "Dedicated account manager",
          "Advanced SOPs",
          "Detailed workforce planning",
          "Multi-level escalation system",
          "Advanced QA framework",
          "Weekly performance reporting",
        ],
      },
      {
        title: "TECHNOLOGY",
        items: [
          "Advanced CRM / workflow configuration",
          "Automated reporting",
          "Productivity dashboards",
          "Performance analytics",
          "Call / chat QA integration",
        ],
      },
      {
        title: "PEOPLE",
        items: [
          "Structured recruitment pipeline",
          "Training framework",
          "Mock-process assessment",
          "Replacement coordination",
          "Attrition management support",
        ],
      },
      {
        title: "GROWTH",
        items: [
          "Capacity planning",
          "Additional seat deployment",
          "Process optimization",
          "Monthly strategy review",
          "Expansion support up to 50 seats",
        ],
      },
    ],
    summaryQuote: "Turn outsourcing into a scalable operating engine.",
    summaryPrice: "₹7.5 lakh once. No renewal fee for the 11-month contract.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹10,00,000",
    priceNumeric: 1000000,
    seats: "50–500 seats",
    contract: "11-month contract",
    renewal: "lifetime support · ₹0 renewal fee",
    subtitle: "FOR BUSINESSES BUILDING A LARGE-SCALE OUTSOURCING OPERATION",
    description:
      "50–500 seats · 11-month contract · lifetime support · ₹0 renewal fee.",
    pillars: [
      {
        title: "ENTERPRISE IMPLEMENTATION",
        items: [
          "Multi-process implementation",
          "Multi-team, multi-shift deployment",
          "Large-scale workforce planning",
          "Enterprise SOP architecture",
          "Department-level KPI framework",
        ],
      },
      {
        title: "TECHNOLOGY & ANALYTICS",
        items: [
          "Enterprise reporting & dashboards",
          "Workflow automation",
          "AI-assisted QA where applicable",
          "Performance analytics",
          "Integration support",
        ],
      },
      {
        title: "ENTERPRISE MANAGEMENT",
        items: [
          "Dedicated enterprise account team",
          "Priority escalation",
          "Monthly business reviews",
          "Capacity & workforce optimization",
          "Scale-up support up to 500 seats",
        ],
      },
      {
        title: "LIFETIME STRATEGIC SUPPORT",
        items: [
          "Process & outsourcing advisory",
          "BPO partner coordination",
          "Expansion discussions",
          "Technology guidance",
          "Operational troubleshooting",
        ],
      },
    ],
    lifetimeSupportNote:
      "After the initial 11-month contract, Thinkatic continues providing lifetime strategic advisory without a separate renewal fee. This does not include unlimited free manpower, technology licenses, additional seats, recruitment, or execution — those remain separately chargeable if required.",
    summaryQuote: "Build an outsourcing infrastructure that can scale from 50 to 500 seats.",
    summaryPrice: "₹10 lakh one-time investment. 11-month enterprise partnership + lifetime strategic support.",
  },
];

export const SCALEOS_MATRIX: ScaleOSComparisonRow[] = [
  { feature: "One-time investment", starter: "₹5,00,000", growth: "₹7,50,000", enterprise: "₹10,00,000" },
  { feature: "Contract period", starter: "11 months", growth: "11 months", enterprise: "11 months" },
  { feature: "Seats supported", starter: "5–10", growth: "10–50", enterprise: "50–500" },
  { feature: "Renewal fee", starter: "₹0", growth: "₹0", enterprise: "₹0" },
  { feature: "Lifetime support", starter: "—", growth: "—", enterprise: "✓" },
  { feature: "BPO partner allocation", starter: "✓", growth: "✓", enterprise: "✓" },
  { feature: "Recruitment coordination", starter: "✓", growth: "✓", enterprise: "✓" },
  { feature: "SOP development", starter: "Standard", growth: "Advanced", enterprise: "Enterprise" },
  { feature: "Technology setup", starter: "Standard", growth: "Advanced", enterprise: "Enterprise" },
  { feature: "QA framework", starter: "Standard", growth: "Advanced", enterprise: "Enterprise" },
  { feature: "Performance reporting", starter: "Monthly", growth: "Weekly", enterprise: "Real-time" },
  { feature: "Process optimization", starter: "Basic", growth: "Continuous", enterprise: "Continuous" },
  { feature: "Scale-up support", starter: "Up to 10 seats", growth: "Up to 50 seats", enterprise: "Up to 500 seats" },
  { feature: "Strategic reviews", starter: "Quarterly", growth: "Monthly", enterprise: "Monthly" },
  { feature: "Account management", starter: "Shared", growth: "Dedicated", enterprise: "Dedicated Enterprise Team" },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  { id: 1, project: "AutoCAD Map Digitization / Cadastral", region: "INDIA", payout: "₹3.50 / polygon", cycle: "Monthly", typeNotes: "Direct sign-up available" },
  { id: 2, project: "UK IVA", region: "UK", payout: "£35 / CPA", cycle: "Weekly", typeNotes: "Individual volunteer agreement" },
  { id: 3, project: "UK Debt Settlement", region: "UK", payout: "£20 / CPA", cycle: "Biweekly", typeNotes: "CPA" },
  { id: 4, project: "Solar Appointment Setting", region: "USA", payout: "$40 / appointment", cycle: "Weekly", typeNotes: "Appointment setting" },
  { id: 5, project: "Final Expense Live Transfer", region: "USA", payout: "$35 / CPA", cycle: "Weekly", typeNotes: "Live transfer" },
  { id: 6, project: "USA Auto Warranty Live Transfer", region: "USA", payout: "$40 / CPA", cycle: "Weekly", typeNotes: "Live transfer" },
  { id: 7, project: "Bank DSA – Domestic", region: "INDIA", payout: "2–3% loan; ₹800–₹1,400 / card", cycle: "Monthly", typeNotes: "Banks + selected NBFCs" },
  { id: 8, project: "GIS Project", region: "INDIA", payout: "TBC", cycle: "TBC", typeNotes: "GIS / mapping" },
  { id: 9, project: "SSID Live Transfer", region: "USA", payout: "$30 / CPA", cycle: "Weekly", typeNotes: "Live transfer" },
  { id: 10, project: "Social Security ID / Home Improvement Live Transfer", region: "USA", payout: "$25 / CPA", cycle: "Weekly", typeNotes: "Live transfer" },
  { id: 11, project: "ACA U65 Health Insurance Live Transfer", region: "USA", payout: "$40–$65 / CPA", cycle: "Weekly", typeNotes: "Health insurance" },
  { id: 12, project: "Additional USA Project Slot A", region: "USA", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
  { id: 13, project: "Additional USA Project Slot B", region: "USA", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
  { id: 14, project: "Additional USA Project Slot C", region: "USA", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
  { id: 15, project: "Additional USA Project Slot D", region: "USA", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
  { id: 16, project: "Additional UK Project Slot A", region: "UK", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
  { id: 17, project: "Additional UK Project Slot B", region: "UK", payout: "TBC", cycle: "TBC", typeNotes: "Pending details" },
];

export const ALTERNATIVE_COMPARISON: AlternativeComparisonRow[] = [
  { traditional: "Hire an outsourcing manager", scaleOS: "Thinkatic manages it" },
  { traditional: "Find a BPO partner", scaleOS: "Thinkatic coordinates" },
  { traditional: "Recruit agents", scaleOS: "Thinkatic coordinates" },
  { traditional: "Build SOPs, training & QA", scaleOS: "Included" },
  { traditional: "Set up reporting", scaleOS: "Included" },
  { traditional: "Manage escalations", scaleOS: "Included" },
  { traditional: "Find replacement staff", scaleOS: "Included" },
  { traditional: "Scale the operation", scaleOS: "Included" },
  { traditional: "Pay annual renewal", scaleOS: "₹0" },
  { traditional: "Manage multiple vendors", scaleOS: "One Thinkatic relationship" },
];
