import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Clock,
  ShieldCheck,
  Share2,
  Wallet,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Check,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User,
  Building2,
  FileCheck,
  Send,
  X,
  MessageSquare,
  FileText,
  FolderKanban,
  ListChecks,
  Activity,
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { BPO_PLANS } from "@/data/packages-data";
import PayPalButton from "@/components/ui/PayPalButton";

interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  selectedPlan: string | null;
  referralCode: string | null;
  createdAt: string;
}

interface Plan {
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
  isBpo?: boolean;
}

interface ClientUpdate {
  id: number;
  title: string;
  message: string;
  category: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  created_at: string;
  ticket_messages: Array<{ id: number; body: string; author_admin_id: number | null; is_internal: boolean; created_at: string }>;
  ticket_attachments: Array<{ id: number; file_name: string; content_type: string }>;
}

interface Project {
  id: number;
  name: string;
  project_type: string;
  status: string;
  progress_percent: number;
  start_date: string | null;
  expected_end_date: string | null;
  description: string | null;
  scope: string | null;
  project_milestones?: Array<{ id: number; name: string; status: string; completion_percent: number; due_date: string | null }>;
  project_tasks?: Array<{ id: number; name: string; status: string; priority: string; due_date: string | null; completion_percent: number }>;
  project_deliverables?: Array<{ id: number; name: string; status: string; description: string | null }>;
  project_activity?: Array<{ id: number; action: string; description: string; created_at: string }>;
  project_meetings?: Array<{ id: number; title: string; status: string; starts_at: string; ends_at: string; timezone: string; location: string | null }>;
}

interface ProjectNotification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

interface ClientDocument { id: number; original_file_name: string; category: string; mime_type: string; file_size: number; project_id: number | null; status: string; created_at: string; uploaded_by: string; }
interface ClientConversation { id: number; project_id: number; subject: string; status: string; messages: Array<{ id: number; body: string; sender_user_id: string | null; sender_admin_id: number | null; created_at: string; read: boolean; attachments: Array<{ id: number; file_name: string }> }>; }
// BUG 2 + BUG 11 FIX: Added missing fields that the API returns (action_items, activity, agenda, cancellation_reason)
interface MeetingActionItem { id: number; title: string; description: string | null; priority: string; status: string; due_date: string | null; assigned_user_id: string | null; }
interface MeetingNote { id: number; note_type: string; body: string; client_visible?: boolean; }
interface MeetingParticipant { id: number; user_id: string | null; participant_role: string; rsvp_status: string; }
interface MeetingActivity { id: number; action: string; metadata: Record<string, unknown>; created_at: string; }
interface ClientMeeting { id: number; project_id: number; title: string; description: string | null; meeting_type: string; status: string; starts_at: string; ends_at: string; timezone: string; location: string | null; agenda: string | null; cancellation_reason: string | null; participants: MeetingParticipant[]; notes: MeetingNote[]; action_items: MeetingActionItem[]; activity?: MeetingActivity[]; }

// ── Billing interfaces ─────────────────────────────────────────────────────
interface InvoiceItem { id: number; sort_order: number; description: string; quantity: number; unit_price: number; line_total: number; }
interface InvoicePayment { id: number; amount: number; currency: string; payment_method: string; gateway: string | null; gateway_order_id: string | null; reference: string | null; status: string; paid_at: string | null; notes: string | null; created_at: string; }
interface InvoiceReceipt { id: number; receipt_number: string; invoice_id: number; payment_id: number; amount: number; currency: string; created_at: string; }
interface ClientInvoice {
  id: number; invoice_number: string; project_id: number | null;
  invoice_date: string; due_date: string; currency: string;
  subtotal: number; tax_amount: number; discount_amount: number;
  total: number; amount_paid: number; balance_due: number;
  status: string; sent_at: string | null; paid_at: string | null;
  notes: string | null; terms: string | null;
  invoice_items?: InvoiceItem[];
  invoice_payments?: InvoicePayment[];
  invoice_receipts?: InvoiceReceipt[];
}
interface BillingSummary {
  totalBilled: number; totalPaid: number; totalPending: number;
  totalOverdue: number; outstandingBalance: number; invoiceCount: number;
}

type ModuleAvailability = Record<string, boolean>;

async function fileAsAttachment(file: File) {
  return new Promise<{ fileName: string; contentType: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ fileName: file.name, contentType: file.type, data: String(reader.result) });
    reader.onerror = () => reject(new Error("Unable to read attachment"));
    reader.readAsDataURL(file);
  });
}

const BPO_PLAN_IDS = new Set(BPO_PLANS.map((plan) => plan.id));
const BPO_DASHBOARD_PLANS: Plan[] = BPO_PLANS.map((plan, index) => ({
  id: 1000 + index,
  serviceId: plan.id,
  serviceNumber: `BPO-${String(index + 1).padStart(2, "0")}`,
  category: "BPO & Outsourcing",
  name: plan.name,
  price: plan.priceNumeric,
  tag: plan.isPopular ? "MOST POPULAR" : "ScaleOS Partnership",
  description: "Thinkatic ScaleOS BPO / Outsourcing Partnership",
  features: [plan.seatRange, plan.partnershipTerm, ...plan.includes],
  popular: Boolean(plan.isPopular),
  isBpo: true,
}));

interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  durationMinutes: number;
  notes: string | null;
}

interface KycRecord {
  id?: number;
  fullName?: string;
  status: "unsubmitted" | "pending" | "verified" | "rejected";
  documentType?: string;
  documentNumber?: string;
  country?: string;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

interface AffiliateData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarned: number;
  referrals: Array<{
    id: number;
    referredUserId: string;
    referralCode: string;
    status: string;
    commissionRate: number;
    totalReward: number;
    createdAt: string;
  }>;
}

interface WalletData {
  id: number;
  balance: number;
  pendingBalance: number;
  currency: string;
  isLocked: boolean;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  fee: number;
  status: string;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

interface Purchase {
  id: number;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  status: string;
  purchasedAt: string | null;
}

interface PayoutDetail {
  id: number;
  method: "paypal" | "indian_bank";
  displayLabel: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  currency: string;
  method: "paypal" | "indian_bank";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
}

export default function UserDashboardPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"overview" | "projects" | "meetings" | "billing" | "documents" | "communications" | "plans" | "updates" | "tickets" | "attendance" | "kyc" | "affiliate" | "wallet" | "profile">("overview");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [bpoEligible, setBpoEligible] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetail[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawMethod, setWithdrawMethod] = useState<"paypal" | "indian_bank">("paypal");
  const [payoutDetailsId, setPayoutDetailsId] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [bankDetails, setBankDetails] = useState({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", accountType: "savings" });
  const [savingPayout, setSavingPayout] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "General Support", priority: "medium", description: "" });
  const [ticketReply, setTicketReply] = useState<Record<number, string>>({});
  const [ticketAttachments, setTicketAttachments] = useState<Array<{ fileName: string; contentType: string; data: string }>>([]);
  const [replyAttachments, setReplyAttachments] = useState<Record<number, Array<{ fileName: string; contentType: string; data: string }>>>({});
  const [ticketBusy, setTicketBusy] = useState(false);
  const [modules, setModules] = useState<ModuleAvailability>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ClientConversation | null>(null);
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentCategory, setDocumentCategory] = useState("all");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageAttachment, setMessageAttachment] = useState<{ fileName: string; contentType: string; data: string } | null>(null);
  const [conversationSubject, setConversationSubject] = useState("");
  const [conversationProjectId, setConversationProjectId] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<ClientMeeting | null>(null);
  const [meetingRequest, setMeetingRequest] = useState({ projectId: "", subject: "", startsAt: "", endsAt: "", reason: "" });

  // Billing state
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [billingPayments, setBillingPayments] = useState<InvoicePayment[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals & sub-states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [planToConfirm, setPlanToConfirm] = useState<Plan | null>(null);

  // Attendance state
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [markingAttendance, setMarkingAttendance] = useState(false);

  // KYC Form state
  const [kycForm, setKycForm] = useState({
    fullName: "",
    dateOfBirth: "1990-01-01",
    country: "US",
    documentType: "passport",
    documentNumber: "",
    documentFrontUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136",
    documentBackUrl: "",
    selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  });
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Withdrawal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Profile Form
  const [profileFullName, setProfileFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const token = localStorage.getItem("user_token");

  const showToast = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      if (!token) throw new Error("Unauthorized");
      const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      if (res.status === 401) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_profile");
        setLocation("/login");
        throw new Error("Session expired");
      }
      return res;
    },
    [token, setLocation]
  );

  const loadAllData = useCallback(async () => {
    if (!token) {
      setLocation("/login");
      return;
    }

    try {
      let availableModules = modules;
      let mayUseBpoWithdrawals = false;
      // 1. Profile
      const pRes = await authFetch("/user/profile");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData);
        setProfileFullName(pData.fullName || "");
        mayUseBpoWithdrawals = pData.role === "partner" || pData.role === "bpo_partner" || BPO_PLAN_IDS.has(pData.selectedPlan || "");
      }
      const modulesRes = await authFetch("/user/modules");
      if (modulesRes.ok) {
        const moduleRows = await modulesRes.json() as Array<{ module_key: string; enabled: boolean }>;
        availableModules = Object.fromEntries(moduleRows.map((item) => [item.module_key, item.enabled]));
        setModules(availableModules);
      }

      // 2. Plans
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const technologyPlans = plansData.filter((plan: Plan) => !BPO_PLAN_IDS.has(plan.serviceId));
        setPlans([...technologyPlans, ...BPO_DASHBOARD_PLANS]);
      }

      if (availableModules.projects !== false) {
        setProjectsLoading(true);
        const projectsRes = await authFetch("/projects");
        if (projectsRes.ok) setProjects(await projectsRes.json());
        setProjectsLoading(false);
      }

      const notificationsRes = await authFetch("/user/notifications");
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
      if (availableModules.documents !== false) { const documentsRes = await authFetch("/documents"); if (documentsRes.ok) setDocuments(await documentsRes.json()); }
      if (availableModules.communication !== false) { const conversationsRes = await authFetch("/conversations"); if (conversationsRes.ok) setConversations(await conversationsRes.json()); }
      if (availableModules.meetings !== false) {
        const meetingsRes = await authFetch("/meetings");
        if (meetingsRes.ok) setMeetings(await meetingsRes.json());
        else if (meetingsRes.status === 503) showToast("error", "Meetings module is currently disabled");
      }

      if (availableModules.billing !== false) {
        const [invRes, sumRes, pymtRes] = await Promise.all([
          authFetch("/invoices"),
          authFetch("/invoices/summary"),
          authFetch("/billing/payments"),
        ]);
        if (invRes.ok) setInvoices(await invRes.json());
        if (sumRes.ok) setBillingSummary(await sumRes.json());
        if (pymtRes.ok) setBillingPayments(await pymtRes.json());
        if (invRes.status === 503) showToast("error", "Billing module is currently disabled");
      }

      const updatesRes = availableModules.client_updates === false ? null : await authFetch("/user/updates");
      if (updatesRes?.ok) {
        setUpdates(await updatesRes.json());
      }

      const ticketsRes = availableModules.tickets === false ? null : await authFetch("/tickets");
      if (ticketsRes?.ok) setTickets(await ticketsRes.json());

      // 3. Attendance
      const attRes = availableModules.attendance === false ? null : await authFetch("/user/attendance");
      if (attRes?.ok) {
        const attData = await attRes.json();
        setAttendance(attData);
      }

      // 4. KYC
      const kycRes = availableModules.kyc === false ? null : await authFetch("/user/kyc");
      if (kycRes?.ok) {
        const kycData = await kycRes.json();
        setKyc(kycData);
        if (kycData.fullName) {
          setKycForm((prev) => ({ ...prev, fullName: kycData.fullName }));
        }
      }

      // 5. Affiliate
      const affRes = availableModules.affiliate === false ? null : await authFetch("/user/affiliate");
      if (affRes?.ok) {
        const affData = await affRes.json();
        setAffiliate(affData);
      }

      // 6. Wallet
      const wRes = availableModules.wallet === false ? null : await authFetch("/user/wallet");
      if (wRes?.ok) {
        const wData = await wRes.json();
        setWallet(wData);
      }

      // 7. Transactions
      const txRes = availableModules.wallet === false ? null : await authFetch("/user/wallet/transactions");
      if (txRes?.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }

      const purchaseRes = await authFetch("/user/purchases");
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchases(purchaseData);
      }

      const accessRes = mayUseBpoWithdrawals && availableModules.bpo_withdrawals !== false ? await authFetch("/user/withdrawals/access") : null;
      const eligible = accessRes?.ok === true;
      setBpoEligible(eligible);
      if (eligible) {
        const [detailRes, withdrawalRes] = await Promise.all([authFetch("/user/payout-details"), authFetch("/user/withdrawals")]);
        if (detailRes.ok) setPayoutDetails(await detailRes.json());
        if (withdrawalRes.ok) setWithdrawals(await withdrawalRes.json());
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, authFetch, setLocation]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const openProject = async (project: Project) => {
    try {
      const response = await authFetch(`/projects/${project.id}`);
      if (!response.ok) throw new Error("Unable to load project details");
      setSelectedProject(await response.json());
      setTab("projects");
    } catch (error: any) { showToast("error", error.message); }
  };
  const openMeeting = async (meeting: ClientMeeting) => { const response = await authFetch(`/meetings/${meeting.id}`); if (!response.ok) return showToast("error", "Unable to load meeting"); setSelectedMeeting(await response.json()); setTab("meetings"); };
  const updateRsvp = async (meeting: ClientMeeting, status: string) => { const response = await authFetch(`/meetings/${meeting.id}/rsvp`, { method: "POST", body: JSON.stringify({ status }) }); if (!response.ok) return showToast("error", "Unable to update RSVP"); await loadAllData(); if (selectedMeeting?.id === meeting.id) await openMeeting(meeting); };

  // Billing functions
  const openInvoice = async (invoice: ClientInvoice) => {
    setBillingLoading(true);
    try {
      const res = await authFetch(`/invoices/${invoice.id}`);
      if (!res.ok) return showToast("error", "Unable to load invoice");
      setSelectedInvoice(await res.json());
    } finally { setBillingLoading(false); }
  };
  const initiatePayPalPayment = async (invoice: ClientInvoice, amount?: number) => {
    setPayingInvoiceId(invoice.id);
    try {
      const res = await authFetch(`/invoices/${invoice.id}/pay/paypal`, {
        method: "POST",
        body: JSON.stringify(amount ? { amount } : {}),
      });
      const data = await res.json();
      if (!res.ok) return showToast("error", data.message || data.error || "Unable to initiate payment");
      // PayPal JS SDK not embedded here — show order ID for manual flow / redirect
      showToast("success", `Payment order created. Order ID: ${data.orderId}. Use the PayPal checkout to complete payment.`);
      // In production this would open the PayPal popup; for now surface the orderId
    } catch (e: any) { showToast("error", e.message); }
    finally { setPayingInvoiceId(null); }
  };
  // BUG 7 FIX: API expects preferredStartsAt / preferredEndsAt, not startsAt / endsAt
  const requestMeeting = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await authFetch("/meeting-requests", {
      method: "POST",
      body: JSON.stringify({
        projectId: Number(meetingRequest.projectId),
        subject: meetingRequest.subject,
        preferredStartsAt: meetingRequest.startsAt,
        preferredEndsAt: meetingRequest.endsAt,
        reason: meetingRequest.reason,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return showToast("error", err.message || err.error || "Unable to request meeting");
    }
    setMeetingRequest({ projectId: "", subject: "", startsAt: "", endsAt: "", reason: "" });
    showToast("success", "Meeting request submitted");
  };

  const openConversation = async (conversation: ClientConversation) => { const response = await authFetch(`/conversations/${conversation.id}`); if (!response.ok) return showToast("error", "Unable to load conversation"); const data = await response.json(); setSelectedConversation(data); await authFetch(`/conversations/${conversation.id}/read`, { method: "POST" }); };
  const sendProjectMessage = async () => { if (!selectedConversation || !messageDraft.trim()) return; const response = await authFetch(`/conversations/${selectedConversation.id}/messages`, { method: "POST", body: JSON.stringify({ body: messageDraft, attachments: messageAttachment ? [messageAttachment] : [] }) }); if (!response.ok) return showToast("error", "Unable to send message"); setMessageDraft(""); setMessageAttachment(null); await openConversation(selectedConversation); };
  const createConversation = async (event: React.FormEvent) => { event.preventDefault(); const response = await authFetch("/conversations", { method: "POST", body: JSON.stringify({ projectId: Number(conversationProjectId), subject: conversationSubject }) }); if (!response.ok) return showToast("error", "Unable to create conversation"); const data = await response.json(); setConversations((previous) => [data, ...previous]); setConversationSubject(""); setSelectedConversation(data); };
  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file || file.size > 25 * 1024 * 1024) return showToast("error", "Documents must be 25 MB or smaller"); const data = new Uint8Array(await file.arrayBuffer()); let binary = ""; for (let index = 0; index < data.length; index += 8192) binary += String.fromCharCode(...data.subarray(index, index + 8192)); const encoded = btoa(binary); const response = await authFetch("/documents", { method: "POST", body: JSON.stringify({ projectId: Number(conversationProjectId || projects[0]?.id), category: documentCategory === "all" ? "Other" : documentCategory, file: { fileName: file.name, contentType: file.type, data: `data:${file.type};base64,${encoded}` } }) }); if (!response.ok) return showToast("error", "Unable to upload document"); const uploaded = await response.json(); setDocuments((previous) => [uploaded, ...previous]); showToast("success", "Document uploaded"); };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_profile");
    setLocation("/login");
  };

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    setTicketBusy(true);
    try {
      const res = await authFetch("/tickets", { method: "POST", body: JSON.stringify({ ...ticketForm, attachments: ticketAttachments }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create ticket");
      setTickets((previous) => [data, ...previous]);
      setTicketForm({ subject: "", category: "General Support", priority: "medium", description: "" });
      setTicketAttachments([]);
      showToast("success", `Ticket ${data.ticket_number} created.`);
    } catch (error: any) { showToast("error", error.message); }
    finally { setTicketBusy(false); }
  };

  const replyToTicket = async (ticket: Ticket) => {
    const body = ticketReply[ticket.id]?.trim();
    if (!body) return;
    const res = await authFetch(`/tickets/${ticket.id}/replies`, { method: "POST", body: JSON.stringify({ body, attachments: replyAttachments[ticket.id] || [] }) });
    if (!res.ok) { showToast("error", "Unable to send reply"); return; }
    setTicketReply((previous) => ({ ...previous, [ticket.id]: "" }));
    setReplyAttachments((previous) => ({ ...previous, [ticket.id]: [] }));
    showToast("success", "Reply sent to support.");
    loadAllData();
  };

  // Check today's attendance status
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.find((a) => a.date === todayStr);

  const handleCheckIn = async () => {
    setMarkingAttendance(true);
    try {
      const res = await authFetch("/user/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ notes: attendanceNotes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check-in failed");
      showToast("success", "Successfully checked in for today!");
      setAttendanceNotes("");
      loadAllData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    setMarkingAttendance(true);
    try {
      const res = await authFetch("/user/attendance/check-out", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check-out failed");
      showToast("success", `Successfully checked out! Logged ${data.durationMinutes} minutes.`);
      loadAllData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setMarkingAttendance(false);
    }
  };

  const savePayoutDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    try {
      const payload = withdrawMethod === "paypal" ? { method: withdrawMethod, paypalEmail: payoutEmail } : { method: withdrawMethod, ...bankDetails };
      const res = await authFetch("/user/payout-details", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save payout details");
      setPayoutDetails((prev) => [data, ...prev.filter((item) => item.method !== data.method)]);
      setPayoutDetailsId(String(data.id));
      showToast("success", "Payout details saved securely.");
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSavingPayout(false);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingKyc(true);
    try {
      const res = await authFetch("/user/kyc", {
        method: "POST",
        body: JSON.stringify(kycForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "KYC submission failed");
      showToast("success", "Identity documents submitted! Under compliance review.");
      loadAllData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      showToast("error", "Please enter a valid withdrawal amount");
      return;
    }
    setWithdrawing(true);
    if (!payoutDetailsId) {
      showToast("error", "Save and select a payout method first");
      return;
    }
    try {
      const res = await authFetch("/user/withdrawals", {
        method: "POST",
        body: JSON.stringify({ amount: amt, payoutDetailsId: Number(payoutDetailsId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");
      showToast("success", "Withdrawal request submitted for admin review.");
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      loadAllData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authFetch("/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: profileFullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      showToast("success", "Profile updated successfully!");
      setProfile(data);
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Copied to clipboard!");
  };

  const categories = ["All", ...Array.from(new Set(plans.map((p) => p.category)))];
  const filteredPlans =
    selectedCategory === "All" ? plans : plans.filter((p) => p.category === selectedCategory);

  const activePlanObj = plans.find((p) => p.serviceId === profile?.selectedPlan);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-slate-500 font-medium">Connecting to Thinkatic Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo & Portal Label */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <BrandLogo larger />
            <span className="text-xs font-mono tracking-widest text-blue-600 uppercase font-bold border-l border-slate-300 pl-3 flex-shrink-0">
                Client Portal
            </span>
          </Link>

          {/* Right Section: Refresh, User Info, Log Out */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : ""} />
            </button>

            <div className="h-8 w-px bg-slate-200 flex-shrink-0" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                {profile?.fullName ? profile.fullName.charAt(0) : "U"}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{profile?.fullName || "Client"}</div>
                <div className="text-[10px] text-slate-500 truncate">{profile?.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex-shrink-0 whitespace-nowrap"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1">
            {[
              { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
              ...(modules.projects !== false ? [{ id: "projects", label: "Projects", icon: FolderKanban, badge: projects.length || undefined }] : []),
              ...(modules.meetings !== false ? [{ id: "meetings", label: "Meetings", icon: Calendar, badge: meetings.filter((meeting) => ["scheduled", "confirmed"].includes(meeting.status)).length || undefined }] : []),
              ...(modules.billing !== false ? [{ id: "billing", label: "Billing & Invoices", icon: DollarSign, badge: invoices.filter(i => ["overdue","pending_payment","partially_paid","sent"].includes(i.status)).length || undefined }] : []),
              ...(modules.documents !== false ? [{ id: "documents", label: "Documents", icon: FileText, badge: documents.length || undefined }] : []),
              ...(modules.communication !== false ? [{ id: "communications", label: "Project Chat", icon: MessageSquare, badge: conversations.filter((conversation) => conversation.messages.some((message) => !message.read && message.sender_admin_id)).length || undefined }] : []),
              { id: "plans", label: "Services & Plans", icon: Layers, badge: plans.length },
              ...(modules.client_updates !== false ? [{ id: "updates", label: "Your Updates", icon: MessageSquare, badge: updates.length || undefined }] : []),
              ...(modules.tickets !== false ? [{ id: "tickets", label: "Support Tickets", icon: MessageSquare, badge: tickets.length || undefined }] : []),
              ...(modules.attendance !== false ? [{ id: "attendance", label: "Attendance & Shift", icon: Clock }] : []),
              ...(modules.kyc !== false ? [{ id: "kyc", label: "KYC Verification", icon: ShieldCheck, badge: kyc?.status === "verified" ? "Verified" : kyc?.status === "pending" ? "Pending" : "Required" }] : []),
              ...(modules.affiliate !== false ? [{ id: "affiliate", label: "Affiliate & Rewards", icon: Share2 }] : []),
              ...(bpoEligible && modules.wallet !== false ? [{ id: "wallet", label: "BPO Withdrawals", icon: Wallet, badge: `$${wallet?.balance.toFixed(0) || 0}` }] : []),
              { id: "profile", label: "Account Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : item.badge === "Verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.badge === "Required"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Help Card */}
          <div className="mt-6 bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
            <Sparkles size={20} className="text-blue-400 mb-2" />
            <div className="text-xs font-bold mb-1">Dedicated Enterprise Support</div>
            <p className="text-[11px] text-blue-200 leading-relaxed mb-3">
              Need custom enterprise architecture or 24/7 SLA governance?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors"
            >
              <span>Contact Senior Engineer</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {actionMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-medium shadow-xs ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Welcome back, {profile?.fullName || "Enterprise Partner"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Client ID: <span className="font-mono text-slate-700">{profile?.id.slice(0, 8)}...</span> ·
                    Status: <span className="text-emerald-600 font-semibold">Active Client</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTab("plans")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Browse 16 Plans
                  </button>
                  <button
                    onClick={() => setTab("attendance")}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Log Attendance
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Wallet Balance */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wallet Balance</span>
                    <Wallet size={16} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ${wallet?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Pending: ${wallet?.pendingBalance.toFixed(2) || "0.00"}</span>
                    <button
                      onClick={() => setTab("wallet")}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Payout →
                    </button>
                  </div>
                </div>

                {/* Card 2: Active Plan */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Service</span>
                    <Layers size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-base font-bold text-slate-900 truncate">
                    {activePlanObj ? activePlanObj.name : "No Plan Activated"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{activePlanObj ? `$${activePlanObj.price.toLocaleString()}` : "16 available"}</span>
                    <button
                      onClick={() => setTab("plans")}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Change →
                    </button>
                  </div>
                </div>

                {/* Card 3: Today's Shift */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shift Status</span>
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {todayAttendance
                      ? todayAttendance.checkOut
                        ? "Shift Finished"
                        : "Currently Clocked In"
                      : "Not Checked In"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{todayAttendance ? `${todayAttendance.durationMinutes} mins logged` : "Ready"}</span>
                    <button
                      onClick={() => setTab("attendance")}
                      className="text-amber-600 font-semibold hover:underline"
                    >
                      Clock →
                    </button>
                  </div>
                </div>

                {/* Card 4: KYC Status */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identity KYC</span>
                    <ShieldCheck size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-base font-bold capitalize text-slate-900">
                    {kyc?.status || "Unsubmitted"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{kyc?.status === "verified" ? "100% Compliant" : "Verification Needed"}</span>
                    <button
                      onClick={() => setTab("kyc")}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-bold text-slate-900">Notifications</h2><span className="text-[11px] text-slate-500">{notifications.length} total</span></div>
                {notifications.length === 0 ? <p className="text-xs text-slate-500 py-4">No project notifications yet.</p> : <div className="space-y-2">{notifications.slice(0, 5).map((notification) => <div key={notification.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-slate-800">{notification.title}</p><time className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(notification.created_at).toLocaleDateString()}</time></div><p className="text-xs text-slate-500 mt-1">{notification.body}</p></div>)}</div>}
              </section>

              {/* Recent Ledger & Attendance Previews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Attendance */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Recent Attendance Logs</h2>
                    <button
                      onClick={() => setTab("attendance")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {attendance.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No attendance logged yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {attendance.slice(0, 4).map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="font-semibold text-slate-800">{rec.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">{rec.durationMinutes} mins</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                              {rec.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Wallet Activity</h2>
                    <button
                      onClick={() => setTab("wallet")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View Wallet
                    </button>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No wallet activity recorded.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {transactions.slice(0, 4).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{tx.description}</div>
                            <div className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${tx.type === "deposit" || tx.type === "commission" ? "text-emerald-600" : "text-slate-900"}`}>
                              {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-400 capitalize">{tx.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES & PLANS */}
          {tab === "projects" && (
            <div className="space-y-6">
              <div><h1 className="text-xl font-bold text-slate-900">Projects</h1><p className="text-xs text-slate-500 mt-0.5">Track delivery progress, milestones, tasks, and client-visible deliverables.</p></div>
              {projectsLoading ? <div className="py-16 text-center text-sm text-slate-500">Loading projects...</div> : projects.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs"><FolderKanban size={28} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-semibold text-slate-700">No projects assigned yet</p><p className="text-xs text-slate-500 mt-1">Your project workspace will appear here when a project is assigned.</p></div> : <div className="space-y-4">{selectedProject ? <div className="space-y-5"><button onClick={() => setSelectedProject(null)} className="text-xs font-bold text-blue-700">← All Projects</button><div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="font-mono text-[10px] text-blue-700">PROJECT #{selectedProject.id}</span><h2 className="text-xl font-bold text-slate-900">{selectedProject.name}</h2><p className="text-xs text-slate-500">{selectedProject.project_type}</p></div><span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">{selectedProject.status.replaceAll("_", " ")}</span></div><div className="mt-5"><div className="flex justify-between text-xs font-semibold text-slate-600"><span>Overall progress</span><span>{selectedProject.progress_percent}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedProject.progress_percent}%` }} /></div></div>{selectedProject.description && <p className="mt-5 text-sm text-slate-600 whitespace-pre-wrap">{selectedProject.description}</p>}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><section className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm text-slate-900 mb-3">Milestones</h3>{(selectedProject.project_milestones || []).length === 0 ? <p className="text-xs text-slate-500">No milestones yet.</p> : <div className="space-y-3">{selectedProject.project_milestones?.map((milestone) => <div key={milestone.id} className="border-b border-slate-100 pb-3"><div className="flex justify-between gap-2"><span className="text-sm font-semibold text-slate-800">{milestone.name}</span><span className="text-[10px] uppercase font-bold text-slate-500">{milestone.status.replaceAll("_", " ")}</span></div><div className="mt-2 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${milestone.completion_percent}%` }} /></div><p className="text-[10px] text-slate-500 mt-1">{milestone.completion_percent}%{milestone.due_date ? ` · Due ${milestone.due_date}` : ""}</p></div>)}</div>}</section><section className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm text-slate-900 mb-3">Tasks</h3>{(selectedProject.project_tasks || []).length === 0 ? <p className="text-xs text-slate-500">No client-visible tasks yet.</p> : <div className="space-y-2">{selectedProject.project_tasks?.map((task) => <div key={task.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2"><div><p className="text-sm font-semibold text-slate-800">{task.name}</p><p className="text-[10px] text-slate-500">{task.status.replaceAll("_", " ")}{task.due_date ? ` · Due ${task.due_date}` : ""}</p></div><span className="text-[10px] font-bold uppercase text-slate-500">{task.priority}</span></div>)}</div>}</section><section className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm text-slate-900 mb-3">Deliverables</h3>{(selectedProject.project_deliverables || []).length === 0 ? <p className="text-xs text-slate-500">No deliverables yet.</p> : <div className="space-y-2">{selectedProject.project_deliverables?.map((deliverable) => <div key={deliverable.id} className="flex justify-between gap-3 border-b border-slate-100 pb-2"><span className="text-sm font-semibold text-slate-800">{deliverable.name}</span><span className="text-[10px] uppercase font-bold text-blue-700">{deliverable.status.replaceAll("_", " ")}</span></div>)}</div>}</section><section className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm text-slate-900 mb-3">Activity</h3>{(selectedProject.project_activity || []).length === 0 ? <p className="text-xs text-slate-500">No activity yet.</p> : <div className="space-y-2">{selectedProject.project_activity?.slice(0, 10).map((event) => <div key={event.id} className="flex gap-2"><Activity size={14} className="text-blue-600 shrink-0 mt-0.5" /><div><p className="text-xs text-slate-700">{event.description}</p><p className="text-[10px] text-slate-400">{new Date(event.created_at).toLocaleString()}</p></div></div>)}</div>}</section></div></div> : projects.map((project) => <button key={project.id} onClick={() => openProject(project)} className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="font-mono text-[10px] text-blue-700">PROJECT #{project.id}</span><h2 className="text-base font-bold text-slate-900">{project.name}</h2><p className="text-xs text-slate-500">{project.project_type}</p></div><span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{project.status.replaceAll("_", " ")}</span></div><div className="mt-4"><div className="flex justify-between text-xs text-slate-500"><span>Progress</span><span>{project.progress_percent}%</span></div><div className="mt-1.5 h-2 rounded-full bg-slate-100"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress_percent}%` }} /></div></div><div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-500"><span>Start: {project.start_date || "Not set"}</span><span>Expected: {project.expected_end_date || "Not set"}</span></div></button>)}</div>}
            </div>
          )}

          {tab === "plans" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Services &amp; Plans</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore enterprise technology packages and Thinkatic ScaleOS BPO partnerships.
                  </p>
                </div>
                {profile?.selectedPlan && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold flex items-center gap-2">
                    <Check size={14} className="text-blue-600" />
                    <span>Active: {activePlanObj?.name || profile.selectedPlan}</span>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlans.map((plan) => {
                  const isCurrent = profile?.selectedPlan === plan.serviceId;
                  return (
                    <div
                      key={plan.serviceId}
                      className={`bg-white rounded-2xl border transition-all flex flex-col p-6 relative ${
                        isCurrent
                          ? "border-blue-600 shadow-md ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {plan.tag || "Popular"}
                        </div>
                      )}

                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                        #{plan.serviceNumber} · {plan.category}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="text-2xl font-extrabold text-slate-900 mb-4">
                        ${plan.price.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          {plan.category === "Managed Services" ? "/month" : "one-time"}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-4 mb-6 flex-1 space-y-2">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <Check size={14} className="text-blue-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <div className="text-[11px] text-slate-400 pl-5">
                            +{plan.features.length - 4} more enterprise features
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setPlanToConfirm(plan)}
                        disabled={isCurrent}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        }`}
                      >
                        {isCurrent ? "Currently Active Plan" : plan.isBpo ? "Discuss BPO Plan" : "Select Enterprise Plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "updates" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Your Updates</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private project, operational, and progress updates from your Thinkatic team.
                </p>
              </div>

              {updates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
                  <MessageSquare size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No updates yet</p>
                  <p className="text-xs text-slate-500 mt-1">Your client-specific updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <article key={update.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-slate-900">{update.title}</h2>
                            {update.category && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">{update.category}</span>}
                          </div>
                          <time className="text-[11px] text-slate-400" dateTime={update.publishedAt || update.createdAt}>
                            {new Date(update.publishedAt || update.createdAt).toLocaleString()}
                          </time>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 self-start">
                          Published
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{update.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "meetings" && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-bold text-slate-900">Meetings</h1><p className="text-xs text-slate-500 mt-1">Project meetings, reviews, demos, and planning sessions.</p></div>

              {/* Meeting request form */}
              <form onSubmit={requestMeeting} className="rounded-2xl border border-slate-200 bg-white p-4 grid grid-cols-1 md:grid-cols-5 gap-2">
                <select required value={meetingRequest.projectId} onChange={(event) => setMeetingRequest((value) => ({ ...value, projectId: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                  <option value="">Select project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <input required value={meetingRequest.subject} onChange={(event) => setMeetingRequest((value) => ({ ...value, subject: event.target.value }))} placeholder="Request subject" className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                <input required type="datetime-local" value={meetingRequest.startsAt} onChange={(event) => setMeetingRequest((value) => ({ ...value, startsAt: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                <input required type="datetime-local" value={meetingRequest.endsAt} onChange={(event) => setMeetingRequest((value) => ({ ...value, endsAt: event.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs" />
                <button type="submit" className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Request meeting</button>
                <textarea required value={meetingRequest.reason} onChange={(event) => setMeetingRequest((value) => ({ ...value, reason: event.target.value }))} placeholder="Reason / agenda" className="md:col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs" rows={2} />
              </form>

              {/* Meeting list */}
              {meetings.length === 0
                ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No meetings scheduled yet.</div>
                : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {meetings.map((meeting) => (
                      <button key={meeting.id} onClick={() => openMeeting(meeting)} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{meeting.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(meeting.starts_at).toLocaleString()} · {meeting.timezone}</p>
                          </div>
                          {/* BUG 11 FIX: status is now in the interface */}
                          <span className={`text-[10px] uppercase font-bold ${meeting.status === "cancelled" ? "text-red-600" : meeting.status === "completed" ? "text-emerald-700" : "text-blue-700"}`}>{meeting.status.replaceAll("_", " ")}</span>
                        </div>
                        {meeting.location && <p className="text-xs text-slate-500 mt-2">{meeting.location}</p>}
                      </button>
                    ))}
                  </div>
              }

              {/* Selected meeting detail panel */}
              {selectedMeeting && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">{selectedMeeting.title}</h2>
                      <p className="text-xs text-slate-500">{new Date(selectedMeeting.starts_at).toLocaleString()} — {new Date(selectedMeeting.ends_at).toLocaleTimeString()} · {selectedMeeting.timezone}</p>
                      {selectedMeeting.location && <p className="text-xs text-slate-500 mt-1">📍 {selectedMeeting.location}</p>}
                    </div>
                    <button onClick={() => setSelectedMeeting(null)} className="text-xs text-slate-500 hover:text-slate-800">Close</button>
                  </div>

                  {selectedMeeting.description && <p className="text-sm text-slate-700">{selectedMeeting.description}</p>}

                  {/* BUG 12 FIX: Show RSVP buttons based on current status — hide the active one */}
                  {(() => {
                    const myRsvp = selectedMeeting.participants.find((p) => p.user_id === profile?.id)?.rsvp_status;
                    return (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600 self-center">Your RSVP:</span>
                        {myRsvp !== "accepted" && (
                          <button onClick={() => updateRsvp(selectedMeeting, "accepted")} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Accept</button>
                        )}
                        {myRsvp !== "tentative" && (
                          <button onClick={() => updateRsvp(selectedMeeting, "tentative")} className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">Tentative</button>
                        )}
                        {myRsvp !== "declined" && (
                          <button onClick={() => updateRsvp(selectedMeeting, "declined")} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold">Decline</button>
                        )}
                        {myRsvp && (
                          <span className={`text-xs self-center px-2.5 py-1 rounded-full font-bold ${myRsvp === "accepted" ? "bg-emerald-100 text-emerald-700" : myRsvp === "declined" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            Current: {myRsvp}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* BUG 2 FIX: Render client-visible notes */}
                  {selectedMeeting.notes.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Meeting Notes</h3>
                      <div className="space-y-2">
                        {selectedMeeting.notes.map((note) => (
                          <div key={note.id} className="rounded-xl bg-white border border-slate-100 p-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400">{note.note_type.replaceAll("_", " ")}</span>
                            <p className="mt-1 text-sm text-slate-700">{note.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BUG 2 FIX: Render action items assigned to the current client */}
                  {selectedMeeting.action_items.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Your Action Items</h3>
                      <div className="space-y-2">
                        {selectedMeeting.action_items.map((item) => (
                          <div key={item.id} className="rounded-xl bg-white border border-slate-100 p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                              {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                              {item.due_date && <p className="text-[10px] text-slate-400 mt-0.5">Due {item.due_date}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : item.status === "cancelled" ? "bg-slate-100 text-slate-400" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{item.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── BILLING & INVOICES TAB ──────────────────────────────────────── */}
          {tab === "billing" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Billing &amp; Invoices</h1>
                <p className="text-xs text-slate-500 mt-0.5">View your invoices, payment history, and outstanding balances.</p>
              </div>

              {/* Summary cards */}
              {billingSummary && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    { label: "Total Billed", value: `$${billingSummary.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-blue-600" },
                    { label: "Total Paid", value: `$${billingSummary.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: BadgeCheck, color: "text-emerald-600" },
                    { label: "Pending", value: `$${billingSummary.totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Clock3, color: "text-amber-600" },
                    { label: "Overdue", value: `$${billingSummary.totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: AlertTriangle, color: "text-red-600" },
                    { label: "Outstanding", value: `$${billingSummary.outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-slate-700" },
                    { label: "Total Invoices", value: String(billingSummary.invoiceCount), icon: Receipt, color: "text-indigo-600" },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</span>
                          <Icon size={14} className={card.color} />
                        </div>
                        <div className="text-lg font-bold text-slate-900">{card.value}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Invoice detail panel */}
              {selectedInvoice && (
                <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-blue-700 font-bold">{selectedInvoice.invoice_number}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          selectedInvoice.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                          selectedInvoice.status === "overdue" ? "bg-red-100 text-red-700" :
                          selectedInvoice.status === "cancelled" ? "bg-slate-100 text-slate-500" :
                          selectedInvoice.status === "partially_paid" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{selectedInvoice.status.replaceAll("_", " ")}</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Invoice Detail</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {selectedInvoice.invoice_date} · Due: {selectedInvoice.due_date} · Currency: {selectedInvoice.currency}
                      </p>
                    </div>
                    <button onClick={() => setSelectedInvoice(null)} className="text-xs text-slate-500 hover:text-slate-800 shrink-0">Close ✕</button>
                  </div>

                  {/* Line items */}
                  {(selectedInvoice.invoice_items || []).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Line Items</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                            <tr>
                              <th className="p-3">Description</th>
                              <th className="p-3 text-right">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedInvoice.invoice_items!.map((item) => (
                              <tr key={item.id}>
                                <td className="p-3 text-slate-800">{item.description}</td>
                                <td className="p-3 text-right text-slate-600">{item.quantity}</td>
                                <td className="p-3 text-right text-slate-600">${Number(item.unit_price).toFixed(2)}</td>
                                <td className="p-3 text-right font-semibold text-slate-900">${Number(item.line_total).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${Number(selectedInvoice.subtotal).toFixed(2)}</span></div>
                    {Number(selectedInvoice.tax_amount) > 0 && <div className="flex justify-between text-slate-600"><span>Tax</span><span>${Number(selectedInvoice.tax_amount).toFixed(2)}</span></div>}
                    {Number(selectedInvoice.discount_amount) > 0 && <div className="flex justify-between text-slate-600"><span>Discount</span><span>−${Number(selectedInvoice.discount_amount).toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5"><span>Total</span><span>${Number(selectedInvoice.total).toFixed(2)}</span></div>
                    <div className="flex justify-between text-emerald-700"><span>Paid</span><span>${Number(selectedInvoice.amount_paid).toFixed(2)}</span></div>
                    <div className={`flex justify-between font-bold text-base ${Number(selectedInvoice.balance_due) > 0 ? "text-red-700" : "text-emerald-700"}`}>
                      <span>Balance Due</span><span>${Number(selectedInvoice.balance_due).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Notes & Terms */}
                  {selectedInvoice.notes && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Notes</h3>
                      <p className="text-sm text-slate-700">{selectedInvoice.notes}</p>
                    </div>
                  )}
                  {selectedInvoice.terms && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Terms</h3>
                      <p className="text-xs text-slate-500">{selectedInvoice.terms}</p>
                    </div>
                  )}

                  {/* Payment history for this invoice */}
                  {(selectedInvoice.invoice_payments || []).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Payment History</h3>
                      <div className="space-y-2">
                        {selectedInvoice.invoice_payments!.map((pmt) => (
                          <div key={pmt.id} className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-100 p-3 text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">${Number(pmt.amount).toFixed(2)} {pmt.currency}</p>
                              <p className="text-slate-500">{pmt.payment_method.replaceAll("_", " ")} {pmt.reference ? `· Ref: ${pmt.reference}` : ""}</p>
                              {pmt.paid_at && <p className="text-slate-400">{new Date(pmt.paid_at).toLocaleString()}</p>}
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              pmt.status === "successful" ? "bg-emerald-100 text-emerald-700" :
                              pmt.status === "failed" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>{pmt.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Receipts */}
                  {(selectedInvoice.invoice_receipts || []).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Receipts</h3>
                      <div className="space-y-2">
                        {selectedInvoice.invoice_receipts!.map((rct) => (
                          <div key={rct.id} className="flex items-center justify-between bg-emerald-50 rounded-xl border border-emerald-100 p-3 text-xs">
                            <div>
                              <p className="font-bold text-emerald-800 font-mono">{rct.receipt_number}</p>
                              <p className="text-emerald-700">${Number(rct.amount).toFixed(2)} · {new Date(rct.created_at).toLocaleDateString()}</p>
                            </div>
                            <BadgeCheck size={16} className="text-emerald-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pay button — shown only when payable */}
                  {["sent","pending_payment","partially_paid","overdue"].includes(selectedInvoice.status) && Number(selectedInvoice.balance_due) > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={() => initiatePayPalPayment(selectedInvoice)}
                        disabled={payingInvoiceId === selectedInvoice.id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                      >
                        <CreditCard size={14} />
                        {payingInvoiceId === selectedInvoice.id ? "Processing..." : `Pay $${Number(selectedInvoice.balance_due).toFixed(2)} via PayPal`}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1.5">Secure payment via PayPal. Your financial information is never stored on our servers.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Invoice list */}
              {billingLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <RefreshCw size={16} className="animate-spin" /> Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                  <Receipt size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No invoices yet</p>
                  <p className="text-xs text-slate-500 mt-1">Your invoices will appear here when issued by your account manager.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Invoice</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Due</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-right">Paid</th>
                        <th className="p-3 text-right">Balance</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className={`hover:bg-slate-50/50 ${selectedInvoice?.id === inv.id ? "bg-blue-50/50" : ""}`}>
                          <td className="p-3 font-mono font-bold text-blue-700">{inv.invoice_number}</td>
                          <td className="p-3 text-slate-600">{inv.invoice_date}</td>
                          <td className={`p-3 font-semibold ${inv.status === "overdue" ? "text-red-600" : "text-slate-600"}`}>{inv.due_date}</td>
                          <td className="p-3 text-right text-slate-800 font-semibold">${Number(inv.total).toFixed(2)}</td>
                          <td className="p-3 text-right text-emerald-700">${Number(inv.amount_paid).toFixed(2)}</td>
                          <td className={`p-3 text-right font-bold ${Number(inv.balance_due) > 0 ? "text-red-600" : "text-emerald-700"}`}>${Number(inv.balance_due).toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                              inv.status === "overdue" ? "bg-red-100 text-red-700" :
                              inv.status === "cancelled" ? "bg-slate-100 text-slate-500" :
                              inv.status === "draft" ? "bg-slate-100 text-slate-600" :
                              inv.status === "partially_paid" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>{inv.status.replaceAll("_", " ")}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openInvoice(inv)}
                                className="text-blue-700 font-bold text-[10px] hover:underline"
                              >View</button>
                              {["sent","pending_payment","partially_paid","overdue"].includes(inv.status) && Number(inv.balance_due) > 0 && (
                                <button
                                  onClick={() => { openInvoice(inv); }}
                                  disabled={payingInvoiceId === inv.id}
                                  className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >Pay</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Full payment history */}
              {billingPayments.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">All Payment History</h2>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Invoice</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Reference</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billingPayments.slice(0, 50).map((pmt: any) => (
                          <tr key={pmt.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono text-blue-700">{pmt.invoices?.invoice_number ?? `#${pmt.invoice_id}`}</td>
                            <td className="p-3 font-semibold text-slate-800">${Number(pmt.amount).toFixed(2)}</td>
                            <td className="p-3 capitalize text-slate-600">{pmt.payment_method?.replaceAll("_", " ")}</td>
                            <td className="p-3 text-slate-500">{pmt.reference ?? pmt.gateway_order_id ?? "—"}</td>
                            <td className="p-3 text-slate-500">{pmt.paid_at ? new Date(pmt.paid_at).toLocaleDateString() : new Date(pmt.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                pmt.status === "successful" ? "bg-emerald-100 text-emerald-700" :
                                pmt.status === "failed" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>{pmt.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold text-slate-900">Documents</h1><p className="text-xs text-slate-500 mt-1">Secure project files shared with your account.</p></div><label className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Upload document<input type="file" className="hidden" onChange={uploadDocument} /></label></div>
              <div className="flex flex-wrap gap-2"><input value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder="Search documents" className="flex-1 min-w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs" /><select value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"><option value="all">All categories</option>{["Contract", "Proposal", "Requirement", "Project Document", "Design", "Technical", "Deliverable", "Report", "Other"].map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
              {documents.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No documents available.</div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{documents.filter((document) => (!documentSearch || document.original_file_name.toLowerCase().includes(documentSearch.toLowerCase())) && (documentCategory === "all" || document.category === documentCategory)).map((document) => <div key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">{document.original_file_name}</p><p className="text-xs text-slate-500 mt-1">{document.category} · {(document.file_size / 1024).toFixed(1)} KB</p><p className="text-[11px] text-slate-400 mt-1">Uploaded by {document.uploaded_by} · {new Date(document.created_at).toLocaleDateString()}</p></div><span className="text-[10px] uppercase font-bold text-emerald-700">{document.status}</span></div><button onClick={async () => { const response = await authFetch(`/documents/${document.id}/download`); if (response.ok) window.open((await response.json()).url, "_blank", "noopener,noreferrer"); }} className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">Download</button></div>)}</div>}
            </div>
          )}

          {tab === "communications" && (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
              <section className="space-y-3"><div className="flex items-center justify-between"><h1 className="text-xl font-bold text-slate-900">Project Chat</h1><button onClick={() => setSelectedConversation(null)} className="text-xs font-bold text-blue-700">New</button></div><form onSubmit={createConversation} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"><select required value={conversationProjectId} onChange={(event) => setConversationProjectId(event.target.value)} className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white text-xs"><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><input required value={conversationSubject} onChange={(event) => setConversationSubject(event.target.value)} placeholder="Conversation subject" className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs" /><button className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Start conversation</button></form>{conversations.map((conversation) => <button key={conversation.id} onClick={() => openConversation(conversation)} className={`w-full text-left rounded-xl border p-3 ${selectedConversation?.id === conversation.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><p className="text-xs font-bold text-slate-900">{conversation.subject}</p><p className="text-[11px] text-slate-500">{conversation.messages.at(-1)?.body || "No messages yet"}</p></button>)}</section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 min-h-96 flex flex-col">{!selectedConversation ? <div className="m-auto text-center text-sm text-slate-500">Select a conversation to begin.</div> : <><div className="border-b border-slate-100 pb-3"><h2 className="font-bold text-slate-900">{selectedConversation.subject}</h2><p className="text-xs text-slate-500">Project #{selectedConversation.project_id}</p></div><div className="flex-1 space-y-3 py-4 overflow-y-auto">{selectedConversation.messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-xl p-3 text-xs ${message.sender_user_id ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}><p>{message.body}</p>{message.attachments?.map((attachment) => <p key={attachment.id} className="mt-2 text-[10px] underline">{attachment.file_name}</p>)}<time className="block mt-1 text-[10px] opacity-70">{new Date(message.created_at).toLocaleString()}</time></div>)}</div><form onSubmit={(event) => { event.preventDefault(); sendProjectMessage(); }} className="flex flex-wrap gap-2"><input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Write a project message" className="flex-1 min-w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs" /><label className="px-3 py-2 rounded-xl border border-slate-200 text-xs cursor-pointer">{messageAttachment ? messageAttachment.fileName : "Attach"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.zip,.docx,.xlsx" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (file && file.size <= 10 * 1024 * 1024) setMessageAttachment(await fileAsAttachment(file)); else if (file) showToast("error", "Attachments must be 10 MB or smaller"); }} /></label><button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Send</button></form></>}</section>
            </div>
          )}

          {tab === "tickets" && (
            <div className="space-y-6">
              <div><h1 className="text-xl font-bold text-slate-900">Support Tickets</h1><p className="text-xs text-slate-500 mt-0.5">Create and follow support requests with the Thinkatic team.</p></div>
              <form onSubmit={createTicket} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input required value={ticketForm.subject} onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm" /><select value={ticketForm.priority} onChange={(e) => setTicketForm((p) => ({ ...p, priority: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option><option value="urgent">Urgent</option></select></div>
                <select value={ticketForm.category} onChange={(e) => setTicketForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">{(profile?.role === "partner" || profile?.role === "bpo_partner" ? ["Process Issue", "Technical Issue", "Payment Issue", "Project Issue", "Employee Issue", "Training", "General Support"] : ["Technical Issue", "Billing Issue", "Project Issue", "Feature Request", "General Support"]).map((category) => <option key={category}>{category}</option>)}</select>
                <textarea required rows={4} value={ticketForm.description} onChange={(e) => setTicketForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the issue" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                <input type="file" accept="image/jpeg,image/png,application/pdf,text/plain,application/zip" multiple onChange={async (e) => { try { setTicketAttachments(await Promise.all(Array.from(e.target.files || []).slice(0, 5).map(fileAsAttachment))); } catch (error: any) { showToast("error", error.message); } }} className="w-full text-xs text-slate-500" />
                <button disabled={ticketBusy} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50">{ticketBusy ? "Submitting..." : "Create Ticket"}</button>
              </form>
              <div className="space-y-3">{tickets.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">No tickets yet.</div> : tickets.map((ticket) => <article key={ticket.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-mono text-xs font-bold text-blue-700">{ticket.ticket_number}</span><h2 className="font-bold text-slate-900">{ticket.subject}</h2></div><div className="flex items-center gap-2"><span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 rounded-full px-2 py-1">{ticket.status}</span>{["resolved", "closed"].includes(ticket.status) && <button onClick={async () => { const res = await authFetch(`/tickets/${ticket.id}/reopen`, { method: "PATCH" }); if (res.ok) { showToast("success", "Ticket reopened."); loadAllData(); } else { const data = await res.json(); showToast("error", data.error || "Unable to reopen ticket"); } }} className="text-[10px] font-bold text-blue-700">Reopen</button>}</div></div><p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{ticket.description}</p><div className="mt-3 space-y-2">{(ticket.ticket_messages || []).filter((message) => message.body !== ticket.description).map((message) => <div key={message.id} className="rounded-xl bg-slate-50 border border-slate-100 p-3"><div className="text-[10px] uppercase font-bold text-slate-400">{message.author_admin_id ? "Support" : "You"} · {new Date(message.created_at).toLocaleString()}</div><p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{message.body}</p></div>)}</div><div className="mt-4 flex gap-2"><input value={ticketReply[ticket.id] || ""} onChange={(e) => setTicketReply((p) => ({ ...p, [ticket.id]: e.target.value }))} placeholder="Reply to support" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" /><button onClick={() => replyToTicket(ticket)} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Reply</button></div><input type="file" accept="image/jpeg,image/png,application/pdf,text/plain,application/zip" multiple onChange={async (e) => { try { const attachments = await Promise.all(Array.from(e.target.files || []).slice(0, 5).map(fileAsAttachment)); setReplyAttachments((p) => ({ ...p, [ticket.id]: attachments })); } catch (error: any) { showToast("error", error.message); } }} className="mt-2 w-full text-xs text-slate-500" /></article>)}</div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE & SHIFTS */}
          {tab === "attendance" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Attendance & Shift Tracker</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record daily project shifts and track your verified attendance history.
                </p>
              </div>

              {/* Action Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Date</div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!todayAttendance ? (
                      <button
                        onClick={handleCheckIn}
                        disabled={markingAttendance}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {markingAttendance ? "Processing..." : "Clock In Now"}
                      </button>
                    ) : !todayAttendance.checkOut ? (
                      <button
                        onClick={handleCheckOut}
                        disabled={markingAttendance}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {markingAttendance ? "Processing..." : "Clock Out Now"}
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">
                        Shift Complete ({todayAttendance.durationMinutes} mins)
                      </div>
                    )}
                  </div>
                </div>

                {!todayAttendance && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Shift Notes / Sprint Tasks (Optional)
                    </label>
                    <input
                      type="text"
                      value={attendanceNotes}
                      onChange={(e) => setAttendanceNotes(e.target.value)}
                      placeholder="e.g. Working on RAG pipeline integration..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Attendance Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
                  Historical Attendance Log ({attendance.length} entries)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Check In</th>
                        <th className="py-3 px-4">Check Out</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No attendance history found.
                          </td>
                        </tr>
                      ) : (
                        attendance.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{rec.date}</td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {rec.checkOut
                                ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{rec.durationMinutes} mins</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                                {rec.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{rec.notes || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KYC VERIFICATION */}
          {tab === "kyc" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">KYC Identity Verification</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regulatory compliance and enterprise anti-fraud verification.
                </p>
              </div>

              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-start gap-3 text-xs ${
                  kyc?.status === "verified"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : kyc?.status === "pending"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : kyc?.status === "rejected"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm capitalize mb-0.5">Status: {kyc?.status || "Unsubmitted"}</div>
                  <p className="leading-relaxed">
                    {kyc?.status === "verified"
                      ? "Your identity has been successfully verified. You have full access to high-tier enterprise infrastructure and automated wallet withdrawals."
                      : kyc?.status === "pending"
                      ? "Your KYC documents have been received and are currently under review by our compliance team. Reviews typically complete within 24 business hours."
                      : kyc?.status === "rejected"
                      ? `Your verification was rejected. Reason: ${kyc.rejectionReason || "Documents unclear"}. Please re-submit below.`
                      : "Please submit your official government ID to verify your client identity."}
                  </p>
                </div>
              </div>

              {/* Verification Form */}
              {kyc?.status !== "verified" && (
                <form onSubmit={handleSubmitKyc} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                    Submit Verification Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={kycForm.fullName}
                        onChange={(e) => setKycForm({ ...kycForm, fullName: e.target.value })}
                        placeholder="Legal name on document"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={kycForm.dateOfBirth}
                        onChange={(e) => setKycForm({ ...kycForm, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Country of Issue</label>
                      <select
                        value={kycForm.country}
                        onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="US">United States (US)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="CA">Canada (CA)</option>
                        <option value="DE">Germany (DE)</option>
                        <option value="AU">Australia (AU)</option>
                        <option value="SG">Singapore (SG)</option>
                        <option value="AE">United Arab Emirates (AE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                      <select
                        value={kycForm.documentType}
                        onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="passport">Passport</option>
                        <option value="national_id">National ID Card</option>
                        <option value="drivers_license">Driver's License</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Document Number</label>
                      <input
                        type="text"
                        required
                        value={kycForm.documentNumber}
                        onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                        placeholder="e.g. A12345678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Document Front URL / CDN Link</label>
                      <input
                        type="url"
                        value={kycForm.documentFrontUrl}
                        onChange={(e) => setKycForm({ ...kycForm, documentFrontUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingKyc}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      {submittingKyc ? "Submitting..." : "Submit for Verification"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: AFFILIATE & REWARDS */}
          {tab === "affiliate" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Affiliate Referral Program</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Earn recurring 10% cash commission on every enterprise technology package signed through your link.
                </p>
              </div>

              {/* Referral Link Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Your Unique Referral Code</div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 select-all truncate">
                    {affiliate?.referralLink || "https://thinkatic.com?ref=" + profile?.referralCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(affiliate?.referralLink || "")}
                    className="w-full sm:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Total Referrals</div>
                  <div className="text-2xl font-black text-slate-900">{affiliate?.totalReferrals || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Enterprise accounts invited</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Commission Rate</div>
                  <div className="text-2xl font-black text-blue-600">10.00%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Per signed contract</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Total Commission Earned</div>
                  <div className="text-2xl font-black text-emerald-600">
                    ${affiliate?.totalEarned.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Directly credited to wallet</div>
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
                  Referred Client Accounts
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Client ID</th>
                        <th className="py-3 px-4">Date Joined</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Commission %</th>
                        <th className="py-3 px-4">Total Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!affiliate?.referrals || affiliate.referrals.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No referrals yet. Share your link to start earning commissions!
                          </td>
                        </tr>
                      ) : (
                        affiliate.referrals.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                              {r.referredUserId.slice(0, 8)}...
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 capitalize">
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{r.commissionRate}%</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-600">${r.totalReward.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WALLET & PAYOUTS */}
          {bpoEligible && tab === "wallet" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">BPO Wallet & Withdrawals</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage available funds, payouts, and view the immutable transaction ledger.
                  </p>
                </div>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={!wallet || wallet.balance <= 0}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Request Payout / Withdrawal
                </button>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Available Balance</div>
                  <div className="text-3xl font-black text-slate-900">
                    ${wallet?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 font-medium">Ready for withdrawal</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Pending Settlement</div>
                  <div className="text-3xl font-black text-amber-600">
                    ${wallet?.pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Clearing in 24–48 hours</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Currency & Safety</div>
                  <div className="text-3xl font-black text-blue-600">USD</div>
                  <div className="text-[11px] text-slate-500 mt-1">Escrow & Ledger Protected</div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
                  Transaction History & Financial Ledger ({transactions.length} entries)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">TX ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">#{tx.id}</td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{tx.type}</td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{tx.description}</td>
                            <td className={`py-3.5 px-4 font-bold ${tx.type === "deposit" || tx.type === "commission" ? "text-emerald-600" : "text-slate-900"}`}>
                              {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 capitalize">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <form onSubmit={savePayoutDetail} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="font-bold text-sm text-slate-900">Manage payout details</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setWithdrawMethod("paypal")} className={`px-3 py-2 rounded-lg text-xs font-bold ${withdrawMethod === "paypal" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>PayPal</button>
                    <button type="button" onClick={() => setWithdrawMethod("indian_bank")} className={`px-3 py-2 rounded-lg text-xs font-bold ${withdrawMethod === "indian_bank" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>Indian Bank</button>
                  </div>
                  {withdrawMethod === "paypal" ? (
                    <input required type="email" value={payoutEmail} onChange={(e) => setPayoutEmail(e.target.value)} placeholder="PayPal email" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(["accountHolderName", "bankName", "accountNumber", "ifscCode"] as const).map((field) => <input key={field} required value={bankDetails[field]} onChange={(e) => setBankDetails((prev) => ({ ...prev, [field]: e.target.value }))} placeholder={field === "ifscCode" ? "IFSC code" : field.replace(/([A-Z])/g, " $1")} className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs" />)}
                      <select value={bankDetails.accountType} onChange={(e) => setBankDetails((prev) => ({ ...prev, accountType: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs"><option value="savings">Savings account</option><option value="current">Current account</option></select>
                    </div>
                  )}
                  <button disabled={savingPayout} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">{savingPayout ? "Saving..." : "Save payout details"}</button>
                  <div className="text-[11px] text-slate-500">{payoutDetails.length ? payoutDetails.map((detail) => <div key={detail.id}>{detail.displayLabel}</div>) : "No payout details saved yet."}</div>
                </form>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="font-bold text-sm text-slate-900 mb-3">Withdrawal history</div>
                  {withdrawals.length === 0 ? <p className="text-xs text-slate-500">No withdrawal requests yet.</p> : <div className="space-y-2">{withdrawals.map((withdrawal) => <div key={withdrawal.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"><span>${withdrawal.amount.toFixed(2)} via {withdrawal.method === "indian_bank" ? "Indian bank" : "PayPal"}</span><span className={`font-bold ${withdrawal.status === "APPROVED" ? "text-emerald-600" : withdrawal.status === "REJECTED" ? "text-red-600" : "text-amber-600"}`}>{withdrawal.status}</span></div>)}</div>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE & SETTINGS */}
          {tab === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update personal profile and enterprise account credentials.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                  Profile Information
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Email cannot be changed directly</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account ID</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.id || ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {savingProfile ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* PLAN CONFIRMATION MODAL */}
      {planToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {planToConfirm.isBpo ? "Discuss BPO Plan" : "Activate Plan"}
              </h3>
              <button
                onClick={() => setPlanToConfirm(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {planToConfirm.isBpo ? "You are about to discuss " : "You are about to activate "}
              <span className="font-bold text-slate-900">{planToConfirm.name}</span> (
              ${planToConfirm.price.toLocaleString()}). {planToConfirm.isBpo
                ? "Continue to contact Thinkatic about this BPO partnership."
                : "This will assign the package to your enterprise account and alert your engineering account executive."}
            </p>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
              <div className="font-bold">Included:</div>
              {planToConfirm.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-blue-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPlanToConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <PayPalButton packageId={planToConfirm.serviceId} />
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form onSubmit={handleWithdraw} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Request Wallet Withdrawal</h3>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Available Balance:{" "}
              <span className="font-bold text-slate-900">${wallet?.balance.toFixed(2)}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Withdrawal Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                max={wallet?.balance || 0}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="100.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Saved payout method</label>
              <select required value={payoutDetailsId} onChange={(e) => setPayoutDetailsId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500">
                <option value="">Select a payout method</option>
                {payoutDetails.map((detail) => <option key={detail.id} value={detail.id}>{detail.displayLabel}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={withdrawing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {withdrawing ? "Processing..." : "Submit Payout Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
