import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

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

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "crm", label: "CRM", icon: Users },
  { key: "clients", label: "Clients", icon: BriefcaseBusiness },
  { key: "partners", label: "BPO Partners", icon: Building2 },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "operations", label: "BPO Operations", icon: Activity },
  { key: "approvals", label: "Approvals", icon: CheckCircle2 },
  { key: "finance", label: "Finance", icon: CircleDollarSign },
  { key: "payouts", label: "Payouts", icon: Wallet },
  { key: "users", label: "Users & Roles", icon: Users },
  { key: "audit", label: "Audit Logs", icon: ShieldCheck },
  { key: "notifications", label: "Notifications", icon: AlertTriangle },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "feature-controls", label: "Feature Controls", icon: ListFilter },
] as const;

type NavKey = (typeof navItems)[number]["key"];

export default function AdminControlCentrePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<NavKey>("overview");
  const [overview, setOverview] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userPagination, setUserPagination] = useState<any>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [userStatus, setUserStatus] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [featureControls, setFeatureControls] = useState<any[]>([]);
  const [adminReports, setAdminReports] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setLocation("/admin-login");
  };

  const loadOverview = useCallback(async () => {
    const response = await apiCall("/admin/control-centre/overview");
    if (response.status === 401) {
      logout();
      return;
    }
    if (response.ok) setOverview(await response.json());
  }, []);

  const loadApprovals = useCallback(async () => {
    const response = await apiCall("/admin/approvals");
    if (response.ok) setApprovals(await response.json());
  }, []);

  const loadUsers = useCallback(async () => {
    const query = new URLSearchParams({ page: String(userPage), pageSize: "20", search: userSearch, role: userRole, status: userStatus });
    const response = await apiCall(`/admin/users?${query}`);
    if (response.ok) {
      const result = await response.json();
      setUsers(result.data || []);
      setUserPagination(result.pagination || null);
    }
  }, [userPage, userSearch, userRole, userStatus]);

  const loadRoles = useCallback(async () => {
    const response = await apiCall("/admin/roles");
    if (response.ok) setRoles(await response.json());
  }, []);

  const loadNotifications = useCallback(async () => {
    const response = await apiCall("/admin/notifications");
    if (response.ok) { const body = await response.json(); setNotifications(body.data || body); }
  }, []);

  const loadReports = useCallback(async () => {
    const response = await apiCall("/admin/reports?report=overview&page=1&pageSize=25");
    if (response.ok) setAdminReports(await response.json());
  }, []);

  const loadAuditLogs = useCallback(async () => {
    const response = await apiCall("/admin/audit-logs?limit=25");
    if (response.ok) setAuditLogs(await response.json());
  }, []);

  const loadFinance = useCallback(async () => {
    const response = await apiCall("/admin/finance");
    if (response.ok) setFinance(await response.json());
  }, []);

  const loadSettings = useCallback(async () => {
    const [settingsResponse, controlsResponse] = await Promise.all([apiCall("/admin/settings"), apiCall("/admin/feature-controls")]);
    if (settingsResponse.ok) setSettings(await settingsResponse.json());
    if (controlsResponse.ok) setFeatureControls(await controlsResponse.json());
  }, []);

  const runSearch = useCallback(async () => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    const response = await apiCall(`/admin/search?q=${encodeURIComponent(search)}`);
    if (response.ok) setSearchResults(await response.json());
  }, [search]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin-login");
      return;
    }

    Promise.all([
      loadOverview(),
      loadApprovals(),
      loadUsers(),
      loadRoles(),
      loadNotifications(),
      loadAuditLogs(),
      loadFinance(),
      loadSettings(),
      loadReports(),
    ]).finally(() => setLoading(false));
  }, [loadOverview, loadApprovals, loadUsers, loadRoles, loadNotifications, loadAuditLogs, loadFinance, loadSettings, loadReports, setLocation]);

  useEffect(() => {
    if (!loading) loadUsers();
  }, [loadUsers, loading]);

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "settings" || activeTab === "feature-controls") loadSettings();
  }, [activeTab, loadUsers, loadSettings]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch();
    }, 350);
    return () => clearTimeout(timeout);
  }, [runSearch]);

  const statCards = useMemo(() => {
    if (!overview?.totals) return [];
    const totals = overview.totals;
    return [
      { label: "Total Clients", value: totals.totalClients ?? 0 },
      { label: "Active Clients", value: totals.activeClients ?? 0 },
      { label: "Leads", value: totals.leads ?? 0 },
      { label: "Total Partners", value: totals.totalPartners ?? 0 },
      { label: "Active Partners", value: totals.activePartners ?? 0 },
      { label: "Centres", value: totals.centres ?? 0 },
      { label: "Agents", value: totals.agents ?? 0 },
      { label: "Active Projects", value: totals.activeProjects ?? 0 },
      { label: "Open Tickets", value: totals.openTickets ?? 0 },
      { label: "Pending Approvals", value: totals.pendingApprovals ?? 0 },
      { label: "Pending KYC", value: totals.pendingKyc ?? 0 },
      { label: "Outstanding Invoices", value: totals.outstandingInvoices ?? 0 },
      { label: "Pending Payments", value: totals.pendingPayments ?? 0 },
      { label: "Pending Partner Payouts", value: totals.pendingPartnerPayouts ?? 0 },
    ];
  }, [overview]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{card.label}</div>
            <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Recent activity</div>
          <div className="space-y-3">
            {(overview?.recentActivity || []).slice(0, 8).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.action}</div>
                  <div className="text-xs text-slate-500">{item.entityType}</div>
                </div>
                <div className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Pending approvals</div>
          <div className="space-y-3">
            {(overview?.pendingApprovalsList || []).slice(0, 6).map((item: any, index: number) => (
              <div key={`${item.type}-${item.id || index}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.type}</div>
                  <div className="text-xs text-slate-500">{item.entity}</div>
                </div>
                <div className="text-[11px] font-semibold text-amber-600">{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Recent tickets</div>
          <div className="space-y-3">
            {(overview?.recentTickets || []).slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.subject}</div>
                  <div className="text-xs text-slate-500">Priority: {item.priority}</div>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Finance alerts</div>
          <div className="space-y-3">
            {(overview?.financeAlerts || []).slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.type}</div>
                </div>
                <div className="text-[11px] font-semibold text-rose-600">${Number(item.amount || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">BPO operational alerts</div>
          <div className="space-y-3">
            {(overview?.bpoAlerts || []).slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.type}</div>
                </div>
                <div className="text-[11px] font-semibold text-amber-600">${Number(item.amount || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Approval centre</div>
      <div className="space-y-3">
        {approvals.length === 0 ? <div className="text-sm text-slate-500">No pending approvals.</div> : approvals.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">{item.type}</div>
              <div className="mt-1 text-xs text-slate-500">{item.entity} · {item.requester}</div>
              <div className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">{item.status}</span>
              <button onClick={() => apiCall(`/admin/approvals/${encodeURIComponent(item.id)}/decision`, { method: "POST", body: JSON.stringify({ status: "APPROVED", comment: "Approved by admin" }) }).then(loadApprovals)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button>
              <button onClick={() => apiCall(`/admin/approvals/${encodeURIComponent(item.id)}/decision`, { method: "POST", body: JSON.stringify({ status: "CHANGES_REQUESTED", comment: "Changes requested by admin" }) }).then(loadApprovals)} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white">Request changes</button>
              <button onClick={() => apiCall(`/admin/approvals/${encodeURIComponent(item.id)}/decision`, { method: "POST", body: JSON.stringify({ status: "REJECTED", comment: "Rejected by admin" }) }).then(loadApprovals)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Users & roles</div>
        <div className="flex flex-wrap gap-2">
          <input value={userSearch} onChange={(event) => { setUserPage(1); setUserSearch(event.target.value); }} placeholder="Search users" className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none" />
          <select value={userRole} onChange={(event) => { setUserPage(1); setUserRole(event.target.value); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="all">All roles</option><option value="user">Client</option><option value="client">Client</option><option value="bpo_partner">BPO partner</option></select>
          <select value={userStatus} onChange={(event) => { setUserPage(1); setUserStatus(event.target.value); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs"><option value="all">All statuses</option><option value="active">Active</option><option value="deactivated">Deactivated</option></select>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-700">User</th>
              <th className="px-4 py-3 font-bold text-slate-700">Email</th>
              <th className="px-4 py-3 font-bold text-slate-700">Role</th>
              <th className="px-4 py-3 font-bold text-slate-700">Status</th>
              <th className="px-4 py-3 font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user: any) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3 text-slate-600"><div className="flex items-center gap-2"><select defaultValue={user.role === "bpo_partner" ? "BPO_PARTNER" : user.role === "admin" ? "ADMIN" : "CLIENT"} aria-label={`Role for ${user.email}`} onChange={(event) => apiCall(`/admin/users/${user.id}/role`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }).then(loadUsers)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs"><option value="CLIENT">CLIENT</option><option value="BPO_PARTNER">BPO_PARTNER</option><option value="ADMIN">ADMIN</option></select></div></td>
                <td className="px-4 py-3 text-slate-600">{user.status}</td>
                <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => apiCall(`/admin/users/${user.id}`, {}).then((response) => response.ok ? response.json() : null).then(setSelectedUser)} className="text-xs font-semibold text-blue-700">Details</button><button onClick={() => apiCall(`/admin/users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ status: user.status === "active" ? "deactivated" : "active" }) }).then(loadUsers)} className="text-xs font-semibold text-slate-700">{user.status === "active" ? "Deactivate" : "Activate"}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{userPagination?.total || 0} users</span><div className="flex gap-2"><button disabled={userPage <= 1} onClick={() => setUserPage((page) => page - 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Previous</button><span className="px-2 py-1">Page {userPagination?.page || userPage} of {userPagination?.totalPages || 1}</span><button disabled={userPage >= (userPagination?.totalPages || 1)} onClick={() => setUserPage((page) => page + 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">Next</button></div></div>
      {selectedUser && <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"><div className="font-bold text-slate-900">{selectedUser.name || selectedUser.full_name}</div><div className="mt-1 text-slate-600">{selectedUser.email} · {selectedUser.role} · {selectedUser.status}</div><div className="mt-3 space-y-2">{(selectedUser.memberships || []).map((membership: any) => <div key={membership.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2"><span className="mr-auto text-xs text-slate-600">{membership.bpo_partners?.name || membership.partner_id}</span><select defaultValue={membership.role} onChange={(event) => apiCall(`/admin/partner-memberships/${membership.id}`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) })} className="rounded border border-slate-200 px-2 py-1 text-xs"><option value="partner_admin">Partner admin</option><option value="operations_manager">Operations manager</option><option value="centre_manager">Centre manager</option><option value="team_leader">Team leader</option><option value="agent">Agent</option></select><button onClick={() => apiCall(`/admin/partner-memberships/${membership.id}`, { method: "PATCH", body: JSON.stringify({ status: membership.status === "active" ? "inactive" : "active" }) }).then(() => apiCall(`/admin/users/${selectedUser.id}`).then((response) => response.json()).then(setSelectedUser))} className="text-xs font-semibold text-slate-700">{membership.status === "active" ? "Deactivate" : "Activate"}</button></div>)}</div>{!(selectedUser.memberships || []).length && <div className="mt-2 text-xs text-slate-600">No partner memberships.</div>}<button onClick={() => setSelectedUser(null)} className="mt-3 text-xs font-semibold text-blue-700">Close details</button></div>}
    </div>
  );

  const renderRoles = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(roles || []).map((role: any) => (
        <div key={role.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{role.name}</div>
          <div className="mt-3 text-lg font-black text-slate-900">{role.description}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(role.permissions || []).map((permission: string) => (
              <span key={permission} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">{permission}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotifications = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Admin notifications</div><button onClick={() => apiCall("/admin/notifications/read-all", { method: "POST" }).then(loadNotifications)} className="text-xs font-semibold text-blue-700">Mark all read</button></div>
      <div className="space-y-3">
        {(notifications || []).map((notification: any) => (
          <button key={notification.id} onClick={() => apiCall(`/admin/notifications/${notification.id}/read`, { method: "POST" }).then(loadNotifications)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
            <div>
              <div className="text-sm font-semibold text-slate-800">{notification.title}</div>
              <div className="text-xs text-slate-500">{notification.body}</div>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">{notification.read ? "Read" : "Unread"}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderReports = () => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Admin reports</div>{!adminReports ? <div className="text-sm text-slate-500">No report data available.</div> : <div className="space-y-2"><div className="text-sm text-slate-700">Report: {adminReports.report}</div><div className="text-xs text-slate-500">{adminReports.pagination?.total || 0} records</div>{(adminReports.data || []).slice(0, 10).map((row: any, index: number) => <div key={row.id || index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{row.name || row.subject || row.invoice_number || row.statement_number || row.title || row.action || `Record ${row.id}`}</div>)}</div>}</div>;

  const renderAudit = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Audit logs</div>
      <div className="space-y-3">
        {(auditLogs || []).map((entry: any) => (
          <div key={entry.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">{entry.action}</div>
              <div className="text-xs text-slate-500">{entry.entity_type} · {entry.entity_id}</div>
            </div>
            <div className="text-[11px] text-slate-500">{new Date(entry.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Paid invoices</div>
        <div className="mt-3 text-3xl font-black text-slate-900">{finance?.paidInvoices ?? 0}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Unpaid invoices</div>
        <div className="mt-3 text-3xl font-black text-slate-900">{finance?.unpaidInvoices ?? 0}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Outstanding amount</div>
        <div className="mt-3 text-3xl font-black text-slate-900">${Number(finance?.outstandingAmount || 0).toFixed(2)}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Partner payable</div>
        <div className="mt-3 text-3xl font-black text-slate-900">${Number(finance?.partnerPayable || 0).toFixed(2)}</div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients, leads, partners, projects, tickets, invoices, documents" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
      </div>
      {!searchResults ? <div className="text-sm text-slate-500">Enter a search query to find authorized records.</div> : (
        <div className="space-y-4">
          {Object.entries(searchResults).map(([group, items]) => (
            <div key={group}>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{group}</div>
              {(items as any[]).length === 0 ? <div className="text-xs text-slate-400">No matches.</div> : <div className="space-y-2">{(items as any[]).slice(0, 5).map((item: any, index: number) => <button key={`${group}-${item.id || index}`} onClick={() => setLocation(`/admin?section=${group}`)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 hover:border-blue-300">{item.name || item.email || item.subject || item.invoice_number || item.file_name || item.partner_code || item.title || `Record ${item.id}`}</button>)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">System settings</div>
      <div className="mb-4 flex flex-wrap gap-2">{(settings?.sections || []).map((section: string) => <span key={section} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{section}</span>)}</div>
      <div className="space-y-2 text-sm text-slate-700">{(settings?.settings || []).map((setting: any) => <div key={setting.setting_key} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"><span>{setting.setting_key}</span><div className="flex gap-2"><input defaultValue={JSON.stringify(setting.setting_value)} aria-label={`Setting ${setting.setting_key}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs" /><button onClick={(event) => { const input = (event.currentTarget.previousElementSibling as HTMLInputElement); let value: unknown = input.value; try { value = JSON.parse(input.value); } catch {} apiCall(`/admin/settings/${encodeURIComponent(setting.setting_key)}`, { method: "PATCH", body: JSON.stringify({ value }) }); }} className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white">Save</button></div></div>)}{(!settings?.settings || settings.settings.length === 0) && <div className="rounded-xl bg-slate-50 p-3">No platform settings are configured.</div>}</div>
    </div>
  );

  const renderFeatureControls = () => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Feature controls</div><div className="space-y-3">{featureControls.map((feature) => <div key={feature.key} className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><div><div className="text-sm font-bold text-slate-800">{feature.label}</div><div className="text-xs text-slate-500">{feature.key}</div></div><button onClick={() => apiCall(`/admin/feature-controls/${feature.key}`, { method: "PATCH", body: JSON.stringify({ enabled: !feature.enabled }) }).then((response) => response.ok ? response.json() : null).then((updated) => updated && setFeatureControls((items) => items.map((item) => item.key === feature.key ? { ...item, enabled: updated.enabled } : item)))} className={`rounded-full px-3 py-1 text-xs font-bold ${feature.enabled ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{feature.enabled ? "Enabled" : "Disabled"}</button></div>)}</div></div>;

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "crm": return renderSearch();
      case "clients": return renderSearch();
      case "partners": return renderSearch();
      case "projects": return renderSearch();
      case "operations": return renderSearch();
      case "approvals": return renderApprovals();
      case "finance": return renderFinance();
      case "payouts": return renderFinance();
      case "users": return renderUsers();
      case "audit": return renderAudit();
      case "notifications": return renderNotifications();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      case "feature-controls": return renderFeatureControls();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-6 flex items-center gap-3">
          <BrandLogo compact />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Admin</div>
            <div className="text-lg font-black text-slate-900">Control Centre</div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${activeTab === key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 border-t border-slate-200 pt-4">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Operations</div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Admin Control Centre</h1>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Global search" className="w-52 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
        </div>

        <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Admin modules">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === key ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <div>{renderTab()}</div>
        )}
      </main>
    </div>
  );
}
