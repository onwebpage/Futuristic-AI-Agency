import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

// ── Knowledge base ────────────────────────────────────────────────────────────
const KB = {
  aiPackages: [
    { id: "ai-agent-pro", name: "AI Agent Pro (★ Best Overall)", setup: 7500, monthly: 1500 },
    { id: "ai-automation", name: "AI Automation", setup: 5000, monthly: 1000 },
    { id: "ai-voice-pro", name: "AI Voice Pro", setup: 6500, monthly: 1500 },
    { id: "private-ai-brain", name: "Private AI Brain", setup: 7500, monthly: 1500 },
    { id: "ai-sales-engine", name: "AI Sales Engine", setup: 6500, monthly: 1500 },
  ],
  scaleOSTiers: [
    { id: "starter", name: "ScaleOS Starter (5–10 seats)", price: "₹5,00,000" },
    { id: "growth", name: "ScaleOS Growth (10–50 seats)", price: "₹7,50,000" },
    { id: "enterprise", name: "ScaleOS Enterprise (50–500 seats)", price: "₹10,00,000" },
  ],
};

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  links?: { label: string; href: string }[];
  chips?: string[];
};

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hey there! 👋 I'm Thinkatic's AI assistant. I can help you explore our **AI Development Packages** (2026 U.S. Edition) or our **ScaleOS Managed BPO Partnership** (₹0 renewal fee).\n\nWhat would you like to know?",
  chips: ["AI Development Packages", "Thinkatic ScaleOS (BPO)", "Pricing Details", "How to order?"],
};

// ── Response engine ───────────────────────────────────────────────────────────
function getResponse(input: string): Message {
  const q = input.toLowerCase();
  const id = () => Math.random().toString(36).slice(2);

  // HOW TO BUY / ORDER
  if (/buy|order|purchase|pay|checkout|how.*plan|place.*order/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Placing an order is quick and secure:\n\n1️⃣ Go to the **Pricing** page.\n2️⃣ Choose between **AI Development Packages ($ USD)** or **Thinkatic ScaleOS (₹ INR)**.\n3️⃣ Click **Order Now / Get Started**.\n4️⃣ Pay securely with PayPal or request direct enterprise invoicing.\n5️⃣ Our team connects with you within **24 hours** to kick off onboarding.",
      links: [{ label: "Go to Pricing & Packages →", href: "/pricing" }],
      chips: ["AI Agent Pro", "Thinkatic ScaleOS", "Contact Sales"],
    };
  }

  // SCALEOS / BPO / OUTSOURCING
  if (/scaleos|outsourc|bpo|seat|renewal|pune|india.*package|campaign|portfolio/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "**Thinkatic ScaleOS** — Managed Outsourcing without building an outsourcing department.\n\n• **1 Strategic Investment for 11 Months**\n• **₹0 Annual Renewal Fee**\n• **17 Live Campaigns Portfolio** (USA, UK, India)\n\n📦 **Scale Tiers:**\n1. **Starter** (5–10 seats) — ₹5,00,000\n2. **Growth (★ Popular)** (10–50 seats) — ₹7,50,000\n3. **Enterprise** (50–500 seats) — ₹10,00,000 (with Lifetime Strategic Support)",
      links: [{ label: "View ScaleOS Packages →", href: "/pricing" }, { label: "Request Proposal →", href: "/request-proposal" }],
      chips: ["Tell me about 17 projects", "How does ScaleOS work?", "AI Development Packages"],
    };
  }

  // PRICING
  if (/price|pricing|cost|how much|rate|fee|budget/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "We offer benchmarked pricing for two distinct models:\n\n🤖 **AI Development Packages (U.S. Market 2026):**\n• **AI Agent Pro (★ Best Overall)** — $7,500 setup + $1,500/mo\n• **AI Automation** — $5,000 setup + $1,000/mo\n• **AI Voice Pro** — $6,500 setup + $1,500/mo\n• **Private AI Brain** — $7,500 setup + $1,500/mo\n• **AI Sales Engine** — $6,500 setup + $1,500/mo\n\n🏢 **Thinkatic ScaleOS (11-Month Managed BPO):**\n• **Starter (5–10 seats)** — ₹5,00,000\n• **Growth (10–50 seats)** — ₹7,50,000\n• **Enterprise (50–500 seats)** — ₹10,00,000 (Lifetime Support, ₹0 Renewal)",
      links: [{ label: "See Full Pricing & Packages →", href: "/pricing" }],
      chips: ["AI Agent Pro", "ScaleOS Growth", "Cheapest option?"],
    };
  }

  // CHEAPEST / SMALLEST
  if (/cheap|small|starter|basic|minimum|lowest|affordable/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our most affordable entry points are:\n\n💡 **AI Consulting Strategy Session** — $2,500 (great starting point)\n⚙️ **Workflow Automation Setup** — $3,136\n🌐 **Premium Website** — $3,500\n🎨 **AI Product Design Sprint** — $4,000\n\nThese are perfect if you want to start small and scale up.",
      links: [{ label: "View all plans →", href: "/pricing" }],
      chips: ["Tell me about AI Consulting", "Tell me about Web Design", "How do I buy a plan?"],
    };
  }

  // HELP CHOOSE
  if (/choose|recommend|suggest|right plan|which plan|what.*need|help.*pick/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Happy to help! Here are a few questions to guide you:\n\n• **Starting an AI project from scratch?** → Custom AI Software or AI SaaS Development\n• **Need a chatbot or content AI?** → Generative AI Development\n• **Want to automate operations?** → AI Automation Solutions\n• **Building a mobile app with AI?** → AI Mobile App Development\n• **Need strategy before building?** → AI Consulting & Strategy\n• **Just need a great website?** → Web Design & Development\n\nTell me more about your project and I'll give a more specific recommendation!",
      links: [{ label: "See all pricing →", href: "/pricing" }, { label: "Contact us →", href: "/contact" }],
      chips: ["I need a chatbot", "I need automation", "I need a website", "I need an app"],
    };
  }

  // CHATBOT / GENERATIVE AI
  if (/chatbot|gpt|llm|generative|rag|language model|content gen|virtual assistant/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **Generative AI Development** service covers:\n\n• GPT-powered chatbots & virtual assistants\n• AI content generation (blogs, emails, reports)\n• RAG platforms (retrieval-augmented generation)\n• Custom LLM fine-tuning & private deployment\n• AI knowledge bases trained on your documents\n• Multimodal AI (text + image + voice)\n\n📦 Starting from **$6,500** (AI Chatbot Starter) up to **$45,000+** for custom LLM solutions.",
      links: [{ label: "See Generative AI plans →", href: "/pricing#generative-ai" }],
      chips: ["How do I buy a plan?", "What's included?", "Enterprise options?"],
    };
  }

  // AUTOMATION
  if (/automat|workflow|crm|erp|process|repetitive|operation/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **AI Automation Solutions** help businesses eliminate manual work:\n\n• Workflow automation (approvals, reporting, routing)\n• AI-powered customer support systems\n• Sales & marketing automation\n• Data processing & document extraction\n• Enterprise process automation (HR, finance, ops)\n\n📦 Starting from **$3,136** (Workflow Automation Setup).",
      links: [{ label: "See Automation plans →", href: "/pricing#ai-automation" }],
      chips: ["How do I buy a plan?", "Tell me about enterprise options", "What's the process?"],
    };
  }

  // MACHINE LEARNING
  if (/machine learning|ml|prediction|recommend|computer vision|nlp|neural|data model|fraud/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **Machine Learning Development** service builds:\n\n• Predictive analytics & forecasting models\n• Recommendation systems (eCommerce, SaaS, streaming)\n• Computer vision (object detection, OCR, image analysis)\n• NLP & sentiment analysis systems\n• Fraud detection & security AI\n• Custom ML pipelines & data engineering\n\n📦 Starting from **$7,500** (ML Prototype).",
      links: [{ label: "See ML plans →", href: "/pricing#machine-learning" }],
      chips: ["How do I buy a plan?", "Difference between tiers?"],
    };
  }

  // SAAS
  if (/saas|software as a service|subscription|multi.tenant|mvp|product/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **AI SaaS Product Development** service covers:\n\n• SaaS MVP (launch fast, from $12,000)\n• Multi-tenant platforms with AI workflows\n• Subscription billing & user management\n• AI productivity & analytics platforms\n• Full cloud infrastructure & scaling\n\n📦 Starting from **$12,000** (SaaS MVP Build).",
      links: [{ label: "See SaaS plans →", href: "/pricing#ai-saas" }],
      chips: ["How long does an MVP take?", "How do I order?", "Enterprise SaaS?"],
    };
  }

  // MOBILE
  if (/mobile|app|ios|android|flutter|react native/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **AI Mobile App Development** service builds:\n\n• iOS & Android AI-powered apps\n• Real-time AI features & offline support\n• On-device ML & cloud AI integration\n• Authentication, notifications & analytics\n• Enterprise-grade mobile platforms\n\n📦 Starting from **$8,500** (AI App MVP).",
      links: [{ label: "See Mobile App plans →", href: "/pricing#ai-mobile" }],
      chips: ["How do I order?", "Enterprise mobile options?"],
    };
  }

  // ENTERPRISE
  if (/enterprise|large.*company|corporate|legacy|transform|scale.*business/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **Enterprise AI Solutions** are designed for large-scale transformation:\n\n• AI readiness audits & transformation roadmaps\n• Cloud AI deployment with governance & security\n• Legacy system modernization\n• Compliance & security implementation\n• Dedicated engineering team\n\n📦 Starting from **$10,000** (AI Transformation Audit) up to **$100,000+** for full ecosystem builds.\n\nFor enterprise inquiries, we recommend booking a strategy call first.",
      links: [{ label: "See Enterprise plans →", href: "/pricing#enterprise-ai" }, { label: "Contact us →", href: "/contact" }],
      chips: ["How do I contact you?", "Book a call"],
    };
  }

  // UI/UX DESIGN
  if (/design|ui|ux|interface|wireframe|prototype|figma|visual/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **UI/UX Design for AI Products** covers:\n\n• UX strategy & wireframes\n• Motion design & interactive prototypes\n• Design systems built for AI workflows\n• AI chat interface design\n• Enterprise UX systems\n• User testing & iteration\n\n📦 Starting from **$4,000** (AI Product Design Sprint).",
      links: [{ label: "See Design plans →", href: "/pricing#ui-ux" }],
      chips: ["How do I order?", "Web design vs UI/UX?"],
    };
  }

  // WEB DESIGN
  if (/website|web design|landing page|cms|seo|webgl|3d site/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **Web Design & Development** service builds:\n\n• High-end UI design with responsive development\n• CMS integration & SEO setup\n• Motion design & advanced animations\n• WebGL/3D experiences for enterprise\n• Conversion-optimized, performance-first builds\n\n📦 Starting from **$3,500** (Premium Website) — our most accessible entry point!",
      links: [{ label: "See Web Design plans →", href: "/pricing#web-design" }],
      chips: ["How do I order?", "What's included in Premium Website?"],
    };
  }

  // CONSULTING
  if (/consult|strategy|audit|roadmap|advisory|advice|expert/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our **AI Consulting & Strategy** service includes:\n\n• AI strategy workshops & opportunity analysis\n• Technical audits & ROI analysis\n• Vendor selection & AI implementation planning\n• Enterprise AI transformation consulting\n• Executive AI advisory programs\n\n📦 Starting from **$2,500** (AI Strategy Session — 2 workshops + a full AI roadmap).\n\nThis is a great first step if you're not sure which AI service to start with.",
      links: [{ label: "See Consulting plans →", href: "/pricing#ai-consulting" }],
      chips: ["How do I buy a consulting session?", "What happens after the session?"],
    };
  }

  // PROCESS / HOW IT WORKS
  if (/process|how.*work|step|timeline|how long|delivery|develop/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Our development process follows 6 structured phases:\n\n**1. Discovery & Strategy** — We understand your goals, workflows & challenges.\n**2. Architecture Planning** — We design scalable AI infrastructure.\n**3. AI Model Development** — Train, integrate & optimize AI models.\n**4. Development & Integration** — Full frontend, backend, APIs & AI systems.\n**5. Testing & Security** — Rigorous accuracy, performance & security checks.\n**6. Deployment & Scaling** — Cloud deployment, optimization & ongoing support.\n\nTimelines vary by project scope.",
      links: [{ label: "See our full process →", href: "/process" }],
      chips: ["How do I start?", "How do I contact you?"],
    };
  }

  // CONTACT
  if (/contact|email|phone|call|reach|talk.*team|speak/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "You can reach the Thinkatic team here:\n\n📧 **Email** — Thinkaticall@gmail.com\n📞 **Phone** — 726 387 4409\n📍 **Location** — Global, Remote\n\nOr fill out the contact form on our Contact page and we'll respond within 24 hours.",
      links: [{ label: "Go to Contact →", href: "/contact" }],
      chips: ["How do I buy a plan?", "See all services"],
    };
  }

  // ABOUT / COMPANY
  if (/about|who.*you|company|team|founded|experience|thinkatic/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "**Thinkatic** is a global AI-native digital agency founded in 2015 with 10+ years of experience.\n\n🏆 **$500M+** in funding secured for our clients\n🥇 **120+** awards recognizing our excellence\n👥 Fully remote, global team\n\nWe build custom AI software, generative AI products, automation systems, ML models, SaaS platforms, and more — all engineered to drive real business growth.",
      links: [{ label: "Learn more about us →", href: "/about" }, { label: "See case studies →", href: "/case-studies" }],
      chips: ["See all services", "What's the pricing?"],
    };
  }

  // CASE STUDIES / PORTFOLIO
  if (/case stud|portfolio|project|work|example|client/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "We've worked on a wide range of AI projects including:\n\n• AI Finance Platform\n• Video AI Editor\n• Enterprise Analytics SaaS\n• Healthcare AI Platform\n• Real Estate AI CRM\n• Crypto Trading Dashboard\n\nCheck out our case studies page for full project breakdowns.",
      links: [{ label: "View case studies →", href: "/case-studies" }],
      chips: ["What's the pricing?", "How do I start a project?"],
    };
  }

  // ALL SERVICES
  if (/all.*service|what.*offer|what.*do|service.*list|list.*service/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Thinkatic offers 10 service categories:\n\n01 Custom AI Software Development\n02 Generative AI Development\n03 AI Automation Solutions\n04 Machine Learning Development\n05 AI SaaS Product Development\n06 AI Mobile App Development\n07 Enterprise AI Solutions\n08 UI/UX Design for AI Products\n09 Web Design & Development\n10 AI Consulting & Strategy\n\nEvery service has starter, growth, and enterprise tiers. Which one interests you most?",
      links: [{ label: "See all pricing →", href: "/pricing" }, { label: "Services page →", href: "/services" }],
      chips: ["Custom AI Software", "Generative AI", "AI Automation", "How do I buy?"],
    };
  }

  // PAYMENT METHOD
  if (/paypal|payment method|how.*pay|credit|card|invoice/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "We accept payments via **PayPal** — directly on our Pricing page.\n\n1. Visit the Pricing page\n2. Pick your plan and click **Order Now**\n3. The PayPal checkout pops up inline\n4. Complete payment securely\n5. We contact you within 24 hours\n\nFor large enterprise projects, we can also arrange custom invoicing. Just reach out via the Contact page.",
      links: [{ label: "Go to Pricing →", href: "/pricing" }, { label: "Contact us →", href: "/contact" }],
      chips: ["What happens after I pay?", "Can I get an invoice?"],
    };
  }

  // AFTER PAYMENT
  if (/after.*pay|what happen|next step|onboard|kick.*off/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "After your payment is confirmed:\n\n✅ You'll receive a PayPal payment receipt\n📧 Our team contacts you within **24 hours**\n🗓️ We schedule a kickoff call to discuss your project\n📋 We share an onboarding questionnaire\n🚀 Discovery & strategy phase begins\n\nWe move fast — most projects kick off within 48–72 hours of payment.",
      links: [{ label: "See our process →", href: "/process" }],
      chips: ["How long does a project take?", "How do I contact you?"],
    };
  }

  // TECHNOLOGIES
  if (/tech|stack|technology|tool|language|framework|openai|langchain|python|react|aws|azure/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "We work with a modern, enterprise-grade tech stack:\n\n🤖 **AI/ML** — OpenAI, LangChain, TensorFlow, PyTorch, Scikit-learn\n👁️ **Vision** — OpenCV, Computer Vision APIs\n💻 **Backend** — Python, Node.js, Express\n⚛️ **Frontend** — React, Next.js, Vite\n☁️ **Cloud** — AWS, Azure, Google Cloud\n🗄️ **Databases** — PostgreSQL, Vector DBs, MongoDB\n🐳 **DevOps** — Docker, Kubernetes",
      chips: ["See all services", "What's the pricing?", "How do I contact you?"],
    };
  }

  // NAVIGATE / WHERE IS
  if (/where|find|navigate|page|go to|how.*get to/i.test(q)) {
    return {
      id: id(), role: "bot",
      text: "Here's a quick map of the site:\n\n🏠 **Home** — Overview and highlights\n🛠️ **Services** — All service details\n💰 **Pricing** — Plans & PayPal checkout\n📁 **Case Studies** — Our past projects\n⚙️ **Process** — How we work\n👤 **About** — Company info\n📬 **Contact** — Get in touch",
      links: [
        { label: "Home →", href: "/" },
        { label: "Pricing →", href: "/pricing" },
        { label: "Contact →", href: "/contact" },
      ],
      chips: ["How do I buy a plan?", "See all services"],
    };
  }

  // FALLBACK
  return {
    id: id(), role: "bot",
    text: "I'm not sure about that one, but I can definitely help with:\n\n• Exploring our 10 AI service categories\n• Understanding pricing & plans\n• Learning how to place an order\n• Navigating the website\n• Getting in touch with our team\n\nWhat would you like to know?",
    chips: ["See all services", "What's the pricing?", "How do I buy a plan?", "How do I contact you?"],
  };
}

// ── ChatBot Component ─────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Math.random().toString(36).slice(2), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const botMsg = getResponse(text);
      setTyping(false);
      setMessages((m) => [...m, botMsg]);
    }, 700 + Math.random() * 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-[998] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: open ? "#1a1a1a" : "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)",
          boxShadow: open ? "0 4px 24px rgba(0,0,0,0.5)" : "0 0 40px rgba(71,163,255,0.45), 0 4px 24px rgba(0,0,0,0.4)",
          border: open ? "1px solid rgba(33,78,207,0.12)" : "none",
        }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.18 }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-[997] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "min(400px, calc(100vw - 24px))",
              height: "min(580px, calc(100vh - 120px))",
              background: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0e0e0e" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#3B82F6" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-bold text-sm leading-tight">Thinkatic Guide</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Online now</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-1 rounded-lg transition-colors hover:bg-white/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? { background: "#3B82F6", color: "#fff", fontWeight: 500, borderBottomRightRadius: 6 }
                        : { background: "rgba(33,78,207,0.04)", color: "rgba(255,255,255,0.88)", borderBottomLeftRadius: 6, border: "1px solid rgba(255,255,255,0.07)" }
                    }
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />

                  {/* Links */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 hover:opacity-80"
                          style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.25)" }}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Chips */}
                  {msg.chips && msg.chips.length > 0 && msg.id === messages[messages.length - 1].id && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => send(chip)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 hover:bg-white/10"
                          style={{ background: "rgba(33,78,207,0.04)", color: "#4B5563", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-start">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center"
                    style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.4)" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0e0e0e" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || typing}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0"
                style={{
                  background: input.trim() && !typing ? "#3B82F6" : "rgba(33,78,207,0.06)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing ? "black" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
