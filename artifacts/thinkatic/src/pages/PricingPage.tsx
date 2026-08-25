import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { lazy, Suspense } from "react";
import {
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Star,
  Search, Globe, Layers, Zap, Building2, HelpCircle,
  Briefcase, Check, Phone, Brain, TrendingUp, Users, Cpu,
  Bot, Clock, DollarSign
} from "lucide-react";
import {
  AI_PACKAGES,
  AI_ENGAGEMENT_TIERS,
  AI_CATALOG_OVERVIEW,
  SCALEOS_OVERVIEW,
  SCALEOS_TIERS,
  SCALEOS_MATRIX,
  PORTFOLIO_PROJECTS,
  ALTERNATIVE_COMPARISON,
  type AIPackage,
  type ScaleOSTier,
} from "@/data/packages-data";
import { Link } from "wouter";

const PayPalButton = lazy(() => import("@/components/ui/PayPalButton"));

// Smooth, snappy easing for high-performance 60fps
const smoothEase = [0.22, 1, 0.36, 1] as const;

export default function PricingPage() {
  const [activeCatalog, setActiveCatalog] = useState<"ai" | "scaleos">("ai");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [portfolioSearch, setPortfolioSearch] = useState<string>("");
  const [activeAiPackage, setActiveAiPackage] = useState<string | null>(null);
  const [activeScaleOSTier, setActiveScaleOSTier] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: number; currency: "USD" | "INR" } | null>(null);

  // Filter 17-project portfolio
  const filteredProjects = useMemo(() => {
    return PORTFOLIO_PROJECTS.filter((p) => {
      const matchRegion = selectedRegion === "ALL" || p.region === selectedRegion;
      const matchSearch =
        portfolioSearch.trim() === "" ||
        p.project.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        p.typeNotes.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
        p.payout.toLowerCase().includes(portfolioSearch.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [selectedRegion, portfolioSearch]);

  return (
    <Layout>
      <div className="pt-28 pb-24 min-h-screen text-foreground" style={{ background: "#FFFFFF" }}>
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(33,78,207,0.12),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">

          {/* ── Top Catalog Switcher ── */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 mb-5">
              <Sparkles size={13} className="text-[#214ECF]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#214ECF] font-semibold">
                Official Thinkatic Packages &amp; Pricing
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tight leading-[1.05] mb-5">
              Transparent, Outcome-Driven <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-white via-[#93C5FD] to-[#214ECF] bg-clip-text text-transparent">
                Service Catalogs
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Explore our 2026 U.S. AI Development Packages or our comprehensive 11-Month ScaleOS Managed BPO Partnership.
            </p>

            {/* Dual Catalog Toggle Tabs */}
            <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-border shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setActiveCatalog("ai")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 ${
                  activeCatalog === "ai"
                    ? "bg-[#214ECF] text-foreground shadow-[0_0_24px_rgba(33,78,207,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <Bot size={16} />
                <span>AI Development Packages</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 ml-1">2026 U.S.</span>
              </button>

              <button
                onClick={() => setActiveCatalog("scaleos")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 ${
                  activeCatalog === "scaleos"
                    ? "bg-[#214ECF] text-foreground shadow-[0_0_24px_rgba(33,78,207,0.3)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <Cpu size={16} />
                <span>Thinkatic ScaleOS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 ml-1">11-Mo BPO</span>
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 1: AI DEVELOPMENT PACKAGES (PDF 1)
             ════════════════════════════════════════════════════════════════════ */}
          {activeCatalog === "ai" && (
            <motion.div
              key="ai-catalog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: smoothEase }}
            >
              {/* Cover Banner */}
              <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#F5F8FF]/80 via-[#F5F8FF]/90 to-[#F5F8FF] p-7 md:p-10 mb-14 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(33,78,207,0.1),transparent_70%)] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#214ECF] mb-2 uppercase tracking-widest">
                      <span>THINKATIC · SERVICE CATALOG</span>
                      <span>·</span>
                      <span>2026 EDITION — U.S. MARKET PRICING</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-3">
                      AI Development Packages
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                      We build AI employees that automate your business. Five core offerings, benchmarked pricing, and a clear path from a single workflow to full AI infrastructure.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["AI Agents", "AI Automation", "AI Voice", "Private AI", "AI Sales"].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-border text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Positioning Box */}
                  <div className="rounded-2xl p-5 border border-blue-400/20 bg-blue-500/5 md:min-w-[280px]">
                    <p className="text-[11px] font-mono text-muted-foreground line-through mb-1">
                      Don't say: "AI Development Company"
                    </p>
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Say: <span className="text-[#214ECF] font-bold">"We Build AI Employees That Automate Your Business."</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Every package is priced and scoped around a business result — not a technical feature.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Public Engagement Tiers */}
              <div className="mb-16">
                <div className="text-center mb-8">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                    WEBSITE PRICING STRUCTURE
                  </span>
                  <h3 className="text-xl md:text-3xl font-display font-bold text-foreground mt-1">
                    Three Levels of Engagement
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    The five packages sit underneath three simple, public-facing tiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {AI_ENGAGEMENT_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`relative rounded-2xl p-6 border transition-all duration-200 ${
                        tier.isPopular
                          ? "bg-gradient-to-b from-[#214ECF]/15 to-[#214ECF]/5 border-[#214ECF]/40 shadow-[0_8px_30px_rgba(33,78,207,0.15)]"
                          : "bg-white/[0.02] border-border hover:border-border"
                      }`}
                    >
                      {tier.isPopular && (
                        <div className="absolute -top-3 left-6">
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#214ECF] text-foreground">
                            RECOMMENDED
                          </span>
                        </div>
                      )}
                      <p className="text-xs font-bold font-mono tracking-wider text-muted-foreground mb-2 uppercase">
                        {tier.name}
                      </p>
                      <h4 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                        {tier.startingPrice}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tier.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Core Detailed AI Packages */}
              <div className="mb-16">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                      DETAILED SERVICE PACKAGES
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-1">
                      Five Packages, Five Scopes
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Benchmarked U.S. market rates with one-time setup and continuous ongoing optimization.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                  {AI_PACKAGES.map((pkg) => {
                    const isExpanded = activeAiPackage === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-3xl p-7 md:p-8 border flex flex-col justify-between transition-all duration-200 ${
                          pkg.isRecommended
                            ? "bg-gradient-to-b from-[#11244A]/90 to-[#08132B]/90 border-blue-500/40 shadow-[0_12px_40px_rgba(33,78,207,0.18)]"
                            : "bg-white/[0.025] border-border hover:border-[#DCE5FF]"
                        }`}
                      >
                        {pkg.isRecommended && (
                          <div className="absolute -top-3.5 right-8">
                            <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#214ECF] text-foreground shadow-lg">
                              <Star size={10} className="fill-white" /> BEST OVERALL
                            </span>
                          </div>
                        )}

                        <div>
                          {/* Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#214ECF]">
                              {pkg.packageNumber}
                            </span>
                            {pkg.tag && !pkg.isRecommended && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-muted-foreground font-mono">
                                {pkg.tag}
                              </span>
                            )}
                          </div>

                          <h4 className="text-2xl font-display font-bold text-foreground mb-1">
                            {pkg.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#93C5FD] mb-4">
                            {pkg.subtitle}
                          </p>

                          {/* Pricing Box */}
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/40 border border-border mb-5">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-muted-foreground block">SETUP FEE</span>
                              <span className="text-2xl font-display font-bold text-foreground">
                                {pkg.setupPriceFormatted}
                              </span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                              <span className="text-[10px] font-mono uppercase text-muted-foreground block">ONGOING / MO</span>
                              <span className="text-2xl font-display font-bold text-[#214ECF]">
                                {pkg.monthlyPriceFormatted}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                            {pkg.description}
                          </p>

                          {/* Includes List */}
                          <div className="mb-6">
                            <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                              INCLUDES
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {pkg.includes.map((inc) => (
                                <div key={inc} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 size={13} className="text-[#214ECF] shrink-0" />
                                  <span>{inc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Unique Section Per Package (Agents / Workflows / Use Cases / RAG) */}
                          {pkg.exampleAgents && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border mb-5">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#214ECF] mb-2">
                                EXAMPLE AGENTS
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
                                {pkg.exampleAgents.map((agent) => (
                                  <span key={agent} className="px-2.5 py-1 rounded-md text-[11px] bg-blue-500/10 text-blue-200 border border-blue-500/20">
                                    • {agent}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.exampleWorkflow && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border mb-5">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#214ECF] mb-2">
                                EXAMPLE WORKFLOW
                              </h5>
                              <div className="text-xs font-mono text-blue-200/90 leading-relaxed bg-background/30 p-2.5 rounded border border-border">
                                {pkg.exampleWorkflow.join(" → ")}
                              </div>
                            </div>
                          )}

                          {pkg.useCases && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border mb-5">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#214ECF] mb-2">
                                USE CASES
                              </h5>
                              <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                                {pkg.useCases.map((uc) => (
                                  <div key={uc} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#214ECF]" />
                                    <span>{uc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.connectsTo && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border mb-5">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#214ECF] mb-2">
                                CONNECTS TO &amp; EXAMPLE QUERY
                              </h5>
                              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-2.5">
                                {pkg.connectsTo.map((conn) => (
                                  <div key={conn} className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                                    <span className="text-[11px]">{conn}</span>
                                  </div>
                                ))}
                              </div>
                              {pkg.exampleQuery && (
                                <p className="text-[11px] italic text-blue-200/80 bg-blue-950/40 p-2 rounded border border-blue-500/20">
                                  {pkg.exampleQuery}
                                </p>
                              )}
                            </div>
                          )}

                          {pkg.workflowSteps && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-border mb-5">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#214ECF] mb-2">
                                WORKFLOW PIPELINE
                              </h5>
                              <div className="text-[11px] font-mono text-blue-200/90 leading-relaxed bg-background/30 p-2.5 rounded border border-border">
                                {pkg.workflowSteps.join(" → ")}
                              </div>
                            </div>
                          )}

                          {/* Ideal Customer & Best Outcome Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground mb-6">
                            <div>
                              <span className="text-[10px] font-mono uppercase block text-muted-foreground">IDEAL CUSTOMER</span>
                              <span className="font-semibold text-muted-foreground">{pkg.idealCustomer}</span>
                            </div>
                            {pkg.bestOutcome && (
                              <div className="text-right">
                                <span className="text-[10px] font-mono uppercase block text-muted-foreground">BEST OUTCOME</span>
                                <span className="font-semibold text-emerald-400">{pkg.bestOutcome}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-2">
                          <button
                            onClick={() =>
                              setCheckoutPlan(
                                checkoutPlan?.name === pkg.name
                                  ? null
                                  : { name: pkg.name, price: pkg.setupPrice, currency: "USD" }
                              )
                            }
                            className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-150 ${
                              pkg.isRecommended
                                ? "bg-[#214ECF] text-foreground hover:bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                : "bg-white/10 hover:bg-white/15 text-foreground border border-border"
                            }`}
                          >
                            <span>{checkoutPlan?.name === pkg.name ? "Close Checkout" : "Get Started / Order Now"}</span>
                            <ArrowRight size={14} />
                          </button>

                          {/* Inline PayPal Checkout Modal */}
                          {checkoutPlan?.name === pkg.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 rounded-xl bg-background/60 border border-blue-500/30"
                            >
                              <div className="flex items-center justify-between mb-3 text-xs">
                                <span className="font-semibold text-foreground">Setup Payment: ${pkg.setupPrice.toLocaleString()}</span>
                                <span className="text-muted-foreground text-[10px]">Secure PayPal Capture</span>
                              </div>
                              <Suspense fallback={<div className="h-10 rounded bg-white/5 animate-pulse" />}>
                                <PayPalButton amount={String(pkg.setupPrice)} currency="USD" intent="CAPTURE" />
                              </Suspense>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overview Comparison Table (Page 2 of PDF 1) */}
              <div className="mb-16 rounded-3xl border border-border bg-white/[0.02] p-6 md:p-8">
                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                    CATALOG OVERVIEW
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mt-1">
                    Five Packages, Five Business Outcomes
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every package is priced and scoped around a business result — not a technical feature — so the conversation stays on outcomes, not implementation.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-blue-500/30 bg-blue-600/10 text-xs font-mono text-[#93C5FD]">
                        <th className="py-3.5 px-4 font-bold">#</th>
                        <th className="py-3.5 px-4 font-bold">PACKAGE</th>
                        <th className="py-3.5 px-4 font-bold">CORE SERVICE</th>
                        <th className="py-3.5 px-4 font-bold">SETUP</th>
                        <th className="py-3.5 px-4 font-bold">MONTHLY</th>
                        <th className="py-3.5 px-4 font-bold">BEST FOR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {AI_CATALOG_OVERVIEW.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">{item.id}</td>
                          <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2">
                            <span>{item.package}</span>
                            {item.isBestOverall && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-[#214ECF] font-semibold">
                                ★ BEST OVERALL
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{item.coreService}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-foreground">{item.setupPrice}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#214ECF]">{item.monthlyPrice}</td>
                          <td className="py-3.5 px-4 text-muted-foreground">{item.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* How to Read this catalog */}
                <div className="mt-6 pt-5 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#214ECF] mt-1.5 shrink-0" />
                    <span>Setup price is a one-time build fee; monthly covers hosting, monitoring, and optimization.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#214ECF] mt-1.5 shrink-0" />
                    <span>Each package can be sold standalone or bundled into a Growth or Enterprise engagement.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#214ECF] mt-1.5 shrink-0" />
                    <span>Pricing benchmarked against comparable tier-1 U.S. AI implementation offers.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 2: THINKATIC SCALEOS (PDF 2)
             ════════════════════════════════════════════════════════════════════ */}
          {activeCatalog === "scaleos" && (
            <motion.div
              key="scaleos-catalog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: smoothEase }}
            >
              {/* Cover Banner */}
              <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#07132B]/90 via-[#050C1B] to-[#03060C] p-7 md:p-10 mb-14 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(33,78,207,0.12),transparent_70%)] pointer-events-none" />
                <div className="max-w-3xl relative z-10">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#214ECF] mb-2 uppercase tracking-widest">
                    <span>OUTSOURCING PARTNERSHIP PROPOSAL</span>
                    <span>·</span>
                    <span>{SCALEOS_OVERVIEW.location}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-foreground mb-2">
                    Thinkatic <span className="text-[#214ECF]">ScaleOS</span>
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed mb-6">
                    {SCALEOS_OVERVIEW.pitch}
                  </p>

                  {/* Motto & Company Line */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground mb-6">
                    <span className="px-3 py-1 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                      {SCALEOS_OVERVIEW.motto}
                    </span>
                    <span>{SCALEOS_OVERVIEW.companyLine}</span>
                  </div>

                  {/* Main Quote Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                    <p className="text-xs sm:text-sm font-semibold text-foreground italic leading-relaxed">
                      {SCALEOS_OVERVIEW.quote}
                    </p>
                  </div>
                </div>

                {/* 3 Metric Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border relative z-10">
                  {SCALEOS_OVERVIEW.stats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-border">
                      <div className="text-3xl font-display font-black text-[#214ECF] mb-1">
                        {stat.value}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pipeline Bar */}
                <div className="mt-6 pt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">LIFECYCLE:</span>
                  {SCALEOS_OVERVIEW.pipeline.map((step, idx) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-border">
                        {step}
                      </span>
                      {idx < SCALEOS_OVERVIEW.pipeline.length - 1 && (
                        <span className="text-blue-400">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 ScaleOS Packages Cards */}
              <div className="mb-16">
                <div className="text-center mb-10">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                    CHOOSE YOUR SCALE
                  </span>
                  <h3 className="text-2xl md:text-4xl font-display font-bold text-foreground mt-1">
                    Outsourcing Partnership Packages
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto mt-2">
                    One payment. One partner. 11 months of outsourcing support — a complete outsourcing infrastructure, without the cost or risk of building it yourself.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {SCALEOS_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`relative rounded-3xl p-7 border flex flex-col justify-between transition-all duration-200 ${
                        tier.isMostPopular
                          ? "bg-gradient-to-b from-[#11244A]/95 to-[#07132B]/95 border-[#214ECF]/50 shadow-[0_12px_45px_rgba(37,99,235,0.3)]"
                          : "bg-white/[0.025] border-border hover:border-[#DCE5FF]"
                      }`}
                    >
                      {tier.isMostPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                          <span className="px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#214ECF] text-foreground shadow-lg">
                            ★ MOST POPULAR
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Header */}
                        <div className="mb-4">
                          <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                            {tier.subtitle}
                          </p>
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-2xl font-display font-bold text-foreground">
                              {tier.name}
                            </h4>
                            <span className="text-2xl md:text-3xl font-display font-black text-[#214ECF]">
                              {tier.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            one-time investment · {tier.seats} · {tier.renewal}
                          </p>
                        </div>

                        {/* 4 Pillars Breakdown */}
                        <div className="space-y-4 my-6">
                          {tier.pillars.map((pillar) => (
                            <div key={pillar.title} className="p-3.5 rounded-xl bg-white/[0.02] border border-border">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#214ECF] mb-2">
                                {pillar.title}
                              </h5>
                              <ul className="space-y-1.5 text-xs text-muted-foreground">
                                {pillar.items.map((it) => (
                                  <li key={it} className="flex items-start gap-2">
                                    <span className="text-[#214ECF] mt-0.5 text-xs">•</span>
                                    <span>{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Lifetime support callout if enterprise */}
                        {tier.lifetimeSupportNote && (
                          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px] leading-relaxed mb-6">
                            <span className="font-bold block mb-1">Lifetime Strategic Support — No Renewal Fee</span>
                            {tier.lifetimeSupportNote}
                          </div>
                        )}
                      </div>

                      {/* Card Footer & Action */}
                      <div className="pt-4 border-t border-border">
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-foreground italic">
                            "{tier.summaryQuote}"
                          </p>
                          <p className="text-[11px] text-[#214ECF] font-mono mt-0.5">
                            {tier.summaryPrice}
                          </p>
                        </div>

                        <Link href="/contact">
                          <button
                            className={`w-full py-3 px-5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors ${
                              tier.isMostPopular
                                ? "bg-[#214ECF] text-foreground hover:bg-blue-600 shadow-lg shadow-blue-500/25"
                                : "bg-white/10 hover:bg-white/15 text-foreground border border-border"
                            }`}
                          >
                            <span>Engage ScaleOS {tier.name}</span>
                            <ArrowRight size={14} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ScaleOS Full Comparison Matrix (Page 3 of PDF 2) */}
              <div className="mb-16 rounded-3xl border border-border bg-white/[0.02] p-6 md:p-8">
                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                    MATRIX COMPARISON
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mt-1">
                    Complete Tier Feature Matrix
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-blue-500/30 bg-blue-600/10 text-xs font-mono text-[#93C5FD]">
                        <th className="py-3.5 px-4 font-bold">FEATURE / SPEC</th>
                        <th className="py-3.5 px-4 font-bold">STARTER</th>
                        <th className="py-3.5 px-4 font-bold">GROWTH (POPULAR)</th>
                        <th className="py-3.5 px-4 font-bold">ENTERPRISE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {SCALEOS_MATRIX.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-foreground">{row.feature}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{row.starter}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#214ECF]">{row.growth}</td>
                          <td className="py-3 px-4 text-foreground font-mono font-bold">{row.enterprise}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 17-Project Outsourcing Portfolio (Page 4 of PDF 2) */}
              <div className="mb-16 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-white/[0.03] to-transparent p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                      LIVE CAMPAIGN PORTFOLIO
                    </span>
                    <h3 className="text-xl md:text-3xl font-display font-bold text-foreground mt-1">
                      17-Project Outsourcing Portfolio
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      10 USA · 4 UK · 3 India — the full set of live and pending campaigns available across every ScaleOS partnership tier.
                    </p>
                  </div>

                  {/* Region Filter & Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-xl bg-background/40 border border-border p-1">
                      {["ALL", "USA", "UK", "INDIA"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRegion(r)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                            selectedRegion === r
                              ? "bg-[#214ECF] text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search campaign..."
                        value={portfolioSearch}
                        onChange={(e) => setPortfolioSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-background/40 border border-border text-xs text-foreground placeholder-white/40 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-blue-500/20 bg-blue-950/30 text-xs font-mono text-[#93C5FD]">
                        <th className="py-3 px-4 font-bold">#</th>
                        <th className="py-3 px-4 font-bold">PROJECT</th>
                        <th className="py-3 px-4 font-bold">REGION</th>
                        <th className="py-3 px-4 font-bold">PAYOUT</th>
                        <th className="py-3 px-4 font-bold">CYCLE</th>
                        <th className="py-3 px-4 font-bold">TYPE / NOTES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredProjects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono text-muted-foreground">{proj.id}</td>
                          <td className="py-3 px-4 font-bold text-foreground">{proj.project}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                proj.region === "USA"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : proj.region === "UK"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {proj.region}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#214ECF]">{proj.payout}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{proj.cycle}</td>
                          <td className="py-3 px-4 text-muted-foreground">{proj.typeNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 p-3.5 rounded-xl bg-background/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-muted-foreground block mb-0.5">Disclaimer:</span>
                  Payout figures are the commercial figures supplied in the brief. Actual earnings depend on approved volumes, quality, client acceptance, and partner agreements.
                </div>
              </div>

              {/* The Alternative: "One relationship, instead of ten" (Page 8 of PDF 2) */}
              <div className="mb-16 rounded-3xl border border-border bg-white/[0.02] p-6 md:p-8">
                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#214ECF] uppercase font-bold">
                    THE ALTERNATIVE
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mt-1">
                    One relationship, instead of ten
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Building an outsourcing operation in-house means hiring, vendor-hunting, and stitching together tools on your own. ScaleOS replaces all of it with a single partner.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-blue-500/30 bg-blue-900/20 text-xs font-mono text-[#93C5FD]">
                        <th className="py-3 px-4 font-bold text-muted-foreground">TRADITIONAL APPROACH</th>
                        <th className="py-3 px-4 font-bold text-[#214ECF]">THINKATIC SCALEOS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {ALTERNATIVE_COMPARISON.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 text-muted-foreground">{row.traditional}</td>
                          <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 size={13} className="text-[#214ECF] shrink-0" />
                            <span>{row.scaleOS}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pay Once Banner */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-blue-950/40 border border-blue-500/30 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#214ECF] font-bold block mb-1">
                    NO ANNUAL RENEWAL FEE
                  </span>
                  <h4 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                    Pay once. Partner with Thinkatic for 11 months.
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                    No annual platform renewal fee · no contract renewal fee · no surprise management renewal.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Bottom Call To Action ── */}
          <div className="mt-16 text-center pt-10 border-t border-border">
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
              Need a Custom Engagement Scope?
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
              Our engineering and operations leads review project requirements within 24 hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact">
                <button className="px-7 py-3 rounded-full font-bold text-xs tracking-wider uppercase bg-[#214ECF] text-foreground hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                  Book a Discovery Call
                </button>
              </Link>
              <Link href="/request-proposal">
                <button className="px-7 py-3 rounded-full font-bold text-xs tracking-wider uppercase bg-white/5 hover:bg-white/10 text-foreground border border-border transition-colors">
                  Request Custom Proposal
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
