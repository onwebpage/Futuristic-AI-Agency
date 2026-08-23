import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

type SubSection = { heading: string; body?: string; bullets?: string[]; note?: string };
type Section = {
  title: string;
  body?: string;
  bullets?: string[];
  note?: string;
  subsections?: SubSection[];
};

const sections: Section[] = [
  {
    title: "Services",
    body: "Thinkatic provides:",
    bullets: [
      "AI development", "Software engineering", "SaaS solutions", "Automation systems",
      "APIs", "Consulting", "Cybersecurity services", "Cloud integrations", "Technical support",
    ],
  },
  {
    title: "Eligibility",
    body: "You must be at least 18 years old and legally capable of entering agreements.",
  },
  {
    title: "Client Responsibilities",
    body: "Clients agree to:",
    bullets: [
      "Provide accurate information",
      "Cooperate during project execution",
      "Review deliverables timely",
      "Ensure lawful use of services",
      "Maintain credentials securely",
    ],
  },
  {
    title: "Payments & Billing Terms",
    subsections: [
      {
        heading: "4.1 Pricing",
        body: "Project pricing may include:",
        bullets: [
          "Fixed pricing", "Hourly billing", "Monthly retainers", "Milestone payments", "Subscription fees",
        ],
      },
      {
        heading: "4.2 Payment Schedule",
        body: "Unless otherwise agreed:",
        bullets: [
          "50% advance before project initiation",
          "25% during development milestone",
          "25% before final deployment",
        ],
        note: "Subscription services are billed monthly or annually.",
      },
      {
        heading: "4.3 Payment Timeline",
        body: "Invoices must be paid within:",
        bullets: ["7 days for startups/small businesses", "15 days for enterprise clients"],
        note: "Late payments may result in service suspension, delayed delivery, additional charges, or legal recovery proceedings.",
      },
      {
        heading: "4.4 Refund Policy",
        body: "Payments are generally non-refundable once work begins. Refunds may be considered only if:",
        bullets: [
          "Thinkatic fails to initiate the project",
          "Duplicate payments occur",
          "Legal requirements mandate refunds",
        ],
        note: "No refunds for completed milestones.",
      },
    ],
  },
  {
    title: "Intellectual Property",
    body: "Unless otherwise agreed:",
    bullets: [
      "Clients own fully paid custom deliverables",
      "Thinkatic retains ownership of internal frameworks, reusable libraries, AI systems, and proprietary tools",
    ],
  },
  {
    title: "Confidentiality",
    body: "Both parties agree to protect confidential information. Non-disclosure obligations survive project termination.",
  },
  {
    title: "Delivery Timelines",
    body: "Estimated timelines depend on:",
    bullets: [
      "Scope changes", "Client approvals", "Third-party dependencies", "Technical complexity",
    ],
    note: "Delays caused by clients may extend deadlines.",
  },
  {
    title: "Revisions Policy",
    body: "Standard projects include limited revision rounds unless otherwise stated in proposal documents. Major scope changes require additional billing.",
  },
  {
    title: "Acceptable Use",
    body: "You may not use Thinkatic services for:",
    bullets: [
      "Illegal activities", "Malware creation", "Hacking", "Fraud", "Spam",
      "Exploitation", "Hate speech", "Intellectual property infringement",
    ],
  },
  {
    title: "AI Usage Terms",
    body: "AI outputs may:",
    bullets: ["Require human review", "Produce unexpected results", "Contain inaccuracies"],
    note: "Clients assume responsibility for final usage decisions.",
  },
  {
    title: "Limitation of Liability",
    body: "Thinkatic shall not be liable for:",
    bullets: [
      "Indirect damages", "Lost profits", "Data loss", "Business interruption", "Third-party failures",
    ],
    note: "Maximum liability shall not exceed the amount paid for services.",
  },
  {
    title: "Termination",
    body: "We may terminate services for:",
    bullets: ["Policy violations", "Non-payment", "Abuse", "Illegal activities"],
    note: "Clients may terminate projects subject to outstanding dues.",
  },
  {
    title: "Governing Law",
    body: "These Terms are governed by laws applicable in India unless otherwise contractually agreed.",
  },
  {
    title: "Contact",
    body: "Email: thinkaticai@gmail.com\nWebsite: www.thinkatic.com",
  },
];

function SectionBlock({ s, index }: { s: Section; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      transition={{ delay: index * 0.04 }}
      className="border-t pt-10"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      <h2 className="text-white font-bold text-xl mb-5">
        {String(index + 1).padStart(2, "0")}. {s.title}
      </h2>
      {s.subsections ? (
        <div className="flex flex-col gap-7">
          {s.subsections.map((sub) => (
            <div key={sub.heading}>
              <p className="text-white/70 font-semibold text-sm mb-3">{sub.heading}</p>
              {sub.body && <p className="text-white/50 text-sm mb-3 leading-relaxed">{sub.body}</p>}
              {sub.bullets && (
                <ul className="flex flex-col gap-1.5 mb-3 pl-4">
                  {sub.bullets.map((b) => (
                    <li key={b} className="text-white/50 text-sm flex items-start gap-2">
                      <span className="text-[#3B82F6] mt-1.5 flex-shrink-0">•</span>{b}
                    </li>
                  ))}
                </ul>
              )}
              {sub.note && <p className="text-white/35 text-sm italic">{sub.note}</p>}
            </div>
          ))}
        </div>
      ) : (
        <>
          {s.body && <p className="text-white/50 text-sm mb-4 leading-relaxed whitespace-pre-line">{s.body}</p>}
          {s.bullets && (
            <ul className="flex flex-col gap-1.5 mb-4 pl-4">
              {s.bullets.map((b) => (
                <li key={b} className="text-white/50 text-sm flex items-start gap-2">
                  <span className="text-[#3B82F6] mt-1.5 flex-shrink-0">•</span>{b}
                </li>
              ))}
            </ul>
          )}
          {s.note && <p className="text-white/35 text-sm italic">{s.note}</p>}
        </>
      )}
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <Layout>
      <section className="pt-40 pb-24 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-4" style={{ color: "#3B82F6" }}>
            Legal
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }}
            className="font-display font-bold text-white mb-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Terms of Service
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-white/40 text-sm font-mono mb-6">
            Effective Date: 01st May 2026
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.15 }}
            className="text-white/60 text-base leading-relaxed mb-16 max-w-2xl">
            By accessing or using Thinkatic services, you agree to these Terms of Use. Please read them carefully before engaging our services.
          </motion.p>

          <div className="flex flex-col gap-10">
            {sections.map((s, i) => (
              <SectionBlock key={s.title} s={s} index={i} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
