import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Linkedin, Instagram, Twitter, Youtube, Github,
  Mail, MapPin, Phone, ArrowRight, Send,
  Activity, HeadphonesIcon, Briefcase, Cpu, Users, Zap,
  BookOpen, FileText, BarChart3, HelpCircle, DollarSign,
  Building2, Heart, ShoppingCart, GraduationCap, Truck, Globe,
  CheckCircle2,
} from "lucide-react";


// ─── Footer data ──────────────────────────────────────────────────────────────

const footerCompany = [
  { label: "About Us",        href: "/about",          icon: Building2 },
  { label: "Careers",         href: "/careers",        icon: Users },
  { label: "Blog",            href: "/blog",           icon: BookOpen },
  { label: "Case Studies",    href: "/case-studies",   icon: BarChart3 },
  { label: "Our Process",     href: "/process",        icon: Activity },
  { label: "Contact",         href: "/contact",        icon: Mail },
];

const footerServices = [
  { label: "Healthcare BPO",   href: "/services/healthcare-bpo",        icon: Activity },
  { label: "Customer Support", href: "/services/customer-support",       icon: HeadphonesIcon },
  { label: "Sales & Lead Gen", href: "/services/sales-lead-generation",  icon: Users },
  { label: "Back Office BPO",  href: "/services/back-office",            icon: Briefcase },
  { label: "AI-Powered BPO",  href: "/services/ai-powered-bpo",          icon: Cpu },
  { label: "AI Software Dev",  href: "/technology",                      icon: Zap },
];

const footerIndustries = [
  { label: "Healthcare",        href: "/services/healthcare-bpo",       icon: Heart },
  { label: "Financial Services",href: "/services",                      icon: DollarSign },
  { label: "E-Commerce",        href: "/services",                      icon: ShoppingCart },
  { label: "Education",         href: "/services",                      icon: GraduationCap },
  { label: "Logistics",         href: "/services",                      icon: Truck },
  { label: "Enterprise Tech",   href: "/technology",                    icon: Globe },
];

const footerResources = [
  { label: "Blog & Insights",   href: "/blog",          icon: BookOpen },
  { label: "Case Studies",      href: "/case-studies",  icon: BarChart3 },
  { label: "Pricing",           href: "/pricing",       icon: DollarSign },
  { label: "Technology",        href: "/technology",    icon: Cpu },
  { label: "FAQ",               href: "/faq",           icon: HelpCircle },
  { label: "Request Proposal",  href: "/contact",       icon: FileText },
];

const footerLegal = [
  { label: "Privacy Policy",  href: "/privacy-policy" },
  { label: "Terms of Service",href: "/terms" },
  { label: "Cookie Policy",   href: "/cookie-policy" },
];

const socials = [
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Github,    href: "#", label: "GitHub" },
];

const contactInfo = [
  { icon: Mail,    text: "Thinkaticai@gmail.com",                              href: "mailto:Thinkaticai@gmail.com" },
  { icon: Phone,   text: "+1 (800) THINKATIC",                                 href: "tel:+18008446528" },
  { icon: MapPin,  text: "Tower B, Magarpatta City, Hadapsar, Pune – 411028",  href: null },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Animated link list ───────────────────────────────────────────────────────

function FooterLinkList({
  title, links, delay = 0, inView,
}: {
  title: string;
  links: { label: string; href: string; icon?: React.ElementType }[];
  delay?: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease, delay }}
    >
      <p className="text-[10px] font-mono tracking-[0.24em] uppercase mb-5 flex items-center gap-2"
        style={{ color: "#6B7280" }}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5" role="list">
        {links.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: delay + 0.06 + i * 0.04, ease }}
            >
              <Link
                href={s.href}
                className="group flex items-center gap-2 text-[13px] transition-all duration-200 hover:text-foreground"
                style={{ color: "#4B5563" }}
              >
                {Icon && (
                  <Icon
                    size={11}
                    className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                    aria-hidden="true"
                  />
                )}
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {s.label}
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function Newsletter({ inView }: { inView: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease, delay: 0.25 }}
      className="rounded-2xl p-6"
      style={{
        background: "rgba(244,247,255,0.85)",
        border: "1px solid rgba(33,78,207,0.08)",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(33,78,207,0.08)" }}
          aria-hidden="true"
        >
          <Send size={13} className="text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900 mb-0.5">
            Enterprise AI Insights
          </p>
          <p className="text-[11px]" style={{ color: "#4B5563" }}>
            Strategy, benchmarks &amp; case studies. No spam.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 py-2.5"
          >
            <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" />
            <span className="text-[12px] text-emerald-400">You're in — check your inbox.</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex gap-2"
            initial={{ opacity: 1 }}
          >
            <div
              className="flex-1 flex items-center gap-2 rounded-lg px-3 h-9 transition-all duration-200"
              style={{
                background: "rgba(244,247,255,0.9)",
                border: `1px solid ${focused ? "rgba(33,78,207,0.3)" : "rgba(33,78,207,0.12)"}`,
                boxShadow: focused ? "0 0 16px rgba(33,78,207,0.12)" : "none",
              }}
            >
              <Mail size={12} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@company.com"
                aria-label="Email address for newsletter"
                required
                className="flex-1 bg-transparent text-[12px] text-foreground placeholder-white/25 outline-none min-w-0"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 h-9 rounded-lg font-semibold text-foreground text-[11px] tracking-wide shrink-0 flex items-center gap-1.5 transition-all"
              style={{
                background: "linear-gradient(135deg,#214ECF,#214ECF)",
                boxShadow: "0 0 14px rgba(33,78,207,0.18)",
              }}
              aria-label="Subscribe to newsletter"
            >
              <ArrowRight size={12} aria-hidden="true" />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-[10px] mt-2.5" style={{ color: "rgba(33,78,207,0.14)" }}>
        Join 4,200+ enterprise leaders. Unsubscribe anytime.
      </p>
    </motion.div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduce = useReducedMotion();

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t"
      style={{ background: "linear-gradient(180deg, #f8faff 0%, #edf3ff 100%)", borderColor: "rgba(33,78,207,0.10)" }}
    >
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(33,78,207,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(33,78,207,0.18) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="absolute top-[35%] left-[20%] w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute top-[60%] left-[78%] w-[320px] h-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(71,163,255,0.03) 0%, transparent 70%)", filter: "blur(44px)" }} />
      </div>

      {/* Top shimmer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(37,99,235,0.32),transparent)" }}
        aria-hidden="true"
      />

      {/* Ghost wordmark */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display font-black text-[#214ECF]/[0.05] uppercase tracking-tighter"
          style={{ fontSize: "clamp(8rem,22vw,22rem)", lineHeight: 0.85 }}
        >
          THINKATIC
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10" ref={ref}>

        {/* ── Newsletter + contact band ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14 pb-14"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.045)" }}>

          {/* Left — brand intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col gap-5"
          >
            <Link href="/" aria-label="Thinkatic – Home" className="inline-block w-fit hover:opacity-75 transition-opacity">
              <img
                src="/logo-transparent.png"
                alt="Thinkatic"
                style={{ height: "60px", width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p className="text-[13px] leading-relaxed max-w-sm" style={{ color: "#4B5563" }}>
              AI-Powered Business Process Outsourcing &amp; Enterprise Technology Solutions. Your long-term growth partner across 15+ industries.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-2">
              {["ISO 27001", "HIPAA", "SOC 2 Type II", "GDPR"].map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-md"
                  style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.14)", color: "rgba(71,163,255,0.6)" }}
                >
                  <CheckCircle2 size={8} aria-hidden="true" />
                  {cert}
                </span>
              ))}
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2.5">
              {contactInfo.map((c) => {
                const Icon = c.icon;
                const inner = (
                  <div className="flex items-start gap-2.5 group">
                    <Icon
                      size={13}
                      className="shrink-0 mt-0.5 text-primary/50 group-hover:text-primary/80 transition-colors"
                      aria-hidden="true"
                    />
                    <span className="text-[12px] leading-relaxed transition-colors group-hover:text-muted-foreground"
                      style={{ color: "rgba(33,78,207,0.22)" }}>
                      {c.text}
                    </span>
                  </div>
                );
                return c.href ? (
                  <a key={c.text} href={c.href} className="w-fit">{inner}</a>
                ) : (
                  <div key={c.text}>{inner}</div>
                );
              })}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  whileHover={shouldReduce ? {} : { scale: 1.04, backgroundColor: "rgba(33,78,207,0.09)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center transition-colors duration-200"
                  aria-label={s.label}
                >
                  <s.icon size={13} className="text-muted-foreground" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right — newsletter */}
          <div className="flex flex-col justify-center">
            <Newsletter inView={inView} />
          </div>
        </div>

        {/* ── 5-column link grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          <FooterLinkList title="Company"    links={footerCompany}    delay={0}    inView={inView} />
          <FooterLinkList title="Services"   links={footerServices}   delay={0.08} inView={inView} />
          <FooterLinkList title="Industries" links={footerIndustries} delay={0.14} inView={inView} />
          <FooterLinkList title="Resources"  links={footerResources}  delay={0.20} inView={inView} />

          {/* Legal column — inline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.26 }}
          >
            <p className="text-[10px] font-mono tracking-[0.24em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
              Legal
            </p>
            <ul className="flex flex-col gap-1.5" role="list">
              {footerLegal.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.04, ease }}
                >
                  <Link
                    href={s.href}
                    className="text-[13px] transition-all duration-200 hover:text-foreground hover:translate-x-0.5 inline-block"
                    style={{ color: "rgba(33,78,207,0.22)" }}
                  >
                    {s.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* CTA card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.5 }}
              className="mt-8 rounded-xl p-4"
              style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(33,78,207,0.12)" }}
            >
              <p className="text-[11px] font-semibold text-foreground mb-1">Ready to scale?</p>
              <p className="text-[10px] mb-3" style={{ color: "rgba(33,78,207,0.22)" }}>
                Free 30-min strategy call with our BPO experts.
              </p>
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-foreground text-[11px] font-semibold cursor-pointer transition-all"
                  style={{ background: "linear-gradient(135deg,#214ECF,#214ECF)", boxShadow: "0 0 12px rgba(37,99,235,0.3)" }}
                >
                  Book Free Call
                  <ArrowRight size={10} aria-hidden="true" />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55, ease }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7 border-t"
          style={{ borderColor: "rgba(255,255,255,0.045)" }}
        >
          <p className="text-[11px] order-2 sm:order-1" style={{ color: "rgba(33,78,207,0.14)" }}>
            © {new Date().getFullYear()} Thinkatic Private Limited. All rights reserved.
          </p>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            {footerLegal.map((l, i) => (
              <span key={l.label} className="flex items-center gap-4">
                <Link
                  href={l.href}
                  className="text-[10px] transition-colors hover:text-muted-foreground"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {l.label}
                </Link>
                {i < footerLegal.length - 1 && (
                  <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} aria-hidden="true" />
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 order-3 hidden sm:flex">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.14)" }}>Built with</span>
            <span className="text-[10px] font-semibold" style={{ color: "rgba(37,99,235,0.7)" }}>AI</span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.14)" }}>by Thinkatic</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
