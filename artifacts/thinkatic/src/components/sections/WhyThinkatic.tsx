import { useRef, useEffect, useState } from "react";
import { motion, useInView, animate, useReducedMotion } from "framer-motion";
import {
  Zap, Globe, Building2, Shield, Target, TrendingUp,
  HeartPulse, Lock, Users
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LINES = [
  "Traditional outsourcing focuses on manpower.",
  "Thinkatic combines skilled professionals, artificial intelligence, automation, analytics, and enterprise technology to deliver measurable business outcomes.",
  "We don't simply execute processes.",
  "We optimize, automate, and continuously improve them.",
];

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Enabled Operations",
    desc: "Every workflow is augmented with purpose-built AI — from voice agents to quality monitoring automation.",
    color: "#F59E0B",
  },
  {
    icon: Globe,
    title: "24×7 Global Delivery",
    desc: "Three regional hubs across Americas, EMEA, and APAC ensure round-the-clock coverage in every market.",
    color: "#214ECF",
  },
  {
    icon: Building2,
    title: "Multi-Industry Expertise",
    desc: "Deep domain knowledge across Healthcare, FinTech, Insurance, Retail, and Technology verticals.",
    color: "#34D399",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "ISO 27001 certified, SOC 2 Type II audited, HIPAA compliant — security is foundational, not an add-on.",
    color: "#A78BFA",
  },
  {
    icon: Target,
    title: "Outcome-Focused Delivery",
    desc: "We commit to measurable KPIs — not activity metrics. Every engagement is tied to business outcomes.",
    color: "#F87171",
  },
  {
    icon: TrendingUp,
    title: "Scalable Teams",
    desc: "Ramp from 5 to 500 agents in days. Our elastic capacity model scales with your business cycle.",
    color: "#214ECF",
  },
];

const COUNTERS = [
  { end: 500, suffix: "+", label: "Enterprise Clients", color: "#214ECF" },
  { end: 98.4, suffix: "%", label: "Accuracy Rate",     color: "#34D399", decimals: 1 },
  { end: 2,   suffix: "B+", label: "Operations / Year", color: "#A78BFA" },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({
  end,
  suffix,
  label,
  color,
  decimals = 0,
}: {
  end: number;
  suffix: string;
  label: string;
  color: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (shouldReduce) { setValue(end); return; }
    const controls = animate(0, end, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate(v) { setValue(v); },
    });
    return () => controls.stop();
  }, [inView, end, shouldReduce]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline gap-0.5">
        <span
          ref={ref}
          className="font-display font-black text-5xl md:text-6xl leading-none"
          style={{ color }}
        >
          {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
        </span>
        <span className="font-display font-black text-2xl md:text-3xl" style={{ color }}>
          {suffix}
        </span>
      </div>
      <span className="text-xs font-medium uppercase tracking-wider text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease, delay: (index % 3) * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden cursor-default transition-all duration-400"
      style={{
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.018)",
        borderColor: hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)",
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.25), 0 0 30px ${feature.color}10` : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.4s",
      }}
    >
      {/* Corner radial on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(ellipse at 10% 10%, ${feature.color}10 0%, transparent 60%)` }}
      />

      {/* Top border sweep */}
      <motion.div
        className="absolute top-0 left-0 h-[1.5px] pointer-events-none rounded-full"
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.45, ease }}
        style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${feature.color}14`,
          border: `1px solid ${feature.color}28`,
          transition: "box-shadow 0.3s",
          boxShadow: hovered ? `0 0 20px ${feature.color}25` : "none",
        }}
      >
        <Icon size={20} style={{ color: feature.color }} />
      </div>

      <div>
        <h3 className="text-foreground font-bold text-sm mb-2">{feature.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function WhyThinkatic() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-36 overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.04) 50%, transparent)" }} />

      {/* Static ambient glow — no continuous animation */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.05) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(37,99,235,0.06) 0%, transparent 45%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 15% 70%, rgba(71,163,255,0.04) 0%, transparent 45%)" }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Two-col header ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left */}
          <div ref={headingRef}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease }}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-5"
              style={{ color: "rgba(71,163,255,0.7)" }}
            >
              Why Choose Us
            </motion.p>

            <div className="overflow-hidden mb-6">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.05]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)" }}
              >
                Intelligence meets
                <br />
                <span style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  human expertise.
                </span>
              </motion.h2>
            </div>

            {/* Animated text lines */}
            <div className="space-y-3">
              {LINES.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.65, ease, delay: 0.2 + i * 0.1 }}
                  className="text-sm md:text-base leading-relaxed"
                  style={{
                    color: i % 2 === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)",
                    fontStyle: i % 2 === 0 ? "normal" : "italic",
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Right: animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6"
          >
            {COUNTERS.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, ease, delay: 0.4 + i * 0.12 }}
                className="rounded-2xl border p-8 text-center"
                style={{
                  background: `${c.color}08`,
                  borderColor: `${c.color}20`,
                  boxShadow: `0 0 40px ${c.color}08`,
                }}
              >
                <AnimatedCounter
                  end={c.end}
                  suffix={c.suffix}
                  label={c.label}
                  color={c.color}
                  decimals={c.decimals}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Feature cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.04) 50%, transparent)" }} />
    </section>
  );
}
