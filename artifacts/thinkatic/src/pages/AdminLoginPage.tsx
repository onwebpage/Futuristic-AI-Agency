import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#FFFFFF" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md px-6"
      >
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg viewBox="0 0 22 26" width="22" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradLogin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#214ECF" />
                  <stop offset="100%" stopColor="#214ECF" />
                </linearGradient>
              </defs>
              <path d="M0 0 H13 V5 H6 V26 H0 Z" fill="url(#logoGradLogin)" />
              <path d="M15 0 H22 V5 H15 Z" fill="url(#logoGradLogin)" opacity="0.75" />
            </svg>
            <span className="text-xl font-bold text-foreground tracking-tight">Thinkatic</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-sm" style={{ color: "#4B5563" }}>
            Sign in to manage your leads and site data
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(244,247,255,0.8)",
            border: "1px solid rgba(33,78,207,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#4B5563" }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-foreground text-sm focus:outline-none transition-all"
                  style={{
                    background: "rgba(33,78,207,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #214ECF";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(33,78,207,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#4B5563" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-foreground text-sm focus:outline-none transition-all"
                  style={{
                    background: "rgba(33,78,207,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #214ECF";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(33,78,207,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#4B5563" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,50,50,0.1)", color: "#ff6b6b", border: "1px solid rgba(255,50,50,0.2)" }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 py-3 rounded-xl font-bold text-foreground text-sm tracking-wider transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #214ECF, #214ECF)",
                boxShadow: "0 0 24px rgba(33,78,207,0.24)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Thinkatic Admin · Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
