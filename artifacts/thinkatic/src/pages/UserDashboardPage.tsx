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
  const [tab, setTab] = useState<"overview" | "plans" | "updates" | "attendance" | "kyc" | "affiliate" | "wallet" | "profile">("overview");

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
      // 1. Profile
      const pRes = await authFetch("/user/profile");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData);
        setProfileFullName(pData.fullName || "");
      }

      // 2. Plans
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        const technologyPlans = plansData.filter((plan: Plan) => !BPO_PLAN_IDS.has(plan.serviceId));
        setPlans([...technologyPlans, ...BPO_DASHBOARD_PLANS]);
      }

      const updatesRes = await authFetch("/user/updates");
      if (updatesRes.ok) {
        setUpdates(await updatesRes.json());
      }

      // 3. Attendance
      const attRes = await authFetch("/user/attendance");
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(attData);
      }

      // 4. KYC
      const kycRes = await authFetch("/user/kyc");
      if (kycRes.ok) {
        const kycData = await kycRes.json();
        setKyc(kycData);
        if (kycData.fullName) {
          setKycForm((prev) => ({ ...prev, fullName: kycData.fullName }));
        }
      }

      // 5. Affiliate
      const affRes = await authFetch("/user/affiliate");
      if (affRes.ok) {
        const affData = await affRes.json();
        setAffiliate(affData);
      }

      // 6. Wallet
      const wRes = await authFetch("/user/wallet");
      if (wRes.ok) {
        const wData = await wRes.json();
        setWallet(wData);
      }

      // 7. Transactions
      const txRes = await authFetch("/user/wallet/transactions");
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }

      const purchaseRes = await authFetch("/user/purchases");
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchases(purchaseData);
      }

      const accessRes = await authFetch("/user/withdrawals/access");
      const eligible = accessRes.ok;
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

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_profile");
    setLocation("/login");
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
              { id: "plans", label: "Services & Plans", icon: Layers, badge: plans.length },
              { id: "updates", label: "Your Updates", icon: MessageSquare, badge: updates.length || undefined },
              { id: "attendance", label: "Attendance & Shift", icon: Clock },
              { id: "kyc", label: "KYC Verification", icon: ShieldCheck, badge: kyc?.status === "verified" ? "Verified" : kyc?.status === "pending" ? "Pending" : "Required" },
              { id: "affiliate", label: "Affiliate & Rewards", icon: Share2 },
              ...(bpoEligible ? [{ id: "wallet", label: "BPO Withdrawals", icon: Wallet, badge: `$${wallet?.balance.toFixed(0) || 0}` }] : []),
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
