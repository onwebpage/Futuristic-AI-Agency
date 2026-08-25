import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const sections = [
  {
    title: "Information We Collect",
    subsections: [
      {
        heading: "1.1 Personal Information",
        body: "We may collect:",
        bullets: [
          "Full name", "Email address", "Phone number", "Company name", "Job title",
          "Billing information", "Payment details", "Address and country",
          "Tax/GST/VAT information", "Identity verification details", "Communication records",
        ],
      },
      {
        heading: "1.2 Technical Information",
        body: "We automatically collect:",
        bullets: [
          "IP address", "Browser type", "Device information", "Operating system",
          "Referral URLs", "Cookies and tracking identifiers", "Session duration",
          "Usage analytics", "AI interaction logs",
        ],
      },
      {
        heading: "1.3 Client Project Data",
        body: "When using Thinkatic services, we may process:",
        bullets: [
          "Documents", "Source code", "APIs", "Databases", "AI training datasets",
          "Business workflows", "Application files", "Cloud infrastructure information",
        ],
        note: "Clients retain ownership of their data.",
      },
    ],
  },
  {
    title: "How We Use Information",
    body: "We use information to:",
    bullets: [
      "Provide AI and software development services",
      "Process payments",
      "Improve products and infrastructure",
      "Maintain security",
      "Prevent fraud and abuse",
      "Respond to inquiries",
      "Deliver customer support",
      "Send invoices and legal notices",
      "Conduct analytics and performance optimization",
      "Comply with laws and regulations",
      "Train internal operational systems (unless contractually restricted)",
    ],
  },
  {
    title: "Cookies & Tracking Technologies",
    body: "We use:",
    bullets: [
      "Essential cookies", "Analytics cookies", "Performance cookies",
      "Security cookies", "Marketing cookies", "Third-party tracking tools",
    ],
    note: "You may disable cookies through browser settings.",
  },
  {
    title: "Sharing of Information",
    body: "We may share data with:",
    bullets: [
      "Payment processors", "Cloud hosting providers", "Security vendors",
      "Analytics providers", "Legal authorities when required",
      "Contractors and employees under confidentiality obligations",
    ],
    note: "We do not sell personal information.",
  },
  {
    title: "International Data Transfers",
    body: "Your data may be processed in:",
    bullets: ["India", "United States", "Europe", "Other operational jurisdictions"],
    note: "By using our services, you consent to international data transfers.",
  },
  {
    title: "Data Retention",
    body: "We retain information:",
    bullets: [
      "As long as necessary for business purposes",
      "For legal compliance",
      "For dispute resolution",
      "For accounting and taxation requirements",
    ],
    note: "Project data may be deleted after project termination unless otherwise agreed.",
  },
  {
    title: "Security Measures",
    body: "We implement:",
    bullets: [
      "Encryption", "Access control systems", "Firewalls",
      "Secure cloud infrastructure", "Monitoring systems", "Internal confidentiality agreements",
    ],
    note: "However, no system is 100% secure.",
  },
  {
    title: "Your Rights",
    body: "Depending on your jurisdiction, you may:",
    bullets: [
      "Access your data", "Correct inaccurate data", "Request deletion",
      "Object to processing", "Withdraw consent", "Request portability",
      "File complaints with regulators",
    ],
    note: "Requests can be sent to: thinkaticai@gmail.com",
  },
  {
    title: "Third-Party Services",
    body: "Our website may contain links to third-party websites and platforms. We are not responsible for their policies or practices.",
  },
  {
    title: "Children's Privacy",
    body: "Our services are not intended for individuals under 18 years of age.",
  },
  {
    title: "AI & Automation Disclaimer",
    body: "Thinkatic develops and deploys AI systems. AI-generated outputs:",
    bullets: [
      "May contain inaccuracies",
      "Require human verification",
      "Should not solely be relied upon for legal, medical, financial, or critical decisions",
    ],
    note: "Clients are responsible for reviewing AI-generated results.",
  },
  {
    title: "Changes to Privacy Policy",
    body: "We may update this policy anytime. Continued use of services constitutes acceptance of changes.",
  },
  {
    title: "Contact Information",
    body: "Thinkatic\nEmail: thinkaticai@gmail.com\nWebsite: www.thinkatic.com",
  },
];

type Section = {
  title: string;
  body?: string;
  bullets?: string[];
  note?: string;
  subsections?: {
    heading: string;
    body?: string;
    bullets?: string[];
    note?: string;
  }[];
};

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
      <h2 className="text-foreground font-bold text-xl mb-5">
        {String(index + 1).padStart(2, "0")}. {s.title}
      </h2>

      {s.subsections ? (
        <div className="flex flex-col gap-7">
          {s.subsections.map((sub) => (
            <div key={sub.heading}>
              <p className="text-muted-foreground font-semibold text-sm mb-3">{sub.heading}</p>
              {sub.body && <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{sub.body}</p>}
              {sub.bullets && (
                <ul className="flex flex-col gap-1.5 mb-3 pl-4">
                  {sub.bullets.map((b) => (
                    <li key={b} className="text-muted-foreground text-sm flex items-start gap-2">
                      <span className="text-[#214ECF] mt-1.5 flex-shrink-0">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {sub.note && <p className="text-muted-foreground text-sm italic">{sub.note}</p>}
            </div>
          ))}
        </div>
      ) : (
        <>
          {s.body && <p className="text-muted-foreground text-sm mb-4 leading-relaxed whitespace-pre-line">{s.body}</p>}
          {s.bullets && (
            <ul className="flex flex-col gap-1.5 mb-4 pl-4">
              {s.bullets.map((b) => (
                <li key={b} className="text-muted-foreground text-sm flex items-start gap-2">
                  <span className="text-[#214ECF] mt-1.5 flex-shrink-0">•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {s.note && <p className="text-muted-foreground text-sm italic">{s.note}</p>}
        </>
      )}
    </motion.div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <section className="pt-40 pb-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-4" style={{ color: "#214ECF" }}>
            Legal
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }}
            className="font-display font-bold text-foreground mb-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Privacy Policy
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm font-mono mb-6">
            Last Updated: 01st May 2026
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.15 }}
            className="text-muted-foreground text-base leading-relaxed mb-16 max-w-2xl">
            Welcome to Thinkatic. This Privacy Policy explains how we collect, use, disclose, process, and protect your information when you use our website, products, software, AI solutions, applications, APIs, consulting services, and related platforms. By using our website or services, you agree to this Privacy Policy.
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
