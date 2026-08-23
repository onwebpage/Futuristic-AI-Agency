/**
 * CookieBanner — GDPR-compliant cookie consent banner.
 * Stores consent in localStorage. No external libraries.
 * Only loads analytics after explicit consent.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield } from "lucide-react";
import { Link } from "wouter";

const STORAGE_KEY = "thinkatic_cookie_consent";
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export type ConsentState = "pending" | "accepted" | "declined" | "partial";

export interface CookiePreferences {
  necessary: true;     // always true — cannot be toggled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

function getStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

function storeConsent(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function useConsentState() {
  const stored = getStoredConsent();
  return {
    hasConsented: stored !== null,
    consent: stored,
    acceptAll: () => {
      const prefs: CookiePreferences = { necessary: true, analytics: true, marketing: true, preferences: true };
      storeConsent(prefs);
      return prefs;
    },
    declineAll: () => {
      const prefs: CookiePreferences = { necessary: true, analytics: false, marketing: false, preferences: false };
      storeConsent(prefs);
      return prefs;
    },
  };
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Small delay so it doesn't pop instantly on page load
    const t = setTimeout(() => {
      if (!getStoredConsent()) setVisible(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleAcceptAll = () => {
    const full: CookiePreferences = { necessary: true, analytics: true, marketing: true, preferences: true };
    storeConsent(full);
    setPrefs(full);
    setVisible(false);
    // Fire analytics init if accepted
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: full }));
  };

  const handleDecline = () => {
    const minimal: CookiePreferences = { necessary: true, analytics: false, marketing: false, preferences: false };
    storeConsent(minimal);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: minimal }));
  };

  const handleSavePrefs = () => {
    storeConsent(prefs);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: prefs }));
  };

  const toggle = (key: keyof Omit<CookiePreferences, "necessary">) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          aria-describedby="cookie-desc"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[100]"
        >
          <div
            className="rounded-2xl border p-5 shadow-2xl"
            style={{
              background: "rgba(8,8,14,0.97)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(255,255,255,0.10)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(71,163,255,0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(71,163,255,0.12)" }}>
                  <Cookie size={13} className="text-[#47A3FF]" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold text-white">Cookie Preferences</span>
              </div>
              <button
                onClick={handleDecline}
                className="text-white/30 hover:text-white/60 transition-colors shrink-0 -mt-0.5"
                aria-label="Close cookie banner"
              >
                <X size={15} />
              </button>
            </div>

            {/* Description */}
            <p id="cookie-desc" className="text-xs text-white/45 leading-relaxed mb-4">
              We use cookies to improve your experience. Essential cookies are always active.{" "}
              <Link href="/cookie-policy" className="text-[#47A3FF] underline underline-offset-2 hover:text-[#47A3FF]/80">
                Learn more
              </Link>
            </p>

            {/* Expanded preferences */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex flex-col gap-2.5 pb-1">
                    {([
                        { key: "necessary" as const,   label: "Necessary",   desc: "Core site functionality. Always on.", locked: true  as const },
                        { key: "analytics" as const,   label: "Analytics",   desc: "Usage metrics to improve the site.", locked: false as const },
                        { key: "marketing" as const,   label: "Marketing",   desc: "Personalised ads & remarketing.", locked: false as const },
                        { key: "preferences" as const, label: "Preferences", desc: "Remember your settings.", locked: false as const },
                      ] as const).map(({ key, label, desc, locked }) => (
                      <div key={key} className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => { if (!locked) toggle(key as "analytics" | "marketing" | "preferences"); }}
                          role="switch"
                          aria-checked={prefs[key]}
                          aria-label={`${label} cookies`}
                          className="relative shrink-0 mt-0.5 w-8 h-4 rounded-full transition-all duration-200 disabled:opacity-60"
                          style={{
                            background: prefs[key] ? "#47A3FF" : "rgba(255,255,255,0.10)",
                          }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200"
                            style={{ transform: prefs[key] ? "translateX(16px)" : "translateX(0)" }}
                          />
                        </button>
                        <div>
                          <p className="text-xs font-medium text-white/80">{label}{locked && " (Required)"}</p>
                          <p className="text-[11px] text-white/30">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetails(v => !v)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  {showDetails ? "Hide" : "Preferences"}
                </button>
                {showDetails ? (
                  <button
                    onClick={handleSavePrefs}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white border border-[#47A3FF]/40 hover:border-[#47A3FF]/70 transition-all"
                    style={{ background: "rgba(71,163,255,0.10)" }}
                  >
                    Save Choices
                  </button>
                ) : (
                  <button
                    onClick={handleDecline}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  >
                    Decline
                  </button>
                )}
              </div>
              <button
                onClick={handleAcceptAll}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#47A3FF,#4040E8)", boxShadow: "0 0 16px rgba(71,163,255,0.2)" }}
              >
                Accept All
              </button>
            </div>

            {/* Trust note */}
            <p className="flex items-center gap-1.5 mt-3 text-[10px] text-white/20">
              <Shield size={9} aria-hidden="true" />
              GDPR compliant · Data never sold
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
