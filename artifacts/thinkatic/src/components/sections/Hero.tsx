import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CalendarDays, Shield, Award, Zap, Star, CheckCircle2 } from 'lucide-react';

const HERO_LINES = ['AI-Powered BPO', 'That Delivers', 'Business', 'Outcomes.'];

const HERO_STATS = [
  { value: '500+', label: 'Enterprise Clients' },
  { value: '99.8%', label: 'Accuracy Rate' },
  { value: '40%', label: 'Cost Reduction' },
  { value: '15+', label: 'Industries Served' },
  { value: '2B+', label: 'Ops / Year' },
];

const CERT_BADGES = [
  { icon: Shield, label: 'ISO 27001 Certified' },
  { icon: Award, label: 'HIPAA Compliant' },
  { icon: Zap, label: 'SOC 2 Type II' },
];

const TRUST_CLIENTS = [
  { name: 'HealthCore', icon: '🏥' },
  { name: 'FinEdge', icon: '💼' },
  { name: 'RetailMax', icon: '🛒' },
  { name: 'TechNova', icon: '⚡' },
];

const SURFACE_CARDS = [
  { icon: '⚡', label: 'Processing Speed', value: '847ms', sub: 'avg response time' },
  { icon: '🧠', label: 'AI Accuracy', value: '99.8%', sub: 'verified enterprise avg' },
  { icon: '📈', label: 'Active Workflows', value: '12,847', sub: '+18% this quarter' },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function Hero() {
  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden flex items-center"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f4f7ff 38%, #eef3ff 100%)' }}
      aria-label="Hero — Thinkatic AI-Powered BPO"
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
          className="w-full lg:w-[52%] flex flex-col items-start text-left relative z-20 lg:pr-14"
        >
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border mb-7"
            style={{ background: 'rgba(33,78,207,0.06)', borderColor: 'rgba(33,78,207,0.18)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-primary font-medium">
              #1 Enterprise AI &amp; BPO Partner — 2024
            </span>
            <div className="ml-1 flex gap-0.5" aria-hidden="true">
              {[...Array(3)].map((_, i) => <Star key={i} size={7} className="fill-yellow-400/70 text-yellow-400/70" />)}
            </div>
          </div>

          <h1 className="font-display font-bold text-slate-900 leading-[1.0] mb-6 tracking-tight">
            {HERO_LINES.map((word, i) => {
              const isAccent = word === 'AI-Powered BPO' || word === 'Business';
              const isSmaller = word === 'AI-Powered BPO' || word === 'Business';

              return (
                <motion.span
                  key={word}
                  className="block"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.55, ease: EASE }}
                  style={{
                    fontSize: isSmaller ? 'clamp(2.2rem,3.8vw,3.6rem)' : 'clamp(2.7rem,5.2vw,4.8rem)',
                    ...(isAccent
                      ? {
                          background: 'linear-gradient(135deg,#214ECF 0%,#4A7BFF 60%,#93c5fd 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }
                      : {}),
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
            className="text-base md:text-lg max-w-[480px] leading-relaxed mb-5"
            style={{ color: '#4B5563' }}
          >
            Accelerate growth with intelligent BPO — AI-enabled customer operations, healthcare outsourcing, outbound sales, and enterprise technology built for scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
            className="mb-7 flex items-center gap-3 flex-wrap"
          >
            {CERT_BADGES.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-700">
                <Icon size={11} className="text-[#214ECF]" aria-hidden="true" />
                <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-600">
                  {label}
                </span>
                {i < CERT_BADGES.length - 1 && <span className="ml-2 w-px h-3 bg-[#DCE5FF]" aria-hidden="true" />}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.55, ease: EASE }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 w-full sm:w-auto"
          >
            <Link href="/contact">
              <button
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white text-[13px] tracking-wide border-0 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(33,78,207,0.28)]"
                style={{
                  background: 'linear-gradient(135deg,#214ECF 0%,#1a43c8 100%)',
                  boxShadow: '0 12px 24px rgba(33,78,207,0.18)',
                }}
              >
                <CalendarDays size={14} aria-hidden="true" />
                Book a Free Consultation
              </button>
            </Link>
            <Link href="/services">
              <button
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-[#214ECF] text-[13px] tracking-wide flex items-center gap-2 transition-colors duration-200 hover:bg-[#214ECF]/5"
                style={{ border: '1px solid rgba(33,78,207,0.2)', background: '#FFFFFF' }}
              >
                Explore BPO Services
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.55, ease: EASE }}
            className="w-full"
          >
            <div className="pt-6 border-t w-full" style={{ borderColor: 'rgba(33,78,207,0.12)' }}>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="relative rounded-xl px-3 py-3 overflow-hidden cursor-default"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #DCE5FF',
                      boxShadow: '0 4px 12px rgba(33,78,207,0.06)',
                    }}
                  >
                    <div className="absolute top-0 left-2 right-2 h-px bg-[linear-gradient(90deg,transparent,rgba(71,163,255,0.4),transparent)]" />
                    <div className="flex flex-col gap-1.5">
                      <span
                        className="text-xl md:text-2xl font-display font-bold text-[#214ECF]"
                      >
                        {stat.value}
                      </span>
                      <span className="text-[8px] md:text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-medium whitespace-nowrap">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.55, ease: EASE }}
            className="mt-6 w-full"
          >
            <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(33,78,207,0.08)' }}>
              <div className="flex items-center gap-2 mb-3.5">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-background flex items-center justify-center text-[8px]"
                      style={{ background: `rgba(37,99,235,${0.3 + i * 0.1})`, zIndex: 4 - i }}
                      aria-hidden="true"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
                  Trusted by 500+ enterprise clients worldwide
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} className="fill-yellow-400/80 text-yellow-400/80" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: 'rgba(33,78,207,0.16)' }}>4.9/5</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {TRUST_CLIENTS.map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(33,78,207,0.04)' }}
                  >
                    <span className="text-xs" aria-hidden="true">{client.icon}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{client.name}</span>
                  </div>
                ))}
                <span className="text-[10px] font-medium text-[#4B5563]">+496 more</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.75, ease: EASE }}
          className="w-full lg:w-[48%] relative mt-14 lg:mt-0 flex-shrink-0"
          aria-hidden="true"
        >
          <div className="relative rounded-[2rem] border p-5 md:p-6 overflow-hidden" style={{ background: '#F4F7FF', borderColor: '#DCE5FF', boxShadow: '0 18px 50px rgba(33,78,207,0.10)' }}>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_25%,rgba(33,78,207,0.14),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(33,78,207,0.09),transparent_36%)]" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.6)_30%,rgba(33,78,207,0.72)_50%,rgba(37,99,235,0.6)_70%,transparent)]" />

            <div className="relative z-10 min-h-[500px] md:min-h-[570px] flex flex-col">
              <div className="rounded-[1.5rem] border px-5 py-6 md:px-6 md:py-7 mb-4" style={{ background: '#FFFFFF', borderColor: '#DCE5FF', boxShadow: '0 8px 24px rgba(33,78,207,0.06)' }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] mb-2" style={{ color: 'rgba(71,163,255,0.65)' }}>
                      Live operations snapshot
                    </p>
                    <h3 className="text-foreground font-display text-2xl md:text-3xl font-bold leading-tight">
                      Premium operations, simplified.
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-700">Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '500+', label: 'Enterprise Clients', color: '#214ECF' },
                    { value: '98.4%', label: 'Accuracy Rate', color: '#34D399' },
                    { value: '2B+', label: 'Ops / Year', color: '#A78BFA' },
                    { value: '24h', label: 'Response Time', color: '#F59E0B' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-4 border text-center"
                      style={{ background: '#F8FAFF', borderColor: '#DCE5FF' }}
                    >
                      <p className="font-display font-black text-3xl md:text-4xl leading-none mb-2" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#4B5563]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-5">
                {SURFACE_CARDS.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl px-4 py-4 min-h-[116px]"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #DCE5FF',
                      boxShadow: '0 6px 18px rgba(33,78,207,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-base leading-none" aria-hidden="true">{card.icon}</span>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-mono">{card.label}</span>
                    </div>
                    <div className="text-[22px] font-bold font-display text-[#111827] leading-none">{card.value}</div>
                    <div className="text-[10px] text-[#4B5563] mt-1 font-mono">{card.sub}</div>
                  </div>
                ))}
              </div>

              <div
                className="mt-auto rounded-2xl border p-5"
                style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.18)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#214ECF]/30 bg-[#214ECF]/10 text-sm">
                    SB
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed italic mb-2" style={{ color: '#4B5563' }}>
                      "They shipped our AI SaaS MVP in six weeks. Quality is genuinely world-class."
                    </p>
                    <p className="text-xs font-semibold text-foreground">Samantha Brooks</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(33,78,207,0.22)' }}>Co-founder &amp; CEO · Stackline AI</p>
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
