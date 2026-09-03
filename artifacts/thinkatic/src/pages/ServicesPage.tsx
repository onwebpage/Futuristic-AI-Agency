import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "wouter";
import { services, BLUE, BLUE_DIM, BLUE_BORDER, type ServiceItem } from "@/data/services-data";
import { SERVICE_CATEGORIES } from "@/data/packages-data";
import {
  Bot, Cloud, Lock, Database, Cpu, Activity,
  Layers, ArrowRight, CheckCheck, Sparkles, ArrowUpRight
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-blue-50 border border-blue-200"
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-xs text-slate-700 leading-snug">{text}</span>
    </div>
  );
}

function ServiceCard({ svc }: { svc: ServiceItem }) {
  return (
    <motion.div
      key={svc.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="rounded-3xl border border-[#DCE5FF] bg-white p-7 md:p-9 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
      id={svc.id}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#214ECF]">
              {svc.number}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono font-semibold uppercase text-slate-500">
              {svc.categoryLabel}
            </span>
            <span className="ml-auto lg:ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-[#214ECF] border border-blue-100">
              {svc.startingPrice}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 mb-2 leading-tight">
            {svc.title}
          </h2>
          <p className="text-sm font-semibold text-[#214ECF] mb-3">{svc.tagline}</p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {svc.description}
          </p>
        </div>

        <div className="flex flex-row lg:flex-col gap-3 shrink-0">
          <Link href={`/services/${svc.id}`}>
            <button
              className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase bg-white border border-[#DCE5FF] text-slate-700 hover:border-[#214ECF] hover:text-[#214ECF] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              Architecture Spec
              <ArrowUpRight size={13} />
            </button>
          </Link>
          <Link href={`/contact?plan=${svc.id}`}>
            <button
              className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase bg-[#214ECF] text-white hover:bg-[#1A43C8] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              Discuss Engagement
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {svc.whatWeBuild.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#214ECF]" />
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom meta row */}
      {svc.technologies && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-2">
            Technologies:
          </span>
          {svc.technologies.slice(0, 8).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-700"
            >
              {tech}
            </span>
          ))}
          {svc.technologies.length > 8 && (
            <span className="text-[10px] font-mono text-[#214ECF] font-semibold">
              +{svc.technologies.length - 8} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function ServicesPage() {
  useSEO({
    title: "Enterprise Technology Capabilities & Services",
    description: "Explore Thinkatic's 16 enterprise transformation capabilities across AI, Cloud, Cybersecurity, Data, and Engineering.",
    path: "/services",
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredServices = useMemo(() => {
    if (activeCategory === "all") return services;
    return services.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "ai-automation": return Bot;
      case "cloud-modernization": return Cloud;
      case "cybersecurity": return Lock;
      case "data": return Database;
      case "product-engineering": return Cpu;
      case "managed-services": return Activity;
      default: return Layers;
    }
  };

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="pt-40 pb-20 bg-white relative border-b border-[#DCE5FF] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(33,78,207,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 mb-6">
            <Sparkles size={13} className="text-[#214ECF]" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#214ECF] font-bold">
              Enterprise Technology Capabilities
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-slate-900 mb-6 tracking-tight leading-[1.06]">
            Architecting Mission-Critical <br />
            <span className="bg-gradient-to-r from-[#1E40AF] via-[#214ECF] to-[#60A5FA] bg-clip-text text-transparent">
              Technology Systems
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Thinkatic helps US enterprises build, modernize, secure and operate mission-critical technology systems across AI, Cloud, Cybersecurity, Data, and Engineering.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 shadow-xs max-w-5xl mx-auto">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#214ECF] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Layers size={14} />
              <span>All Disciplines</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 ml-1">
                {services.length}
              </span>
            </button>

            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const count = services.filter((s) => s.category === cat.id).length;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#214ECF] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.shortTitle}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ml-1 ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services List ── */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8">
          {filteredServices.map((svc) => (
            <ServiceCard key={svc.id} svc={svc} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-28 bg-white border-t border-[#DCE5FF] relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs font-mono uppercase tracking-[0.25em] mb-4 text-[#214ECF] font-bold">
            Start Your Strategic Transformation
          </p>
          <h2 className="font-display font-black text-slate-900 text-3xl sm:text-5xl leading-tight mb-5">
            Partner with Thinkatic to Engineer Your Future
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
            Mission-critical systems, enterprise AI platforms, and cloud architectures built for US enterprise scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button
                className="px-8 py-4 rounded-full font-bold text-white text-xs tracking-wider uppercase bg-[#214ECF] hover:bg-[#1A43C8] shadow-md transition-all cursor-pointer"
              >
                Plan Your Transformation
              </button>
            </Link>
            <Link href="/pricing">
              <button
                className="px-8 py-4 rounded-full font-bold text-slate-700 text-xs tracking-wider uppercase bg-white border border-slate-300 hover:border-[#214ECF] hover:text-[#214ECF] transition-all cursor-pointer shadow-2xs"
              >
                View Engagement Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
