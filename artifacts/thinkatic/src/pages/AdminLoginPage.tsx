import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json() as { token?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", data.token!);
      localStorage.setItem("admin_username", data.token ? username : "");
      setLocation("/admin");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(33,78,207,0.18), transparent 34%), #070B16",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: "linear-gradient(rgba(71,163,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(71,163,255,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
      />
      <div className="absolute -top-48 -right-40 w-[560px] h-[560px] rounded-full border border-primary/10 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-5">
            <div className="rounded-2xl bg-white/95 px-2.5 py-1.5 ring-1 ring-blue-200/40 shadow-[0_8px_28px_rgba(71,163,255,0.16)] scale-[0.78] sm:scale-[0.88] lg:scale-100 origin-center">
              <BrandLogo larger className="rounded-xl" />
            </div>
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-blue-300 mb-3">
            Secure Operations Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Admin Panel</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#A8B4C7" }}>
            Sign in to manage your leads and site data
          </p>
        </div>

        <div
          className="rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
          style={{
            background: "rgba(15,23,42,0.86)",
            borderColor: "rgba(148,163,184,0.18)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200">Username</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7DB4FF" }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(148,163,184,0.24)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #214ECF";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(33,78,207,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(148,163,184,0.24)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-200">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7DB4FF" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(148,163,184,0.24)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #214ECF";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(33,78,207,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(148,163,184,0.24)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ color: "#A8B4C7" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(248,113,113,0.12)", color: "#FCA5A5", border: "1px solid rgba(248,113,113,0.28)" }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 py-3.5 rounded-2xl font-bold text-white text-sm tracking-[0.08em] transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #214ECF, #214ECF)",
                boxShadow: "0 0 24px rgba(33,78,207,0.24)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          Thinkatic Admin · Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
