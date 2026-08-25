import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion, AnimatePresence, useInView, useMotionValue, useTransform,
  useScroll, useTransform as useScrollTransform, useReducedMotion, animate,
} from "framer-motion";
import { useLocation } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  {
    id: "healthcare",
    title: "Healthcare & Life Sciences",
    category: "Medical BPO",
    description:
      "AI-accelerated medical coding, revenue cycle management, and patient engagement that reduce claim denials and compress reimbursement timelines.",
    impact:
      "Health systems and hospitals cut billing errors by 62% and bring A/R days below 30 — without increasing headcount.",
    stats: [
      { value: 62,   suffix: "%",  label: "Fewer Claim Denials"  },
      { value: 30,   suffix: "d",  label: "Avg A/R Days"         },
      { value: 98.4, suffix: "%",  label: "Coding Accuracy"      },
    ],
    cta: "Explore Healthcare BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    accentColor: "rgba(33,78,207,0.14)",
    glowColor:   "rgba(33,78,207,0.18)",
  },
  {
    id: "finance",
    title: "Financial Services & Banking",
    category: "FinTech Operations",
    description:
      "Compliance-ready back-office workflows, real-time fraud signal triage, KYC/AML processing, and loan operations at enterprise scale.",
    impact:
      "Banks and lenders reduce operational costs by 45% while maintaining 99.9% regulatory compliance across every jurisdiction.",
    stats: [
      { value: 45,   suffix: "%",  label: "Cost Reduction"       },
      { value: 99.9, suffix: "%",  label: "Compliance Rate"      },
      { value: 3.1,  suffix: "x",  label: "Processing Speed"     },
    ],
    cta: "Explore Financial BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    accentColor: "rgba(52,211,153,0.14)",
    glowColor:   "rgba(16,185,129,0.2)",
  },
  {
    id: "technology",
    title: "Technology & SaaS",
    category: "Tech Support Ops",
    description:
      "White-glove customer success, 24/7 tier-1 and tier-2 technical support, QA automation, and onboarding operations that scale with your product.",
    impact:
      "SaaS companies achieve sub-2-hour first response and 92% CSAT at a fraction of the cost of an equivalent in-house team.",
    stats: [
      { value: 2,    suffix: "h",  label: "First Response SLA"   },
      { value: 92,   suffix: "%",  label: "CSAT Score"            },
      { value: 60,   suffix: "%",  label: "Cost vs In-House"      },
    ],
    cta: "Explore Tech Support BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    accentColor: "rgba(129,140,248,0.16)",
    glowColor:   "rgba(99,102,241,0.22)",
  },
  {
    id: "insurance",
    title: "Insurance & Risk",
    category: "Claims & Policy",
    description:
      "Intelligent claims adjudication, underwriting support, and policy administration that eliminate backlogs and accelerate settlement cycles.",
    impact:
      "Carriers reduce claims cycle time by 58% and improve adjuster throughput by 3.2× with zero increase in error rate.",
    stats: [
      { value: 58,   suffix: "%",  label: "Faster Claims"         },
      { value: 3.2,  suffix: "x",  label: "Adjuster Throughput"   },
      { value: 94,   suffix: "%",  label: "First-Pass Accuracy"   },
    ],
    cta: "Explore Insurance BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    accentColor: "rgba(251,191,36,0.13)",
    glowColor:   "rgba(245,158,11,0.2)",
  },
  {
    id: "retail",
    title: "Retail & E-Commerce",
    category: "CX Operations",
    description:
      "Omnichannel customer experience, returns and refund management, catalog operations, and order support that turn friction into long-term loyalty.",
    impact:
      "Retailers achieve a 40% reduction in CX costs while lifting Net Promoter Score by 25 points within the first quarter.",
    stats: [
      { value: 40,   suffix: "%",  label: "CX Cost Reduction"     },
      { value: 25,   suffix: "pt", label: "NPS Increase"          },
      { value: 98,   suffix: "%",  label: "Order Accuracy"        },
    ],
    cta: "Explore Retail BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    accentColor: "rgba(251,113,133,0.13)",
    glowColor:   "rgba(244,63,94,0.18)",
  },
  {
    id: "realestate",
    title: "Real Estate & PropTech",
    category: "Property Operations",
    description:
      "AI-powered lead qualification, CRM management, property listing support, and tenant operations that convert faster and retain longer.",
    impact:
      "Real estate firms convert 2.8× more qualified leads while cutting administrative overhead by 50% across portfolio teams.",
    stats: [
      { value: 2.8,  suffix: "x",  label: "Lead Conversion"      },
      { value: 50,   suffix: "%",  label: "Admin Reduction"       },
      { value: 48,   suffix: "h",  label: "Response SLA"         },
    ],
    cta: "Explore Real Estate BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    accentColor: "rgba(71,163,255,0.16)",
    glowColor:   "rgba(37,99,235,0.22)",
  },
  {
    id: "education",
    title: "Education & EdTech",
    category: "Student Success",
    description:
      "Enrollment support, student success operations, content moderation, and LMS management at institutional scale — across every time zone.",
    impact:
      "EdTech platforms improve enrollment completion by 35% and reduce student churn by 28% in the first semester.",
    stats: [
      { value: 35,   suffix: "%",  label: "Enrollment Completion" },
      { value: 28,   suffix: "%",  label: "Churn Reduction"       },
      { value: 24,   suffix: "/7", label: "Support Coverage"      },
    ],
    cta: "Explore EdTech BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    accentColor: "rgba(167,139,250,0.15)",
    glowColor:   "rgba(139,92,246,0.2)",
  },
  {
    id: "logistics",
    title: "Logistics & Supply Chain",
    category: "Supply Chain Ops",
    description:
      "Shipment tracking, carrier management, freight audit, dispute resolution, and last-mile coordination powered by AI-driven operational intelligence.",
    impact:
      "Logistics providers cut exception-handling time by 65% and push on-time delivery rates above 97% at scale.",
    stats: [
      { value: 65,   suffix: "%",  label: "Exception Reduction"   },
      { value: 97,   suffix: "%",  label: "On-Time Delivery"      },
      { value: 40,   suffix: "%",  label: "Ops Cost Savings"      },
    ],
    cta: "Explore Logistics BPO",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    accentColor: "rgba(52,211,153,0.15)",
    glowColor:   "rgba(16,185,129,0.2)",
  },
] as const;

type Industry = typeof INDUSTRIES[number];

const REASONS = [
  "AI-first approach",
  "Highly trained professionals",
  "Enterprise-grade security",
  "Flexible engagement models",
  "Rapid team scaling",
  "Transparent reporting",
  "Continuous process improvement",
  "Dedicated account management",
  "Global delivery capabilities",
];

// ─── Animated stat number ─────────────────────────────────────────────────────

function StatNumber({ value, suffix, label, trigger }: {
  value: number; suffix: string; label: string; trigger: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!trigger || !ref.current) return;
    const isFloat = value % 1 !== 0;
    const ctrl = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [trigger, value, suffix]);

  return (
    <div className="flex flex-col gap-1">
      <span
        ref={ref}
        className="text-2xl md:text-3xl font-bold font-display"
        style={{
          background: "linear-gradient(135deg,#ffffff 0%,#214ECF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        0{suffix}
      </span>
      <span className="text-[9px] uppercase tracking-[0.18em] font-mono"
        style={{ color: "rgba(33,78,207,0.22)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Industry card ────────────────────────────────────────────────────────────

interface IndustryCardProps {
  industry: Industry;
  index: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  shouldReduce: boolean;
}

function IndustryCard({ industry, index, isActive, onActivate, shouldReduce }: IndustryCardProps) {
  const [, setLocation] = useLocation();
  const cardRef   = useRef<HTMLDivElement>(null);
  const inView    = useInView(cardRef, { once: true, margin: "-60px" });
  const mouseX    = useMotionValue(0);
  const mouseY    = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const highlightX = useTransform(mouseX, (v) => v - 200);
  const highlightY = useTransform(mouseY, (v) => v - 200);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY, shouldReduce]);

  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.65, ease }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setHovered(true); onActivate(industry.id); }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onActivate(industry.id)}
      className="relative overflow-hidden cursor-pointer select-none"
      style={{ borderRadius: 16 }}
    >
      {/* Glass base */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isActive
            ? "linear-gradient(135deg,rgba(10,24,54,0.92) 0%,rgba(6,16,38,0.88) 100%)"
            : "linear-gradient(135deg,rgba(8,14,28,0.72) 0%,rgba(5,10,22,0.65) 100%)",
          borderColor: isActive
            ? "rgba(71,163,255,0.28)"
            : hovered
              ? "rgba(33,78,207,0.12)"
              : "rgba(255,255,255,0.07)",
          boxShadow: isActive
            ? `0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(33,78,207,0.1), 0 0 60px ${industry.glowColor}`
            : hovered
              ? "0 8px 32px rgba(0,0,0,0.25)"
              : "0 2px 12px rgba(0,0,0,0.15)",
        }}
        transition={{ duration: 0.38 }}
        style={{
          borderRadius: 16,
          border: "1px solid",
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Mouse-follow radial highlight */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          x: highlightX,
          y: highlightY,
          background: `radial-gradient(circle, ${industry.accentColor} 0%, transparent 65%)`,
          opacity: hovered && !shouldReduce ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Active glow pulse */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 16 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0"
            style={{
              borderRadius: 16,
              boxShadow: `inset 0 0 40px ${industry.accentColor}`,
            }}
          />
        </motion.div>
      )}

      {/* Top shimmer line */}
      <motion.div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(90deg,transparent,rgba(33,78,207,0.38),transparent)",
        }}
      />

      <div className="relative z-10">
        {/* ── Collapsed header — always visible ── */}
        <div className="flex items-center gap-5 px-6 md:px-8 min-h-[76px] py-4">
          {/* Icon container */}
          <motion.div
            animate={{
              background: isActive
                ? "rgba(33,78,207,0.15)"
                : hovered ? "rgba(33,78,207,0.09)" : "rgba(33,78,207,0.04)",
              borderColor: isActive
                ? "rgba(71,163,255,0.4)"
                : hovered ? "rgba(33,78,207,0.18)" : "rgba(255,255,255,0.1)",
              color: isActive ? "rgba(71,163,255,1)" : hovered ? "rgba(33,78,207,0.72)" : "rgba(255,255,255,0.45)",
            }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border"
          >
            {industry.icon}
          </motion.div>

          {/* Title + category */}
          <div className="flex-1 min-w-0">
            <motion.h3
              animate={{ color: isActive ? "rgba(255,255,255,1)" : hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}
              transition={{ duration: 0.25 }}
              className="font-display font-semibold text-base md:text-lg leading-snug truncate"
            >
              {industry.title}
            </motion.h3>
            <motion.span
              animate={{ opacity: isActive ? 0.55 : 0.35 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#214ECF]"
            >
              {industry.category}
            </motion.span>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: isActive ? 45 : 0, opacity: isActive ? 1 : 0.3 }}
            transition={{ duration: 0.35, ease }}
            className="flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center"
            style={{
              borderColor: isActive ? "rgba(33,78,207,0.24)" : "rgba(255,255,255,0.1)",
              background: isActive ? "rgba(33,78,207,0.12)" : "transparent",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.div>
        </div>

        {/* ── Expanded content ── */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-6 md:px-8 pb-8 pt-1">
                {/* Divider */}
                <div className="mb-6 h-px"
                  style={{ background: "linear-gradient(90deg,rgba(33,78,207,0.18),rgba(71,163,255,0.06),transparent)" }} />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
                  {/* Left — text content */}
                  <div>
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.5, ease }}
                      className="text-sm md:text-base leading-relaxed mb-5"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {industry.description}
                    </motion.p>

                    {/* Impact callout */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14, duration: 0.5, ease }}
                      className="relative rounded-xl px-4 py-3.5 mb-7"
                      style={{
                        background: "rgba(37,99,235,0.07)",
                        border: "1px solid rgba(33,78,207,0.12)",
                      }}
                    >
                      <div className="absolute top-0 left-3 right-3 h-px"
                        style={{ background: "linear-gradient(90deg,transparent,rgba(71,163,255,0.35),transparent)" }} />
                      <p className="text-[13px] leading-relaxed font-medium"
                        style={{ color: "#4B5563" }}>
                        <span style={{ color: "#214ECF", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginRight: 8 }}>
                          Business Impact
                        </span>
                        <br className="sm:hidden" />
                        {industry.impact}
                      </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22, duration: 0.45, ease }}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => { e.stopPropagation(); setLocation("/contact"); }}
                      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full font-semibold text-[13px] text-foreground tracking-wide"
                      style={{
                        background: "linear-gradient(135deg,#214ECF 0%,#214ECF 60%,#3b82f6 100%)",
                        boxShadow: "0 0 24px rgba(37,99,235,0.3)",
                      }}
                    >
                      {industry.cta}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Right — animated stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.55, ease }}
                    className="flex flex-row md:flex-col gap-6 md:gap-5 md:min-w-[160px]"
                  >
                    {industry.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="relative rounded-xl px-4 py-3.5 flex-1 md:flex-none overflow-hidden"
                        style={{
                          background: "rgba(244,247,255,0.8)",
                          border: "1px solid rgba(33,78,207,0.08)",
                        }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-px"
                          style={{ background: "linear-gradient(90deg,transparent,rgba(33,78,207,0.18),transparent)" }} />
                        <StatNumber
                          value={stat.value}
                          suffix={stat.suffix}
                          label={stat.label}
                          trigger={isActive}
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Reason card (kept from original) ────────────────────────────────────────

function ReasonCard({ reason, index }: { reason: string; index: number }) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: row * 0.1 + col * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-start gap-4 rounded-xl p-5 border border-white/6 cursor-default overflow-hidden relative"
      style={{
        transition: "border-color 0.3s, background 0.3s, transform 0.3s",
        borderColor: hovered ? "rgba(37,99,235,0.3)" : "rgba(33,78,207,0.04)",
        background: hovered ? "rgba(8,27,58,0.3)" : "rgba(8,14,28,0.5)",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
      }}
    >
      <motion.div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        animate={{ background: hovered ? "rgba(33,78,207,0.18)" : "rgba(33,78,207,0.09)" }}
        style={{ border: "1px solid rgba(33,78,207,0.18)" }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="#214ECF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <motion.span
        className="text-sm font-medium"
        animate={{ color: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)" }}
        transition={{ duration: 0.25 }}
      >
        {reason}
      </motion.span>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function IndustriesSection() {
  const [activeId, setActiveId] = useState<string>(INDUSTRIES[0].id);
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const inView      = useInView(headingRef, { once: true, margin: "-80px" });
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useScrollTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px", "0px"] : ["60px", "-60px"]);
  const cardsY = useScrollTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px", "0px"] : ["20px", "-20px"]);

  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <section ref={sectionRef} className="py-28 md:py-36 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#050505 0%,#F5F8FF 50%,#050505 100%)" }}>

      {/* Background depth layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(37,99,235,0.05) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(37,99,235,0.04) 0%,transparent 70%)", filter: "blur(60px)" }} />
        {/* Fine grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(71,163,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(71,163,255,0.025) 1px,transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)",
          }} />
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* ── Section header ── */}
        <div ref={headingRef} className="mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease }}
            className="text-[10px] font-mono uppercase tracking-[0.28em] mb-5 text-center"
            style={{ color: "rgba(71,163,255,0.7)" }}
          >
            Industries We Serve
          </motion.p>
          <div className="overflow-hidden text-center">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.85, ease }}
              className="font-display font-bold text-foreground leading-[1.05]"
              style={{ fontSize: "clamp(2rem,4vw,3.4rem)" }}
            >
              Global Reach Across Every Sector
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.6, ease }}
            className="text-center text-sm md:text-base max-w-xl mx-auto mt-4"
            style={{ color: "#4B5563" }}
          >
            Explore how Thinkatic's AI-powered operations transform performance across the industries that drive global enterprise.
          </motion.p>
        </div>

        {/* ── Interactive industry accordion ── */}
        <motion.div
          style={{ y: cardsY }}
          className="flex flex-col gap-2.5 mb-28"
        >
          {INDUSTRIES.map((industry, i) => (
            <IndustryCard
              key={industry.id}
              industry={industry}
              index={i}
              isActive={activeId === industry.id}
              onActivate={setActiveId}
              shouldReduce={!!shouldReduce}
            />
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, ease }}
          className="mb-24 h-px origin-center"
          style={{ background: "linear-gradient(90deg,transparent,rgba(33,78,207,0.06) 50%,transparent)" }}
        />

        {/* ── Why Thinkatic ── */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="text-[10px] font-mono uppercase tracking-[0.25em] mb-4"
            style={{ color: "rgba(71,163,255,0.7)" }}
          >
            Why Businesses Choose Thinkatic
          </motion.p>
          <div className="overflow-hidden mb-10">
            <motion.h3
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease }}
              className="font-display font-bold text-foreground"
              style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}
            >
              Nine Reasons to Choose Intelligent Operations
            </motion.h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REASONS.map((r, i) => (
              <ReasonCard key={r} reason={r} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
