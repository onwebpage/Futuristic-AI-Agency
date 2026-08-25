import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  HeartPulse, Headphones, TrendingUp, Database, Bot,
  ArrowRight, CheckCheck, Zap, Star,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Data ─────────────────────────────────────────────────────────────────────

const pillars = [
  {
    id: "01",
    title: "Healthcare BPO",
    slug: "healthcare-bpo",
    icon: HeartPulse,
    desc: "HIPAA-compliant outsourcing for healthcare organizations — from patient outreach to revenue cycle management.",
    services: ["Medical Call Transfer", "Patient Outreach", "Appointment Scheduling", "Revenue Cycle Assistance"],
    stat: { value: "62%", label: "Fewer claim denials" },
    accent: "#214ECF",
    gradient: "from-[#0B1E3D] to-[#0a1628]",
    featured: false,
  },
  {
    id: "02",
    title: "Customer Support",
    slug: "customer-support",
    icon: Headphones,
    desc: "AI-assisted support teams delivering exceptional customer experiences at scale, 24×7 across every channel.",
    services: ["Voice Support", "Live Chat", "WhatsApp Support", "Technical Support"],
    stat: { value: "92%", label: "CSAT score" },
    accent: "#214ECF",
    gradient: "from-[#0a1830] to-[#0a0f1e]",
    featured: false,
  },
  {
    id: "03",
    title: "Sales & Lead Gen",
    slug: "sales-lead-generation",
    icon: TrendingUp,
    desc: "Generate qualified opportunities with intelligent outbound operations built to fill your pipeline at speed.",
    services: ["Outbound Calling", "Appointment Setting", "Lead Qualification", "Sales Development"],
    stat: { value: "3.2×", label: "Pipeline velocity" },
    accent: "#214ECF",
    gradient: "from-[#0B1E3D] to-[#0a1628]",
    featured: false,
  },
  {
    id: "04",
    title: "Back Office Ops",
    slug: "back-office",
    icon: Database,
    desc: "Streamlined back-office processes that improve efficiency, reduce errors, and cut operational overhead.",
    services: ["Data Entry", "CRM Management", "Document Processing", "Quality Assurance"],
    stat: { value: "45%", label: "Cost reduction" },
    accent: "#214ECF",
    gradient: "from-[#0a1830] to-[#0a0f1e]",
    featured: false,
  },
  {
    id: "05",
    title: "AI-Powered BPO",
    slug: "ai-powered-bpo",
    icon: Bot,
    desc: "The future of outsourcing — human expertise combined with intelligent automation for measurable, guaranteed outcomes.",
    services: ["AI Voice Agents", "AI Chatbots", "Workflow Automation", "AI Quality Monitoring"],
    stat: { value: "2B+", label: "Operations / year" },
    accent: "#214ECF",
    gradient: "from-[#F4F8FF] to-[#E9F1FF]",
    featured: true,
  },
];

// ─── Service chip ─────────────────────────────────────────────────────────────

function ServiceChip({ label, accent }: { label: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: `${accent}10`,
        border: `1px solid ${accent}28`,
        color: `${accent}cc`,
      }}
    >
      <CheckCheck size={10} style={{ color: accent, flexShrink: 0 }} />
      {label}
    </div>
  );
}

// ─── Pillar card ──────────────────────────────────────────────────────────────

function PillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = pillar.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease, delay: index * 0.08 }}
      className={`group relative rounded-2xl p-8 flex flex-col gap-6 border cursor-default overflow-hidden h-full bg-gradient-to-br ${pillar.gradient} transition-all duration-300`}
      style={{
        borderColor: pillar.featured ? "rgba(37,99,235,0.4)" : "rgba(33,78,207,0.06)",
      }}
    >
      {/* Subtle hover glow via CSS group-hover */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `radial-gradient(ellipse at 10% 0%, ${pillar.accent}12 0%, transparent 55%)` }}
      />

      {/* Featured badge */}
      {pillar.featured && (
        <motion.div
          className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease, delay: index * 0.08 + 0.25 }}
          style={{ background: "rgba(33,78,207,0.15)", border: "1px solid rgba(37,99,235,0.4)" }}
        >
          <Star size={10} fill="#214ECF" color="#214ECF" />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#214ECF" }}>
            Featured
          </span>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          background: `${pillar.accent}18`,
          border: `1px solid ${pillar.accent}35`,
        }}
      >
        <Icon size={22} style={{ color: pillar.accent }} />
      </div>

      {/* Number tag */}
      <div className="absolute top-8 right-8">
        <span
          className="font-display font-black text-5xl leading-none select-none"
          style={{ color: `${pillar.accent}10`, letterSpacing: "-0.04em" }}
        >
          {pillar.id}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-display font-bold text-foreground text-xl leading-tight mb-2">
            {pillar.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
            {pillar.desc}
          </p>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2">
          {pillar.services.map((s) => (
            <ServiceChip key={s} label={s} accent={pillar.accent} />
          ))}
        </div>
      </div>

      {/* Stat + CTA row */}
      <div className="flex items-end justify-between gap-4 pt-2 border-t" style={{ borderColor: "rgba(33,78,207,0.04)" }}>
        {/* Key metric */}
        <div>
          <p className="font-display font-black text-2xl leading-none" style={{ color: pillar.accent }}>
            {pillar.stat.value}
          </p>
          <p className="text-[10px] font-medium mt-1" style={{ color: "#4B5563" }}>
            {pillar.stat.label}
          </p>
        </div>

        {/* Learn more link */}
        <Link href={`/services/${pillar.slug}`}>
          <div
            className="flex items-center gap-1.5 text-xs font-bold transition-transform duration-200 group-hover:translate-x-1"
            style={{ color: pillar.accent }}
          >
            Learn more
            <ArrowRight size={13} />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function BPOServices() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)" }} />

      {/* Static ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 85% 20%, rgba(37,99,235,0.05) 0%, transparent 50%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 10% 70%, rgba(71,163,255,0.04) 0%, transparent 50%)" }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Header ── */}
        <div ref={headingRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease }}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-5"
              style={{ color: "rgba(71,163,255,0.7)" }}
            >
              BPO Services
            </motion.p>

            <div className="overflow-hidden mb-4">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.88, ease, delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.0]"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
              >
                Every operation,
                <br />
                <span style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI-powered.
                </span>
              </motion.h2>
            </div>
          </div>

          {/* Right: description + badge row */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              className="text-base md:text-lg leading-relaxed mb-6"
              style={{ color: "#4B5563" }}
            >
              Five core pillars of AI-enabled outsourcing — each combining trained human professionals with intelligent automation to deliver measurable business outcomes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {[
                { icon: Zap, label: "AI-First" },
                { icon: CheckCheck, label: "Outcome-Guaranteed" },
                { icon: HeartPulse, label: "HIPAA Compliant" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold"
                  style={{
                    background: "rgba(33,78,207,0.08)",
                    borderColor: "rgba(37,99,235,0.22)",
                    color: "rgba(33,78,207,0.72)",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Cards grid ── */}
        {/* Top row: 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {pillars.slice(0, 2).map((p, i) => (
            <PillarCard key={p.id} pillar={p} index={i} />
          ))}
        </div>

        {/* Middle row: 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {pillars.slice(2, 4).map((p, i) => (
            <PillarCard key={p.id} pillar={p} index={i + 2} />
          ))}
        </div>

        {/* Bottom: featured card full width */}
        <div className="grid grid-cols-1 gap-4">
          <PillarCard pillar={pillars[4]} index={4} />
        </div>

        {/* ── Bottom CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-14 rounded-2xl border p-7"
          style={{ background: "rgba(37,99,235,0.05)", borderColor: "rgba(37,99,235,0.18)" }}
        >
          <div>
            <p className="text-foreground font-bold text-base mb-1">Not sure which service fits your needs?</p>
            <p className="text-sm" style={{ color: "#4B5563" }}>
              Our team will assess your operations and recommend the right BPO solution — free of charge.
            </p>
          </div>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(37,99,235,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm text-foreground flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", boxShadow: "0 0 28px rgba(33,78,207,0.18)" }}
            >
              Get a Free Consultation
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)" }} />
    </section>
  );
}
