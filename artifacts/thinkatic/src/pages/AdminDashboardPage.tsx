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
  Ticket,
  FolderKanban,
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  BadgeCheck,
  Activity,
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
  enabled?: boolean;
  clientVisible?: boolean;
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

type TicketRow = {
  id: number;
  ticket_number: string;
  requester_role: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_to: number | null;
};

type TicketStats = {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  highPriority: number;
};

type ModuleSetting = { module_key: string; enabled: boolean };

type AdminProject = { id: number; client_id: string; name: string; project_type: string; status: string; progress_percent: number; start_date: string | null; expected_end_date: string | null; description: string | null; project_milestones?: any[]; project_tasks?: any[]; project_deliverables?: any[]; project_activity?: any[] };

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
  new: { bg: "rgba(59,130,246,0.12)", text: "#1A3DB3" },
  contacted: { bg: "rgba(99,102,241,0.12)", text: "#4338CA" },
  qualified: { bg: "rgba(251,191,36,0.12)", text: "#92400E" },
  closed_won: { bg: "rgba(59,130,246,0.18)", text: "#1A3DB3" },
  closed_lost: { bg: "rgba(239,68,68,0.12)", text: "#B91C1C" },
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
  const colors = STATUS_COLORS[status] ?? { bg: "rgba(33,78,207,0.06)", text: "#334155" };
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
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
        {label}
      </div>
      <div className="text-4xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "#475569" }}>{sub}</div>}
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
      <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#475569" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none transition-all"
        style={{ background: "rgba(33,78,207,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
        onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(71,163,255,0.4)"; }}
        onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(33,78,207,0.14)"; }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<
    "overview" | "leads" | "analytics" | "plans" | "client-updates" | "projects" | "meetings" | "billing" | "documents" | "communications" | "tickets" | "attendance" | "kyc" | "affiliates" | "wallets" | "withdrawals" | "bpo-partners" | "settings"
  >("overview");
  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get("section");
    const sectionTabs: Record<string, string> = { clients: "overview", leads: "leads", partners: "bpo-partners", projects: "projects", campaigns: "bpo-partners", agents: "bpo-partners", tickets: "tickets", invoices: "billing", documents: "documents" };
    const nextTab = section ? sectionTabs[section] : undefined;
    if (nextTab) setTab(nextTab as any);
  }, []);
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
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState("all");
  const [ticketPriority, setTicketPriority] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");
  const [moduleSettings, setModuleSettings] = useState<ModuleSetting[]>([]);
  const [moduleSettingsLoading, setModuleSettingsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketNote, setTicketNote] = useState("");
  const [ticketAudit, setTicketAudit] = useState<any[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [projectForm, setProjectForm] = useState({ clientId: "", name: "", projectType: "Custom Project", status: "planning", description: "", scope: "", startDate: "", expectedEndDate: "" });
  const [projectSaving, setProjectSaving] = useState(false);
  const [bpoPartners, setBpoPartners] = useState<any[]>([]);
  const [bpoPartnerDocs, setBpoPartnerDocs] = useState<any[]>([]);
  const [bpoPartnerMeetings, setBpoPartnerMeetings] = useState<any[]>([]);
  const [bpoPartnerTraining, setBpoPartnerTraining] = useState<any[]>([]);
  const [bpoPartnerQuality, setBpoPartnerQuality] = useState<any[]>([]);
  const [bpoPartnerPayouts, setBpoPartnerPayouts] = useState<any[]>([]);
  const [bpoPartnerLoading, setBpoPartnerLoading] = useState(false);
  const [adminDocuments, setAdminDocuments] = useState<any[]>([]);
  const [adminConversations, setAdminConversations] = useState<any[]>([]);
  const [selectedAdminConversation, setSelectedAdminConversation] = useState<any | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminDocumentForm, setAdminDocumentForm] = useState({ clientId: "", projectId: "", category: "Other", visibility: "client_visible" });
  const [milestoneForm, setMilestoneForm] = useState({ name: "", status: "not_started", completionPercent: "0" });
  const [taskForm, setTaskForm] = useState({ name: "", assignedName: "", status: "todo", priority: "medium", internalNotes: "", clientVisible: true });
  const [deliverableForm, setDeliverableForm] = useState({ name: "", description: "", filePath: "", status: "submitted", clientVisible: true });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [meetingForm, setMeetingForm] = useState({ clientId: "", projectId: "", title: "", startsAt: "", endsAt: "", meetingType: "project_meeting", location: "", agenda: "" });
  // BUG 4+15 FIX: Replace uncontrolled DOM textarea with controlled React state
  const [meetingNoteBody, setMeetingNoteBody] = useState("");
  const [meetingNoteClientVisible, setMeetingNoteClientVisible] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  // BUG 9 FIX: Add action item form state
  const [actionItemForm, setActionItemForm] = useState({ title: "", description: "", assignedUserId: "", dueDate: "", priority: "medium" });
  const [addingActionItem, setAddingActionItem] = useState(false);
  const [meetingRequests, setMeetingRequests] = useState<any[]>([]);

  // Billing state
  const [adminInvoices, setAdminInvoices] = useState<any[]>([]);
  const [adminInvoicesLoading, setAdminInvoicesLoading] = useState(false);
  const [selectedAdminInvoice, setSelectedAdminInvoice] = useState<any | null>(null);
  const [billingMetrics, setBillingMetrics] = useState<any | null>(null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [invoiceClientFilter, setInvoiceClientFilter] = useState("");
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "", projectId: "", invoiceDate: "", dueDate: "", taxRate: "0", discountAmount: "0",
    notes: "", terms: "", internalNotes: "",
    items: [{ description: "", quantity: "1", unitPrice: "" }],
  });
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [manualPaymentForm, setManualPaymentForm] = useState({ amount: "", paymentMethod: "manual", reference: "", notes: "" });
  const [recordingPayment, setRecordingPayment] = useState(false);

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

  const loadWithdrawals = useCallback(async () => {
    setWithdrawalsLoading(true);
    try {
      const res = await apiCall("/admin/withdrawals");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setWithdrawals(await res.json());
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const params = new URLSearchParams();
      if (ticketStatus !== "all") params.set("status", ticketStatus);
      if (ticketPriority !== "all") params.set("priority", ticketPriority);
      if (ticketSearch.trim()) params.set("search", ticketSearch.trim());
      const [listRes, statsRes] = await Promise.all([
        apiCall(`/admin/tickets?${params.toString()}`),
        apiCall("/admin/tickets/stats"),
      ]);
      if (listRes.status === 401 || statsRes.status === 401) { logout(); return; }
      if (listRes.ok) setTickets(await listRes.json());
      if (statsRes.ok) setTicketStats(await statsRes.json());
    } finally {
      setTicketsLoading(false);
    }
  }, [ticketPriority, ticketSearch, ticketStatus]);

  const loadModuleSettings = useCallback(async () => {
    setModuleSettingsLoading(true);
    try {
      const res = await apiCall("/admin/modules");
      if (res.status === 401) { logout(); return; }
      if (res.ok) setModuleSettings(await res.json());
    } finally { setModuleSettingsLoading(false); }
  }, []);

  const toggleModule = async (setting: ModuleSetting) => {
    const res = await apiCall(`/admin/modules/${setting.module_key}`, { method: "PATCH", body: JSON.stringify({ enabled: !setting.enabled }) });
    if (!res.ok) { setDataError("Unable to update feature setting"); return; }
    const updated = await res.json();
    setModuleSettings((previous) => previous.map((item) => item.module_key === updated.module_key ? updated : item));
  };

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try { const res = await apiCall("/admin/projects"); if (res.status === 401) { logout(); return; } if (res.ok) setProjects(await res.json()); }
    finally { setProjectsLoading(false); }
  }, []);

  const openAdminProject = async (project: AdminProject) => {
    const res = await apiCall(`/admin/projects/${project.id}`);
    if (res.ok) setSelectedProject(await res.json()); else setDataError("Unable to load project");
  };

  const createAdminProject = async (event: React.FormEvent) => {
    event.preventDefault(); setProjectSaving(true);
    try { const res = await apiCall("/admin/projects", { method: "POST", body: JSON.stringify(projectForm) }); if (!res.ok) throw new Error("Unable to create project"); setProjectForm({ clientId: "", name: "", projectType: "Custom Project", status: "planning", description: "", scope: "", startDate: "", expectedEndDate: "" }); await loadProjects(); }
    catch (error: any) { setDataError(error.message); } finally { setProjectSaving(false); }
  };

  const updateAdminProject = async (patch: Record<string, unknown>) => {
    if (!selectedProject) return; const res = await apiCall(`/admin/projects/${selectedProject.id}`, { method: "PATCH", body: JSON.stringify(patch) }); if (!res.ok) { setDataError("Unable to update project"); return; } await openAdminProject(selectedProject); await loadProjects();
  };

  const createProjectChild = async (kind: "milestones" | "tasks" | "deliverables", payload: Record<string, unknown>) => {
    if (!selectedProject) return;
    const res = await apiCall(`/admin/projects/${selectedProject.id}/${kind}`, { method: "POST", body: JSON.stringify(payload) });
    if (!res.ok) { setDataError(`Unable to create ${kind.slice(0, -1)}`); return; }
    await openAdminProject(selectedProject);
  };

  const updateProjectChild = async (kind: "milestones" | "tasks" | "deliverables", id: number, payload: Record<string, unknown>) => {
    const res = await apiCall(`/admin/${kind}/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (!res.ok) { setDataError(`Unable to update ${kind.slice(0, -1)}`); return; }
    if (selectedProject) await openAdminProject(selectedProject);
  };

  const loadDocuments = useCallback(async () => { const response = await apiCall("/admin/documents"); if (response.status === 401) return logout(); if (response.ok) setAdminDocuments(await response.json()); }, []);
  const loadConversations = useCallback(async () => { const response = await apiCall("/admin/conversations"); if (response.status === 401) return logout(); if (response.ok) setAdminConversations(await response.json()); }, []);
  const loadMeetings = useCallback(async () => {
    const response = await apiCall("/admin/meetings");
    if (response.status === 401) return logout();
    if (response.ok) setMeetings(await response.json());
  }, []);
  const loadMeetingRequests = useCallback(async () => {
    const response = await apiCall("/admin/meeting-requests");
    if (response.status === 401) return logout();
    if (response.ok) setMeetingRequests(await response.json());
  }, []);

  const loadAdminBilling = useCallback(async () => {
    setAdminInvoicesLoading(true);
    try {
      const params = new URLSearchParams();
      if (invoiceStatusFilter !== "all") params.set("status", invoiceStatusFilter);
      if (invoiceClientFilter.trim()) params.set("clientId", invoiceClientFilter.trim());
      if (invoiceSearchQuery.trim()) params.set("search", invoiceSearchQuery.trim());
      const [invRes, metricsRes] = await Promise.all([
        apiCall(`/admin/invoices?${params.toString()}`),
        apiCall("/admin/invoices/metrics"),
      ]);
      if (invRes.status === 401) { logout(); return; }
      if (invRes.ok) setAdminInvoices(await invRes.json());
      if (metricsRes.ok) setBillingMetrics(await metricsRes.json());
    } finally { setAdminInvoicesLoading(false); }
  }, [invoiceStatusFilter, invoiceClientFilter, invoiceSearchQuery]);

  const loadBpoPartners = useCallback(async () => {
    setBpoPartnerLoading(true);
    try {
      const [partnersRes, docsRes, meetingsRes, trainingRes, qualityRes, payoutsRes] = await Promise.all([
        apiCall("/admin/partners"),
        apiCall("/admin/partner-documents"),
        apiCall("/admin/partner-meetings"),
        apiCall("/admin/partner-training"),
        apiCall("/admin/partner-quality"),
        apiCall("/admin/partner-payout-statements"),
      ]);
      if (partnersRes.status === 401 || docsRes.status === 401 || meetingsRes.status === 401 || trainingRes.status === 401 || qualityRes.status === 401 || payoutsRes.status === 401) {
        logout();
        return;
      }
      if (partnersRes.ok) setBpoPartners(await partnersRes.json());
      if (docsRes.ok) setBpoPartnerDocs(await docsRes.json());
      if (meetingsRes.ok) setBpoPartnerMeetings(await meetingsRes.json());
      if (trainingRes.ok) setBpoPartnerTraining(await trainingRes.json());
      if (qualityRes.ok) setBpoPartnerQuality(await qualityRes.json());
      if (payoutsRes.ok) setBpoPartnerPayouts(await payoutsRes.json());
    } finally { setBpoPartnerLoading(false); }
  }, []);

  const openAdminInvoice = async (inv: any) => {
    const res = await apiCall(`/admin/invoices/${inv.id}`);
    if (res.ok) setSelectedAdminInvoice(await res.json());
    else setDataError("Unable to load invoice");
  };

  const createAdminInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    try {
      const payload = {
        clientId: invoiceForm.clientId,
        projectId: invoiceForm.projectId ? Number(invoiceForm.projectId) : undefined,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        taxRate: Number(invoiceForm.taxRate) / 100, // UI shows %, API expects 0–1
        discountAmount: Number(invoiceForm.discountAmount),
        notes: invoiceForm.notes || undefined,
        terms: invoiceForm.terms || undefined,
        internalNotes: invoiceForm.internalNotes || undefined,
        items: invoiceForm.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };
      const res = await apiCall("/admin/invoices", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setDataError(data.message || data.error || "Unable to create invoice"); return; }
      setShowCreateInvoice(false);
      setInvoiceForm({ clientId: "", projectId: "", invoiceDate: "", dueDate: "", taxRate: "0", discountAmount: "0", notes: "", terms: "", internalNotes: "", items: [{ description: "", quantity: "1", unitPrice: "" }] });
      await loadAdminBilling();
    } finally { setSavingInvoice(false); }
  };

  const sendAdminInvoice = async (inv: any) => {
    const res = await apiCall(`/admin/invoices/${inv.id}/send`, { method: "POST" });
    if (!res.ok) { setDataError("Unable to send invoice"); return; }
    await loadAdminBilling();
    if (selectedAdminInvoice?.id === inv.id) await openAdminInvoice(inv);
  };

  const cancelAdminInvoice = async (inv: any, reason?: string) => {
    if (!confirm(`Cancel invoice ${inv.invoice_number}? This cannot be undone.`)) return;
    const res = await apiCall(`/admin/invoices/${inv.id}/cancel`, { method: "POST", body: JSON.stringify({ reason: reason || "Cancelled by admin" }) });
    if (!res.ok) { setDataError("Unable to cancel invoice"); return; }
    await loadAdminBilling();
    if (selectedAdminInvoice?.id === inv.id) setSelectedAdminInvoice(null);
  };

  const recordManualPayment = async (inv: any) => {
    if (!manualPaymentForm.amount || Number(manualPaymentForm.amount) <= 0) { setDataError("Enter a valid payment amount"); return; }
    setRecordingPayment(true);
    try {
      const res = await apiCall(`/admin/invoices/${inv.id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(manualPaymentForm.amount),
          paymentMethod: manualPaymentForm.paymentMethod,
          reference: manualPaymentForm.reference || undefined,
          notes: manualPaymentForm.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setDataError(data.message || data.error || "Unable to record payment"); return; }
      setManualPaymentForm({ amount: "", paymentMethod: "manual", reference: "", notes: "" });
      await loadAdminBilling();
      await openAdminInvoice(inv);
    } finally { setRecordingPayment(false); }
  };
  const openAdminMeeting = async (meeting: any) => {
    const response = await apiCall(`/admin/meetings/${meeting.id}`);
    if (response.ok) {
      setSelectedMeeting(await response.json());
      // BUG 4+15 FIX: Reset note state when opening a new meeting
      setMeetingNoteBody("");
      setMeetingNoteClientVisible(false);
    }
  };
  // BUG 14 FIX: datetime-local inputs return "YYYY-MM-DDTHH:mm" strings.
  // Wrap in new Date().toISOString() so the API gets a valid ISO timestamp.
  const createAdminMeeting = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await apiCall("/admin/meetings", {
      method: "POST",
      body: JSON.stringify({
        ...meetingForm,
        projectId: Number(meetingForm.projectId),
        startsAt: meetingForm.startsAt ? new Date(meetingForm.startsAt).toISOString() : undefined,
        endsAt: meetingForm.endsAt ? new Date(meetingForm.endsAt).toISOString() : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      setDataError(err.message || err.error || "Unable to create meeting");
      return;
    }
    setMeetingForm({ clientId: "", projectId: "", title: "", startsAt: "", endsAt: "", meetingType: "project_meeting", location: "", agenda: "" });
    await loadMeetings();
  };
  const updateAdminMeeting = async (patch: Record<string, unknown>) => {
    if (!selectedMeeting) return;
    const response = await apiCall(`/admin/meetings/${selectedMeeting.id}`, { method: "PATCH", body: JSON.stringify(patch) });
    if (!response.ok) { setDataError("Unable to update meeting"); return; }
    await openAdminMeeting(selectedMeeting);
    await loadMeetings();
  };
  // BUG 4+15 FIX: Add note using controlled state
  const addAdminMeetingNote = async () => {
    if (!selectedMeeting || !meetingNoteBody.trim()) return;
    setAddingNote(true);
    try {
      const response = await apiCall(`/admin/meetings/${selectedMeeting.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: meetingNoteBody, noteType: "summary", clientVisible: meetingNoteClientVisible }),
      });
      if (!response.ok) { setDataError("Unable to add meeting note"); return; }
      setMeetingNoteBody("");
      setMeetingNoteClientVisible(false);
      await openAdminMeeting(selectedMeeting);
    } finally { setAddingNote(false); }
  };
  // BUG 9 FIX: Add action item using controlled state
  const addAdminActionItem = async () => {
    if (!selectedMeeting || !actionItemForm.title.trim()) return;
    setAddingActionItem(true);
    try {
      const response = await apiCall(`/admin/meetings/${selectedMeeting.id}/action-items`, {
        method: "POST",
        body: JSON.stringify({
          ...actionItemForm,
          projectId: selectedMeeting.project_id,
          assignedUserId: actionItemForm.assignedUserId || undefined,
          dueDate: actionItemForm.dueDate || undefined,
        }),
      });
      if (!response.ok) { setDataError("Unable to add action item"); return; }
      setActionItemForm({ title: "", description: "", assignedUserId: "", dueDate: "", priority: "medium" });
      await openAdminMeeting(selectedMeeting);
    } finally { setAddingActionItem(false); }
  };
  const openAdminConversation = async (conversation: any) => { const response = await apiCall(`/admin/conversations/${conversation.id}`); if (response.ok) { const data = await response.json(); setSelectedAdminConversation(data); await apiCall(`/admin/conversations/${conversation.id}/read`, { method: "POST" }); } };
  const sendAdminMessage = async () => { if (!selectedAdminConversation || !adminMessage.trim()) return; const response = await apiCall(`/admin/conversations/${selectedAdminConversation.id}/messages`, { method: "POST", body: JSON.stringify({ body: adminMessage }) }); if (!response.ok) return setDataError("Unable to send project message"); setAdminMessage(""); await openAdminConversation(selectedAdminConversation); };
  const uploadAdminDocument = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file || !adminDocumentForm.clientId) return setDataError("Client ID and file are required"); if (file.size > 25 * 1024 * 1024) return setDataError("Documents must be 25 MB or smaller"); const bytes = new Uint8Array(await file.arrayBuffer()); let binary = ""; for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192)); const response = await apiCall("/admin/documents", { method: "POST", body: JSON.stringify({ ...adminDocumentForm, projectId: adminDocumentForm.projectId ? Number(adminDocumentForm.projectId) : undefined, file: { fileName: file.name, contentType: file.type, data: `data:${file.type};base64,${btoa(binary)}` } }) }); if (!response.ok) return setDataError("Unable to upload document"); await loadDocuments(); };

  const updateTicket = async (ticket: TicketRow, patch: { status?: string; priority?: string }) => {
    const res = await apiCall(`/admin/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify(patch) });
    if (!res.ok) { setDataError("Unable to update ticket"); return; }
    await loadTickets();
  };

  const openTicket = async (ticket: TicketRow) => {
    const [detailRes, auditRes] = await Promise.all([apiCall(`/admin/tickets/${ticket.id}`), apiCall(`/admin/tickets/${ticket.id}/audit`)]);
    if (!detailRes.ok) { setDataError("Unable to load ticket details"); return; }
    setSelectedTicket(await detailRes.json());
    if (auditRes.ok) setTicketAudit(await auditRes.json());
  };

  const addTicketMessage = async (internal: boolean) => {
    const body = (internal ? ticketNote : ticketReply).trim();
    if (!selectedTicket || !body) return;
    const path = internal ? `/admin/tickets/${selectedTicket.id}/internal-notes` : `/admin/tickets/${selectedTicket.id}/replies`;
    const res = await apiCall(path, { method: "POST", body: JSON.stringify({ body }) });
    if (!res.ok) { setDataError(internal ? "Unable to add internal note" : "Unable to send reply"); return; }
    setTicketNote(""); setTicketReply(""); await openTicket(selectedTicket);
  };

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

  useEffect(() => { loadData(); loadModuleSettings(); }, [loadData, loadModuleSettings]);

  useEffect(() => {
    if (tab === "plans") loadPlans();
    if (tab === "attendance") loadAttendance();
    if (tab === "kyc") loadKyc();
    if (tab === "affiliates") loadAffiliates();
    if (tab === "wallets") loadWallets();
    if (tab === "withdrawals") loadWithdrawals();
    if (tab === "tickets") loadTickets();
    if (tab === "settings") loadModuleSettings();
    if (tab === "projects") loadProjects();
    if (tab === "documents") loadDocuments();
    if (tab === "communications") loadConversations();
    if (tab === "meetings") { loadMeetings(); loadMeetingRequests(); }
    if (tab === "billing") loadAdminBilling();
    if (tab === "client-updates") loadUpdateClients();
    if (tab === "bpo-partners") loadBpoPartners();
  }, [tab, loadPlans, loadAttendance, loadKyc, loadAffiliates, loadWallets, loadWithdrawals, loadTickets, loadModuleSettings, loadProjects, loadUpdateClients, loadDocuments, loadConversations, loadMeetings, loadMeetingRequests, loadAdminBilling, loadBpoPartners]);

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

  const togglePlanVisibility = async (plan: Plan) => {
    const res = await apiCall(`/admin/plans/${plan.id}`, { method: "PATCH", body: JSON.stringify({ enabled: !(plan.enabled ?? true), clientVisible: !(plan.clientVisible ?? true) }) });
    if (!res.ok) { setDataError("Unable to update plan visibility"); return; }
    const updated = await res.json() as Plan;
    setPlans((previous) => previous.map((item) => item.id === updated.id ? updated : item));
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
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "meetings", label: "Meetings", icon: Calendar },
    { id: "billing", label: "Billing & Invoices", icon: DollarSign },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "tickets", label: "Support / Tickets", icon: Ticket },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "kyc", label: "KYC Review", icon: ShieldCheck },
    { id: "affiliates", label: "Affiliates", icon: Share2 },
    { id: "wallets", label: "Wallets", icon: Wallet },
    { id: "withdrawals", label: "BPO Withdrawals", icon: Wallet },
    { id: "bpo-partners", label: "BPO Partners", icon: BadgeCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const panelOpen = editingPlan !== null || isAddingPlan;

  const renderPartnerSection = (title: string, value: any[], field: string, emptyText: string, subtitle: (item: any) => string) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">{value.length}</span>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {value.slice(0, 4).map((item) => (
            <div key={item.id ?? `${title}-${field}-${Math.random()}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800">{item[field] || item.title || item.statement_number || item.name || "Record"}</span>
                {item.status && <StatusBadge status={item.status} />}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{subtitle(item)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel min-h-screen flex" style={{ background: "#FFFFFF", color: "#111827" }}>
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
          {navItems.filter(({ id }) => id !== "billing" || moduleSettings.find((setting) => setting.module_key === "billing")?.enabled !== false).map(({ id, label, icon: Icon }) => (
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
            {tab === "overview" ? "Dashboard Overview" : tab === "leads" ? "Lead Management" : tab === "analytics" ? "Analytics" : tab === "plans" ? "Plan Management" : tab === "client-updates" ? "Client Updates" : tab === "projects" ? "Projects" : tab === "meetings" ? "Meetings" : tab === "documents" ? "Documents" : tab === "communications" ? "Communications" : tab === "tickets" ? "Support / Tickets" : tab === "bpo-partners" ? "BPO Partner Operations" : "Settings"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ color: "#4B5563", border: "1px solid rgba(33,78,207,0.06)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#214ECF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#4B5563"; }}
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
                                color: "#111827",
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
                                      onClick={() => togglePlanVisibility(plan)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${plan.enabled === false || plan.clientVisible === false ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                                      title="Toggle client visibility"
                                    >
                                      {plan.enabled === false || plan.clientVisible === false ? "Hidden" : "Visible"}
                                    </button>
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

              {tab === "bpo-partners" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground">BPO Partner Operations</h2>
                      <p className="text-xs text-slate-500">Review partner documents, meetings, training, quality, and payout records from the live admin APIs.</p>
                    </div>
                    <button
                      onClick={loadBpoPartners}
                      className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary"
                    >
                      <RefreshCw size={13} className={bpoPartnerLoading ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>

                  {bpoPartnerLoading ? (
                    <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" /></div>
                  ) : bpoPartners.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No BPO partners are configured yet.</div>
                  ) : (
                    <div className="space-y-5">
                      {bpoPartners.map((partner) => {
                        const partnerDocs = bpoPartnerDocs.filter((item: any) => item.partner_id === partner.id);
                        const partnerMeetings = bpoPartnerMeetings.filter((item: any) => item.partner_id === partner.id);
                        const partnerTraining = bpoPartnerTraining.filter((item: any) => item.partner_id === partner.id);
                        const partnerQuality = bpoPartnerQuality.filter((item: any) => item.partner_id === partner.id);
                        const partnerPayouts = bpoPartnerPayouts.filter((item: any) => item.partner_id === partner.id);

                        return (
                          <div key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-primary">{partner.partner_code || "BPO"}</div>
                                <h3 className="text-xl font-black text-slate-900">{partner.name}</h3>
                              </div>
                              <StatusBadge status={partner.status || "active"} />
                            </div>

                            <div className="grid gap-4 xl:grid-cols-2">
                              {renderPartnerSection("Documents", partnerDocs, "documents?.original_file_name", "No shared documents for this partner.", (item) => `${item.documents?.category || "Document"} · ${item.documents?.status || "shared"}`)}
                              {renderPartnerSection("Meetings", partnerMeetings, "meetings?.title", "No shared meetings for this partner.", (item) => `${item.meetings?.status || "scheduled"} · ${item.meetings?.starts_at ? new Date(item.meetings.starts_at).toLocaleString() : "No start time"}`)}
                              {renderPartnerSection("Training", partnerTraining, "title", "No training programs assigned.", (item) => `${item.status || "not_started"} · ${item.completion_percent ?? 0}% complete`)}
                              {renderPartnerSection("Quality", partnerQuality, "status", "No quality reviews for this partner.", (item) => `${item.score ?? "n/a"}/100 · ${item.status || "submitted"}`)}
                              {renderPartnerSection("Payout Statements", partnerPayouts, "statement_number", "No payout statements available.", (item) => `${item.status || "pending"} · ${item.reference || "No reference"}`)}
                            </div>
                          </div>
                        );
                      })}
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
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
                              <td colSpan={7} className="py-8 text-center text-slate-500">
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
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
                              <td colSpan={7} className="py-8 text-center text-slate-500">
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
                                    <span className="text-[11px] text-slate-500">Reviewed</span>
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
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
                              <td colSpan={8} className="py-8 text-center text-slate-500">
                                No affiliate referrals recorded yet.
                              </td>
                            </tr>
                          ) : (
                            affiliates.map((aff) => (
                              <tr key={aff.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-medium text-slate-900">#{aff.id}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{aff.referrer_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{aff.referred_user_id.slice(0, 8)}...</td>
                                <td className="py-3 px-4 font-bold text-primary uppercase">{aff.referral_code}</td>
                                <td className="py-3 px-4 text-slate-600">{aff.commission_rate}%</td>
                                <td className="py-3 px-4 font-bold text-emerald-600">${parseFloat(aff.total_reward).toFixed(2)}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary capitalize">
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

              {tab === "withdrawals" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div><h2 className="text-base font-bold text-foreground">Withdrawal Users</h2><p className="text-xs text-slate-500">Manage and review all user payout/withdrawal requests with complete details.</p></div>
                    <button onClick={loadWithdrawals} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10"><RefreshCw size={13} className={withdrawalsLoading ? "animate-spin" : ""} />Refresh</button>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200"><tr><th className="py-3 px-4">Request ID</th><th className="py-3 px-4">Full Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Account Type</th><th className="py-3 px-4">Plan</th><th className="py-3 px-4">Amount</th><th className="py-3 px-4">Method</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
                      {withdrawals.length === 0 ? <tr><td colSpan={10} className="py-8 text-center text-slate-500">No withdrawal requests.</td></tr> : withdrawals.map((withdrawal: any) => <tr key={withdrawal.id}><td className="py-3 px-4 font-mono font-bold text-slate-900">#{withdrawal.id}</td><td className="py-3 px-4 font-semibold text-slate-900">{withdrawal.userFullName || "N/A"}</td><td className="py-3 px-4 text-slate-700">{withdrawal.userEmail || "N/A"}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${withdrawal.userAccountType === "BPO" ? "bg-purple-100 text-purple-700" : "bg-primary/10 text-primary"}`}>{withdrawal.userAccountType}</span></td><td className="py-3 px-4 text-slate-700">{withdrawal.userPlan || "N/A"}</td><td className="py-3 px-4 font-bold text-slate-900">${withdrawal.amount.toFixed(2)}</td><td className="py-3 px-4">{withdrawal.method === "indian_bank" ? "🏦 Bank" : "💳 PayPal"}</td><td className="py-3 px-4 text-slate-600">{new Date(withdrawal.createdAt).toLocaleDateString()}</td><td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${withdrawal.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : withdrawal.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{withdrawal.status}</span></td><td className="py-3 px-4">{withdrawal.status === "PENDING" ? <div className="flex gap-1"><button onClick={async () => { const res = await apiCall(`/admin/withdrawals/${withdrawal.id}`, { method: "PATCH", body: JSON.stringify({ status: "APPROVED" }) }); if (res.ok) loadWithdrawals(); }} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 transition-colors" title="Approve this withdrawal">✓</button><button onClick={async () => { const reason = window.prompt("Rejection reason") || "Rejected by admin"; const res = await apiCall(`/admin/withdrawals/${withdrawal.id}`, { method: "PATCH", body: JSON.stringify({ status: "REJECTED", rejectionReason: reason }) }); if (res.ok) loadWithdrawals(); }} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors" title="Reject this withdrawal">✕</button></div> : <span className="text-slate-500 text-[10px]">{withdrawal.reviewedAt ? new Date(withdrawal.reviewedAt).toLocaleDateString() : "—"}</span>}</td></tr>)}
                    </tbody></table></div>
                  </div>

                  {withdrawals.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
                        <p className="text-xs text-slate-600 mb-1">Pending Requests</p>
                        <p className="text-2xl font-bold text-orange-600">{withdrawals.filter((w: any) => w.status === "PENDING").length}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                        <p className="text-xs text-slate-600 mb-1">Total Approved</p>
                        <p className="text-2xl font-bold text-emerald-600">${withdrawals.filter((w: any) => w.status === "APPROVED").reduce((sum: number, w: any) => sum + Number(w.amount), 0).toFixed(2)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-red-50 to-pink-50 p-4">
                        <p className="text-xs text-slate-600 mb-1">Total Rejected</p>
                        <p className="text-2xl font-bold text-red-600">${withdrawals.filter((w: any) => w.status === "REJECTED").reduce((sum: number, w: any) => sum + Number(w.amount), 0).toFixed(2)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                        <p className="text-xs text-slate-600 mb-1">Total Requested</p>
                        <p className="text-2xl font-bold text-slate-600">${withdrawals.reduce((sum: number, w: any) => sum + Number(w.amount), 0).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
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
                              <td colSpan={6} className="py-8 text-center text-slate-500">
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
                              <td colSpan={7} className="py-8 text-center text-slate-500">
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
              {tab === "projects" && (
                <div className="space-y-6">
                  <div><h2 className="text-base font-bold text-slate-900">Project Management</h2><p className="text-xs text-slate-500 mt-1">Create and manage client delivery projects, milestones, tasks, and deliverables.</p></div>
                  <form onSubmit={createAdminProject} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><input required value={projectForm.clientId} onChange={(e) => setProjectForm((p) => ({ ...p, clientId: e.target.value }))} placeholder="Client profile UUID" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" /><input required value={projectForm.name} onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))} placeholder="Project name" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" /><select value={projectForm.status} onChange={(e) => setProjectForm((p) => ({ ...p, status: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"><option value="planning">Planning</option><option value="design">Design</option><option value="development">Development</option><option value="testing">Testing</option><option value="deployment">Deployment</option><option value="completed">Completed</option><option value="on_hold">On hold</option></select></div><textarea value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} placeholder="Project description" rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" /><button disabled={projectSaving} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">{projectSaving ? "Creating..." : "Create Project"}</button></form>
                  {projectsLoading ? <div className="py-12 text-center text-sm text-slate-500">Loading projects...</div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{projects.length === 0 ? <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No projects created yet.</div> : projects.map((project) => <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-[10px] text-primary">PROJECT #{project.id}</span><h3 className="font-bold text-slate-900">{project.name}</h3><p className="text-xs text-slate-500">Client: {project.client_id}</p></div><span className="text-[10px] font-bold uppercase text-slate-600">{project.status.replaceAll("_", " ")}</span></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span>Progress</span><span>{project.progress_percent}%</span></div><div className="mt-1 h-2 bg-slate-100 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${project.progress_percent}%` }} /></div><button onClick={() => openAdminProject(project)} className="mt-4 px-3 py-2 rounded-xl bg-primary/5 text-primary text-xs font-bold">Open project</button></div>)}</div>}
                  {selectedProject && <div className="rounded-2xl border border-primary/20 bg-primary/5/40 p-5 space-y-4"><div className="flex items-center justify-between"><div><span className="font-mono text-[10px] text-primary">PROJECT #{selectedProject.id}</span><h3 className="text-lg font-bold text-slate-900">{selectedProject.name}</h3></div><button onClick={() => setSelectedProject(null)} className="text-xs font-bold text-slate-500">Close</button></div><div className="flex flex-wrap gap-2"><select value={selectedProject.status} onChange={(e) => updateAdminProject({ status: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="planning">Planning</option><option value="design">Design</option><option value="development">Development</option><option value="testing">Testing</option><option value="deployment">Deployment</option><option value="completed">Completed</option><option value="on_hold">On hold</option></select><input type="number" min="0" max="100" defaultValue={selectedProject.progress_percent} onBlur={(e) => updateAdminProject({ progressPercent: Number(e.target.value) })} className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs" placeholder="Progress %" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"><div className="rounded-xl bg-white border border-slate-200 p-3"><b>Milestones</b><p className="mt-1 text-slate-500">{selectedProject.project_milestones?.length || 0}</p></div><div className="rounded-xl bg-white border border-slate-200 p-3"><b>Tasks</b><p className="mt-1 text-slate-500">{selectedProject.project_tasks?.length || 0}</p></div><div className="rounded-xl bg-white border border-slate-200 p-3"><b>Deliverables</b><p className="mt-1 text-slate-500">{selectedProject.project_deliverables?.length || 0}</p></div></div><div className="space-y-2">{(selectedProject.project_activity || []).slice(0, 8).map((event: any) => <div key={event.id} className="text-xs text-slate-600">{event.description} · {new Date(event.created_at).toLocaleString()}</div>)}</div></div>}
                </div>
              )}

              {tab === "projects" && selectedProject && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5/40 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Project actions</h3>
                  <form onSubmit={(event) => { event.preventDefault(); createProjectChild("milestones", { ...milestoneForm, completionPercent: Number(milestoneForm.completionPercent) }); }} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input required value={milestoneForm.name} onChange={(event) => setMilestoneForm((value) => ({ ...value, name: event.target.value }))} placeholder="Milestone name" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <select value={milestoneForm.status} onChange={(event) => setMilestoneForm((value) => ({ ...value, status: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="at_risk">At risk</option><option value="completed">Completed</option></select>
                    <input type="number" min="0" max="100" value={milestoneForm.completionPercent} onChange={(event) => setMilestoneForm((value) => ({ ...value, completionPercent: event.target.value }))} placeholder="Completion %" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <button className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold">Create milestone</button>
                  </form>
                  <form onSubmit={(event) => { event.preventDefault(); createProjectChild("tasks", { ...taskForm, completionPercent: taskForm.status === "completed" ? 100 : 0 }); }} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input required value={taskForm.name} onChange={(event) => setTaskForm((value) => ({ ...value, name: event.target.value }))} placeholder="Task name" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input value={taskForm.assignedName} onChange={(event) => setTaskForm((value) => ({ ...value, assignedName: event.target.value }))} placeholder="Assign to" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <select value={taskForm.status} onChange={(event) => setTaskForm((value) => ({ ...value, status: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="review">Review</option><option value="completed">Completed</option></select>
                    <select value={taskForm.priority} onChange={(event) => setTaskForm((value) => ({ ...value, priority: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
                    <button className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold">Create and assign task</button>
                  </form>
                  <form onSubmit={(event) => { event.preventDefault(); createProjectChild("deliverables", deliverableForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input required value={deliverableForm.name} onChange={(event) => setDeliverableForm((value) => ({ ...value, name: event.target.value }))} placeholder="Deliverable name" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input value={deliverableForm.filePath} onChange={(event) => setDeliverableForm((value) => ({ ...value, filePath: event.target.value }))} placeholder="File path" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <select value={deliverableForm.status} onChange={(event) => setDeliverableForm((value) => ({ ...value, status: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="resubmitted">Resubmitted</option></select>
                    <button className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold">Submit deliverable</button>
                  </form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{(selectedProject.project_tasks || []).map((task: any) => <label key={task.id} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-2 text-xs"><span className="flex-1">{task.name}{task.assigned_name ? ` - ${task.assigned_name}` : ""}</span><select value={task.status} onChange={(event) => updateProjectChild("tasks", task.id, { status: event.target.value, completionPercent: event.target.value === "completed" ? 100 : task.completion_percent })} className="px-2 py-1 rounded border border-slate-200 bg-white text-xs"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="review">Review</option><option value="completed">Completed</option></select></label>)}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{(selectedProject.project_deliverables || []).map((deliverable: any) => <label key={deliverable.id} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-2 text-xs"><span className="flex-1">{deliverable.name}</span><select value={deliverable.status} onChange={(event) => updateProjectChild("deliverables", deliverable.id, { status: event.target.value })} className="px-2 py-1 rounded border border-slate-200 bg-white text-xs"><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="changes_requested">Request changes</option><option value="resubmitted">Resubmitted</option><option value="approved">Approve</option></select></label>)}</div>
                </div>
              )}

              {tab === "meetings" && (
                <div className="space-y-6">
                  <div><h2 className="text-base font-bold text-slate-900">Meetings Centre</h2><p className="text-xs text-slate-500 mt-1">Schedule and manage project meetings, notes, and action items.</p></div>

                  {/* Schedule new meeting form */}
                  <form onSubmit={createAdminMeeting} className="rounded-2xl border border-slate-200 bg-white p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input required value={meetingForm.clientId} onChange={(event) => setMeetingForm((value) => ({ ...value, clientId: event.target.value }))} placeholder="Client profile UUID" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input required value={meetingForm.projectId} onChange={(event) => setMeetingForm((value) => ({ ...value, projectId: event.target.value }))} placeholder="Project ID" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input required value={meetingForm.title} onChange={(event) => setMeetingForm((value) => ({ ...value, title: event.target.value }))} placeholder="Meeting title" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <select value={meetingForm.meetingType} onChange={(event) => setMeetingForm((value) => ({ ...value, meetingType: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                      <option value="project_meeting">Project Meeting</option><option value="requirement_discussion">Requirement Discussion</option><option value="review">Review</option><option value="demo">Demo</option><option value="uat">UAT</option><option value="planning">Planning</option><option value="support">Support</option><option value="other">Other</option>
                    </select>
                    {/* BUG 14 FIX: datetime-local inputs — conversion to ISO happens in createAdminMeeting */}
                    <input required type="datetime-local" value={meetingForm.startsAt} onChange={(event) => setMeetingForm((value) => ({ ...value, startsAt: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input required type="datetime-local" value={meetingForm.endsAt} onChange={(event) => setMeetingForm((value) => ({ ...value, endsAt: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <input value={meetingForm.location} onChange={(event) => setMeetingForm((value) => ({ ...value, location: event.target.value }))} placeholder="Location or meeting link" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                    <button type="submit" className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold">Schedule meeting</button>
                    <textarea value={meetingForm.agenda} onChange={(event) => setMeetingForm((value) => ({ ...value, agenda: event.target.value }))} placeholder="Agenda (optional)" className="md:col-span-4 px-3 py-2 rounded-xl border border-slate-200 text-xs" rows={2} />
                  </form>

                  {/* Meeting requests from clients */}
                  {meetingRequests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">Pending Meeting Requests ({meetingRequests.filter((r: any) => r.status === "requested").length})</h3>
                      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Subject</th><th className="p-3">Client</th><th className="p-3">Project</th><th className="p-3">Requested Time</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {meetingRequests.map((req: any) => (
                              <tr key={req.id}>
                                <td className="p-3 font-semibold">{req.subject}</td>
                                <td className="p-3 font-mono text-[10px]">{req.client_id?.slice(0, 8)}...</td>
                                <td className="p-3">#{req.project_id}</td>
                                <td className="p-3">{new Date(req.preferred_starts_at).toLocaleString()}</td>
                                <td className="p-3"><span className="uppercase text-[10px] font-bold text-amber-700">{req.status}</span></td>
                                <td className="p-3 flex gap-2">
                                  <button onClick={async () => { const r = await apiCall(`/admin/meeting-requests/${req.id}`, { method: "PATCH", body: JSON.stringify({ status: "confirmed", reviewNotes: "Approved" }) }); if (r.ok) loadMeetingRequests(); }} className="text-emerald-700 font-bold text-[10px]">Approve</button>
                                  <button onClick={async () => { const r = await apiCall(`/admin/meeting-requests/${req.id}`, { method: "PATCH", body: JSON.stringify({ status: "rejected", reviewNotes: "Declined" }) }); if (r.ok) loadMeetingRequests(); }} className="text-red-600 font-bold text-[10px]">Reject</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Meetings table */}
                  {meetings.length === 0
                    ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No meetings scheduled.</div>
                    : <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Meeting</th><th className="p-3">Client</th><th className="p-3">Project</th><th className="p-3">When</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {meetings.map((meeting: any) => (
                              <tr key={meeting.id} className={selectedMeeting?.id === meeting.id ? "bg-primary/5" : ""}>
                                <td className="p-3 font-semibold">{meeting.title}</td>
                                <td className="p-3 font-mono text-[10px]">{meeting.client_id?.slice(0, 8)}...</td>
                                <td className="p-3">#{meeting.project_id}</td>
                                <td className="p-3">{new Date(meeting.starts_at).toLocaleString()}</td>
                                <td className="p-3 uppercase text-[10px] font-bold">{meeting.status?.replaceAll("_", " ")}</td>
                                <td className="p-3"><button onClick={() => openAdminMeeting(meeting)} className="text-primary font-bold">Open</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  }

                  {/* Selected meeting detail panel */}
                  {selectedMeeting && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5/40 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900">{selectedMeeting.title}</h3>
                          <p className="text-xs text-slate-500">{new Date(selectedMeeting.starts_at).toLocaleString()} · {selectedMeeting.timezone}</p>
                          {selectedMeeting.location && <p className="text-xs text-slate-500">📍 {selectedMeeting.location}</p>}
                        </div>
                        <button onClick={() => setSelectedMeeting(null)} className="text-xs text-slate-500 hover:text-slate-800">Close</button>
                      </div>

                      {/* Status + Reschedule controls */}
                      <div className="flex flex-wrap gap-2">
                        <select value={selectedMeeting.status} onChange={(event) => updateAdminMeeting({ status: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                          {["scheduled", "confirmed", "in_progress", "completed", "cancelled", "rescheduled", "no_show"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                        </select>
                        {/* BUG 14 FIX: wrap datetime-local value in new Date().toISOString() before sending */}
                        <input type="datetime-local" defaultValue={new Date(selectedMeeting.starts_at).toISOString().slice(0, 16)} onBlur={(event) => { if (event.target.value) updateAdminMeeting({ startsAt: new Date(event.target.value).toISOString() }); }} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" title="Reschedule start time" />
                        <input type="datetime-local" defaultValue={new Date(selectedMeeting.ends_at).toISOString().slice(0, 16)} onBlur={(event) => { if (event.target.value) updateAdminMeeting({ endsAt: new Date(event.target.value).toISOString() }); }} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" title="Reschedule end time" />
                        <button onClick={() => updateAdminMeeting({ status: "completed" })} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Mark completed</button>
                        <button onClick={() => updateAdminMeeting({ status: "cancelled" })} className="px-3 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-bold">Cancel</button>
                      </div>

                      {/* Participants */}
                      {(selectedMeeting.participants || []).length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Participants</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedMeeting.participants.map((p: any) => (
                              <span key={p.id} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                {p.user_id ? `User ${p.user_id.slice(0, 6)}` : `Admin ${p.admin_id}`} · {p.participant_role} · RSVP: {p.rsvp_status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes list */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes ({(selectedMeeting.notes || []).length})</h4>
                        <div className="space-y-2 mb-3">
                          {(selectedMeeting.notes || []).length === 0
                            ? <p className="text-xs text-slate-500">No notes yet.</p>
                            : (selectedMeeting.notes || []).map((note: any) => (
                                <div key={note.id} className="rounded-xl bg-white border border-slate-100 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">{note.note_type?.replaceAll("_", " ")}</span>
                                    {note.client_visible && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">Client visible</span>}
                                    {!note.client_visible && <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded-full">Internal</span>}
                                  </div>
                                  <p className="text-sm text-slate-700">{note.body}</p>
                                </div>
                              ))
                          }
                        </div>
                        {/* BUG 4+15 FIX: Controlled textarea via React state */}
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={meetingNoteBody}
                            onChange={(event) => setMeetingNoteBody(event.target.value)}
                            placeholder="Add meeting note..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            rows={2}
                          />
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input type="checkbox" checked={meetingNoteClientVisible} onChange={(event) => setMeetingNoteClientVisible(event.target.checked)} className="rounded" />
                              Visible to client
                            </label>
                            <button onClick={addAdminMeetingNote} disabled={addingNote || !meetingNoteBody.trim()} className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold disabled:opacity-50">
                              {addingNote ? "Adding..." : "Add note"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* BUG 9 FIX: Action items section with create form */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Action Items ({(selectedMeeting.action_items || []).length})</h4>
                        <div className="space-y-2 mb-3">
                          {(selectedMeeting.action_items || []).length === 0
                            ? <p className="text-xs text-slate-500">No action items yet.</p>
                            : (selectedMeeting.action_items || []).map((item: any) => (
                                <div key={item.id} className="rounded-xl bg-white border border-slate-100 p-3 flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                    {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                                    <p className="text-[10px] text-slate-500 mt-1">
                                      {item.assigned_user_id ? `Assigned to user ${item.assigned_user_id.slice(0, 6)}` : "Unassigned"}
                                      {item.due_date ? ` · Due ${item.due_date}` : ""}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <select
                                      value={item.status}
                                      onChange={async (event) => {
                                        await apiCall(`/admin/action-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
                                        await openAdminMeeting(selectedMeeting);
                                      }}
                                      className="text-[10px] px-2 py-1 rounded-lg border border-slate-200 bg-white"
                                    >
                                      <option value="open">Open</option>
                                      <option value="in_progress">In progress</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                    <span className="text-[10px] text-slate-500 uppercase">{item.priority}</span>
                                  </div>
                                </div>
                              ))
                          }
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input value={actionItemForm.title} onChange={(event) => setActionItemForm((value) => ({ ...value, title: event.target.value }))} placeholder="Action item title" className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                          <input value={actionItemForm.assignedUserId} onChange={(event) => setActionItemForm((value) => ({ ...value, assignedUserId: event.target.value }))} placeholder="Assign to user UUID (optional)" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                          <input type="date" value={actionItemForm.dueDate} onChange={(event) => setActionItemForm((value) => ({ ...value, dueDate: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" title="Due date (optional)" />
                          <input value={actionItemForm.description} onChange={(event) => setActionItemForm((value) => ({ ...value, description: event.target.value }))} placeholder="Description (optional)" className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                          <select value={actionItemForm.priority} onChange={(event) => setActionItemForm((value) => ({ ...value, priority: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                          </select>
                          <button onClick={addAdminActionItem} disabled={addingActionItem || !actionItemForm.title.trim()} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50">
                            {addingActionItem ? "Adding..." : "Add action item"}
                          </button>
                        </div>
                      </div>

                      {/* Meeting history / audit trail */}
                      {(selectedMeeting.activity || []).length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Meeting History</h4>
                          <div className="space-y-1">
                            {selectedMeeting.activity.slice(0, 20).map((entry: any) => (
                              <div key={entry.id} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">{new Date(entry.created_at).toLocaleString()}</span>
                                <span className="font-mono text-[10px] text-primary">{entry.action.replaceAll("_", " ")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab === "documents" && (
                <div className="space-y-5"><div><h2 className="text-base font-bold text-slate-900">Document Centre</h2><p className="text-xs text-slate-500 mt-1">Manage private client and project documents.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 grid grid-cols-1 md:grid-cols-5 gap-2"><input value={adminDocumentForm.clientId} onChange={(event) => setAdminDocumentForm((value) => ({ ...value, clientId: event.target.value }))} placeholder="Client profile UUID" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" /><input value={adminDocumentForm.projectId} onChange={(event) => setAdminDocumentForm((value) => ({ ...value, projectId: event.target.value }))} placeholder="Project ID" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" /><select value={adminDocumentForm.category} onChange={(event) => setAdminDocumentForm((value) => ({ ...value, category: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option>Other</option><option>Contract</option><option>Proposal</option><option>Requirement</option><option>Project Document</option><option>Design</option><option>Technical</option><option>Deliverable</option><option>Report</option></select><select value={adminDocumentForm.visibility} onChange={(event) => setAdminDocumentForm((value) => ({ ...value, visibility: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="client_visible">Client visible</option><option value="internal_only">Internal only</option></select><label className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold text-center cursor-pointer">Upload<input type="file" className="hidden" onChange={uploadAdminDocument} /></label></div><div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Document</th><th className="p-3">Client</th><th className="p-3">Category</th><th className="p-3">Visibility</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{adminDocuments.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No documents found.</td></tr> : adminDocuments.map((document) => <tr key={document.id}><td className="p-3 font-semibold">{document.original_file_name}<div className="text-[10px] text-slate-500">{new Date(document.created_at).toLocaleString()}</div></td><td className="p-3 font-mono text-[10px]">{document.client_id.slice(0, 8)}...</td><td className="p-3">{document.category}</td><td className="p-3">{document.visibility}</td><td className="p-3">{document.status}</td><td className="p-3 flex gap-2"><button onClick={async () => { const response = await apiCall(`/admin/documents/${document.id}/download`); if (response.ok) window.open((await response.json()).url, "_blank", "noopener,noreferrer"); }} className="text-primary font-bold">Download</button><button onClick={async () => { await apiCall(`/admin/documents/${document.id}`, { method: "PATCH", body: JSON.stringify({ status: document.status === "archived" ? "active" : "archived" }) }); await loadDocuments(); }} className="text-amber-700 font-bold">{document.status === "archived" ? "Restore" : "Archive"}</button></td></tr>)}</tbody></table></div></div>
              )}

              {tab === "communications" && (
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5"><section className="space-y-3"><h2 className="text-base font-bold text-slate-900">Project Communications</h2>{adminConversations.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">No active conversations.</div> : adminConversations.map((conversation) => <button key={conversation.id} onClick={() => openAdminConversation(conversation)} className={`w-full text-left rounded-xl border p-3 ${selectedAdminConversation?.id === conversation.id ? "border-blue-500 bg-primary/5" : "border-slate-200 bg-white"}`}><p className="text-xs font-bold">{conversation.subject}</p><p className="text-[10px] text-slate-500">Client {conversation.client_id.slice(0, 8)}... · {conversation.status}</p></button>)}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 min-h-96 flex flex-col">{!selectedAdminConversation ? <div className="m-auto text-sm text-slate-500">Select a project conversation.</div> : <><div className="border-b border-slate-100 pb-3"><h2 className="font-bold text-slate-900">{selectedAdminConversation.subject}</h2><button onClick={async () => { await apiCall(`/admin/conversations/${selectedAdminConversation.id}`, { method: "PATCH", body: JSON.stringify({ status: selectedAdminConversation.status === "open" ? "closed" : "open" }) }); await loadConversations(); }} className="text-xs text-primary font-bold">{selectedAdminConversation.status === "open" ? "Close conversation" : "Reopen conversation"}</button></div><div className="flex-1 space-y-3 py-4 overflow-y-auto">{selectedAdminConversation.messages.map((message: any) => <div key={message.id} className={`max-w-[85%] rounded-xl p-3 text-xs ${message.sender_admin_id ? "ml-auto bg-primary text-white" : "bg-slate-100"}`}><p>{message.body}</p><time className="block mt-1 text-[10px] opacity-70">{new Date(message.created_at).toLocaleString()}</time></div>)}</div><form onSubmit={(event) => { event.preventDefault(); sendAdminMessage(); }} className="flex gap-2"><input value={adminMessage} onChange={(event) => setAdminMessage(event.target.value)} placeholder="Reply to client" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs" /><button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">Send</button></form></>}</section></div>
              )}

              {tab === "tickets" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ["Total", ticketStats?.total ?? 0],
                      ["Open", ticketStats?.open ?? 0],
                      ["In Progress", ticketStats?.inProgress ?? 0],
                      ["High Priority", ticketStats?.highPriority ?? 0],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
                        <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadTickets(); }} placeholder="Search ticket ID or subject" className="min-w-56 flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                    <select value={ticketStatus} onChange={(e) => { setTicketStatus(e.target.value); }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                      <option value="all">All statuses</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="waiting_for_requester">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                    </select>
                    <select value={ticketPriority} onChange={(e) => { setTicketPriority(e.target.value); }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                      <option value="all">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                    <button onClick={loadTickets} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/10"><RefreshCw size={13} className={ticketsLoading ? "animate-spin" : ""} />Refresh</button>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200"><tr><th className="py-3 px-4">Ticket</th><th className="py-3 px-4">Requester</th><th className="py-3 px-4">Subject</th><th className="py-3 px-4">Priority</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Created</th><th className="py-3 px-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
                      {tickets.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-slate-500">No tickets match these filters.</td></tr> : tickets.map((ticket) => <tr key={ticket.id} className="hover:bg-slate-50/50"><td className="py-3 px-4 font-mono font-bold text-primary">{ticket.ticket_number}</td><td className="py-3 px-4 capitalize text-slate-600">{ticket.requester_role}</td><td className="py-3 px-4 font-semibold text-slate-900">{ticket.subject}<div className="text-[10px] font-normal text-slate-500">{ticket.category}</div></td><td className="py-3 px-4"><select value={ticket.priority} onChange={(e) => updateTicket(ticket, { priority: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] bg-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></td><td className="py-3 px-4"><select value={ticket.status} onChange={(e) => updateTicket(ticket, { status: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] bg-white"><option value="open">Open</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="waiting_for_requester">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></td><td className="py-3 px-4 text-slate-500">{new Date(ticket.created_at).toLocaleString()}</td><td className="py-3 px-4"><button onClick={() => openTicket(ticket)} className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary font-bold">View</button></td></tr>)}
                    </tbody></table></div>
                  </div>
                </div>
              )}

              {tab === "settings" && (
                <div className="max-w-md space-y-6">
                  <div className="rounded-2xl p-6 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold text-slate-900">Feature Control</h2><p className="text-xs text-slate-500 mt-1">These settings are enforced by the backend.</p></div><button onClick={loadModuleSettings} className="p-2 rounded-lg text-primary hover:bg-primary/5" title="Refresh feature settings"><RefreshCw size={14} className={moduleSettingsLoading ? "animate-spin" : ""} /></button></div>
                    <div className="space-y-2">{moduleSettings.map((setting) => <div key={setting.module_key} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5"><span className="text-sm font-medium text-slate-700 capitalize">{setting.module_key.replaceAll("_", " ")}</span><button type="button" role="switch" aria-checked={setting.enabled} onClick={() => toggleModule(setting)} className={`relative h-6 w-11 rounded-full transition-colors ${setting.enabled ? "bg-primary" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${setting.enabled ? "left-6" : "left-1"}`} /></button></div>)}</div>
                  </div>
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

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between"><div><div className="font-mono text-xs font-bold text-primary">{selectedTicket.ticket_number}</div><h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2><p className="text-xs text-slate-500">{selectedTicket.requester_role} · {selectedTicket.category}</p></div><button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-slate-700"><X size={18} /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><select value={selectedTicket.status} onChange={async (e) => { const res = await apiCall(`/admin/tickets/${selectedTicket.id}`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }); if (res.ok) { await openTicket(selectedTicket); loadTickets(); } else { const data = await res.json(); setDataError(data.error || "Unable to update status"); } }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"><option value="open">Open</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="waiting_for_requester">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><select value={selectedTicket.priority} onChange={async (e) => { await updateTicket(selectedTicket, { priority: e.target.value }); openTicket(selectedTicket); }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input type="number" value={selectedTicket.assigned_to || ""} onChange={(e) => setSelectedTicket((previous: any) => ({ ...previous, assigned_to: e.target.value ? Number(e.target.value) : null }))} onBlur={async () => { const res = await apiCall(`/admin/tickets/${selectedTicket.id}`, { method: "PATCH", body: JSON.stringify({ assignedTo: selectedTicket.assigned_to }) }); if (res.ok) { await openTicket(selectedTicket); loadTickets(); } }} placeholder="Admin ID to assign" className="px-3 py-2 rounded-xl border border-slate-200 text-sm" /></div>
            <div className="space-y-3">{(selectedTicket.ticket_messages || []).map((message: any) => <div key={message.id} className={`rounded-xl p-3 ${message.is_internal ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200"}`}><div className="text-[10px] uppercase font-bold text-slate-500">{message.is_internal ? "Internal note" : message.author_admin_id ? "Admin reply" : "Requester message"} · {new Date(message.created_at).toLocaleString()}</div><p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{message.body}</p></div>)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><textarea value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} rows={3} placeholder="Reply to requester" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" /><button onClick={() => addTicketMessage(false)} className="mt-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold">Send Reply</button></div><div><textarea value={ticketNote} onChange={(e) => setTicketNote(e.target.value)} rows={3} placeholder="Internal note (never shown to requester)" className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm" /><button onClick={() => addTicketMessage(true)} className="mt-2 px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">Add Internal Note</button></div></div>
            <div className="border-t border-slate-200 pt-4"><h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Audit history</h3><div className="mt-2 space-y-1">{ticketAudit.length === 0 ? <p className="text-xs text-slate-500">No audit events.</p> : ticketAudit.map((event: any) => <div key={event.id} className="text-xs text-slate-600">{event.action} · {new Date(event.created_at).toLocaleString()}</div>)}</div></div>
          </div>
        </div>
      )}

      {/* Client Update Composer Modal */}
      {updateModalOpen && selectedUpdateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form onSubmit={saveClientUpdate} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{editingClientUpdate ? "Edit Client Update" : "Send Client Update"}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Only {selectedUpdateClient.clientName} ({selectedUpdateClient.email})</p>
              </div>
              <button type="button" onClick={() => setUpdateModalOpen(false)} className="text-slate-500 hover:text-slate-600"><X size={18} /></button>
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
              <button type="submit" disabled={savingClientUpdate} className="px-5 py-2 bg-primary hover:bg-primary disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
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
              <button onClick={() => setKycReviewModal(null)} className="text-slate-500 hover:text-slate-600">
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
