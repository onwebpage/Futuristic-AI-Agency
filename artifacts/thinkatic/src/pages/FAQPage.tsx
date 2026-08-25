import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const faqs = [
  {
    q: "What does Thinkatic do?",
    a: "Thinkatic is an AI and software development company providing AI solutions, SaaS platforms, automation systems, cybersecurity services, cloud applications, APIs, and enterprise software.",
  },
  {
    q: "Which countries do you serve?",
    a: "We work with clients globally including the United States, India, Europe, Middle East, and other regions.",
  },
  {
    q: "How long does a project take?",
    a: "Typical timelines:\n\n• Small AI tools: 2–6 weeks\n• SaaS products: 2–6 months\n• Enterprise systems: 6–18 months\n\nActual timelines depend on scope and approvals.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We may accept:\n\n• Bank transfers\n• Wire transfers\n• UPI\n• Credit/debit cards\n• Stripe\n• PayPal\n• Cryptocurrency (where legally permitted)",
  },
  {
    q: "Do you provide support after deployment?",
    a: "Yes. Support plans may include:\n\n• Bug fixes\n• Maintenance\n• Security updates\n• Server monitoring\n• Feature enhancements",
  },
  {
    q: "Who owns the project after completion?",
    a: "Clients generally own custom-developed deliverables after full payment. Thinkatic retains ownership of its internal frameworks, reusable libraries, and proprietary tooling.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes. We can sign Non-Disclosure Agreements before discussing confidential projects.",
  },
  {
    q: "Can Thinkatic build AI products?",
    a: "Yes. We specialise in:\n\n• Generative AI\n• AI agents\n• Automation\n• Computer vision\n• NLP systems\n• Predictive analytics\n• AI SaaS products",
  },
  {
    q: "Do you offer cybersecurity services?",
    a: "Yes. We offer:\n\n• Security audits\n• Vulnerability assessments\n• Secure architecture consulting\n• Cloud security solutions",
  },
  {
    q: "What happens if a client delays approvals?",
    a: "Project timelines may automatically extend proportionally to the delay caused by client approvals or feedback.",
  },
  {
    q: "Are refunds available?",
    a: "Refunds are limited and subject to contract terms. Payments are generally non-refundable once work begins. Refunds may be considered if Thinkatic fails to initiate a project, duplicate payments occur, or legal requirements mandate them.",
  },
  {
    q: "Do you provide source code?",
    a: "Yes, unless otherwise agreed in the contract. Full source code is delivered to clients upon final payment.",
  },
  {
    q: "Can project scope change during development?",
    a: "Yes, but additional scope may require revised pricing and timelines. Major changes are documented and agreed upon before implementation.",
  },
  {
    q: "How can I contact Thinkatic?",
    a: "Website: www.thinkatic.com\nEmail: thinkaticai@gmail.com",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      transition={{ delay: index * 0.04 }}
      className="border-b cursor-pointer group"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between py-6 gap-6">
        <div className="flex items-start gap-5">
          <span className="text-[10px] font-mono pt-1 flex-shrink-0" style={{ color: "rgba(33,78,207,0.16)" }}>
            / {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-foreground font-semibold text-base leading-snug group-hover:text-[#214ECF] transition-colors">
            {q}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: open ? "#214ECF" : "rgba(33,78,207,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={open ? "white" : "rgba(255,255,255,0.6)"} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground leading-relaxed pb-7 pl-9 pr-12 whitespace-pre-line text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  return (
    <Layout>
      <section className="pt-40 pb-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-4" style={{ color: "#214ECF" }}>
            Help Center
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }}
            className="font-display font-bold text-foreground mb-6 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Frequently Asked<br />Questions
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg leading-relaxed mb-16 max-w-xl">
            Everything you need to know about Thinkatic — services, pricing, process, and how to work with us.
          </motion.p>

          <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>

          {/* Still have questions CTA */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mt-20 rounded-2xl p-10 text-center"
            style={{ background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(33,78,207,0.1)", border: "1px solid rgba(33,78,207,0.18)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#214ECF" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-foreground font-bold text-xl mb-3">Still have questions?</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Our team is happy to help. Send us a message and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-full font-bold text-foreground text-sm"
                  style={{ background: "linear-gradient(135deg, #214ECF 0%, #214ECF 100%)" }}>
                  Contact Us
                </motion.button>
              </Link>
              <a href="mailto:thinkaticai@gmail.com"
                className="px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(33,78,207,0.12)", color: "#4B5563" }}>
                thinkaticai@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
