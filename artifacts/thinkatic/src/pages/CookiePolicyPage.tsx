import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    desc: "Required for core website functionality. These cookies cannot be disabled as the site will not work without them.",
  },
  {
    name: "Analytics Cookies",
    required: false,
    desc: "Help us understand user behavior and improve services. Data is collected anonymously to measure site performance.",
  },
  {
    name: "Functional Cookies",
    required: false,
    desc: "Remember preferences and settings to provide a more personalised experience.",
  },
  {
    name: "Security Cookies",
    required: true,
    desc: "Protect against fraud and malicious activities, keeping your session and data safe.",
  },
  {
    name: "Marketing Cookies",
    required: false,
    desc: "Used for advertising and remarketing campaigns to show relevant content and promotions.",
  },
];

const thirdParties = [
  "Google Analytics", "Meta Pixel", "LinkedIn Insights",
  "Cloudflare", "CRM systems", "Marketing automation platforms",
];

export default function CookiePolicyPage() {
  return (
    <Layout>
      <section className="pt-40 pb-24 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-4" style={{ color: "#47A3FF" }}>
            Legal
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }}
            className="font-display font-bold text-white mb-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Cookie Policy
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-white/40 text-sm font-mono mb-6">
            Effective Date: 01st May 2026
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.15 }}
            className="text-white/60 text-base leading-relaxed mb-16 max-w-2xl">
            This Cookie Policy explains how Thinkatic uses cookies and similar technologies on our website and services.
          </motion.p>

          {/* Section 1 */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border-t pt-10 mb-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-white font-bold text-xl mb-5">01. What Are Cookies?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Cookies are small files stored on your device to improve user experience and website performance. They help us remember your preferences, analyse site traffic, and provide relevant content.
            </p>
          </motion.div>

          {/* Section 2 — Cookie types */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border-t pt-10 mb-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-white font-bold text-xl mb-8">02. Types of Cookies We Use</h2>
            <div className="flex flex-col gap-4">
              {cookieTypes.map((ct, i) => (
                <motion.div key={ct.name}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-7 flex flex-col gap-3"
                  style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm">{ct.name}</h3>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider"
                      style={{
                        background: ct.required ? "rgba(71,163,255,0.12)" : "rgba(255,255,255,0.05)",
                        color: ct.required ? "#47A3FF" : "rgba(255,255,255,0.35)",
                        border: `1px solid ${ct.required ? "rgba(71,163,255,0.2)" : "rgba(255,255,255,0.08)"}`,
                      }}>
                      {ct.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{ct.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 3 — Third-party */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border-t pt-10 mb-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-white font-bold text-xl mb-5">03. Third-Party Cookies</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-5">We may use the following third-party services that set their own cookies:</p>
            <div className="flex flex-wrap gap-2">
              {thirdParties.map((tp) => (
                <span key={tp} className="px-3 py-1.5 rounded-full text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {tp}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Section 4 — Managing */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border-t pt-10 mb-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-white font-bold text-xl mb-5">04. Managing Cookies</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">Users can:</p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {["Disable cookies", "Delete cookies", "Modify browser settings"].map((b) => (
                <li key={b} className="text-white/50 text-sm flex items-start gap-2">
                  <span className="text-[#47A3FF] mt-1.5 flex-shrink-0">•</span>{b}
                </li>
              ))}
            </ul>
            <p className="text-white/35 text-sm italic mt-4">Disabling cookies may affect functionality.</p>
          </motion.div>

          {/* Section 5 — Consent */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-white font-bold text-xl mb-5">05. Consent</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              By continuing to use the Thinkatic website, you consent to our use of cookies in accordance with this Cookie Policy.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
