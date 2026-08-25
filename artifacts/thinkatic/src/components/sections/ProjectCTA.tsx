import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { CalendarDays, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { MovingGrid, AmbientParticles, GlowOrb } from "@/components/ui/ParallaxLayers";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRUST_POINTS = [
  "Response within 24 hours",
  "No commitment required",
  "Free discovery consultation",
  "ISO 27001 & HIPAA compliant",
];

const SOCIAL_PROOF = [
  { value: "500+",  label: "Clients Served"    },
  { value: "98.4%", label: "Accuracy Rate"     },
  { value: "4.9/5", label: "Client Rating"     },
  { value: "24/7",  label: "Global Coverage"   },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Section ───────────────────────────────────────────────────────────────────

export function ProjectCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px","0px"] : ["50px", "-50px"]);
  const midY = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px","0px"] : ["80px", "-80px"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #F5F8FF 0%, #F5F8FF 50%, #F5F8FF 100%)" }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.3) 50%, transparent)" }} />

      {/* Background depth layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <MovingGrid opacity={0.025} size={52} duration={35} />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(33,78,207,0.08) 0%, transparent 70%)" }}
        />
      </motion.div>

      {/* Mid glow layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: midY }}>
        <GlowOrb x="20%" y="30%" size={700} color="rgba(37,99,235,0.06)" blur={100} duration={12} delay={0} />
        <GlowOrb x="80%" y="70%" size={500} color="rgba(71,163,255,0.05)" blur={80}  duration={9}  delay={4} />
      </motion.div>

      {/* Ambient particles */}
      <AmbientParticles count={28} color="rgba(71,163,255,0.22)" seed={7} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Social proof strip ── */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {SOCIAL_PROOF.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease, delay: i * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="font-display font-black text-3xl md:text-4xl leading-none"
                style={{ background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {s.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#4B5563" }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, ease }}
          className="mb-16 h-px origin-center"
          style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.18) 50%, transparent)" }}
        />

        {/* ── Main heading ── */}
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-6"
            style={{ color: "rgba(71,163,255,0.7)" }}
          >
            Get Started · No Commitment
          </motion.p>

          <div className="overflow-hidden mb-6">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease, delay: 0.1 }}
              className="font-display font-bold text-foreground leading-[1.0]"
              style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}
            >
              Ready to scale your
              <br />
              <span
                style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 50%, #60A5FA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                operations with AI?
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base md:text-lg max-w-xl mx-auto mb-10"
            style={{ color: "#4B5563" }}
          >
            Book a discovery call, request a proposal, or send us a message. Our team responds within 24 hours.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(37,99,235,0.55), 0 8px 40px rgba(0,0,0,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-4.5 rounded-full font-bold text-foreground"
                style={{
                  background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)",
                  boxShadow: "0 0 40px rgba(33,78,207,0.25), 0 4px 24px rgba(0,0,0,0.4)",
                  fontSize: "0.95rem",
                  letterSpacing: "0.04em",
                  padding: "1rem 2.5rem",
                }}
              >
                <CalendarDays size={18} />
                Book a Discovery Call
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.04, borderColor: "rgba(71,163,255,0.45)", background: "rgba(33,78,207,0.08)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-full font-bold border transition-all duration-300"
                style={{
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "#4B5563",
                  background: "rgba(244,247,255,0.8)",
                  fontSize: "0.95rem",
                  letterSpacing: "0.04em",
                  padding: "1rem 2.5rem",
                }}
              >
                <FileText size={18} />
                Request a Proposal
                <ArrowRight size={15} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: "#34D399", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "#4B5563" }}>{point}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Bottom card row ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16"
        >
          {/* Card 1: book */}
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5 group hover:border-blue-500/30 transition-all duration-400"
            style={{ background: "rgba(37,99,235,0.06)", borderColor: "rgba(33,78,207,0.12)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(33,78,207,0.12)", border: "1px solid rgba(37,99,235,0.3)" }}
            >
              <CalendarDays size={22} style={{ color: "#214ECF" }} />
            </div>
            <div>
              <h3 className="text-foreground font-bold text-lg mb-2">Book a Free Consultation</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                45-minute strategy session with a BPO expert. We'll map your current operations and identify the highest-ROI automation opportunities.
              </p>
            </div>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                style={{ color: "#214ECF" }}
              >
                Schedule Now <ArrowRight size={15} />
              </motion.button>
            </Link>
          </div>

          {/* Card 2: proposal */}
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5 group hover:border-border transition-all duration-400"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(33,78,207,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(33,78,207,0.12)" }}
            >
              <FileText size={22} style={{ color: "#4B5563" }} />
            </div>
            <div>
              <h3 className="text-foreground font-bold text-lg mb-2">Request a Custom Proposal</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                Tell us your volume, industry, and goals. We'll send a detailed scope, staffing plan, and pricing within 24 hours — no generic templates.
              </p>
            </div>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Get Proposal <ArrowRight size={15} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.18) 50%, transparent)" }} />
    </section>
  );
}
