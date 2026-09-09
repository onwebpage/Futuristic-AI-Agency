import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Share2,
} from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

export default function UserAuthPage() {
  const [location, setLocation] = useLocation();
  const isSignupMode = location.includes("signup");
  const [mode, setMode] = useState<"login" | "signup">(isSignupMode ? "signup" : "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check URL params for referral code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      setMode("signup");
    }
  }, []);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (token) {
      const storedProfile = localStorage.getItem("user_profile");
      const role = storedProfile ? (JSON.parse(storedProfile) as { role?: string }).role : undefined;
      setLocation(role === "partner" || role === "bpo_partner" ? "/partner" : "/dashboard");
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/user/auth/signup" : "/api/user/auth/login";
      const payload: Record<string, string> = { email, password };
      if (mode === "signup") {
        if (fullName) payload.fullName = fullName;
        if (referralCode) payload.referralCode = referralCode;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const rawBody = await res.text();
      let data: { success?: boolean; token?: string; profile?: unknown; message?: string; error?: string } = {};
      if (rawBody.trim()) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          throw new Error(`Authentication service returned an invalid response (${res.status}).`);
        }
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || `Authentication failed (${res.status}). Please try again.`);
      }

      if (!data.token || !data.profile) {
        throw new Error("Authentication service returned an incomplete login response.");
      }

      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user_profile", JSON.stringify(data.profile));

      setSuccessMessage(mode === "signup" ? "Account created successfully! Redirecting..." : "Login successful! Redirecting...");
      setTimeout(() => {
        const role = (data.profile as { role?: string }).role;
        setLocation(role === "partner" || role === "bpo_partner" ? "/partner" : "/dashboard");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans"
      style={{
        background: "radial-gradient(circle at 12% 18%, rgba(33,78,207,0.12), transparent 30%), radial-gradient(circle at 88% 82%, rgba(71,163,255,0.10), transparent 32%), #F4F7FF",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ backgroundImage: "linear-gradient(rgba(33,78,207,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(33,78,207,0.05) 1px, transparent 1px)", backgroundSize: "44px 44px" }}
      />
      <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full border border-blue-200/40 pointer-events-none" />
      <div className="absolute -bottom-48 -left-40 w-[560px] h-[560px] rounded-full border border-blue-200/30 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-7">
          <BrandLogo larger />
        </Link>
        <p className="text-center text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-blue-700 mb-3">
          Thinkatic Enterprise Portal
        </p>
        <h2 className="text-center text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
          {mode === "signup" ? "Create Client Account" : "Sign in to Client Portal"}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
          Access your enterprise AI projects, attendance, KYC, and wallet.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 py-8 px-6 shadow-[0_24px_70px_rgba(30,64,175,0.14)] sm:rounded-3xl sm:px-10 border border-blue-100/80 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex gap-1 p-1 mb-7 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all relative ${
                mode === "login" ? "text-blue-700 bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
              {mode === "login" && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-x-3 bottom-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all relative ${
                mode === "signup" ? "text-blue-700 bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
              {mode === "signup" && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-x-3 bottom-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700"
              >
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">
                  Password
                </label>
                {mode === "login" && (
                  <span className="text-[11px] font-medium text-slate-400">Default: password123</span>
                )}
              </div>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-[11px] text-slate-400">Minimum 6 characters</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                    <Share2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="THINK-ABC123"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all uppercase tracking-wider"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_10px_24px_rgba(33,78,207,0.24)] text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === "signup" ? (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  Don't have an enterprise account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage("");
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Sign up now
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-blue-600" />
          <span>Protected by Supabase Row-Level Security & Enterprise Encryption</span>
        </div>
      </div>
    </div>
  );
}
