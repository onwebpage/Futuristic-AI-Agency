import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    index: "01",
    quote:
      "Thinkatic completely transformed how we approach AI in our product. Their team didn't just build features — they thought through the entire user experience from first principles. Delivery was fast, communication was flawless, and the results speak for themselves.",
    name: "Ryan Mitchell",
    title: "Chief Product Officer",
    company: "Aether Labs",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    metric: "68%",
    metricLabel: "reduction in support tickets",
    accent: "#214ECF",
  },
  {
    index: "02",
    quote:
      "I've worked with a lot of agencies, and Thinkatic stands apart. They shipped our AI SaaS MVP in six weeks, handled all the complexity under the hood, and our users love it. The quality of work is genuinely world-class.",
    name: "Samantha Brooks",
    title: "Co-founder & CEO",
    company: "Stackline AI",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    metric: "6 wks",
    metricLabel: "from kickoff to launch",
    accent: "#214ECF",
  },
  {
    index: "03",
    quote:
      "What impressed me most was how quickly they understood our domain. We're in healthcare AI — a very nuanced space — and within days they were proposing solutions our own team hadn't thought of. Highly recommend.",
    name: "Dr. James Whitfield",
    title: "Head of Product",
    company: "MedLogic Systems",
    photo: "https://randomuser.me/api/portraits/men/67.jpg",
    metric: "98.4%",
    metricLabel: "medical coding accuracy",
    accent: "#34D399",
  },
  {
    index: "04",
    quote:
      "They care about the outcome, not just the deliverable. Thinkatic pushed back when something wouldn't work and offered smarter alternatives. That kind of partnership is rare and incredibly valuable.",
    name: "Ashley Norwood",
    title: "VP of Engineering",
    company: "Forge Analytics",
    photo: "https://randomuser.me/api/portraits/women/23.jpg",
    metric: "45%",
    metricLabel: "operational cost reduction",
    accent: "#A78BFA",
  },
  {
    index: "05",
    quote:
      "Our conversion rate jumped 40% after Thinkatic rebuilt our onboarding flow with AI personalization. They're not just designers or engineers — they think like growth partners.",
    name: "Tyler Garrison",
    title: "Growth Lead",
    company: "Beacon Commerce",
    photo: "https://randomuser.me/api/portraits/men/41.jpg",
    metric: "40%",
    metricLabel: "conversion rate increase",
    accent: "#F59E0B",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Individual slide ──────────────────────────────────────────────────────────

function Slide({ t, direction }: { t: typeof TESTIMONIALS[0]; direction: number }) {
  return (
    <motion.div
      key={t.index}
      initial={{ opacity: 0, x: direction * 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -80 }}
      transition={{ duration: 0.55, ease }}
      className="absolute inset-0 flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-center"
    >
      {/* Left: large metric + quote */}
      <div className="flex-1 min-w-0">
        {/* Quote icon */}
        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}
          >
            <Quote size={18} style={{ color: t.accent }} />
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={t.accent} color={t.accent} style={{ opacity: 0.9 }} />
          ))}
        </div>

        {/* Quote text */}
        <blockquote
          className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed mb-8"
          style={{ color: "rgba(255,255,255,0.82)" }}
        >
          "{t.quote}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={t.photo}
            alt={t.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ border: `2px solid ${t.accent}60` }}
            loading="lazy"
          />
          <div>
            <p className="text-foreground font-bold text-sm">{t.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
              {t.title} · {t.company}
            </p>
          </div>
        </div>
      </div>

      {/* Right: metric card */}
      <div
        className="flex-shrink-0 w-full md:w-52 lg:w-60 rounded-2xl p-7 border text-center"
        style={{
          background: `linear-gradient(135deg, ${t.accent}12, ${t.accent}06)`,
          borderColor: `${t.accent}30`,
          boxShadow: `0 0 60px ${t.accent}14`,
        }}
      >
        <p
          className="font-display font-black leading-none mb-2"
          style={{ fontSize: "clamp(2.8rem, 6vw, 4rem)", color: t.accent }}
        >
          {t.metric}
        </p>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
          {t.metricLabel}
        </p>
        <div
          className="mt-5 h-px w-12 mx-auto"
          style={{ background: `linear-gradient(90deg, transparent, ${t.accent}60, transparent)` }}
        />
        <p className="text-xs mt-4 font-mono font-bold uppercase tracking-wider text-[#1E40AF]">
          {t.company}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function Testimonials() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });
  const shouldReduce = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number) => {
    const clamped = ((next % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length;
    setDirection(next > index ? 1 : -1);
    setIndex(clamped);
  }, [index]);

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  // Auto-advance every 6 s
  useEffect(() => {
    if (paused || shouldReduce) return;
    const id = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(id);
  }, [index, paused, shouldReduce, goTo]);

  const current = TESTIMONIALS[index];

  return (
    <section
      className="relative py-28 md:py-36 overflow-hidden"
      style={{ background: "#FFFFFF" }}
      data-testid="section-testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.06) 50%, transparent)" }} />

      {/* Ambient glow tracks the active accent */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse at 70% 50%, ${current.accent}07 0%, transparent 65%)` }}
        transition={{ duration: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Header row ── */}
        <div ref={headingRef} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease }}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4"
              style={{ color: "rgba(71,163,255,0.7)" }}
            >
              Client Testimonials
            </motion.p>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%", opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.05]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
              >
                What our clients
                <br />
                <span style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  say about us.
                </span>
              </motion.h2>
            </div>
          </div>

          {/* Prev / Next controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:border-white/30 hover:bg-white/5"
              style={{ borderColor: "rgba(33,78,207,0.12)" }}
            >
              <ChevronLeft size={18} style={{ color: "#4B5563" }} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:border-white/30 hover:bg-white/5"
              style={{ borderColor: "rgba(33,78,207,0.12)" }}
            >
              <ChevronRight size={18} style={{ color: "#4B5563" }} />
            </button>
          </motion.div>
        </div>

        {/* ── Carousel stage ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease, delay: 0.2 }}
          className="relative rounded-2xl border p-8 md:p-14 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            borderColor: "rgba(33,78,207,0.06)",
            minHeight: "340px",
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: "linear-gradient(rgba(71,163,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(71,163,255,0.025) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <AnimatePresence mode="wait" custom={direction}>
            <Slide key={current.index} t={current} direction={direction} />
          </AnimatePresence>
        </motion.div>

        {/* ── Dot indicators + counter ── */}
        <div className="flex items-center justify-between mt-8">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.index}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="relative h-1.5 rounded-full transition-all duration-400 overflow-hidden"
                style={{
                  width: i === index ? "32px" : "8px",
                  background: i === index ? t.accent : "rgba(33,78,207,0.12)",
                }}
              >
                {i === index && !paused && !shouldReduce && (
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ background: "rgba(255,255,255,0.5)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    key={`progress-${index}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Counter */}
          <p className="text-xs font-mono font-semibold text-slate-600">
            {String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
          </p>
        </div>

        {/* ── Thumbnail strip (desktop) ── */}
        <div className="hidden md:flex items-center gap-4 mt-8">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.index}
              onClick={() => goTo(i)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300"
              style={{
                borderColor: i === index ? `${t.accent}40` : "rgba(33,78,207,0.04)",
                background: i === index ? `${t.accent}0e` : "transparent",
                opacity: i === index ? 1 : 0.5,
              }}
            >
              <img
                src={t.photo}
                alt={t.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                style={{ border: i === index ? `1.5px solid ${t.accent}60` : "1.5px solid transparent" }}
                loading="lazy"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{t.name}</p>
                <p className="text-[10px] font-mono text-slate-500 font-medium">{t.company}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.06) 50%, transparent)" }} />
    </section>
  );
}
