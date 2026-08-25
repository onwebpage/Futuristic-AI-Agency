import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Calendar, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { OurClients } from "@/components/sections/OurClients";
import { BPOServices } from "@/components/sections/BPOServices";
import { WhyThinkatic } from "@/components/sections/WhyThinkatic";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { GlobalCoverage } from "@/components/sections/GlobalCoverage";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";

// ─── Guarantees strip ─────────────────────────────────────────────────────────
const GUARANTEES = [
  "ISO 27001 Certified",
  "SOC 2 Type II Audited",
  "HIPAA Compliant",
  "24/7 Global Coverage",
  "99.9% Uptime SLA",
];

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px", "0px"] : ["40px", "-40px"]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px", "0px"] : ["60px", "-60px"]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0px", "0px"] : ["-40px", "40px"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F8FF 50%, #FFFFFF 100%)" }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.18) 50%, transparent)" }} />

      {/* Parallax background layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(33,78,207,0.08) 0%, transparent 65%)" }} />
      </motion.div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: "15%", top: "20%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
          filter: "blur(80px)", y: orb1Y,
        }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: "10%", bottom: "15%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(71,163,255,0.06) 0%, transparent 70%)",
          filter: "blur(80px)", y: orb2Y,
        }}
      />

      {/* Animated mesh grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(71,163,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(71,163,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: headline + actions ── */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2.5 mb-8"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{ background: "rgba(37,99,235,0.1)", borderColor: "rgba(37,99,235,0.3)" }}
              >
                <Sparkles size={12} style={{ color: "#214ECF" }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(33,78,207,0.72)" }}>
                  Start Your Engagement
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-4">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.0]"
                style={{ fontSize: "clamp(2.6rem, 5.5vw, 5rem)" }}
              >
                Ready to build
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #214ECF 0%, #214ECF 60%, #93C5FD 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  smarter operations?
                </span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: "#4B5563" }}
            >
              Book a discovery call, request a proposal, or send us a message. Our team responds within 24 hours — no sales pressure, just a real conversation.
            </motion.p>

            {/* Guarantees list */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-x-5 gap-y-2.5 mb-12"
            >
              {GUARANTEES.map((g, i) => (
                <motion.div
                  key={g}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.07 }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} style={{ color: "#34D399", flexShrink: 0 }} />
                  <span className="text-xs font-medium" style={{ color: "#4B5563" }}>{g}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(37,99,235,0.55), 0 8px 32px rgba(0,0,0,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-foreground text-sm tracking-wide"
                  style={{
                    background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)",
                    boxShadow: "0 0 40px rgba(33,78,207,0.25), 0 4px 24px rgba(0,0,0,0.4)",
                    letterSpacing: "0.03em",
                  }}
                >
                  <Calendar size={16} />
                  Book a Discovery Call
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04, borderColor: "rgba(33,78,207,0.38)", background: "rgba(33,78,207,0.04)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold border transition-all duration-300"
                  style={{
                    borderColor: "rgba(33,78,207,0.2)",
                    color: "#214ECF",
                    background: "#FFFFFF",
                    fontSize: "0.875rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  <FileText size={16} />
                  Request a Proposal
                  <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: premium stats card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div
              className="absolute -inset-8 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(33,78,207,0.09) 0%, transparent 70%)", filter: "blur(40px)" }}
            />

            {/* Glass card */}
            <div
              className="relative rounded-3xl border p-8 md:p-10 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(33,78,207,0.06)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Animated top border */}
              <div
                className="absolute top-0 left-0 right-0 h-[1.5px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.6) 30%, rgba(33,78,207,0.72) 50%, rgba(37,99,235,0.6) 70%, transparent)" }}
              />

              {/* Inner content */}
              <p
                className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] mb-8"
                style={{ color: "rgba(71,163,255,0.65)" }}
              >
                Why teams choose us
              </p>

              <div className="grid grid-cols-2 gap-5 mb-8">
                {[
                  { value: "500+", label: "Enterprise Clients", color: "#214ECF" },
                  { value: "98.4%", label: "Accuracy Rate", color: "#34D399" },
                  { value: "2B+", label: "Ops / Year", color: "#A78BFA" },
                  { value: "24h", label: "Response Time", color: "#F59E0B" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, delay: 0.3 + i * 0.1 }}
                    className="rounded-2xl p-5 border text-center"
                    style={{
                      background: `${stat.color}08`,
                      borderColor: `${stat.color}20`,
                    }}
                  >
                    <p
                      className="font-display font-black text-3xl md:text-4xl leading-none mb-2"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(33,78,207,0.22)" }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial snippet */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="rounded-2xl border p-5"
                style={{
                  background: "rgba(37,99,235,0.06)",
                  borderColor: "rgba(37,99,235,0.18)",
                }}
              >
                <div className="flex items-start gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Samantha Brooks"
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    style={{ border: "2px solid rgba(71,163,255,0.4)" }}
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm leading-relaxed italic mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                      "They shipped our AI SaaS MVP in six weeks. Quality is genuinely world-class."
                    </p>
                    <p className="text-xs font-semibold text-foreground">Samantha Brooks</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(33,78,207,0.22)" }}>Co-founder & CEO · Stackline AI</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.04) 50%, transparent)" }} />
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <Layout>
      {/* 1 · Hero */}
      <Hero />

      {/* 2 · Trusted Companies */}
      <OurClients />

      {/* 3 · Services */}
      <BPOServices />

      {/* 4 · Why Choose Us */}
      <WhyThinkatic />

      {/* 5 · Industries */}
      <IndustriesSection />

      {/* 6 · Global Coverage */}
      <GlobalCoverage />

      {/* 7 · Process */}
      <Process />

      {/* 8 · Testimonials */}
      <Testimonials />

      {/* 9 · FAQ */}
      <FAQ />

      {/* 10 · Final CTA */}
      <FinalCTA />
    </Layout>
  );
}
