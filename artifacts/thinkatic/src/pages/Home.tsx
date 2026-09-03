import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Calendar, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { OurClients } from "@/components/sections/OurClients";
import { BPOServices } from "@/components/sections/BPOServices";
import { FlagshipPricingSection } from "@/components/sections/FlagshipPricingSection";
import { WhyThinkatic } from "@/components/sections/WhyThinkatic";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { GlobalCoverage } from "@/components/sections/GlobalCoverage";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { useSEO } from "@/hooks/useSEO";

// ─── Guarantees strip ─────────────────────────────────────────────────────────
const GUARANTEES = [
  "ISO 27001 Certified",
  "SOC 2 Type II Audited",
  "HIPAA Compliant",
  "Zero Trust Architecture",
  "99.99% Uptime SLA",
];

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      className="relative py-32 md:py-40 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F8FF 50%, #FFFFFF 100%)" }}
    >
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.18) 50%, transparent)" }} />

      {/* Parallax background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(33,78,207,0.08) 0%, transparent 65%)" }} />
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: "15%", top: "20%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: "10%", bottom: "15%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(71,163,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
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
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10"
              >
                <Sparkles size={12} style={{ color: "#214ECF" }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#214ECF]">
                  Start Your Strategic Transformation
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-5">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="font-display font-black text-slate-900 leading-[1.04]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Ready to engineer
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #1E40AF 0%, #214ECF 60%, #60A5FA 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  mission-critical scale?
                </span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-lg leading-relaxed mb-10 max-w-lg text-slate-600"
            >
              Schedule an architectural consultation or request a transformation proposal. Our principal architects respond within 24 hours to discuss system requirements, timeline, and measurable outcomes.
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
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{g}</span>
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
                <button
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-white text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #214ECF 0%, #1A43C8 100%)",
                  }}
                >
                  <Calendar size={16} />
                  Book Architectural Consultation
                </button>
              </Link>
              <Link href="/request-proposal">
                <button
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold border transition-all duration-300 bg-white hover:bg-slate-50 text-[#214ECF] border-[#214ECF]/30 text-sm tracking-wide cursor-pointer"
                >
                  <FileText size={16} />
                  Request a Proposal
                  <ArrowRight size={14} />
                </button>
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
            <div
              className="relative rounded-3xl border border-[#DCE5FF] p-8 md:p-10 overflow-hidden bg-white shadow-xl"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.6) 30%, rgba(33,78,207,0.72) 50%, rgba(37,99,235,0.6) 70%, transparent)" }}
              />

              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-8 text-[#214ECF]">
                Enterprise Partnership Benchmarks
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "500+", label: "Enterprise Clients", color: "#214ECF" },
                  { value: "99.99%", label: "Cloud Uptime SLA", color: "#10B981" },
                  { value: "2B+", label: "Ops / Year", color: "#8B5CF6" },
                  { value: "<24h", label: "Consultation SLA", color: "#F59E0B" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-5 border text-center"
                    style={{
                      background: `${stat.color}08`,
                      borderColor: `${stat.color}22`,
                    }}
                  >
                    <p
                      className="font-display font-black text-3xl md:text-4xl leading-none mb-2"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Verified Enterprise Endorsement */}
              <div
                className="rounded-2xl border p-5 bg-slate-50 border-slate-200"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-[#214ECF]/10 border border-[#214ECF]/30 text-[#214ECF] shrink-0">
                    CTO
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm leading-relaxed italic mb-2 text-slate-700">
                      "Thinkatic modernized our monolithic applications into cloud-native microservices and deployed private AI agents with zero downtime. Exceptional delivery."
                    </p>
                    <p className="text-xs font-bold text-slate-900">Chief Information Officer</p>
                    <p className="text-[10px] text-slate-500 font-mono">U.S. Enterprise Healthcare &amp; Technology Network</p>
                  </div>
                </div>
              </div>
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
  useSEO({
    title: "Thinkatic — Enterprise Technology Transformation Partner",
    description: "Thinkatic helps US enterprises build, modernize, secure and operate mission-critical technology systems across AI, Cloud, Cybersecurity, Data, and Engineering.",
    path: "/",
  });

  return (
    <Layout>
      {/* 1 · Hero */}
      <Hero />

      {/* 2 · Trusted Companies */}
      <OurClients />

      {/* 3 · Enterprise Capabilities */}
      <BPOServices />

      {/* 4 · Why Choose Thinkatic */}
      <WhyThinkatic />

      {/* 5 · Flagship Strategic Pricing Engagements */}
      <FlagshipPricingSection />

      {/* 6 · Industries */}
      <IndustriesSection />

      {/* 7 · Global Coverage */}
      <GlobalCoverage />

      {/* 8 · Transformation Process */}
      <Process />

      {/* 9 · Testimonials */}
      <Testimonials />

      {/* 10 · Enterprise FAQ */}
      <FAQ />

      {/* 11 · Final Strategic CTA */}
      <FinalCTA />
    </Layout>
  );
}
