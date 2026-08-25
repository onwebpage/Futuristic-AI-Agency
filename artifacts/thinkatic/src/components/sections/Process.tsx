import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Compass, Layout, Database, Cpu, Plug, Rocket, BarChart2, ArrowRight
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Discovery & Strategy",
    desc: "We map your business goals, identify automation opportunities, and define measurable success criteria before writing a single line of code.",
    tags: ["Stakeholder Interviews", "ROI Modeling", "Feasibility Analysis"],
    icon: Compass,
    accent: "#214ECF",
  },
  {
    number: "02",
    title: "AI Architecture Design",
    desc: "Selecting the right LLMs, vector databases, orchestration layers, and data pipelines for your specific use case and compliance requirements.",
    tags: ["Model Selection", "Vector DB", "Pipeline Design"],
    icon: Layout,
    accent: "#3B82F6",
  },
  {
    number: "03",
    title: "Data Engineering",
    desc: "Cleaning, structuring, chunking, and embedding your proprietary data to create knowledge bases that make AI responses accurate and contextual.",
    tags: ["ETL Pipelines", "Embedding", "Knowledge Graphs"],
    icon: Database,
    accent: "#214ECF",
  },
  {
    number: "04",
    title: "Model Development",
    desc: "Fine-tuning, prompt engineering, RLHF, and extensive red-team testing to ensure models are accurate, safe, and aligned with your brand voice.",
    tags: ["Fine-tuning", "Prompt Engineering", "RLHF"],
    icon: Cpu,
    accent: "#60A5FA",
  },
  {
    number: "05",
    title: "Integration & Testing",
    desc: "Connecting AI capabilities into your existing CRM, ERP, or product stack via secure APIs — with rigorous QA, load testing, and user acceptance validation.",
    tags: ["API Integration", "Load Testing", "UAT"],
    icon: Plug,
    accent: "#3B82F6",
  },
  {
    number: "06",
    title: "Deployment & Scaling",
    desc: "Zero-downtime production launch on your preferred cloud infrastructure with auto-scaling, CDN, monitoring, and incident response in place from day one.",
    tags: ["Cloud Deploy", "Auto-scaling", "Zero Downtime"],
    icon: Rocket,
    accent: "#214ECF",
  },
  {
    number: "07",
    title: "Ongoing Optimization",
    desc: "Continuous monitoring of model drift, accuracy decay, and user feedback loops — plus monthly reviews to retrain, improve, and expand capabilities.",
    tags: ["Drift Monitoring", "Retraining", "Monthly Reviews"],
    icon: BarChart2,
    accent: "#214ECF",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Step card ─────────────────────────────────────────────────────────────────

function StepCard({ step, index, isLast }: { step: typeof STEPS[0]; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduce = useReducedMotion();
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, ease, delay: 0.05 }}
      className="relative flex gap-6 md:gap-10"
    >
      {/* Left: number + connector line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: "56px" }}>
        {/* Number bubble */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="relative flex items-center justify-center w-14 h-14 rounded-2xl border flex-shrink-0 z-10"
          style={{
            background: `linear-gradient(135deg, ${step.accent}18, ${step.accent}08)`,
            borderColor: `${step.accent}35`,
            boxShadow: inView ? `0 0 24px ${step.accent}18` : "none",
          }}
        >
          <span
            className="font-display font-black text-xs"
            style={{ color: step.accent, letterSpacing: "0.05em" }}
          >
            {step.number}
          </span>
        </motion.div>

        {/* Connector line */}
        {!isLast && (
          <div className="flex-1 w-px mt-2 mb-2 relative overflow-hidden" style={{ minHeight: "40px" }}>
            <div className="absolute inset-0" style={{ background: "rgba(33,78,207,0.04)" }} />
            <motion.div
              className="absolute top-0 left-0 w-full origin-top"
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              style={{ background: `linear-gradient(180deg, ${step.accent}60, transparent)`, height: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Right: content */}
      <div className="pb-14 flex-1 min-w-0">
        {/* Icon + title row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${step.accent}12`, border: `1px solid ${step.accent}22` }}
          >
            <Icon size={18} style={{ color: step.accent }} />
          </div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="font-display font-bold text-foreground text-xl md:text-2xl leading-tight mt-1.5"
          >
            {step.title}
          </motion.h3>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.22 }}
          className="text-base leading-relaxed mb-5"
          style={{ color: "rgba(255,255,255,0.5)", maxWidth: "62ch" }}
        >
          {step.desc}
        </motion.p>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: `${step.accent}10`,
                border: `1px solid ${step.accent}25`,
                color: `${step.accent}cc`,
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function Process() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section
      id="process"
      className="relative py-28 md:py-36 overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)" }} />

      {/* Ambient radial */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24">

          {/* Left: sticky header block */}
          <div ref={headingRef} className="lg:sticky lg:top-24 self-start">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease }}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-5"
              style={{ color: "rgba(71,163,255,0.7)" }}
            >
              How We Work
            </motion.p>

            <div className="overflow-hidden mb-6">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.8rem)" }}
              >
                Our battle-tested
                <br />
                <span style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  7-step process.
                </span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              className="text-base leading-relaxed mb-10"
              style={{ color: "rgba(255,255,255,0.4)", maxWidth: "38ch" }}
            >
              A rigorous, repeatable methodology that ships reliable AI and delivers measurable business outcomes — every engagement, every time.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.35 }}
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(37,99,235,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm text-foreground"
                  style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", boxShadow: "0 0 30px rgba(33,78,207,0.18)" }}
                >
                  Start Your Journey
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Timeline duration badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
              style={{ background: "rgba(33,78,207,0.08)", borderColor: "rgba(33,78,207,0.15)" }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: "rgba(33,78,207,0.72)" }}>
                MVP delivery in 4–8 weeks
              </span>
            </motion.div>
          </div>

          {/* Right: step list */}
          <div className="pt-1">
            {STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)" }} />
    </section>
  );
}
