export const BLUE = "#214ECF";
export const BLUE_DIM = "rgba(33,78,207,0.1)";
export const BLUE_BORDER = "rgba(33,78,207,0.14)";

export type ServiceItem = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  whatWeBuild: { title: string; desc: string }[];
  process?: string[];
  technologies?: string[];
  whyUs?: string[];
  benefits?: string[];
  industries?: string[];
  principles?: string[];
  fullServices?: string[];
  trustBadges?: { icon: string; label: string; description: string }[];
  icon: string;
};

export const services: ServiceItem[] = [
  {
    id: "custom-ai",
    number: "01",
    icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
    title: "Custom AI Software Development",
    tagline: "Build AI Software Designed Specifically for Your Business",
    description:
      "At Thinkatic, we develop intelligent AI-powered software tailored to your workflows, business goals, operations, and scalability requirements. Unlike generic tools, our custom AI systems are engineered specifically for your organization, enabling automation, smarter decision-making, operational efficiency, and long-term competitive advantage.",
    whatWeBuild: [
      { title: "AI-Powered Business Applications", desc: "Custom platforms enhanced with AI capabilities for automation, analytics, predictions, and intelligent workflows." },
      { title: "Intelligent Dashboards", desc: "Real-time AI dashboards that provide insights, forecasting, business intelligence, and performance monitoring." },
      { title: "AI CRM & ERP Systems", desc: "Custom CRM, ERP, and management systems powered by machine learning and automation." },
      { title: "AI Agents & Assistants", desc: "Conversational AI assistants and autonomous AI agents for customer support, operations, and workflow management." },
      { title: "Workflow Automation Platforms", desc: "Automate repetitive business operations using AI-driven decision systems and integrations." },
      { title: "Industry-Specific AI Solutions", desc: "AI software built for healthcare, finance, logistics, eCommerce, education, real estate, cybersecurity, and enterprise operations." },
    ],
    process: [
      "Discovery & Strategy", "Architecture Planning", "AI Model Development",
      "Development & Integration", "Testing & Security", "Deployment & Scaling"
    ],
    technologies: ["OpenAI", "LangChain", "Python", "TensorFlow", "PyTorch", "Node.js", "React", "AWS", "Azure", "Google Cloud", "Vector Databases", "Kubernetes", "Docker"],
    whyUs: ["Business-focused AI engineering", "Scalable enterprise architecture", "Advanced AI expertise", "End-to-end development", "Secure and optimized systems", "Long-term support and maintenance"],
  },
  {
    id: "generative-ai",
    number: "02",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Generative AI Development",
    tagline: "Transform Businesses with Next-Generation Generative AI Solutions",
    description:
      "Thinkatic develops advanced Generative AI systems that create content, automate workflows, improve customer experiences, and power intelligent digital products. We help organizations leverage Large Language Models (LLMs), multimodal AI, and intelligent automation to accelerate innovation.",
    whatWeBuild: [
      { title: "AI Chatbots & Virtual Assistants", desc: "Human-like AI assistants for customer support, internal operations, and business automation." },
      { title: "AI Content Generation", desc: "Generate blogs, reports, emails, product descriptions, marketing content, and documentation." },
      { title: "AI Image & Media Generation", desc: "AI systems for image creation, editing, visual automation, and media workflows." },
      { title: "AI Coding Assistants", desc: "AI tools that assist with software development, debugging, and code generation." },
      { title: "AI Knowledge Bases", desc: "Custom AI systems trained on company documents, databases, and internal information." },
      { title: "Multimodal AI Applications", desc: "Combine text, image, voice, and video AI into intelligent business systems." },
    ],
    benefits: ["Reduce operational costs", "Improve productivity", "Automate repetitive work", "Accelerate content production", "Enhance customer experience", "Scale business operations efficiently"],
    industries: ["Healthcare", "Finance", "eCommerce", "SaaS", "Education", "Real Estate", "Logistics", "Cybersecurity", "Enterprise Operations"],
  },
  {
    id: "ai-automation",
    number: "03",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    title: "AI Automation Solutions",
    tagline: "Automate Business Operations with Intelligent AI Systems",
    description:
      "Thinkatic helps businesses automate repetitive, time-consuming, and complex workflows using AI-powered automation systems. We combine artificial intelligence, APIs, cloud systems, and machine learning to create intelligent operational ecosystems that reduce manual work, improve accuracy, increase efficiency, and allow businesses to scale faster.",
    whatWeBuild: [
      { title: "Workflow Automation", desc: "Automate approvals, processing, reporting, communication, and operational tasks." },
      { title: "AI-Powered Customer Support", desc: "24/7 intelligent customer support systems using AI chatbots and automation engines." },
      { title: "Sales & Marketing Automation", desc: "Automate lead management, CRM operations, campaigns, analytics, and personalization." },
      { title: "Data Processing Automation", desc: "AI systems that analyze, process, and organize massive datasets automatically." },
      { title: "AI Email & Communication Automation", desc: "Automate email responses, ticketing systems, and internal communications." },
      { title: "Enterprise Process Automation", desc: "Intelligent systems for HR, finance, operations, procurement, and management workflows." },
    ],
    benefits: ["Lower operational costs", "Faster execution", "Reduced human errors", "Improved efficiency", "Scalable infrastructure", "Enhanced business productivity"],
  },
  {
    id: "machine-learning",
    number: "04",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2",
    title: "Machine Learning Development",
    tagline: "Build Smarter Systems with Machine Learning",
    description:
      "Thinkatic develops Machine Learning solutions that help businesses analyze data, make predictions, automate decisions, and uncover actionable insights. Our ML systems transform raw data into intelligent business intelligence. We build scalable machine learning models customized to your industry and operational requirements.",
    whatWeBuild: [
      { title: "Predictive Analytics", desc: "Forecast trends, customer behavior, risks, and future outcomes." },
      { title: "Recommendation Systems", desc: "AI recommendation engines for eCommerce, SaaS, streaming, and digital platforms." },
      { title: "Computer Vision", desc: "Image recognition, object detection, OCR, facial analysis, and visual AI systems." },
      { title: "Natural Language Processing (NLP)", desc: "Text analysis, sentiment analysis, language processing, and AI understanding systems." },
      { title: "Fraud Detection Systems", desc: "AI systems that identify suspicious activities and security threats." },
      { title: "AI Data Modeling", desc: "Data engineering, feature engineering, and AI pipeline optimization." },
    ],
    technologies: ["TensorFlow", "PyTorch", "Scikit-learn", "OpenCV", "NLP Models", "Vector Databases", "Deep Learning Frameworks"],
  },
  {
    id: "ai-saas",
    number: "05",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    title: "AI SaaS Product Development",
    tagline: "Launch Powerful AI SaaS Platforms",
    description:
      "Thinkatic helps startups and enterprises build scalable AI SaaS products designed for growth, automation, and recurring revenue. From MVP development to enterprise-scale platforms, we create intelligent SaaS ecosystems powered by modern AI technologies.",
    whatWeBuild: [
      { title: "AI Productivity Platforms", desc: "AI tools for workflow management, collaboration, automation, and operations." },
      { title: "AI Analytics Platforms", desc: "Business intelligence and predictive analytics SaaS solutions." },
      { title: "AI Content Platforms", desc: "Platforms for AI-generated content, media, and creative automation." },
      { title: "AI Customer Service Platforms", desc: "AI-powered helpdesk, support, and customer engagement solutions." },
      { title: "Vertical AI SaaS", desc: "Industry-specific AI products for healthcare, finance, legal, logistics, and enterprise sectors." },
      { title: "Multi-Tenant Platforms", desc: "Scalable SaaS architectures with robust subscription and user management systems." },
    ],
    fullServices: ["Product strategy", "MVP development", "UI/UX design", "Backend architecture", "AI integration", "Cloud infrastructure", "API development", "Billing systems", "Security implementation", "Scaling & maintenance"],
    whyUs: ["Startup-focused execution", "Enterprise scalability", "Modern cloud infrastructure", "AI-first product engineering", "Fast development cycles"],
  },
  {
    id: "enterprise-ai",
    number: "06",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Enterprise AI Solutions",
    tagline: "Enterprise AI & Digital Transformation Solutions",
    description:
      "Thinkatic builds enterprise-grade software and AI systems designed for scalability, security, automation, and operational excellence. We help organizations modernize legacy infrastructure and implement intelligent digital ecosystems.",
    whatWeBuild: [
      { title: "Enterprise Software Development", desc: "Custom enterprise platforms for operations, analytics, and workflow management." },
      { title: "AI Enterprise Automation", desc: "Large-scale automation systems for enterprise operations and productivity." },
      { title: "Cloud Infrastructure Solutions", desc: "Scalable cloud architecture, migration, and optimization." },
      { title: "Data Intelligence Platforms", desc: "Enterprise analytics and AI-powered decision systems." },
      { title: "Cybersecurity Integration", desc: "Secure enterprise systems with advanced protection mechanisms." },
      { title: "API & System Integrations", desc: "Connect CRMs, ERPs, cloud services, payment systems, and enterprise tools." },
    ],
    benefits: ["Scalable infrastructure", "Enhanced operational efficiency", "Advanced security", "AI-powered intelligence", "Improved collaboration", "Long-term digital transformation"],
  },
  {
    id: "ui-ux",
    number: "07",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    title: "UI/UX Design for AI Products",
    tagline: "Design Intelligent Experiences for AI Products",
    description:
      "Thinkatic creates modern UI/UX experiences specifically designed for AI-powered applications, SaaS platforms, enterprise systems, and intelligent digital products. We combine design psychology, human-centered experiences, and AI interaction principles to create intuitive and engaging interfaces.",
    whatWeBuild: [
      { title: "AI Product Design", desc: "Design interfaces optimized for AI workflows and intelligent interactions." },
      { title: "SaaS UI/UX Design", desc: "Modern SaaS product experiences focused on usability and scalability." },
      { title: "Enterprise UX Systems", desc: "User experiences built for enterprise productivity and operational efficiency." },
      { title: "AI Chat Interfaces", desc: "Conversation-first UI systems for AI assistants and chatbots." },
      { title: "Dashboard & Analytics Design", desc: "Data-rich visual experiences for intelligent decision-making." },
      { title: "Mobile & Web Experiences", desc: "Responsive cross-platform experiences optimized for performance." },
    ],
    principles: ["Simplicity", "Scalability", "Accessibility", "User-centered workflows", "Modern aesthetics", "Intelligent interactions"],
  },
  {
    id: "ai-consulting",
    number: "08",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "AI Consulting & Strategy",
    tagline: "Strategic AI Consulting for Modern Businesses",
    description:
      "Thinkatic helps organizations understand, implement, and scale artificial intelligence strategically. Our AI consulting services guide businesses through digital transformation, automation opportunities, AI infrastructure planning, and intelligent product development.",
    whatWeBuild: [
      { title: "AI Strategy Development", desc: "Define AI roadmaps aligned with business goals and market opportunities." },
      { title: "AI Opportunity Assessment", desc: "Identify areas where AI can maximize operational and financial impact." },
      { title: "AI Architecture Consulting", desc: "Design scalable AI infrastructure and deployment systems." },
      { title: "AI Product Consulting", desc: "Validate AI product ideas, MVP strategies, and go-to-market planning." },
      { title: "Enterprise AI Transformation", desc: "Implement AI across enterprise operations and workflows." },
      { title: "AI Security & Compliance", desc: "Guidance for secure, ethical, and compliant AI implementation." },
    ],
    whyUs: ["Deep AI expertise", "Business-first strategy", "Enterprise-grade architecture", "Scalable implementation", "Startup-to-enterprise experience", "Long-term technology partnership"],
  },
  {
    id: "healthcare-bpo",
    number: "09",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Healthcare BPO",
    tagline: "Patient-Focused Outsourcing Powered by AI",
    description:
      "Thinkatic delivers intelligent healthcare BPO services that combine compliance expertise with AI automation. From medical billing to patient coordination, we help healthcare organizations reduce administrative burden, improve accuracy, and focus on delivering exceptional patient care.",
    trustBadges: [
      {
        icon: "shield",
        label: "HIPAA-Aligned Operations",
        description: "All patient data is handled under strict privacy protocols with end-to-end encryption, role-based access controls, and comprehensive audit trails as standard. ⚠ Legal review recommended before publishing compliance claims.",
      },
      {
        icon: "phone",
        label: "Call Compliance Ready",
        description: "Our agents are trained on TCPA-aligned calling practices — including prior consent management, do-not-call registry adherence, and call recording disclosures. ⚠ Consult legal counsel for jurisdiction-specific requirements.",
      },
      {
        icon: "lock",
        label: "End-to-End Data Security",
        description: "Patient information is processed on secure, encrypted cloud infrastructure with zero third-party data sharing, contractual confidentiality obligations, and regular security reviews.",
      },
    ],
    whatWeBuild: [
      { title: "Medical Billing & Coding", desc: "Accurate, compliant medical billing and coding with AI-assisted error detection." },
      { title: "Patient Scheduling & Coordination", desc: "24/7 appointment scheduling, reminders, and patient communication management." },
      { title: "Insurance Verification", desc: "Real-time insurance eligibility checks and prior authorization processing." },
      { title: "Medical Records Management", desc: "Secure digitization, indexing, and retrieval of patient records." },
      { title: "Revenue Cycle Management", desc: "End-to-end RCM services to maximize reimbursements and reduce denials." },
      { title: "Healthcare Customer Support", desc: "HIPAA-aligned patient support across phone, chat, and email channels." },
    ],
    benefits: ["HIPAA-aligned operations", "Reduced billing errors", "Faster reimbursements", "Improved patient satisfaction", "Lower administrative costs", "Scalable staffing on demand"],
    industries: ["Hospitals", "Clinics", "Telehealth", "Dental Practices", "Pharmacy", "Medical Laboratories"],
  },
  {
    id: "customer-support",
    number: "10",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    title: "Customer Support",
    tagline: "AI-Assisted 24×7 Customer Support at Scale",
    description:
      "Thinkatic provides enterprise-grade customer support outsourcing powered by AI tools and trained agents. We deliver consistent, high-quality support experiences across every channel — voice, email, live chat, and social — helping brands build loyalty and resolve issues faster.",
    whatWeBuild: [
      { title: "Omnichannel Support", desc: "Unified customer support across phone, email, live chat, and social media." },
      { title: "AI-Assisted Agent Workflows", desc: "AI co-pilots that suggest responses, surface knowledge base answers, and reduce handle time." },
      { title: "Tier 1 & Tier 2 Support", desc: "Structured support tiers for technical troubleshooting and escalation management." },
      { title: "After-Hours Support", desc: "24/7 coverage with AI chatbot handoffs during off-peak hours." },
      { title: "Customer Success Management", desc: "Proactive outreach, onboarding support, and retention-focused interactions." },
      { title: "Quality Assurance & Reporting", desc: "Ongoing QA monitoring, CSAT tracking, and performance dashboards." },
    ],
    benefits: ["Faster first response times", "Higher CSAT scores", "Lower cost per ticket", "24/7 global coverage", "Consistent brand voice", "Scalable team size"],
    industries: ["eCommerce", "SaaS", "Fintech", "Healthcare", "Retail", "Telecommunications"],
  },
  {
    id: "sales-lead-generation",
    number: "11",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    title: "Sales & Lead Generation",
    tagline: "Intelligent Outbound Operations That Drive Revenue",
    description:
      "Thinkatic's AI-powered sales and lead generation services help businesses build predictable revenue pipelines. Our trained outbound teams, combined with AI prospecting and enrichment tools, identify high-intent leads, qualify prospects, and book meetings that convert.",
    whatWeBuild: [
      { title: "Outbound Prospecting", desc: "Targeted outreach campaigns using AI-enriched prospect lists and personalized messaging." },
      { title: "Lead Qualification (SDR)", desc: "Dedicated Sales Development Representatives to qualify inbound and outbound leads." },
      { title: "Appointment Setting", desc: "Consistent pipeline of booked meetings with decision-makers for your sales team." },
      { title: "Cold Email & LinkedIn Outreach", desc: "Multi-touch outreach sequences personalized with AI for higher engagement rates." },
      { title: "CRM Management", desc: "Real-time CRM updates, data hygiene, and pipeline reporting." },
      { title: "Sales Analytics & Reporting", desc: "Weekly reports on campaign performance, conversion metrics, and revenue impact." },
    ],
    benefits: ["More qualified meetings", "Reduced cost per lead", "Faster sales cycle", "Predictable revenue pipeline", "AI-powered personalization", "Dedicated sales team"],
    industries: ["SaaS", "B2B Services", "Technology", "Real Estate", "Finance", "Healthcare"],
  },
  {
    id: "back-office",
    number: "12",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Back Office",
    tagline: "Efficiency & Cost Reduction Through Smart Outsourcing",
    description:
      "Thinkatic handles critical back-office operations so your core team can focus on growth. From data entry to document processing, our trained specialists combined with AI automation deliver high accuracy, fast turnaround times, and significant cost savings.",
    whatWeBuild: [
      { title: "Data Entry & Processing", desc: "High-volume, accurate data entry with AI validation and quality checks." },
      { title: "Document Management", desc: "Digitization, classification, indexing, and retrieval of business documents." },
      { title: "Finance & Accounting Support", desc: "Accounts payable/receivable, invoice processing, and reconciliation." },
      { title: "Order & Inventory Management", desc: "Order processing, inventory tracking, and fulfillment coordination." },
      { title: "HR & Payroll Administration", desc: "Onboarding support, payroll data management, and employee record keeping." },
      { title: "Compliance & Reporting", desc: "Regulatory reporting, audit support, and compliance documentation." },
    ],
    benefits: ["Up to 60% cost reduction", "99%+ data accuracy", "Faster processing times", "Scalable capacity", "Reduced operational overhead", "Compliance-ready workflows"],
    industries: ["Finance", "Healthcare", "eCommerce", "Logistics", "Legal", "Insurance"],
  },
  {
    id: "ai-powered-bpo",
    number: "13",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2",
    title: "AI-Powered BPO",
    tagline: "Automation-First Outsourcing for the Modern Enterprise",
    description:
      "Thinkatic's AI-Powered BPO service combines trained human agents with advanced AI automation to deliver outsourcing that is faster, more accurate, and more cost-effective than traditional BPO. We integrate AI tools directly into every workflow to maximize productivity and minimize manual effort.",
    whatWeBuild: [
      { title: "Intelligent Process Automation", desc: "AI bots that handle repetitive tasks, freeing agents for complex interactions." },
      { title: "AI-Enhanced Agent Workstations", desc: "Agent tools powered by AI for real-time suggestions, auto-fill, and quality checks." },
      { title: "Predictive Operations Management", desc: "AI forecasting for staffing, volume, and SLA management." },
      { title: "Automated Quality Assurance", desc: "AI-driven QA that monitors 100% of interactions for compliance and quality." },
      { title: "Real-Time Analytics Dashboards", desc: "Live dashboards showing operational KPIs, agent performance, and business impact." },
      { title: "Custom AI Workflow Integration", desc: "Bespoke AI tools integrated into your existing systems and processes." },
    ],
    benefits: ["70% reduction in manual tasks", "Higher throughput per agent", "Real-time quality monitoring", "Faster onboarding with AI training", "Lower error rates", "Scalable hybrid workforce"],
    industries: ["Enterprise", "Finance", "Healthcare", "eCommerce", "Telecommunications", "Insurance"],
  },
];
