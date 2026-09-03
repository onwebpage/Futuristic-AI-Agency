import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CalendarDays, Shield, Award, Zap, Star, CheckCircle2, Lock, Database, Cloud, Cpu, Sparkles } from 'lucide-react';

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
  { value: '99.99%', label: 'Cloud Uptime SLA', color: '#214ECF' },
  { value: 'Zero Trust', label: 'Security Baseline', color: '#10B981' },
  { value: '2B+', label: 'Annual Operations', color: '#8B5CF6' },
  { value: '<25ms', label: 'Platform Latency', color: '#F59E0B' },
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
      className="relative min-h-[100dvh] w-full overflow-hidden flex items-center"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f4f7ff 38%, #eef3ff 100%)' }}
      aria-label="Hero — Thinkatic Enterprise Technology Transformation Partner"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(71,163,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(71,163,255,1) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_82%_80%,rgba(71,163,255,0.16),transparent_26%),radial-gradient(circle_at_50%_48%,rgba(33,78,207,0.08),transparent_22%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full relative z-10 flex flex-col lg:flex-row items-center pt-36 pb-20 lg:pt-0 lg:pb-0 min-h-[100dvh]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full lg:w-[54%] flex flex-col items-start text-left relative z-20 lg:pr-12"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border mb-6"
            style={{ background: 'rgba(33,78,207,0.06)', borderColor: 'rgba(33,78,207,0.18)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#214ECF] animate-pulse" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#214ECF] font-bold">
              Enterprise Technology Transformation Partner
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-slate-900 leading-[1.04] mb-6 tracking-tight">
            {HERO_LINES.map((line, i) => {
              const isAccent = line === 'Transformation' || line === 'Enterprise Technology';

              return (
                <motion.span
                  key={line}
                  className="block"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.55, ease: EASE }}
                  style={{
                    fontSize: line === 'Transformation' ? 'clamp(2.5rem,4.8vw,4.5rem)' : 'clamp(2.2rem,4.2vw,3.8rem)',
                    ...(line === 'Transformation'
                      ? {
                          background: 'linear-gradient(135deg,#1E40AF 0%,#214ECF 50%,#3B82F6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }
                      : {}),
                  }}
                >
                  {line}
                </motion.span>
              );
            })}
          </h1>

          {/* Core positioning text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
            className="text-base sm:text-lg max-w-[540px] leading-relaxed mb-6 font-normal text-slate-600"
          >
            <strong className="font-semibold text-slate-900">
              Thinkatic helps US enterprises build, modernize, secure and operate mission-critical technology systems.
            </strong>{' '}
            We unite AI, Cloud, Cybersecurity, Data, and Engineering into cohesive enterprise transformations.
          </motion.p>

          {/* Primary Capabilities Pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5, ease: EASE }}
            className="flex flex-wrap gap-2 mb-7"
          >
            {CAPABILITIES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white shadow-xs text-xs font-semibold text-slate-800"
                style={{ borderColor: '#DCE5FF' }}
              >
                <Icon size={13} className="text-[#214ECF]" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.55, ease: EASE }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 mb-8 w-full sm:w-auto"
          >
            <Link href="/contact">
              <button
                className="w-full sm:w-auto h-12 px-7 rounded-xl font-bold text-white text-[13px] tracking-wider border-0 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] bg-[#1E40AF] cursor-pointer shadow-sm"
              >
                <CalendarDays size={15} aria-hidden="true" />
                Plan Your Transformation
              </button>
            </Link>
            <Link href="/pricing">
              <button
                className="w-full sm:w-auto h-12 px-7 rounded-xl font-bold text-slate-900 text-[13px] tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 border border-slate-200 bg-white cursor-pointer shadow-2xs"
              >
                View Enterprise Plans
                <ArrowRight size={15} className="text-[#1E40AF]" aria-hidden="true" />
              </button>
            </Link>
          </motion.div>

          {/* Certifications & SLA badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.5, ease: EASE }}
            className="flex items-center gap-3 flex-wrap pt-4 border-t border-[#DCE5FF] w-full"
          >
            {CERT_BADGES.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-700">
                <Icon size={12} className="text-[#214ECF]" aria-hidden="true" />
                <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-600 font-medium">
                  {label}
                </span>
                {i < CERT_BADGES.length - 1 && <span className="ml-2 w-px h-3 bg-[#DCE5FF]" aria-hidden="true" />}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Hero Architecture Snapshot */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.75, ease: EASE }}
          className="w-full lg:w-[46%] relative mt-14 lg:mt-0 flex-shrink-0"
          aria-hidden="true"
        >
          <div className="relative rounded-[2rem] border p-5 md:p-7 overflow-hidden" style={{ background: '#F4F7FF', borderColor: '#DCE5FF', boxShadow: '0 20px 60px rgba(33,78,207,0.12)' }}>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_25%,rgba(33,78,207,0.14),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(33,78,207,0.09),transparent_36%)]" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.6)_30%,rgba(33,78,207,0.72)_50%,rgba(37,99,235,0.6)_70%,transparent)]" />

            <div className="relative z-10 flex flex-col gap-5">
              {/* Dashboard Header */}
              <div className="rounded-[1.5rem] border px-6 py-6" style={{ background: '#FFFFFF', borderColor: '#DCE5FF', boxShadow: '0 8px 24px rgba(33,78,207,0.06)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-1.5 text-[#214ECF]">
                      Enterprise Architecture
                    </p>
                    <h3 className="text-slate-900 font-display text-2xl font-black leading-tight">
                      Mission-Critical Telemetry
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-700 font-bold">Active SLA</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {ARCHITECTURE_METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl p-3.5 border text-center"
                      style={{ background: '#F8FAFF', borderColor: '#DCE5FF' }}
                    >
                      <p className="font-display font-black text-2xl sm:text-3xl leading-none mb-1.5" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Pipeline Cards */}
              <div className="grid gap-3">
                {TELEMETRY_PIPELINES.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl px-4 py-3.5 flex items-center justify-between"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #DCE5FF',
                      boxShadow: '0 4px 14px rgba(33,78,207,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none">{item.icon}</span>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-semibold">
                          {item.label}
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {item.value}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-[#1E40AF] border border-blue-200/80">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Executive Testimonial Quote */}
              <div
                className="rounded-xl border p-4.5 bg-slate-50/80 border-slate-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border border-[#1E40AF]/30 bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    CTO
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm leading-relaxed italic text-slate-800 mb-1.5 font-medium">
                      "Thinkatic re-architected our core technology infrastructure and deployed enterprise AI pipelines with zero disruption. World-class technical acumen."
                    </p>
                    <p className="text-xs font-bold text-slate-900">Enterprise Vice President of Engineering</p>
                    <p className="text-[10px] text-slate-600 font-mono font-medium">Fortune 500 Financial &amp; Logistics Group</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
