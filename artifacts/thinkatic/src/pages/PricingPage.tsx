import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "wouter";
import {
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Star,
  Search, Globe, Layers, Zap, Building2, HelpCircle,
  Briefcase, Check, Phone, Brain, TrendingUp, Users, Cpu,
  Bot, Clock, DollarSign, Cloud, Lock, Database, Activity,
  ChevronDown, ChevronUp, ArrowUpRight, MessageSquare
} from "lucide-react";
import {
  ENTERPRISE_PLANS,
  SERVICE_CATEGORIES,
  type EnterprisePlan,
} from "@/data/packages-data";
import { useSEO } from "@/hooks/useSEO";
import { BPOPlansSection } from "@/components/sections/BPOPlansSection";

const smoothEase = [0.22, 1, 0.36, 1] as const;

export default function PricingPage() {
  useSEO({
    title: "Enterprise Technology Plans & Pricing",
    description: "Explore Thinkatic's 16 enterprise technology transformation plans across AI & Automation, Cloud Modernization, Cybersecurity, Data, and Managed Services.",
    path: "/pricing",
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Filter plans based on category and search
  const filteredPlans = useMemo(() => {
    return ENTERPRISE_PLANS.filter((plan) => {
      const matchCategory = activeCategory === "all" || plan.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.shortPositioning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.idealCustomer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.includes.some((inc) => inc.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedPlanId((prev) => (prev === id ? null : id));
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "ai-automation":
        return Bot;
      case "cloud-modernization":
        return Cloud;
      case "cybersecurity":
        return Lock;
      case "data":
        return Database;
      case "product-engineering":
        return Cpu;
      case "managed-services":
        return Activity;
      default:
        return Layers;
    }
  };

  return (
    <Layout>
      <div className="pt-28 pb-28 min-h-screen text-slate-900" style={{ background: "#FFFFFF" }}>
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(33,78,207,0.12),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">

          {/* ── Top Header ── */}
          <div className="flex flex-col items-center text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 mb-5">
              <Sparkles size={13} className="text-[#214ECF]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#214ECF] font-bold">
                Enterprise Engagement Catalog
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08] mb-5 text-slate-900">
              Architectural Engagements &amp; <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1E40AF] via-[#214ECF] to-[#60A5FA] bg-clip-text text-transparent">
                Transparent Investment
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8">
              Explore our 16 enterprise technology transformation plans organized across 6 mission-critical disciplines. Outcome-focused architectures engineered for US enterprise scale.
            </p>

            {/* Search Filter Box */}
            <div className="w-full max-w-md relative mb-8">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by capability, e.g. RAG, Zero Trust, Cloud, ETL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full text-xs sm:text-sm bg-white border border-[#DCE5FF] shadow-sm focus:outline-none focus:border-[#214ECF] focus:ring-2 focus:ring-[#214ECF]/15 transition-all text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 shadow-xs backdrop-blur-md max-w-5xl">
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-[#214ECF] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Layers size={14} />
                <span>All Disciplines</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 ml-1">
                  {ENTERPRISE_PLANS.length}
                </span>
              </button>

              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.id);
                const count = ENTERPRISE_PLANS.filter((p) => p.category === cat.id).length;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 cursor-pointer ${
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

          {/* ── Active Category Details Banner (if specific category selected) ── */}
          {activeCategory !== "all" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-white border border-[#DCE5FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#214ECF] block mb-1">
                  Category Overview
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {SERVICE_CATEGORIES.find((c) => c.id === activeCategory)?.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {SERVICE_CATEGORIES.find((c) => c.id === activeCategory)?.description}
                </p>
              </div>
              <button
                onClick={() => setActiveCategory("all")}
                className="text-xs font-semibold text-[#214ECF] hover:underline whitespace-nowrap cursor-pointer"
              >
                View all categories →
              </button>
            </motion.div>
          )}

          {/* ── 16 Plans Grid ── */}
          {filteredPlans.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300 mb-16">
              <Search size={32} className="text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No matching plans found</h3>
              <p className="text-xs text-slate-500 mb-4">Try clearing your search query or selecting a different category.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#214ECF] text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-20">
              {filteredPlans.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const isPopular = plan.isPopular;

                return (
                  <motion.div
                    key={plan.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: smoothEase }}
                    className={`relative rounded-xl p-7 flex flex-col justify-between transition-all duration-300 bg-white border ${
                      isPopular
                        ? "border-2 border-[#1E40AF] shadow-lg ring-4 ring-blue-500/10"
                        : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* Top Row: Plan number & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-slate-500">
                          {plan.planNumber}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">·</span>
                        <span className="text-[10px] font-mono font-semibold text-[#1E40AF] uppercase">
                          {plan.categoryLabel}
                        </span>
                      </div>

                      {isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#1E40AF] text-white shadow-2xs">
                          <Star size={10} className="fill-white" />
                          Most Popular
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {plan.tag}
                        </span>
                      )}
                    </div>

                    {/* Title & Investment */}
                    <div className="mb-5">
                      <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight mb-2">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">Starting at</span>
                        <span className="font-display font-black text-3xl text-[#1E40AF] tracking-tight">
                          {plan.startingPriceFormatted}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal min-h-[36px]">
                        {plan.shortPositioning}
                      </p>
                    </div>

                    {/* Ideal Customer Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Target Enterprise Environment
                      </span>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {plan.idealCustomer}
                      </p>
                    </div>

                    {/* Key Business Outcomes */}
                    <div className="mb-5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                        Strategic Business Outcomes
                      </span>
                      <ul className="space-y-2">
                        {plan.keyOutcomes.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                            <CheckCircle2 size={14} className="text-[#1E40AF] shrink-0 mt-0.5" />
                            <span className="leading-snug">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Included Deliverables (Expandable) */}
                    <div className="pt-4 border-t border-slate-100 mb-6 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          Included Capabilities ({plan.includes.length})
                        </span>
                        <button
                          onClick={() => toggleExpand(plan.id)}
                          className="text-[11px] font-semibold text-[#1E40AF] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {isExpanded ? (
                            <>Hide details <ChevronUp size={12} /></>
                          ) : (
                            <>View all <ChevronDown size={12} /></>
                          )}
                        </button>
                      </div>

                      <ul className="space-y-1.5">
                        {(isExpanded ? plan.includes : plan.includes.slice(0, 4)).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <span className="text-[#1E40AF] font-bold text-xs leading-none">•</span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                        {!isExpanded && plan.includes.length > 4 && (
                          <li className="text-[10px] font-mono text-[#1E40AF] pt-1 font-semibold">
                            + {plan.includes.length - 4} more deliverables
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Link href={plan.ctaRoute || `/contact?plan=${plan.id}`}>
                        <button
                          className={`w-full h-11 px-5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                            isPopular
                              ? "bg-[#1E40AF] text-white shadow-xs hover:bg-[#1D4ED8]"
                              : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                          }`}
                        >
                          <span>{plan.ctaLabel}</span>
                          <ArrowRight size={14} />
                        </button>
                      </Link>

                      <Link href={`/services/${plan.id}`}>
                        <button className="w-full py-2 px-4 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#1E40AF] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                          <span>Review technical architecture</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <BPOPlansSection />

          {/* ── Section 6: Mandatory Pricing Disclaimer ── */}
          <div className="relative rounded-xl p-8 sm:p-12 border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF] mb-5">
                <HelpCircle size={22} />
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-3 tracking-tight">
                Every enterprise is different.
              </h3>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 max-w-2xl font-normal">
                Our plans provide a starting point. Final investment depends on your technology environment, business requirements, integrations, scale and transformation goals.
              </p>

              <p className="text-sm font-semibold text-[#1E40AF] mb-8">
                Have a complex technology challenge? Let's build the right solution together.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/contact">
                  <button className="w-full sm:w-auto h-12 px-7 rounded-xl font-bold text-white text-xs tracking-wider uppercase bg-[#1E40AF] hover:bg-[#1D4ED8] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <MessageSquare size={15} />
                    Discuss Your Project
                  </button>
                </Link>

                <Link href="/request-proposal">
                  <button className="w-full sm:w-auto h-12 px-7 rounded-xl font-bold text-slate-800 text-xs tracking-wider uppercase bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                    Request a Proposal
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
