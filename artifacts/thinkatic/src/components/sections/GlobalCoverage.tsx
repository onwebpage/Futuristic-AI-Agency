import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Globe, Clock, Languages, Shield, Wifi } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Globe,     value: "25+",   label: "Countries",         color: "#214ECF" },
  { icon: Clock,     value: "24/7",  label: "Global Coverage",   color: "#214ECF" },
  { icon: Languages, value: "14",    label: "Languages",          color: "#34D399" },
  { icon: Wifi,      value: "99.9%", label: "Uptime SLA",        color: "#A78BFA" },
  { icon: Shield,    value: "ISO",   label: "27001 Certified",   color: "#F59E0B" },
];

// Hub locations: { label, x %, y %, desc, size }
const HUBS = [
  { label: "New York",     x: 22, y: 36, desc: "Americas HQ",       size: "lg", color: "#214ECF" },
  { label: "London",       x: 47, y: 27, desc: "EMEA HQ",           size: "lg", color: "#214ECF" },
  { label: "Dubai",        x: 59, y: 40, desc: "Middle East Hub",   size: "md", color: "#34D399" },
  { label: "Mumbai",       x: 65, y: 43, desc: "South Asia Hub",    size: "md", color: "#F59E0B" },
  { label: "Manila",       x: 78, y: 46, desc: "APAC Operations",   size: "lg", color: "#A78BFA" },
  { label: "Bangalore",    x: 64, y: 47, desc: "Tech & AI Center",  size: "md", color: "#214ECF" },
  { label: "Sydney",       x: 81, y: 66, desc: "ANZ Hub",           size: "sm", color: "#214ECF" },
  { label: "Toronto",      x: 23, y: 31, desc: "Canada Hub",        size: "sm", color: "#34D399" },
  { label: "São Paulo",    x: 29, y: 63, desc: "LATAM Hub",         size: "md", color: "#F59E0B" },
  { label: "Singapore",    x: 77, y: 51, desc: "SE Asia Hub",       size: "md", color: "#A78BFA" },
  { label: "Frankfurt",    x: 50, y: 26, desc: "EU Data Center",    size: "sm", color: "#214ECF" },
  { label: "Cairo",        x: 53, y: 41, desc: "MENA Hub",          size: "sm", color: "#214ECF" },
];

const REGIONS = [
  {
    name: "Americas",
    flag: "🌎",
    offices: ["New York", "Toronto", "São Paulo"],
    timezone: "UTC−8 to UTC−3",
    languages: ["English", "Spanish", "Portuguese"],
    accent: "#214ECF",
  },
  {
    name: "EMEA",
    flag: "🌍",
    offices: ["London", "Frankfurt", "Dubai", "Cairo"],
    timezone: "UTC+0 to UTC+4",
    languages: ["English", "German", "Arabic", "French"],
    accent: "#214ECF",
  },
  {
    name: "APAC",
    flag: "🌏",
    offices: ["Manila", "Bangalore", "Mumbai", "Singapore", "Sydney"],
    timezone: "UTC+5.5 to UTC+11",
    languages: ["English", "Tagalog", "Hindi", "Mandarin"],
    accent: "#34D399",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Map pin component ────────────────────────────────────────────────────────

function MapPin({
  hub,
  index,
  mapInView,
}: {
  hub: typeof HUBS[0];
  index: number;
  mapInView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const sizeMap = { lg: 10, md: 8, sm: 6 } as const;
  const size = sizeMap[hub.size as keyof typeof sizeMap];

  return (
    <motion.div
      className="absolute group cursor-pointer"
      style={{ left: `${hub.x}%`, top: `${hub.y}%`, transform: "translate(-50%, -50%)" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={mapInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.4, ease, delay: 0.2 + index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Static ring (no animation) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 2.8,
          height: size * 2.8,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: `1px solid ${hub.color}50`,
        }}
      />

      {/* Dot */}
      <div
        className="relative rounded-full z-10 transition-transform duration-200"
        style={{
          width: size,
          height: size,
          background: hub.color,
          boxShadow: `0 0 ${size * 2}px ${hub.color}80`,
          transform: hovered ? "scale(1.5)" : "scale(1)",
        }}
      />

      {/* Tooltip */}
      <AnimatedTooltip hub={hub} visible={hovered} />
    </motion.div>
  );
}

function AnimatedTooltip({ hub, visible }: { hub: typeof HUBS[0]; visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? -8 : 0, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.2, ease }}
      className="absolute bottom-[120%] left-1/2 -translate-x-1/2 pointer-events-none z-20"
      style={{ minWidth: "100px" }}
    >
      <div
        className="px-3 py-2 rounded-lg text-center"
        style={{
          background: "rgba(10,10,10,0.95)",
          border: `1px solid ${hub.color}40`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${hub.color}20`,
        }}
      >
        <p className="text-foreground font-bold text-xs whitespace-nowrap">{hub.label}</p>
        <p className="text-[10px] whitespace-nowrap mt-0.5" style={{ color: hub.color }}>
          {hub.desc}
        </p>
      </div>
      {/* Arrow */}
      <div
        className="w-2 h-2 rotate-45 mx-auto -mt-1"
        style={{ background: "rgba(10,10,10,0.95)", border: `1px solid ${hub.color}40`, borderTop: "none", borderLeft: "none" }}
      />
    </motion.div>
  );
}

// ─── Region card ──────────────────────────────────────────────────────────────

function RegionCard({ region, index }: { region: typeof REGIONS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease, delay: index * 0.12 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{region.flag}</span>
        <div>
          <h3 className="text-slate-900 font-bold text-base">{region.name}</h3>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{region.timezone}</p>
        </div>
        <div
          className="ml-auto px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#1E40AF] border border-blue-200/80"
        >
          {region.offices.length} offices
        </div>
      </div>

      {/* Offices */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {region.offices.map((office) => (
          <span
            key={office}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-50 text-slate-700 border border-slate-200"
          >
            {office}
          </span>
        ))}
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-1.5">
        {region.languages.map((lang) => (
          <span
            key={lang}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-blue-50/60 text-[#1E40AF] border border-blue-200/50"
          >
            {lang}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function GlobalCoverage() {
  const headingRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });
  const mapInView = useInView(mapRef, { once: true, margin: "-40px" });

  return (
    <section
      className="relative py-28 md:py-36 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F8FF 50%, #FFFFFF 100%)" }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.06) 50%, transparent)" }} />

      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(37,99,235,0.06) 0%, transparent 65%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Header ── */}
        <div ref={headingRef} className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-5"
            style={{ color: "rgba(71,163,255,0.7)" }}
          >
            Global Delivery
          </motion.p>

          <div className="overflow-hidden mb-5">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.85, ease, delay: 0.05 }}
              className="font-display font-bold text-foreground leading-[1.05]"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
            >
              Wherever you operate,
              <br />
              <span style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                we're already there.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="text-base max-w-2xl mx-auto"
            style={{ color: "#4B5563" }}
          >
            With operations across 25 countries and three global delivery regions, Thinkatic provides round-the-clock BPO coverage in every major market.
          </motion.p>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, ease, delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border"
                style={{
                  background: `${stat.color}0c`,
                  borderColor: `${stat.color}25`,
                }}
              >
                <Icon size={16} style={{ color: stat.color }} />
                <span className="font-display font-black text-foreground text-lg leading-none">{stat.value}</span>
                <span className="text-xs font-medium" style={{ color: "#4B5563" }}>{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── World map ── */}
        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="relative w-full rounded-2xl border overflow-hidden mb-12"
          style={{
            background: "rgba(6,8,15,0.8)",
            borderColor: "rgba(255,255,255,0.07)",
            aspectRatio: "16/7",
            minHeight: "260px",
          }}
        >
          {/* Fine dot grid (world map texture) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(71,163,255,0.25) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
              maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 50%, transparent 100%)",
            }}
          />

          {/* Continent shadow overlays to darken the ocean dots */}
          <div className="absolute inset-0 pointer-events-none">
            {/* North America */}
            <div className="absolute" style={{ left: "8%", top: "15%", width: "22%", height: "45%", background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)", borderRadius: "40% 30% 50% 30% / 50% 40% 40% 60%" }} />
            {/* South America */}
            <div className="absolute" style={{ left: "18%", top: "50%", width: "14%", height: "36%", background: "radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)", borderRadius: "30% 50% 40% 40% / 40% 40% 60% 40%" }} />
            {/* Europe */}
            <div className="absolute" style={{ left: "43%", top: "10%", width: "14%", height: "30%", background: "radial-gradient(ellipse, rgba(71,163,255,0.07) 0%, transparent 70%)", borderRadius: "50% 40% 30% 50% / 40% 50% 40% 50%" }} />
            {/* Africa */}
            <div className="absolute" style={{ left: "44%", top: "35%", width: "16%", height: "42%", background: "radial-gradient(ellipse, rgba(37,99,235,0.04) 0%, transparent 70%)", borderRadius: "40% 40% 50% 50% / 30% 30% 60% 60%" }} />
            {/* Asia */}
            <div className="absolute" style={{ left: "56%", top: "10%", width: "30%", height: "50%", background: "radial-gradient(ellipse, rgba(71,163,255,0.06) 0%, transparent 70%)", borderRadius: "50% 30% 40% 40% / 40% 50% 40% 50%" }} />
            {/* Australia */}
            <div className="absolute" style={{ left: "74%", top: "56%", width: "14%", height: "22%", background: "radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)", borderRadius: "50% 50% 50% 50% / 40% 50% 40% 50%" }} />
          </div>

          {/* Hub pins */}
          {HUBS.map((hub, i) => (
            <MapPin key={hub.label} hub={hub} index={i} mapInView={mapInView} />
          ))}

          {/* Region labels */}
          <div className="absolute top-3 left-3 text-[11px] font-mono uppercase tracking-widest text-slate-300 font-semibold">
            Americas · EMEA · APAC
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300 font-medium">
              {HUBS.length} active hubs
            </span>
          </div>
        </motion.div>

        {/* ── Region cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REGIONS.map((region, i) => (
            <RegionCard key={region.name} region={region} index={i} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(33,78,207,0.06) 50%, transparent)" }} />
    </section>
  );
}
