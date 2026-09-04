import { useLocation, Link } from "wouter";
import { useState, useRef } from "react";
import {
  motion, useScroll, useMotionValueEvent, AnimatePresence,
} from "framer-motion";
import {
  Check, Search, X, ArrowRight, FileText,
  HeadphonesIcon, Activity, Briefcase, Cpu, Users,
  ChevronDown, CalendarDays, Building2, Globe, Zap,
  Sparkles, Cloud, ShieldCheck, Database, User,
} from "lucide-react";

// ─── Logo ─────────────────────────────────────────────────────────────────────

function ThinkaticLogo({ compact }: { compact?: boolean }) {
  return (
    <img
      src="/logo-transparent-light.png"
      alt="Thinkatic"
      style={{ height: compact ? "42px" : "48px", width: "auto", objectFit: "contain", filter: "contrast(1.18) saturate(1.15)", transition: "height 0.25s" }}
    />
  );
}

// ─── Nav data ─────────────────────────────────────────────────────────────────

interface NavLinkItem {
  label: string;
  slug: string;
  desc: string;
  icon: any;
  href?: string;
}

const bpoLinks: NavLinkItem[] = [
  { label: "AI & Automation",     slug: "ai-transformation",          desc: "Sovereign LLMs, RAG & agent swarms", icon: Sparkles },
  { label: "Cloud Modernization", slug: "cloud-modernization",        desc: "Multi-cloud architecture & DevOps IaC", icon: Cloud },
  { label: "Cybersecurity",       slug: "enterprise-security",        desc: "Zero Trust defense & 24/7 SOC",      icon: ShieldCheck },
  { label: "Data Platforms",      slug: "enterprise-data-platform",   desc: "Real-time streaming lakehouse & BI", icon: Database },
  { label: "Product Engineering", slug: "enterprise-product-engineering", desc: "Mission-critical systems & squads", icon: Cpu },
  { label: "Managed Services",    slug: "managed-ai",                 desc: "24/7 SLA-backed operational governance", icon: Activity },
];

const navItems = [
  { label: "CAPABILITIES", href: "/services", hasMega: true },
  { label: "PLANS & PRICING", href: "/pricing" },
  { label: "TECHNOLOGY",   href: "/technology", isSecondary: true },
  { label: "CASES",        href: "/case-studies" },
  { label: "ABOUT",        href: "/about" },
  { label: "CAREERS",      href: "/careers" },
  { label: "FAQ",          href: "/faq" },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Wide Mega Menu ───────────────────────────────────────────────────────────

function MegaMenu({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 rounded-2xl border overflow-hidden z-50"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(32px)",
            borderColor: "rgba(33,78,207,0.12)",
            minWidth: "640px",
            boxShadow: "0 24px 80px rgba(17,24,39,0.10), 0 0 0 1px rgba(33,78,207,0.08)",
          }}
        >
          {/* Top eyebrow bar */}
          <div
            className="px-6 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: "rgba(33,78,207,0.10)", background: "rgba(33,78,207,0.03)" }}
          >
            <span className="text-[9px] font-mono tracking-[0.28em] uppercase" style={{ color: "#214ECF" }}>
              Enterprise Technology Capabilities
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
              Mission-Critical Systems
            </span>
          </div>

          {/* Two-column body */}
          <div className="flex">
            {/* Left — service links */}
            <div className="flex-1 p-3 grid grid-cols-1 gap-0.5">
              {bpoLinks.map((item, i) => {
                const Icon = item.icon;
                const href = item.href ?? `/services/${item.slug}`;
                return (
                  <motion.div
                    key={item.slug || item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035, duration: 0.22, ease }}
                  >
                    <Link
                      href={href}
                      className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors duration-200 group-hover:bg-primary/15"
                        style={{ background: "rgba(33,78,207,0.08)" }}
                      >
                        <Icon size={13} className="text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 group-hover:text-[#214ECF] leading-none mb-0.5 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight
                        size={11}
                        className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 shrink-0"
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right — featured card */}
            <div
              className="w-[220px] shrink-0 p-4 flex flex-col justify-between border-l"
              style={{ borderColor: "rgba(33,78,207,0.10)", background: "rgba(33,78,207,0.025)" }}
            >
              <div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg,rgba(33,78,207,0.25),rgba(33,78,207,0.18))" }}
                >
                  <Globe size={14} className="text-primary" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#214ECF" }}>
                  Flagship Engagements
                </p>
                <p className="text-[13px] font-bold text-slate-900 leading-snug mb-2">
                  Enterprise Technology Transformation
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600 mb-3">
                  16 structured plans across AI, Cloud, Cybersecurity, Data, and Engineering.
                </p>
              </div>
              <Link
                href="/pricing"
                className="mt-2 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg px-3 py-2 text-white transition-all duration-200 bg-[#214ECF] hover:bg-[#1A43C8] shadow-xs"
              >
                <FileText size={11} />
                Explore 16 Plans
              </Link>
            </div>
          </div>

          {/* Footer bar */}
          <div
            className="px-5 py-2.5 border-t flex items-center justify-between"
            style={{ borderColor: "rgba(33,78,207,0.04)" }}
          >
            <Link
              href="/services"
              className="text-[11px] font-medium flex items-center gap-1.5 transition-all hover:gap-2.5 duration-200"
              style={{ color: "rgba(37,99,235,0.75)" }}
            >
              View All Services
              <ArrowRight size={10} />
            </Link>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#475569" }}>
                Accepting New Clients
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 220 }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.25, ease }}
          className="overflow-hidden"
          onAnimationComplete={() => open && inputRef.current?.focus()}
        >
          <div
            className="flex items-center gap-2 rounded-lg px-3 h-8"
            style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(33,78,207,0.06)" }}
          >
            <Search size={12} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search services, insights…"
              aria-label="Search"
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder-white/25 outline-none min-w-0"
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X size={11} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [location] = useLocation();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileBpoOpen, setMobileBpoOpen] = useState(false);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) setHidden(true);
    else setHidden(false);
    setScrolled(latest > 20);
  });

  const handleMegaEnter = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setMegaOpen(true);
  };
  const handleMegaLeave = () => {
    megaTimerRef.current = setTimeout(() => setMegaOpen(false), 140);
  };

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(226, 232, 240, 0.9)"
            : "1px solid rgba(226, 232, 240, 0.5)",
          boxShadow: scrolled
            ? "0 4px 20px -2px rgba(15, 23, 42, 0.05)"
            : "none",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between gap-4 transition-all duration-300"
          style={{ height: scrolled ? "56px" : "64px" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 hover:opacity-85 transition-opacity duration-200"
            aria-label="Thinkatic – Home"
          >
            <ThinkaticLogo compact={scrolled} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = item.href === location || location.startsWith(item.href + "/");

              if (item.hasMega) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={handleMegaEnter}
                    onMouseLeave={handleMegaLeave}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={megaOpen}
                      aria-haspopup="true"
                      className="flex items-center gap-1 px-3 py-2 rounded-md transition-colors duration-150 hover:bg-slate-100/60"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        color: isActive ? "#1E40AF" : "#0F172A",
                      }}
                    >
                      {item.label}
                      <motion.span
                        animate={{ rotate: megaOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex opacity-60"
                        aria-hidden="true"
                      >
                        <ChevronDown size={10} strokeWidth={2.5} />
                      </motion.span>
                    </Link>
                    {isActive && (
                      <motion.div
                        layoutId="activeUnderline"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1E40AF] rounded-full"
                        transition={{ duration: 0.3, ease }}
                      />
                    )}
                    <MegaMenu visible={megaOpen} />
                  </div>
                );
              }

              return (
                <div key={item.label} className="relative">
                  <Link
                    href={item.href}
                    className="px-3 py-2 rounded-md transition-colors duration-150 block hover:bg-slate-100/60 hover:text-[#1E40AF]"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      color: isActive ? "#1E40AF" : "#0F172A",
                    }}
                  >
                    {item.label}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1E40AF] rounded-full"
                      transition={{ duration: 0.3, ease }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2">
              <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
              {!searchOpen && (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <Search size={14} />
                </button>
              )}
            </div>

            {/* Client Portal — desktop */}
            <Link href={typeof window !== "undefined" && localStorage.getItem("user_token") ? "/dashboard" : "/login"} className="hidden md:block">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="h-9 flex items-center gap-1.5 px-3 rounded-lg transition-all duration-200 border border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100/80 font-bold text-[11px] tracking-wider shadow-2xs cursor-pointer"
                aria-label="Client Portal"
              >
                <User size={12} className="text-blue-600" aria-hidden="true" />
                {typeof window !== "undefined" && localStorage.getItem("user_token") ? "PORTAL" : "CLIENT LOGIN"}
              </motion.button>
            </Link>

            {/* Request Proposal — desktop only */}
            <Link href="/request-proposal" className="hidden lg:block">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="h-9 flex items-center gap-1.5 px-3.5 rounded-lg transition-all duration-200 border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-2xs font-semibold text-[11px] tracking-wider"
                aria-label="Request a proposal"
              >
                <FileText size={11} className="text-slate-500" aria-hidden="true" />
                REQUEST PROPOSAL
              </motion.button>
            </Link>

            {/* Book Consultation — primary CTA */}
            <Link href="/contact" className="hidden md:block">
              <motion.button
                whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(30,64,175,0.2)" }}
                whileTap={{ y: 0 }}
                className="h-9 flex items-center gap-2 px-4 rounded-lg font-bold text-white transition-all duration-200 bg-[#1E40AF] hover:bg-[#1D4ED8] text-[11px] tracking-wider shadow-xs"
                data-testid="button-book-consultation"
              >
                <CalendarDays size={11} aria-hidden="true" />
                BOOK CONSULTATION
                <Check size={11} strokeWidth={3} aria-hidden="true" />
              </motion.button>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex flex-col gap-[5px] p-2 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <motion.span
                className="block w-5 h-[1.5px] bg-[#111827] origin-center"
                animate={mobileOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="block w-5 h-[1.5px] bg-[#111827]"
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="block w-5 h-[1.5px] bg-[#111827] origin-center"
                animate={mobileOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile full-screen nav ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-0 z-40 flex flex-col"
                style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)" }}
          >
            {/* Top bar — logo + close */}
            <div
              className="flex items-center justify-between px-6 border-b shrink-0"
              style={{ height: "68px", borderColor: "rgba(33,78,207,0.04)" }}
            >
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <ThinkaticLogo />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <div
                className="flex items-center gap-3 rounded-xl px-4 h-11"
                style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Search size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search services, insights…"
                  aria-label="Search"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-white/25 outline-none"
                />
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-0.5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease }}
                >
                  {item.hasMega ? (
                    <>
                      <button
                        onClick={() => setMobileBpoOpen(!mobileBpoOpen)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                        aria-expanded={mobileBpoOpen}
                      >
                        <span
                          className="font-bold text-foreground"
                          style={{ fontSize: "clamp(1.1rem,4vw,1.5rem)", letterSpacing: "0.04em" }}
                        >
                          {item.label}
                        </span>
                        <motion.span animate={{ rotate: mobileBpoOpen ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
                          <ChevronDown size={16} className="text-muted-foreground" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {mobileBpoOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 flex flex-col gap-0.5">
                              {bpoLinks.map((b) => {
                                const Icon = b.icon;
                                return (
                                  <Link
                                    key={b.slug || b.label}
                                    href={b.href ?? `/services/${b.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                                  >
                                    <Icon size={13} className="text-primary/60 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
                                    <span className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors">{b.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3.5 rounded-xl font-bold text-foreground hover:bg-white/[0.04] hover:text-primary transition-colors"
                      style={{ fontSize: "clamp(1.1rem,4vw,1.5rem)", letterSpacing: "0.04em" }}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35, ease }}
              className="px-6 pb-8 pt-4 border-t flex flex-col gap-3 shrink-0"
              style={{ borderColor: "rgba(33,78,207,0.04)" }}
            >
              <Link href={typeof window !== "undefined" && localStorage.getItem("user_token") ? "/dashboard" : "/login"} onClick={() => setMobileOpen(false)}>
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-blue-200 bg-blue-50/80 text-blue-700 font-bold text-xs shadow-2xs"
                >
                  <User size={13} aria-hidden="true" />
                  {typeof window !== "undefined" && localStorage.getItem("user_token") ? "MY CLIENT PORTAL" : "CLIENT LOGIN / SIGNUP"}
                </button>
              </Link>
              <Link href="/request-proposal" onClick={() => setMobileOpen(false)}>
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-[#DCE5FF]"
                  style={{ fontSize: "12px", letterSpacing: "0.14em", borderColor: "rgba(33,78,207,0.12)", background: "rgba(244,247,255,0.8)" }}
                >
                  <FileText size={13} aria-hidden="true" />
                  REQUEST PROPOSAL
                </button>
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-foreground"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    background: "linear-gradient(135deg,#214ECF 0%,#214ECF 60%,#3b82f6 100%)",
                    boxShadow: "0 0 28px rgba(37,99,235,0.4)",
                  }}
                >
                  <CalendarDays size={13} aria-hidden="true" />
                  BOOK CONSULTATION
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
