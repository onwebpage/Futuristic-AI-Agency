import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "wouter";
import { services, BLUE, BLUE_DIM, BLUE_BORDER } from "@/data/services-data";
import type { ServiceItem } from "@/data/services-data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
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
      style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
    >
      {text}
    </span>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}` }}
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm text-muted-foreground leading-snug">{text}</span>
    </div>
  );
}

function ServiceSection({ svc }: { svc: ServiceItem }) {
  return (
    <motion.div
      key={svc.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ delay: 0.05 }}
      className="relative"
      id={svc.id}
    >
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div
          className="px-8 md:px-12 py-10 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(71,163,255,0.03)" }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold tracking-[0.2em]" style={{ color: BLUE }}>
                  {svc.number}
                </span>
                <div className="h-px flex-1 max-w-[40px]" style={{ background: BLUE_BORDER }} />
              </div>
              <h2 className="font-display font-bold text-foreground mb-3 leading-[1.1]"
                style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)" }}>
                {svc.title}
              </h2>
              <p className="text-sm font-medium" style={{ color: BLUE }}>{svc.tagline}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <Link href={`/services/${svc.id}`}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs tracking-wider"
                  style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(33,78,207,0.12)", color: "#4B5563" }}
                >
                  LEARN MORE
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-foreground text-xs tracking-wider"
                  style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)" }}
                >
                  GET STARTED
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed mt-5 max-w-4xl">{svc.description}</p>
        </div>

        {/* What We Build / Services */}
        <div className="px-8 md:px-12 py-10">
          <h3 className="text-muted-foreground text-xs font-mono uppercase tracking-[0.2em] mb-6">
            {svc.id === "ai-consulting" ? "Our Services" : "What We Build"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {svc.whatWeBuild.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5 flex flex-col gap-2 hover:border-border transition-colors"
                style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: BLUE }} />
                  <p className="text-foreground font-semibold text-sm leading-snug">{item.title}</p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed pl-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom metadata row */}
        {(svc.technologies || svc.benefits || svc.whyUs || svc.industries || svc.principles || svc.fullServices || svc.process) && (
          <div
            className="px-8 md:px-12 py-8 border-t flex flex-col gap-8"
            style={{ borderColor: "rgba(33,78,207,0.04)", background: "rgba(0,0,0,0.2)" }}
          >
            {svc.process && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Development Process</p>
                <div className="flex flex-wrap gap-2">
                  {svc.process.map((p, i) => (
                    <div key={p} className="flex items-center gap-2">
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2"
                        style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#4B5563" }}
                      >
                        <span className="text-[9px] font-mono" style={{ color: BLUE }}>{String(i + 1).padStart(2, "0")}</span>
                        {p}
                      </span>
                      {i < svc.process!.length - 1 && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M6 3l2 2-2 2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {svc.fullServices && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Full Development Services</p>
                <div className="flex flex-wrap gap-2">
                  {svc.fullServices.map((t) => <WhiteBadge key={t} text={t} />)}
                </div>
              </div>
            )}
            {svc.technologies && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {svc.technologies.map((t) => <WhiteBadge key={t} text={t} />)}
                </div>
              </div>
            )}
            {svc.principles && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Design Principles</p>
                <div className="flex flex-wrap gap-2">
                  {svc.principles.map((t) => <Badge key={t} text={t} />)}
                </div>
              </div>
            )}
            {svc.benefits && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Key Benefits</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {svc.benefits.map((b) => <CheckItem key={b} text={b} />)}
                </div>
              </div>
            )}
            {svc.whyUs && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Why Choose Thinkatic</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {svc.whyUs.map((b) => <CheckItem key={b} text={b} />)}
                </div>
              </div>
            )}
            {svc.industries && (
              <div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.18em] mb-4">Industries We Serve</p>
                <div className="flex flex-wrap gap-2">
                  {svc.industries.map((ind) => <WhiteBadge key={ind} text={ind} />)}
                </div>
              </div>
            )}

            {/* Link to full detail page */}
            <div className="pt-2">
              <Link href={`/services/${svc.id}`}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: BLUE }}
                >
                  View full {svc.title} page
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-48 pb-24 bg-background relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#214ECF05_1px,transparent_1px),linear-gradient(to_bottom,#214ECF05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="text-primary font-bold tracking-widest text-sm uppercase mb-6">SERVICES</div>
            <h1 className="text-5xl md:text-8xl font-display font-bold text-foreground mb-8 leading-[1.0]">
              Everything You Need<br />to Build the Future
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              Full-stack AI development capabilities — from strategic consulting and machine learning to production-grade engineering and immersive design.
            </p>
          </motion.div>

          {/* Quick service nav — links to individual pages */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mt-12"
          >
            {services.map((svc) => (
              <Link
                key={svc.id}
                href={`/services/${svc.id}`}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all hover:bg-white/10 hover:text-foreground"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(33,78,207,0.06)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {svc.number} {svc.title.split(" ").slice(0, 3).join(" ")}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services list */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8">
          {services.map((svc) => (
            <ServiceSection key={svc.id} svc={svc} />
          ))}
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
            Ready to Build with AI?
          </motion.p>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.05 }}
            className="font-display font-bold text-foreground leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            Partner with Thinkatic to Build Intelligent Systems
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg leading-relaxed mb-10"
          >
            Scalable platforms, next-generation AI products, and world-class digital experiences that drive real business growth.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full font-bold text-foreground text-sm tracking-wider"
                style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)", boxShadow: "0 0 30px rgba(71,163,255,0.25)" }}
              >
                START YOUR PROJECT
              </motion.button>
            </Link>
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full font-bold text-sm tracking-wider transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(33,78,207,0.12)", color: "rgba(255,255,255,0.65)" }}
              >
                VIEW PRICING
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
