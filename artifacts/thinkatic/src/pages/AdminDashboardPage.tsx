import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Download,
  Trash2,
  ChevronDown,
  X,
  Check,
  Eye,
  StickyNote,
  RefreshCw,
  Tag,
  Plus,
  Pencil,
  DollarSign,
  Star,
  Clock,
  ShieldCheck,
  Share2,
  Wallet,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

type Submission = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  status: string;
  notes: string | null;
  source: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  today: number;
  thisWeek: number;
  byStatus: { status: string; count: number }[];
  byBudget: { budget: string | null; count: number }[];
};

type Plan = {
  id: number;
  serviceId: string;
  serviceNumber: string;
  category: string;
  name: string;
  price: number;
  tag: string;
  description: string;
  features: string[];
  popular: boolean;
  sortOrder: number;
};

type PlanFormData = {
  serviceId: string;
  serviceNumber: string;
  category: string;
  name: string;
  price: string;
  tag: string;
  description: string;
  features: string;
  popular: boolean;
};

type ClientUpdate = {
  id: number;
  userId: string;
  title: string;
  message: string;
  category: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type UpdateClient = {
  userId: string;
  clientName: string;
  email: string;
  assignedPlan: string | null;
  planPrice: number | null;
  planSeats: string | null;
  planStatus: string;
  lastUpdateSent: string | null;
  updateCount: number;
};

type UpdateFormData = {
  title: string;
  message: string;
  category: string;
  status: "draft" | "published";
};

const EMPTY_UPDATE_FORM: UpdateFormData = { title: "", message: "", category: "", status: "published" };

const EMPTY_PLAN_FORM: PlanFormData = {
  serviceId: "",
  serviceNumber: "",
  category: "",
  name: "",
  price: "",
  tag: "",
  description: "",
  features: "",
  popular: false,
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  contacted: { bg: "rgba(99,102,241,0.12)", text: "#818cf8" },
  qualified: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  closed_won: { bg: "rgba(59,130,246,0.18)", text: "#93c5fd" },
  closed_lost: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
};

const STATUS_OPTIONS = ["new", "contacted", "qualified", "closed_won", "closed_lost"];

function apiCall(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("admin_token");
  return fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: "rgba(33,78,207,0.06)", text: "rgba(255,255,255,0.5)" };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: colors.bg, color: colors.text }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(33,78,207,0.22)" }}>
        {label}
      </div>
      <div className="text-4xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "rgba(33,78,207,0.22)" }}>{sub}</div>}
    </motion.div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all"
        style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
        onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
        onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<
    "overview" | "leads" | "analytics" | "plans" | "client-updates" | "attendance" | "kyc" | "affiliates" | "wallets" | "settings"
  >("overview");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataError, setDataError] = useState("");

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [planForm, setPlanForm] = useState<PlanFormData>(EMPTY_PLAN_FORM);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Client updates state
  const [updateClients, setUpdateClients] = useState<UpdateClient[]>([]);
  const [updateClientsLoading, setUpdateClientsLoading] = useState(false);
  const [selectedUpdateClient, setSelectedUpdateClient] = useState<UpdateClient | null>(null);
  const [clientUpdateHistory, setClientUpdateHistory] = useState<ClientUpdate[]>([]);
  const [clientUpdatesLoading, setClientUpdatesLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState<UpdateFormData>(EMPTY_UPDATE_FORM);
  const [editingClientUpdate, setEditingClientUpdate] = useState<ClientUpdate | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [savingClientUpdate, setSavingClientUpdate] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // KYC state
  const [kycRecords, setKycRecords] = useState<any[]>([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycReviewModal, setKycReviewModal] = useState<{ id: number; name: string; action: "verified" | "rejected" } | null>(null);
  const [kycRejectReason, setKycRejectReason] = useState("");
  const [reviewingKyc, setReviewingKyc] = useState(false);

  // Affiliates state
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);

  // Wallets state
  const [walletsData, setWalletsData] = useState<{ wallets: any[]; recentTransactions: any[] }>({
    wallets: [],
    recentTransactions: [],
  });
  const [walletsLoading, setWalletsLoading] = useState(false);

  const adminUsername = localStorage.getItem("admin_username") ?? "admin";

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setLocation("/admin-login");
  };

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { setLocation("/admin-login"); return; }

    setLoading(true);
    setDataError("");
    try {
      const [subRes, statRes] = await Promise.all([
        apiCall("/admin/submissions"),
        apiCall("/admin/stats"),
      ]);

      if (subRes.status === 401 || statRes.status === 401) {
        logout();
        return;
      }

      if (!subRes.ok || !statRes.ok) {
        throw new Error("Unable to load dashboard data");
      }

      setSubmissions(await subRes.json() as Submission[]);
      setStats(await statRes.json() as Stats);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await apiCall("/admin/plans");
      if (res.status === 401) { logout(); return; }
      setPlans(await res.json() as Plan[]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const res = await apiCall("/admin/attendance");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setAttendanceRecords(await res.json());
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const loadKyc = useCallback(async () => {
    setKycLoading(true);
    try {
      const res = await apiCall("/admin/kyc");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setKycRecords(await res.json());
    } finally {
      setKycLoading(false);
    }
  }, []);

  const loadAffiliates = useCallback(async () => {
    setAffiliatesLoading(true);
    try {
      const res = await apiCall("/admin/affiliates");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setAffiliates(await res.json());
    } finally {
      setAffiliatesLoading(false);
    }
  }, []);

  const loadWallets = useCallback(async () => {
    setWalletsLoading(true);
    try {
      const res = await apiCall("/admin/wallets");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setWalletsData(await res.json());
    } finally {
      setWalletsLoading(false);
    }
  }, []);

  const loadUpdateClients = useCallback(async () => {
    setUpdateClientsLoading(true);
    try {
      const res = await apiCall("/admin/client-updates/clients");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setUpdateClients(await res.json());
    } finally {
      setUpdateClientsLoading(false);
    }
  }, []);

  const loadClientUpdateHistory = async (client: UpdateClient) => {
    setSelectedUpdateClient(client);
    setClientUpdatesLoading(true);
    try {
      const res = await apiCall(`/admin/client-updates/users/${client.userId}`);
      if (res.ok) setClientUpdateHistory(await res.json());
    } finally {
      setClientUpdatesLoading(false);
    }
  };

  const openClientUpdate = (client: UpdateClient, update?: ClientUpdate) => {
    setSelectedUpdateClient(client);
    setEditingClientUpdate(update ?? null);
    setUpdateForm(update
      ? { title: update.title, message: update.message, category: update.category ?? "", status: update.status }
      : EMPTY_UPDATE_FORM);
    setUpdateModalOpen(true);
  };

  const saveClientUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUpdateClient || !updateForm.title.trim() || !updateForm.message.trim()) return;
    setSavingClientUpdate(true);
    try {
      const path = editingClientUpdate
        ? `/admin/client-updates/${editingClientUpdate.id}`
        : "/admin/client-updates";
      const res = await apiCall(path, {
        method: editingClientUpdate ? "PATCH" : "POST",
        body: JSON.stringify({
          ...updateForm,
          userId: selectedUpdateClient.userId,
        }),
      });
      if (!res.ok) throw new Error("Unable to save client update");
      setUpdateModalOpen(false);
      await loadClientUpdateHistory(selectedUpdateClient);
      await loadUpdateClients();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to save client update");
    } finally {
      setSavingClientUpdate(false);
    }
  };

  const deleteClientUpdate = async (update: ClientUpdate) => {
    if (!confirm("Delete this client update permanently?")) return;
    const res = await apiCall(`/admin/client-updates/${update.id}`, { method: "DELETE" });
    if (!res.ok) { setDataError("Unable to delete client update"); return; }
    if (selectedUpdateClient) {
      await loadClientUpdateHistory(selectedUpdateClient);
      await loadUpdateClients();
    }
  };

  const handleReviewKyc = async (id: number, status: "verified" | "rejected", reason?: string) => {
    setReviewingKyc(true);
    try {
      const res = await apiCall(`/admin/kyc/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        setKycReviewModal(null);
        setKycRejectReason("");
        loadKyc();
      }
    } finally {
      setReviewingKyc(false);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (tab === "plans") loadPlans();
    if (tab === "attendance") loadAttendance();
    if (tab === "kyc") loadKyc();
    if (tab === "affiliates") loadAffiliates();
    if (tab === "wallets") loadWallets();
    if (tab === "client-updates") loadUpdateClients();
  }, [tab, loadPlans, loadAttendance, loadKyc, loadAffiliates, loadWallets, loadUpdateClients]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const updateSubmission = async (id: number, patch: { status?: string; notes?: string }) => {
    try {
      const res = await apiCall(`/admin/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Unable to update lead");
      const updated = await res.json() as Submission;
      setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (selected?.id === id) setSelected(updated);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update lead");
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      const res = await apiCall(`/admin/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Unable to delete lead");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to delete lead");
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/submissions-export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to export leads");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thinkatic-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to export leads");
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    try {
      await updateSubmission(selected.id, { notes: noteText });
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    try {
      const res = await apiCall("/admin/settings/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok) {
        setPwMessage({ type: "success", text: "Password changed successfully" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPwMessage({ type: "error", text: data.error ?? "Failed to change password" });
      }
    } catch {
      setPwMessage({ type: "error", text: "Connection error. Please try again." });
    }
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsAddingPlan(false);
    setPlanForm({
      serviceId: plan.serviceId,
      serviceNumber: plan.serviceNumber,
      category: plan.category,
      name: plan.name,
      price: String(plan.price),
      tag: plan.tag,
      description: plan.description,
      features: plan.features.join("\n"),
      popular: plan.popular,
    });
    setPlanMessage(null);
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    setIsAddingPlan(true);
    setPlanForm(EMPTY_PLAN_FORM);
    setPlanMessage(null);
  };

  const closePlanPanel = () => {
    setEditingPlan(null);
    setIsAddingPlan(false);
    setPlanMessage(null);
  };

  const savePlan = async () => {
    setSavingPlan(true);
    setPlanMessage(null);
    try {
      const payload = {
        ...planForm,
        price: Number(planForm.price),
        features: planForm.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      let res: Response;
      if (isAddingPlan) {
        res = await apiCall("/admin/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (editingPlan) {
        res = await apiCall(`/admin/plans/${editingPlan.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      const data = await res.json() as Plan & { error?: string };
      if (!res.ok) {
        setPlanMessage({ type: "error", text: data.error ?? "Failed to save plan" });
        return;
      }

      if (isAddingPlan) {
        setPlans((prev) => [...prev, data]);
        setPlanMessage({ type: "success", text: "Plan added successfully" });
        setTimeout(closePlanPanel, 1000);
      } else {
        setPlans((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        setPlanMessage({ type: "success", text: "Plan updated successfully" });
      }
    } finally {
      setSavingPlan(false);
    }
  };

  const deletePlan = async (id: number) => {
    if (!confirm("Delete this plan permanently? This cannot be undone.")) return;
    const res = await apiCall(`/admin/plans/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (editingPlan?.id === id) closePlanPanel();
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.company ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group plans by service category
  const groupedPlans = plans.reduce((acc, plan) => {
    if (!acc[plan.serviceId]) {
      acc[plan.serviceId] = {
        id: plan.serviceId,
        number: plan.serviceNumber,
        category: plan.category,
        plans: [] as Plan[],
      };
    }
    acc[plan.serviceId].plans.push(plan);
    return acc;
  }, {} as Record<string, { id: string; number: string; category: string; plans: Plan[] }>);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "plans", label: "Plans", icon: Tag },
    { id: "client-updates", label: "Client Updates", icon: MessageSquare },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "kyc", label: "KYC Review", icon: ShieldCheck },
    { id: "affiliates", label: "Affiliates", icon: Share2 },
    { id: "wallets", label: "Wallets", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const panelOpen = editingPlan !== null || isAddingPlan;

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFFFF", color: "#111827" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col py-8 px-4"
                  style={{ borderRight: "1px solid rgba(33,78,207,0.12)", background: "#F4F7FF" }}
      >
        <div className="px-2 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BrandLogo compact />
          </div>
          <div className="text-xs" style={{ color: "#4B5563" }}>Admin Panel</div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
              style={{
                background: tab === id ? "rgba(33,78,207,0.08)" : "transparent",
                color: tab === id ? "#214ECF" : "#4B5563",
                border: tab === id ? "1px solid rgba(33,78,207,0.18)" : "1px solid transparent",
              }}
            >
              <Icon size={16} />
              {label}
              {id === "leads" && submissions.filter((s) => s.status === "new").length > 0 && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#214ECF", color: "#fff" }}
                >
                  {submissions.filter((s) => s.status === "new").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4" style={{ borderTop: "1px solid rgba(33,78,207,0.04)" }}>
          <div className="px-3 py-2 text-xs" style={{ color: "#4B5563" }}>
            Signed in as <span className="text-foreground">{adminUsername}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all"
            style={{ color: "rgba(33,78,207,0.22)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(33,78,207,0.22)"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div
          className="px-8 py-5 flex items-center justify-between sticky top-0 z-10"
          style={{ borderBottom: "1px solid rgba(33,78,207,0.12)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}
        >
          <h1 className="text-lg font-bold text-foreground capitalize">
            {tab === "overview" ? "Dashboard Overview" : tab === "leads" ? "Lead Management" : tab === "analytics" ? "Analytics" : tab === "plans" ? "Plan Management" : tab === "client-updates" ? "Client Updates" : "Settings"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ color: "#4B5563", border: "1px solid rgba(33,78,207,0.06)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
            {tab === "leads" && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF", border: "1px solid rgba(33,78,207,0.18)" }}
              >
                <Download size={14} />
                Export CSV
              </button>
            )}
            {tab === "plans" && (
              <button
                onClick={openAddPlan}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF", border: "1px solid rgba(33,78,207,0.18)" }}
              >
                <Plus size={14} />
                Add New Plan
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {dataError && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#B91C1C", border: "1px solid rgba(239,68,68,0.2)" }}>
              {dataError}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full border-2 border-border border-t-blue-400 w-8 h-8" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {tab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Leads" value={stats?.total ?? 0} />
                    <StatCard label="New Today" value={stats?.today ?? 0} />
                    <StatCard label="This Week" value={stats?.thisWeek ?? 0} />
                    <StatCard
                      label="New Leads"
                      value={stats?.byStatus.find((s) => s.status === "new")?.count ?? 0}
                      sub="Awaiting contact"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(33,78,207,0.22)" }}>
                      Recent Submissions
                    </h2>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {submissions.slice(0, 5).length === 0 ? (
                        <div className="py-16 text-center" style={{ color: "#4B5563" }}>
                          No submissions yet. Share your contact form to start receiving leads.
                        </div>
                      ) : (
                        submissions.slice(0, 5).map((s, i) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between px-6 py-4 cursor-pointer transition-all"
                            style={{
                              borderBottom: i < 4 ? "1px solid rgba(33,78,207,0.04)" : "none",
                              background: "rgba(33,78,207,0.02)",
                            }}
                            onClick={() => { setSelected(s); setNoteText(s.notes ?? ""); setTab("leads"); }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(33,78,207,0.02)"; }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                                style={{ background: "rgba(33,78,207,0.1)", color: "#214ECF" }}
                              >
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-foreground text-sm">{s.name}</div>
                                <div className="text-xs" style={{ color: "#4B5563" }}>{s.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {s.budget && (
                                <span className="text-xs" style={{ color: "#4B5563" }}>{s.budget}</span>
                              )}
                              <StatusBadge status={s.status} />
                              <span className="text-xs" style={{ color: "rgba(33,78,207,0.16)" }}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Tab */}
              {tab === "leads" && (
                <div className="flex gap-6 h-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4B5563" }} />
                        <input
                          type="text"
                          placeholder="Search by name, email, company..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all"
                          style={{
                            background: "rgba(33,78,207,0.04)",
                            border: "1px solid rgba(33,78,207,0.06)",
                          }}
                          onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
                          onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(33,78,207,0.06)"; }}
                        />
                      </div>

                      <div className="relative">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="appearance-none pl-4 pr-8 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                          style={{
                            background: "rgba(33,78,207,0.04)",
                            border: "1px solid rgba(33,78,207,0.06)",
                            color: "#4B5563",
                          }}
                        >
                          <option value="all">All Status</option>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#4B5563" }} />
                      </div>

                      <span className="text-xs" style={{ color: "#4B5563" }}>
                        {filteredSubmissions.length} lead{filteredSubmissions.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      {filteredSubmissions.length === 0 ? (
                        <div className="py-20 text-center" style={{ color: "#4B5563" }}>
                          No leads match your filters.
                        </div>
                      ) : (
                        filteredSubmissions.map((s, i) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-all"
                            style={{
                              borderBottom: i < filteredSubmissions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                              background: selected?.id === s.id ? "rgba(71,163,255,0.04)" : "rgba(255,255,255,0.01)",
                            }}
                            onClick={() => { setSelected(s); setNoteText(s.notes ?? ""); }}
                            onMouseEnter={(e) => {
                              if (selected?.id !== s.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = selected?.id === s.id ? "rgba(71,163,255,0.04)" : "rgba(255,255,255,0.01)";
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                              style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF" }}
                            >
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm truncate">{s.name}</div>
                              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {s.email}{s.company ? ` · ${s.company}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {s.budget && (
                                <span className="text-xs hidden lg:block" style={{ color: "rgba(33,78,207,0.22)" }}>{s.budget}</span>
                              )}
                              <StatusBadge status={s.status} />
                              <span className="text-xs hidden md:block" style={{ color: "rgba(33,78,207,0.16)" }}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }}
                                className="p-1.5 rounded-lg transition-all"
                                style={{ color: "rgba(33,78,207,0.16)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(33,78,207,0.16)"; e.currentTarget.style.background = "transparent"; }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="w-80 flex-shrink-0 rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto"
                        style={{
                          background: "rgba(244,247,255,0.8)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          maxHeight: "calc(100vh - 140px)",
                          position: "sticky",
                          top: "80px",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                              style={{ background: "rgba(33,78,207,0.1)", color: "#214ECF" }}
                            >
                              {selected.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-sm">{selected.name}</div>
                              <div className="text-xs" style={{ color: "#4B5563" }}>{selected.email}</div>
                            </div>
                          </div>
                          <button onClick={() => setSelected(null)} style={{ color: "#4B5563" }}>
                            <X size={16} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {selected.company && (
                            <div>
                              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#4B5563" }}>Company</div>
                              <div className="text-sm text-foreground">{selected.company}</div>
                            </div>
                          )}
                          {selected.budget && (
                            <div>
                              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#4B5563" }}>Budget</div>
                              <div className="text-sm text-foreground">{selected.budget}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#4B5563" }}>Source</div>
                            <div className="text-sm text-foreground capitalize">{selected.source?.replace(/_/g, " ") ?? "contact form"}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#4B5563" }}>Received</div>
                            <div className="text-sm text-foreground">{new Date(selected.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "#4B5563" }}>Message</div>
                          <div
                            className="text-sm rounded-xl p-3"
                            style={{ background: "rgba(255,255,255,0.04)", color: "#4B5563", lineHeight: 1.6 }}
                          >
                            {selected.message}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "#4B5563" }}>Status</div>
                          <div className="relative">
                            <select
                              value={selected.status}
                              onChange={(e) => updateSubmission(selected.id, { status: e.target.value })}
                              className="w-full appearance-none px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                              style={{
                                background: "rgba(33,78,207,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white",
                              }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace("_", " ")}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#4B5563" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote size={13} style={{ color: "#4B5563" }} />
                            <div className="text-xs uppercase tracking-widest" style={{ color: "#4B5563" }}>Internal Notes</div>
                          </div>
                          <textarea
                            rows={4}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add notes about this lead..."
                            className="w-full px-4 py-3 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(33,78,207,0.06)",
                              lineHeight: 1.6,
                            }}
                            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
                            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(33,78,207,0.06)"; }}
                          />
                          <button
                            onClick={saveNote}
                            disabled={savingNote}
                            className="mt-2 w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                              background: "rgba(33,78,207,0.08)",
                              color: "#214ECF",
                              border: "1px solid rgba(33,78,207,0.18)",
                            }}
                          >
                            {savingNote ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                            {savingNote ? "Saving..." : "Save Note"}
                          </button>
                        </div>

                        <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid rgba(33,78,207,0.04)" }}>
                          <a
                            href={`mailto:${selected.email}`}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all"
                            style={{
                              background: "rgba(33,78,207,0.04)",
                              color: "#4B5563",
                              border: "1px solid rgba(33,78,207,0.06)",
                            }}
                          >
                            <Eye size={13} className="inline mr-1.5" />
                            Email
                          </a>
                          <button
                            onClick={() => deleteSubmission(selected.id)}
                            className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                            style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Plans Tab */}
              {tab === "plans" && (
                <div className="flex gap-6">
                  <div className="flex-1 min-w-0">
                    {plansLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full border-2 border-border border-t-blue-400 w-8 h-8" />
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {Object.values(groupedPlans).map((group) => (
                          <div key={group.id}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-baseline gap-3">
                                <span className="font-mono text-xs" style={{ color: "rgba(71,163,255,0.6)" }}>
                                  / {group.number}
                                </span>
                                <h3 className="font-bold text-foreground text-base">{group.category}</h3>
                                <span className="text-xs" style={{ color: "#4B5563" }}>
                                  {group.plans.length} plan{group.plans.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>

                            <div
                              className="rounded-2xl overflow-hidden"
                              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                            >
                              {group.plans.map((plan, i) => (
                                <div
                                  key={plan.id}
                                  className="flex items-center gap-4 px-5 py-4 transition-all"
                                  style={{
                                    borderBottom: i < group.plans.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    background: editingPlan?.id === plan.id ? "rgba(71,163,255,0.04)" : "rgba(255,255,255,0.01)",
                                  }}

                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF" }}
                                  >
                                    <DollarSign size={14} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground text-sm truncate">{plan.name}</span>
                                      {plan.popular && (
                                        <Star size={11} fill="#214ECF" style={{ color: "#214ECF", flexShrink: 0 }} />
                                      )}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: "#4B5563" }}>
                                      {plan.tag} · {plan.features.length} features
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="font-bold text-foreground text-sm">
                                      ${plan.price.toLocaleString()}
                                    </span>
                                    <button
                                      onClick={() => openEditPlan(plan)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                      style={{
                                        background: editingPlan?.id === plan.id ? "rgba(33,78,207,0.12)" : "rgba(33,78,207,0.04)",
                                        color: editingPlan?.id === plan.id ? "#214ECF" : "rgba(255,255,255,0.5)",
                                        border: "1px solid rgba(33,78,207,0.06)",
                                      }}
                                    >
                                      <Pencil size={11} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deletePlan(plan.id)}
                                      className="p-1.5 rounded-lg transition-all"
                                      style={{ color: "rgba(33,78,207,0.16)" }}
                                      onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(33,78,207,0.16)"; e.currentTarget.style.background = "transparent"; }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {Object.values(groupedPlans).length === 0 && (
                          <div className="text-center py-20" style={{ color: "#4B5563" }}>
                            No plans yet. Click "Add New Plan" to get started.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Plan Edit / Add Panel */}
                  <AnimatePresence>
                    {panelOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25 }}
                        className="w-80 flex-shrink-0 rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto"
                        style={{
                          background: "rgba(244,247,255,0.8)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          maxHeight: "calc(100vh - 140px)",
                          position: "sticky",
                          top: "80px",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground text-sm">
                            {isAddingPlan ? "Add New Plan" : "Edit Plan"}
                          </h3>
                          <button onClick={closePlanPanel} style={{ color: "#4B5563" }}>
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex flex-col gap-3">
                          <InputField
                            label="Plan Name"
                            value={planForm.name}
                            onChange={(v) => setPlanForm((f) => ({ ...f, name: v }))}
                            placeholder="e.g. AI Launch Package"
                            required
                          />

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <InputField
                                label="Price (USD)"
                                value={planForm.price}
                                onChange={(v) => setPlanForm((f) => ({ ...f, price: v }))}
                                type="number"
                                placeholder="8000"
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <InputField
                                label="Tag"
                                value={planForm.tag}
                                onChange={(v) => setPlanForm((f) => ({ ...f, tag: v }))}
                                placeholder="Startups"
                              />
                            </div>
                          </div>

                          <InputField
                            label="Description"
                            value={planForm.description}
                            onChange={(v) => setPlanForm((f) => ({ ...f, description: v }))}
                            placeholder="Short description of this plan"
                          />

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#4B5563" }}>
                              Features (one per line)
                            </label>
                            <textarea
                              rows={5}
                              value={planForm.features}
                              onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))}
                              placeholder={"AI architecture planning\n2 custom workflows\nBasic dashboard"}
                              className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all"
                              style={{
                                background: "rgba(33,78,207,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                lineHeight: 1.6,
                              }}
                              onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
                              onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; }}
                            />
                          </div>

                          <div className="pt-1 border-t" style={{ borderColor: "rgba(33,78,207,0.04)" }}>
                            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "#4B5563" }}>
                              Category
                            </p>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <InputField
                                  label="Service ID"
                                  value={planForm.serviceId}
                                  onChange={(v) => setPlanForm((f) => ({ ...f, serviceId: v }))}
                                  placeholder="custom-ai"
                                />
                              </div>
                              <div style={{ width: "60px" }}>
                                <InputField
                                  label="No."
                                  value={planForm.serviceNumber}
                                  onChange={(v) => setPlanForm((f) => ({ ...f, serviceNumber: v }))}
                                  placeholder="01"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <InputField
                                label="Category Name"
                                value={planForm.category}
                                onChange={(v) => setPlanForm((f) => ({ ...f, category: v }))}
                                placeholder="Custom AI Software Development"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center gap-2">
                              <Star size={13} style={{ color: planForm.popular ? "#214ECF" : "rgba(255,255,255,0.3)" }} />
                              <span className="text-xs font-medium" style={{ color: "#4B5563" }}>
                                Most Popular
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPlanForm((f) => ({ ...f, popular: !f.popular }))}
                              className="relative w-9 h-5 rounded-full transition-all duration-200"
                              style={{
                                background: planForm.popular ? "#214ECF" : "rgba(33,78,207,0.12)",
                              }}
                            >
                              <span
                                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                                style={{ transform: planForm.popular ? "translateX(16px)" : "translateX(0)" }}
                              />
                            </button>
                          </div>
                        </div>

                        {planMessage && (
                          <div
                            className="px-4 py-3 rounded-xl text-xs font-medium"
                            style={{
                              background: planMessage.type === "success" ? "rgba(33,78,207,0.08)" : "rgba(239,68,68,0.08)",
                              color: planMessage.type === "success" ? "#214ECF" : "#f87171",
                              border: `1px solid ${planMessage.type === "success" ? "rgba(33,78,207,0.18)" : "rgba(239,68,68,0.2)"}`,
                            }}
                          >
                            {planMessage.text}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid rgba(33,78,207,0.04)" }}>
                          <button
                            onClick={savePlan}
                            disabled={savingPlan}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                            style={{ background: "linear-gradient(135deg, #214ECF, #214ECF)", color: "white" }}
                          >
                            {savingPlan ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                            {savingPlan ? "Saving..." : isAddingPlan ? "Add Plan" : "Save Changes"}
                          </button>
                          {!isAddingPlan && editingPlan && (
                            <button
                              onClick={() => deletePlan(editingPlan.id)}
                              className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Analytics Tab */}
              {tab === "analytics" && stats && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Total Leads" value={stats.total} />
                    <StatCard label="This Week" value={stats.thisWeek} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="rounded-2xl p-6"
                      style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(33,78,207,0.22)" }}>
                        Leads by Status
                      </h3>
                      <div className="space-y-3">
                        {stats.byStatus.map(({ status, count: c }) => {
                          const pct = stats.total > 0 ? Math.round((Number(c) / stats.total) * 100) : 0;
                          const colors = STATUS_COLORS[status] ?? { bg: "rgba(33,78,207,0.06)", text: "rgba(255,255,255,0.5)" };
                          return (
                            <div key={status}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs capitalize font-medium" style={{ color: colors.text }}>
                                  {status.replace("_", " ")}
                                </span>
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c} ({pct}%)</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(33,78,207,0.04)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ background: colors.text }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className="rounded-2xl p-6"
                      style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(33,78,207,0.22)" }}>
                        Leads by Budget
                      </h3>
                      <div className="space-y-3">
                        {stats.byBudget.filter((b) => b.budget).map(({ budget, count: c }) => {
                          const pct = stats.total > 0 ? Math.round((Number(c) / stats.total) * 100) : 0;
                          return (
                            <div key={budget}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-medium text-foreground">{budget}</span>
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c} ({pct}%)</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(33,78,207,0.04)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ background: "#214ECF" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {stats.byBudget.filter((b) => b.budget).length === 0 && (
                          <p className="text-sm" style={{ color: "#4B5563" }}>No budget data yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Updates Tab */}
              {tab === "client-updates" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Client Updates</h2>
                    <p className="text-xs mt-1" style={{ color: "#4B5563" }}>Send private project and operational updates to clients with assigned plans.</p>
                  </div>
                  {updateClientsLoading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full border-2 border-border border-t-blue-400 w-8 h-8" /></div>
                  ) : updateClients.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(33,78,207,0.1)" }}><Users size={28} className="mx-auto mb-3" style={{ color: "#214ECF" }} /><p className="text-sm font-semibold text-slate-700">No clients with assigned plans</p></div>
                  ) : (
                    <div className="space-y-4">
                      {updateClients.map((client) => (
                        <div key={client.userId} className="rounded-2xl p-5" style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(33,78,207,0.1)" }}>
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-foreground truncate">{client.clientName}</h3><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF" }}>{client.planStatus}</span></div><p className="text-xs truncate" style={{ color: "#4B5563" }}>{client.email}</p></div>
                            <div className="lg:w-64"><div className="text-xs font-semibold text-foreground">{client.assignedPlan || "Unassigned"}</div><div className="text-xs" style={{ color: "#4B5563" }}>{client.planPrice === null ? "" : `$${client.planPrice.toLocaleString()}`}{client.planSeats ? ` · ${client.planSeats}` : ""}</div></div>
                            <div className="lg:w-40 text-xs" style={{ color: "#4B5563" }}><div><span className="font-semibold text-foreground">{client.updateCount}</span> update{client.updateCount === 1 ? "" : "s"}</div><div>{client.lastUpdateSent ? new Date(client.lastUpdateSent).toLocaleDateString() : "Never sent"}</div></div>
                            <div className="flex flex-wrap gap-2"><button onClick={() => loadClientUpdateHistory(client)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "rgba(33,78,207,0.05)", color: "#214ECF", border: "1px solid rgba(33,78,207,0.12)" }}><Eye size={13} /> View Updates</button><button onClick={() => openClientUpdate(client)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white" style={{ background: "#214ECF" }}><Send size={13} /> Send Update</button></div>
                          </div>
                          {selectedUpdateClient?.userId === client.userId && <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(33,78,207,0.1)" }}><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold text-foreground">Update History</h4><button onClick={() => openClientUpdate(client)} className="text-xs font-semibold" style={{ color: "#214ECF" }}>+ New Update</button></div>{clientUpdatesLoading ? <p className="text-xs text-slate-500">Loading history...</p> : clientUpdateHistory.length === 0 ? <p className="text-xs text-slate-500">No updates sent yet.</p> : <div className="space-y-3">{clientUpdateHistory.map((update) => <div key={update.id} className="rounded-xl p-4 bg-white" style={{ border: "1px solid rgba(33,78,207,0.08)" }}><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"><div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-foreground">{update.title}</span><StatusBadge status={update.status} /></div><p className="text-xs mt-1 whitespace-pre-wrap" style={{ color: "#4B5563" }}>{update.message}</p><p className="text-[10px] mt-2" style={{ color: "#64748B" }}>{update.publishedAt ? `Sent ${new Date(update.publishedAt).toLocaleString()}` : `Created ${new Date(update.createdAt).toLocaleString()}`}</p></div><div className="flex gap-2 shrink-0"><button onClick={() => openClientUpdate(client, update)} className="p-2 rounded-lg" style={{ color: "#214ECF", background: "rgba(33,78,207,0.05)" }} title="Edit update"><Pencil size={13} /></button><button onClick={() => deleteClientUpdate(update)} className="p-2 rounded-lg" style={{ color: "#B91C1C", background: "rgba(239,68,68,0.06)" }} title="Delete update"><Trash2 size={13} /></button></div></div></div>)}</div>}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Tab */}
              {tab === "attendance" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Employee & User Attendance</h2>
                      <p className="text-xs" style={{ color: "#4B5563" }}>
                        Real-time audit log of user check-in/out timestamps and durations.
                      </p>
                    </div>
                    <button
                      onClick={loadAttendance}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <RefreshCw size={13} className={attendanceLoading ? "animate-spin" : ""} />
                      Refresh Attendance
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">User ID</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Check In</th>
                            <th className="py-3 px-4">Check Out</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendanceRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                No attendance records recorded in Supabase yet.
                              </td>
                            </tr>
                          ) : (
                            attendanceRecords.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-800">{r.userId.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-semibold text-slate-900">{r.date}</td>
                                <td className="py-3 px-4 text-slate-600">{new Date(r.checkIn).toLocaleTimeString()}</td>
                                <td className="py-3 px-4 text-slate-600">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "In Progress"}</td>
                                <td className="py-3 px-4 text-slate-600">{r.durationMinutes}m</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                                    {r.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{r.notes || "—"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Tab */}
              {tab === "kyc" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">KYC Identity Verification Queue</h2>
                      <p className="text-xs" style={{ color: "#4B5563" }}>
                        Review submitted passports, national IDs, and identity documents.
                      </p>
                    </div>
                    <button
                      onClick={loadKyc}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <RefreshCw size={13} className={kycLoading ? "animate-spin" : ""} />
                      Refresh KYC
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">User ID</th>
                            <th className="py-3 px-4">Full Name</th>
                            <th className="py-3 px-4">Country</th>
                            <th className="py-3 px-4">Doc Type & ID</th>
                            <th className="py-3 px-4">Submitted At</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {kycRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                No KYC submissions awaiting review.
                              </td>
                            </tr>
                          ) : (
                            kycRecords.map((k) => (
                              <tr key={k.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-800">{k.userId.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{k.fullName}</td>
                                <td className="py-3 px-4 text-slate-600">{k.country}</td>
                                <td className="py-3 px-4 text-slate-600">
                                  <span className="capitalize">{k.documentType}</span>: <span className="font-mono">{k.documentNumber}</span>
                                </td>
                                <td className="py-3 px-4 text-slate-500">{new Date(k.submittedAt).toLocaleDateString()}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                      k.status === "verified"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : k.status === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {k.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {k.status === "pending" && (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleReviewKyc(k.id, "verified")}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => setKycReviewModal({ id: k.id, name: k.fullName, action: "rejected" })}
                                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[11px] border border-red-200 cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {k.status !== "pending" && (
                                    <span className="text-[11px] text-slate-400">Reviewed</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Affiliates Tab */}
              {tab === "affiliates" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">Affiliate & Referral Network</h2>
                      <p className="text-xs" style={{ color: "#4B5563" }}>
                        All tracked client invitation links, commission rates, and payouts.
                      </p>
                    </div>
                    <button
                      onClick={loadAffiliates}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <RefreshCw size={13} className={affiliatesLoading ? "animate-spin" : ""} />
                      Refresh Affiliates
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Referral ID</th>
                            <th className="py-3 px-4">Referrer</th>
                            <th className="py-3 px-4">Referred User</th>
                            <th className="py-3 px-4">Code</th>
                            <th className="py-3 px-4">Commission %</th>
                            <th className="py-3 px-4">Total Reward</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {affiliates.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400">
                                No affiliate referrals recorded yet.
                              </td>
                            </tr>
                          ) : (
                            affiliates.map((aff) => (
                              <tr key={aff.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-900">#{aff.id}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{aff.referrer_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{aff.referred_user_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-bold text-blue-600 uppercase">{aff.referral_code}</td>
                                <td className="py-3 px-4 text-slate-600">{aff.commission_rate}%</td>
                                <td className="py-3 px-4 font-bold text-emerald-600">${parseFloat(aff.total_reward).toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 capitalize">
                                    {aff.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-500">{new Date(aff.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallets Tab */}
              {tab === "wallets" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">User Wallets & Financial Ledger</h2>
                      <p className="text-xs" style={{ color: "#4B5563" }}>
                        Global escrow balances, ledger transactions, and withdrawal requests.
                      </p>
                    </div>
                    <button
                      onClick={loadWallets}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <RefreshCw size={13} className={walletsLoading ? "animate-spin" : ""} />
                      Refresh Wallets
                    </button>
                  </div>

                  {/* Wallets Table */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
                      User Accounts & Balances ({walletsData.wallets.length} active)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Wallet ID</th>
                            <th className="py-3 px-4">User ID</th>
                            <th className="py-3 px-4">Available Balance</th>
                            <th className="py-3 px-4">Pending Balance</th>
                            <th className="py-3 px-4">Currency</th>
                            <th className="py-3 px-4">Security Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {walletsData.wallets.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No user wallets provisioned yet.
                              </td>
                            </tr>
                          ) : (
                            walletsData.wallets.map((w) => (
                              <tr key={w.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-900">#{w.id}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{w.user_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-bold text-slate-900">${parseFloat(w.balance).toFixed(2)}</td>
                                <td className="py-3 px-4 text-slate-500">${parseFloat(w.pending_balance).toFixed(2)}</td>
                                <td className="py-3 px-4 font-semibold text-slate-700">{w.currency}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      w.is_locked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {w.is_locked ? "Locked" : "Active"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
                      Recent Ledger Transactions ({walletsData.recentTransactions.length} recorded)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">TX ID</th>
                            <th className="py-3 px-4">User ID</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {walletsData.recentTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                No ledger transactions logged.
                              </td>
                            </tr>
                          ) : (
                            walletsData.recentTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-900">#{tx.id}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{tx.user_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-semibold text-slate-800 capitalize">{tx.type}</td>
                                <td className={`py-3 px-4 font-bold ${tx.type === "deposit" || tx.type === "commission" ? "text-emerald-600" : "text-slate-900"}`}>
                                  {tx.type === "withdrawal" ? "-" : "+"}${parseFloat(tx.amount).toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{tx.description}</td>
                                <td className="py-3 px-4 text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {tab === "settings" && (
                <div className="max-w-md space-y-6">
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h2 className="font-semibold text-foreground mb-5">Change Password</h2>
                    <form onSubmit={changePassword} className="flex flex-col gap-4">
                      {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                        <div key={field} className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                          </label>
                          <input
                            type="password"
                            value={field === "currentPassword" ? currentPassword : field === "newPassword" ? newPassword : confirmPassword}
                            onChange={(e) => {
                              if (field === "currentPassword") setCurrentPassword(e.target.value);
                              else if (field === "newPassword") setNewPassword(e.target.value);
                              else setConfirmPassword(e.target.value);
                            }}
                            required
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all"
                            style={{
                              background: "rgba(33,78,207,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
                            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; }}
                          />
                        </div>
                      ))}

                      {pwMessage && (
                        <div
                          className="px-4 py-3 rounded-xl text-sm font-medium"
                          style={{
                            background: pwMessage.type === "success" ? "rgba(33,78,207,0.08)" : "rgba(239,68,68,0.08)",
                            color: pwMessage.type === "success" ? "#214ECF" : "#f87171",
                            border: `1px solid ${pwMessage.type === "success" ? "rgba(33,78,207,0.18)" : "rgba(239,68,68,0.2)"}`,
                          }}
                        >
                          {pwMessage.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="py-2.5 rounded-xl text-sm font-bold text-foreground transition-all"
                        style={{ background: "linear-gradient(135deg, #214ECF, #214ECF)" }}
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h2 className="font-semibold text-foreground mb-2">Export Data</h2>
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Download all leads as a CSV file for use in CRMs or spreadsheets.
                    </p>
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: "rgba(33,78,207,0.08)", color: "#214ECF", border: "1px solid rgba(33,78,207,0.18)" }}
                    >
                      <Download size={14} />
                      Export All Leads (CSV)
                    </button>
                  </div>

                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(244,247,255,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h2 className="font-semibold text-foreground mb-2">Session</h2>
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Signed in as <strong className="text-foreground">{adminUsername}</strong>. Tokens expire after 7 days.
                    </p>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Client Update Composer Modal */}
      {updateModalOpen && selectedUpdateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form onSubmit={saveClientUpdate} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{editingClientUpdate ? "Edit Client Update" : "Send Client Update"}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Only {selectedUpdateClient.clientName} ({selectedUpdateClient.email})</p>
              </div>
              <button type="button" onClick={() => setUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <InputField label="Update Title" value={updateForm.title} onChange={(value) => setUpdateForm((prev) => ({ ...prev, title: value }))} placeholder="Daily Progress Update" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-500">Update Message</label>
              <textarea required rows={6} value={updateForm.message} onChange={(e) => setUpdateForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="Write a client-specific project update..." className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 border border-slate-200 focus:outline-none focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Category / Status" value={updateForm.category} onChange={(value) => setUpdateForm((prev) => ({ ...prev, category: value }))} placeholder="Project Update" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-500">Publish Status</label>
                <select value={updateForm.status} onChange={(e) => setUpdateForm((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))} className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 border border-slate-200 bg-white focus:outline-none focus:border-blue-400">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">Date/time: {new Date().toLocaleString()} (recorded by the server when saved)</div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setUpdateModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" disabled={savingClientUpdate} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                {savingClientUpdate ? "Saving..." : editingClientUpdate ? "Save Changes" : "Send / Publish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KYC Rejection Reason Modal */}
      {kycReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reject KYC Submission</h3>
              <button onClick={() => setKycReviewModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Rejecting verification for <span className="font-bold text-slate-900">{kycReviewModal.name}</span>.
              Please provide a specific reason for the client:
            </p>
            <textarea
              rows={3}
              value={kycRejectReason}
              onChange={(e) => setKycRejectReason(e.target.value)}
              placeholder="e.g. Document image is blurry or expired. Please upload a clear color scan."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setKycReviewModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewingKyc || !kycRejectReason.trim()}
                onClick={() => handleReviewKyc(kycReviewModal.id, "rejected", kycRejectReason.trim())}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {reviewingKyc ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
