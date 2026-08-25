import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import Layout from "@/components/layout/Layout";
import { services, BLUE, BLUE_DIM, BLUE_BORDER } from "@/data/services-data";
import NotFound from "@/pages/not-found";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function Badge({ text }: { text: string }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, color: BLUE }}
    >
      {text}
    </span>
  );
}

function WhiteBadge({ text }: { text: string }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: "rgba(33,78,207,0.08)", border: "1px solid rgba(33,78,207,0.2)", color: "#214ECF" }}
    >
      {text}
    </span>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}` }}
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm text-muted-foreground leading-snug">{text}</span>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const svc = services.find((s) => s.id === slug);

  if (!svc) return <NotFound />;

  const related = services.filter((s) => s.id !== svc.id).slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-44 pb-24 bg-background overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#214ECF05_1px,transparent_1px),linear-gradient(to_bottom,#214ECF05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 60% 0%, rgba(71,163,255,0.10) 0%, transparent 65%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center gap-2 mb-10 text-xs font-mono"
          >
            <Link href="/services" className="text-muted-foreground hover:text-muted-foreground transition-colors">Services</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(33,78,207,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            <span style={{ color: BLUE }}>{svc.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 mb-6">
                <span className="text-xs font-mono font-bold tracking-[0.25em]" style={{ color: BLUE }}>{svc.number}</span>
                <div className="h-px w-10" style={{ background: BLUE_BORDER }} />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Service</span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.05 }}
                className="font-display font-bold text-foreground leading-[1.05] mb-5"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
              >
                {svc.title}
              </motion.h1>

              <motion.p
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.1 }}
                className="text-base font-medium mb-6"
                style={{ color: BLUE }}
              >
                {svc.tagline}
              </motion.p>

              <motion.p
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.15 }}
                className="text-muted-foreground text-base leading-relaxed mb-10 max-w-xl"
              >
                {svc.description}
              </motion.p>

              <motion.div
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-foreground text-sm tracking-wide"
                    style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)" }}
                  >
                    Start a Project
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                  </motion.button>
                </Link>
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm"
                    style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}
                  >
                    View Pricing
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Icon panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div
                className="w-64 h-64 rounded-3xl flex items-center justify-center relative"
                style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}` }}
              >
                <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle at center, rgba(33,78,207,0.12) 0%, transparent 70%)" }} />
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={svc.icon} />
                </svg>
                <div className="absolute top-5 right-5 text-4xl font-mono font-bold" style={{ color: "rgba(33,78,207,0.12)" }}>{svc.number}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Healthcare BPO — Compliance Trust Badges */}
      {svc.trustBadges && (
        <section className="py-10 bg-[#FFFFFF] border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex flex-col md:flex-row gap-4"
            >
              {svc.trustBadges.map((badge: { icon: string; label: string; description: string }, i: number) => (
                <div
                  key={badge.label}
                  className="flex-1 flex items-start gap-4 rounded-2xl p-5"
                  style={{ background: "rgba(71,163,255,0.04)", border: "1px solid rgba(71,163,255,0.14)" }}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}` }}
                  >
                    {badge.icon === "shield" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                    {badge.icon === "phone" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    )}
                    {badge.icon === "lock" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1.5">{badge.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* What We Build */}
      <section className="py-24 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
            className="mb-12"
          >
            <p className="text-xs font-mono uppercase tracking-[0.25em] mb-3" style={{ color: BLUE }}>
              {svc.id === "ai-consulting" ? "Our Services" : "What We Build"}
            </p>
            <h2 className="font-display font-bold text-foreground leading-[1.05]" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
              {svc.id === "ai-consulting" ? "Consulting Services We Provide" : "Solutions We Deliver"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {svc.whatWeBuild.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-6 flex flex-col gap-3 group hover:border-border transition-colors"
                style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}` }}
                >
                  <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-foreground font-semibold text-sm leading-snug">{item.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process / Technologies / Benefits / etc. */}
      {(svc.process || svc.technologies || svc.benefits || svc.whyUs || svc.industries || svc.principles || svc.fullServices) && (
        <section className="py-24 bg-background border-t border-border">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16">

            {svc.process && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-xs font-mono uppercase tracking-[0.25em] mb-4 text-muted-foreground">Development Process</p>
                <h3 className="font-display font-bold text-foreground mb-8" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
                  How We Work
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {svc.process.map((step, i) => (
                    <motion.div
                      key={step}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-4 p-5 rounded-2xl"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                        style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, color: BLUE }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium leading-snug pt-1">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {svc.fullServices && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-4">Full Development Services</p>
                <div className="flex flex-wrap gap-2">
                  {svc.fullServices.map((t) => <WhiteBadge key={t} text={t} />)}
                </div>
              </motion.div>
            )}

            {svc.technologies && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-4">Technologies We Use</p>
                <div className="flex flex-wrap gap-2">
                  {svc.technologies.map((t) => <WhiteBadge key={t} text={t} />)}
                </div>
              </motion.div>
            )}

            {svc.principles && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-4">Design Principles</p>
                <div className="flex flex-wrap gap-2">
                  {svc.principles.map((t) => <Badge key={t} text={t} />)}
                </div>
              </motion.div>
            )}

            {svc.benefits && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-6">Key Benefits</p>
                <h3 className="font-display font-bold text-foreground mb-8" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
                  Why It Matters for Your Business
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {svc.benefits.map((b, i) => (
                    <motion.div
                      key={b}
                      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <CheckItem text={b} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {svc.whyUs && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-6">Why Choose Thinkatic</p>
                <h3 className="font-display font-bold text-foreground mb-8" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
                  What Sets Us Apart
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {svc.whyUs.map((b, i) => (
                    <motion.div
                      key={b}
                      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <CheckItem text={b} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {svc.industries && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.25em] mb-4">Industries We Serve</p>
                <div className="flex flex-wrap gap-2">
                  {svc.industries.map((ind) => <WhiteBadge key={ind} text={ind} />)}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Related Services */}
      <section className="py-24 bg-[#FFFFFF] border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}
            className="mb-10"
          >
            <p className="text-xs font-mono uppercase tracking-[0.25em] mb-3" style={{ color: BLUE }}>Explore More</p>
            <h2 className="font-display font-bold text-foreground" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
              Related Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel, i) => (
              <motion.div
                key={rel.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/services/${rel.id}`}>
                  <div
                    className="group p-7 rounded-2xl flex flex-col gap-4 h-full cursor-pointer hover:border-border transition-all duration-300"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold tracking-[0.2em]" style={{ color: BLUE }}>{rel.number}</span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(33,78,207,0.16)" strokeWidth="2" strokeLinecap="round"
                        className="group-hover:stroke-white/60 transition-colors"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-foreground font-bold text-base mb-2 leading-snug group-hover:text-foreground transition-colors">{rel.title}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{rel.tagline}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <Link href="/services">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
                style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
              >
                View All Services
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-background border-t border-border relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(33,78,207,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-6"
            style={{ color: BLUE }}
          >
            Ready to Get Started?
          </motion.p>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.05 }}
            className="font-display font-bold text-foreground leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Let's Build Your<br />{svc.title} Solution
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mb-10"
          >
            Talk to our team and get a custom proposal tailored to your goals.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-foreground text-sm tracking-wide"
                style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)" }}
              >
                Book a Free Consultation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
              </motion.button>
            </Link>
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full font-bold text-sm"
                style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(33,78,207,0.12)", color: "rgba(255,255,255,0.75)" }}
              >
                See Pricing
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
