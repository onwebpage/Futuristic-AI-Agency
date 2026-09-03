import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight, CalendarDays, Shield, Award, Zap, CheckCircle2,
  Lock, Database, Cloud, Cpu, Sparkles, Activity, Terminal
} from 'lucide-react';

// ─── Content Locked Assets ───────────────────────────────────────────────────

const HERO_LINES = ['Enterprise Technology', 'Transformation', 'For Mission-Critical', 'Scale.'];

const CAPABILITIES = [
  { label: 'AI & Automation', icon: Sparkles },
  { label: 'Cloud Modernization', icon: Cloud },
  { label: 'Cybersecurity', icon: Lock },
  { label: 'Data Platforms', icon: Database },
  { label: 'Product Engineering', icon: Cpu },
];

const CERT_BADGES = [
  { icon: Shield, label: 'ISO 27001 Certified' },
  { icon: Award, label: 'SOC 2 Type II Audited' },
  { icon: Zap, label: 'HIPAA Compliant' },
  { icon: CheckCircle2, label: '99.99% Uptime SLA' },
];

const ARCHITECTURE_METRICS = [
  { value: '99.99%', label: 'Cloud Uptime SLA', color: '#1E40AF', sub: 'High Availability' },
  { value: 'Zero Trust', label: 'Security Baseline', color: '#059669', sub: 'NIST & SOC 2' },
  { value: '2B+', label: 'Annual Operations', color: '#7C3AED', sub: 'Mission-Critical' },
  { value: '<25ms', label: 'Platform Latency', color: '#D97706', sub: 'Real-Time Edge' },
];

const TELEMETRY_PIPELINES = [
  { icon: '🤖', label: 'AI Architecture', value: 'Multi-Agent RAG', status: 'Optimal' },
  { icon: '☁️', label: 'Cloud Foundation', value: 'AWS & Azure Hybrid', status: 'Secured' },
  { icon: '🛡️', label: 'Cyber Defense', value: '24/7 SOC Surveillance', status: 'Protected' },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function Hero() {
  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden flex items-center bg-white"
      aria-label="Hero — Thinkatic Enterprise Technology Transformation Partner"
    >
      {/* ── Background Architectural Canvas ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Soft atmospheric gradient behind command center */}
        <div
          className="absolute top-1/4 right-0 w-[650px] h-[650px] opacity-40"
          style={{
            background: 'radial-gradient(circle at 60% 40%, rgba(30, 64, 175, 0.07) 0%, rgba(5, 150, 105, 0.03) 45%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Hairline Technical Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Subtle decorative circuit traces */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="144" x2="100%" y2="144" stroke="#0F172A" strokeWidth="1" />
          <line x1="0" y1="576" x2="100%" y2="576" stroke="#0F172A" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="50%" cy="144" r="3" fill="#1E40AF" />
          <circle cx="75%" cy="576" r="3" fill="#1E40AF" />
        </svg>

        {/* Subtle bottom division */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-slate-200" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 w-full relative z-10 pt-32 pb-20 lg:pt-28 lg:pb-16 min-h-[100dvh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ═══════════════════════════════════════════════════════════════════
              LEFT COLUMN: Authoritative Enterprise Proclamation (7 cols)
          ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Technical Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/80 mb-6 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-slate-800 font-bold">
                Enterprise Technology Transformation Partner
              </span>
            </div>

            {/* Monumental Headline */}
            <h1 className="font-display font-black text-slate-900 leading-[0.98] mb-6 tracking-[-0.035em]">
              <span className="block text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.25rem] text-slate-900">
                {HERO_LINES[0]}
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.25rem] text-[#1E40AF] mt-1 mb-1">
                {HERO_LINES[1]}
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.5rem] text-slate-900 font-bold tracking-tight">
                {HERO_LINES[2]} {HERO_LINES[3]}
              </span>
            </h1>

            {/* Core Positioning Narrative */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
              className="text-base sm:text-lg max-w-xl leading-relaxed mb-7 text-slate-700 font-normal"
            >
              <strong className="font-semibold text-slate-900">
                Thinkatic helps US enterprises build, modernize, secure and operate mission-critical technology systems.
              </strong>{' '}
              We unite AI, Cloud, Cybersecurity, Data, and Engineering into cohesive enterprise transformations.
            </motion.p>

            {/* Capabilities Navigation Architecture (Connected Bar) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
              className="w-full max-w-xl mb-8"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Terminal size={12} className="text-[#1E40AF]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                  Core Engineering Disciplines
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-slate-200 bg-slate-50/60 shadow-2xs">
                {CAPABILITIES.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200/90 text-xs font-mono font-medium text-slate-800 transition-all hover:border-[#93C5FD] hover:text-[#1E40AF] cursor-default shadow-2xs"
                  >
                    <Icon size={12} className="text-[#1E40AF]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Confident Enterprise CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.55, ease: EASE }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-9 w-full sm:w-auto"
            >
              <Link href="/contact">
                <button
                  className="h-12 px-7 rounded-xl font-bold text-white text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-[#1D4ED8] bg-[#1E40AF] cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  Plan Your Transformation
                </button>
              </Link>
              <Link href="/pricing">
                <button
                  className="h-12 px-7 rounded-xl font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 border border-slate-200 bg-white cursor-pointer shadow-2xs"
                >
                  View Enterprise Plans
                  <ArrowRight size={14} className="text-[#1E40AF]" aria-hidden="true" />
                </button>
              </Link>
            </motion.div>

            {/* Certifications & Trust Architecture (Understated Baseline) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
              className="flex items-center gap-y-2 gap-x-4 flex-wrap pt-5 border-t border-slate-200 w-full max-w-xl"
            >
              {CERT_BADGES.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-600">
                  <Icon size={13} className="text-[#1E40AF]" aria-hidden="true" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold">
                    {label}
                  </span>
                  {i < CERT_BADGES.length - 1 && (
                    <span className="hidden sm:inline-block ml-3 text-slate-300 select-none">·</span>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: Enterprise Technology Command Center (5 cols)
          ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: EASE }}
            className="lg:col-span-5 relative w-full"
            aria-label="Enterprise Infrastructure Command Center"
          >
            {/* Multi-Layered Technical Command Deck */}
            <div className="relative space-y-4">

              {/* Panel A: Mission-Critical Telemetry Console */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
                {/* Corner registration crosshairs */}
                <div className="absolute top-2 left-2 text-slate-300 font-mono text-[9px] select-none">+</div>
                <div className="absolute top-2 right-2 text-slate-300 font-mono text-[9px] select-none">+</div>

                {/* Header Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#1E40AF]" />
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#1E40AF]">
                        Enterprise Architecture
                      </p>
                      <h3 className="text-slate-900 font-display text-base font-bold leading-tight">
                        Mission-Critical Telemetry
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                      Active SLA
                    </span>
                  </div>
                </div>

                {/* High-Density Metric Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {ARCHITECTURE_METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-lg p-3 border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="font-display font-black text-xl sm:text-2xl leading-none text-slate-900">
                          {metric.value}
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: metric.color }} />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-semibold leading-tight">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel B: Active Production Pipelines Stream */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span>Active Production Pipelines</span>
                  <span className="text-[#1E40AF]">Live Signal</span>
                </div>

                <div className="space-y-2">
                  {TELEMETRY_PIPELINES.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg p-2.5 border border-slate-100 bg-slate-50/70 flex items-center justify-between hover:bg-white hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none select-none">{item.icon}</span>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                            {item.label}
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            {item.value}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] border border-blue-200/70">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel C: Executive Endorsement Anchor */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4.5 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#1E40AF]" />
                <div className="flex items-start gap-3 pl-1">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs border border-[#1E40AF]/30 bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    CTO
                  </div>
                  <div>
                    <p className="text-xs leading-relaxed italic text-slate-800 mb-1.5 font-medium">
                      "Thinkatic re-architected our core technology infrastructure and deployed enterprise AI pipelines with zero disruption. World-class technical acumen."
                    </p>
                    <p className="text-xs font-bold text-slate-900">Enterprise Vice President of Engineering</p>
                    <p className="text-[10px] text-slate-600 font-mono font-medium">Fortune 500 Financial &amp; Logistics Group</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
