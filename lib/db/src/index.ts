import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://gkcmdngzatpdrzfdahcq.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl) {
  console.warn("[Supabase] Warning: Neither SUPABASE_URL nor VITE_SUPABASE_URL is set in environment.");
}

if (!supabaseKey) {
  console.warn("[Supabase] Warning: Neither SUPABASE_SECRET_KEY nor VITE_SUPABASE_PUBLISHABLE_KEY is set in environment.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function getSupabaseAdminClient(): SupabaseClient {
  return supabase;
}

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

export interface PlanRow {
  id: number;
  service_id: string;
  service_number: string;
  category: string;
  name: string;
  price: number;
  tag: string;
  description: string;
  features: string[];
  popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
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
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionRow {
  id: number;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  status: string;
  notes: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  email: string;
  passwordHash?: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  selectedPlan: string | null;
  referralCode: string | null;
  referredBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: number;
  userId: string;
  date: string;
  checkIn: Date;
  checkOut: Date | null;
  status: string;
  durationMinutes: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycVerification {
  id: number;
  userId: string;
  fullName: string;
  dateOfBirth: string | null;
  country: string;
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  submittedAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateReferral {
  id: number;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  totalReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: number;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  userId: string;
  type: string;
  amount: number;
  fee: number;
  status: string;
  description: string;
  referenceId: string | null;
  createdAt: Date;
}

export interface Purchase {
  id: number;
  userId: string;
  packageId: string;
  packageName: string;
  paypalOrderId: string;
  paypalCaptureId: string | null;
  amount: number;
  currency: string;
  status: string;
  purchasedAt: Date | null;
  createdAt: Date;
}

export interface PayoutDetail {
  id: number;
  method: "paypal" | "indian_bank";
  displayLabel: string;
  createdAt: Date;
}

export interface Withdrawal {
  id: number;
  userId: string;
  amount: number;
  currency: string;
  method: "paypal" | "indian_bank";
  payoutDetailsId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export interface ClientUpdate {
  id: number;
  userId: string;
  title: string;
  message: string;
  category: string | null;
  status: "draft" | "published";
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUpdateClient {
  userId: string;
  clientName: string;
  email: string;
  assignedPlan: string | null;
  planPrice: number | null;
  planSeats: string | null;
  planStatus: string;
  lastUpdateSent: string | null;
  updateCount: number;
}

// -----------------------------------------------------------------------------
// Mappers
// -----------------------------------------------------------------------------

export function mapPlanRow(row: PlanRow): Plan {
  return {
    id: Number(row.id),
    serviceId: row.service_id,
    serviceNumber: row.service_number,
    category: row.category,
    name: row.name,
    price: Number(row.price),
    tag: row.tag,
    description: row.description,
    features: Array.isArray(row.features) ? row.features : [],
    popular: Boolean(row.popular),
    sortOrder: Number(row.sort_order),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContactRow(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    company: row.company,
    budget: row.budget,
    message: row.message,
    status: row.status,
    notes: row.notes,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapAdminRow(row: AdminUserRow): AdminUser {
  return {
    id: Number(row.id),
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// -----------------------------------------------------------------------------
// Plans Repository
// -----------------------------------------------------------------------------

export const plansRepository = {
  async getAll(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("service_number", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data as PlanRow[] || []).map(mapPlanRow);
  },

  async getById(id: number): Promise<Plan | null> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapPlanRow(data as PlanRow) : null;
  },

  async getByServiceId(serviceId: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("service_id", serviceId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapPlanRow(data as PlanRow) : null;
  },

  async create(plan: Omit<Plan, "id" | "createdAt" | "updatedAt">): Promise<Plan> {
    const { data, error } = await supabase
      .from("plans")
      .insert({
        service_id: plan.serviceId,
        service_number: plan.serviceNumber,
        category: plan.category,
        name: plan.name,
        price: plan.price,
        tag: plan.tag,
        description: plan.description,
        features: plan.features,
        popular: plan.popular,
        sort_order: plan.sortOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return mapPlanRow(data as PlanRow);
  },

  async update(id: number, updates: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>): Promise<Plan | null> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.serviceId !== undefined) payload.service_id = updates.serviceId;
    if (updates.serviceNumber !== undefined) payload.service_number = updates.serviceNumber;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.tag !== undefined) payload.tag = updates.tag;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.features !== undefined) payload.features = updates.features;
    if (updates.popular !== undefined) payload.popular = updates.popular;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

    const { data, error } = await supabase
      .from("plans")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? mapPlanRow(data as PlanRow) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { error, count } = await supabase
      .from("plans")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async seedIfEmpty(seedPlans: Array<Omit<Plan, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    const { count, error } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("[Plans] Could not check plans table count:", error.message);
      return;
    }

    if (count === 0 && seedPlans.length > 0) {
      const rows = seedPlans.map((p) => ({
        service_id: p.serviceId,
        service_number: p.serviceNumber,
        category: p.category,
        name: p.name,
        price: p.price,
        tag: p.tag,
        description: p.description,
        features: p.features,
        popular: p.popular,
        sort_order: p.sortOrder,
      }));

      const { error: insertError } = await supabase.from("plans").insert(rows);
      if (insertError) {
        console.warn("[Plans] Seeding plans failed:", insertError.message);
      } else {
        console.log(`[Plans] Successfully seeded ${rows.length} plans into Supabase.`);
      }
    }
  },
};

// -----------------------------------------------------------------------------
// Contacts Repository (Leads)
// -----------------------------------------------------------------------------

export const contactsRepository = {
  async create(data: {
    name: string;
    email: string;
    company?: string | null;
    budget?: string | null;
    message: string;
    source?: string | null;
  }): Promise<ContactSubmission> {
    const { data: created, error } = await supabase
      .from("contact_submissions")
      .insert({
        name: data.name,
        email: data.email,
        company: data.company ?? null,
        budget: data.budget ?? null,
        message: data.message,
        source: data.source ?? "contact_form",
        status: "new",
      })
      .select()
      .single();

    if (error) throw error;
    return mapContactRow(created as ContactSubmissionRow);
  },

  async list(options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ContactSubmission[]> {
    let query = supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (options.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options.limit !== undefined) {
      const offset = options.offset ?? 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as ContactSubmissionRow[] || []).map(mapContactRow);
  },

  async getById(id: number): Promise<ContactSubmission | null> {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapContactRow(data as ContactSubmissionRow) : null;
  },

  async update(id: number, updates: { status?: string; notes?: string | null }): Promise<ContactSubmission | null> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from("contact_submissions")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? mapContactRow(data as ContactSubmissionRow) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { error, count } = await supabase
      .from("contact_submissions")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async getStats() {
    const { count: total, error: totalErr } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true });
    if (totalErr) throw totalErr;

    const { data: allRows, error: rowsErr } = await supabase
      .from("contact_submissions")
      .select("status, budget, created_at");
    if (rowsErr) throw rowsErr;

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    let today = 0;
    let thisWeek = 0;
    const statusMap = new Map<string, number>();
    const budgetMap = new Map<string, number>();

    for (const r of (allRows || [])) {
      const createdAtMs = new Date(r.created_at).getTime();
      if (createdAtMs >= oneDayAgo) today++;
      if (createdAtMs >= sevenDaysAgo) thisWeek++;

      const st = r.status || "new";
      statusMap.set(st, (statusMap.get(st) || 0) + 1);

      if (r.budget) {
        budgetMap.set(r.budget, (budgetMap.get(r.budget) || 0) + 1);
      }
    }

    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    const byBudget = Array.from(budgetMap.entries()).map(([budget, count]) => ({ budget, count }));

    return {
      total: total ?? 0,
      today,
      thisWeek,
      byStatus,
      byBudget,
    };
  },
};

// -----------------------------------------------------------------------------
// Admin Repository
// -----------------------------------------------------------------------------

export const adminRepository = {
  async getByUsername(username: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;
    return data ? mapAdminRow(data as AdminUserRow) : null;
  },

  async getById(id: number): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapAdminRow(data as AdminUserRow) : null;
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const { error } = await supabase
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async ensureDefaultAdmin(defaultPasswordHash: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("username", "admin")
        .maybeSingle();

      if (error) {
        console.warn("[Admin] Could not check admin existence:", error.message);
        return;
      }

      if (!data) {
        await supabase.from("admin_users").insert({
          username: "admin",
          password_hash: defaultPasswordHash,
        });
        console.log("[Admin] Default admin user initialized in Supabase.");
      }
    } catch (err: any) {
      console.warn("[Admin] Ensure default admin warning:", err?.message || err);
    }
  },
};

// -----------------------------------------------------------------------------
// User Profile Repository
// -----------------------------------------------------------------------------

export const userProfileRepository = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash ?? null,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      selectedPlan: row.selected_plan ?? null,
      referralCode: row.referral_code,
      referredBy: row.referred_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  },

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash ?? null,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      selectedPlan: data.selected_plan ?? null,
      referralCode: data.referral_code,
      referredBy: data.referred_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash ?? null,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      selectedPlan: data.selected_plan ?? null,
      referralCode: data.referral_code,
      referredBy: data.referred_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getByReferralCode(code: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("referral_code", code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash ?? null,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      selectedPlan: data.selected_plan ?? null,
      referralCode: data.referral_code,
      referredBy: data.referred_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async create(data: {
    id?: string;
    email: string;
    passwordHash?: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
    selectedPlan?: string;
    referralCode?: string;
    referredBy?: string;
  }): Promise<Profile> {
    const payload: Record<string, unknown> = {
      email: data.email,
      password_hash: data.passwordHash ?? null,
      full_name: data.fullName ?? null,
      avatar_url: data.avatarUrl ?? null,
      role: data.role ?? "user",
      selected_plan: data.selectedPlan ?? null,
      referral_code: data.referralCode ?? ("REF_" + Math.random().toString(36).substring(2, 8).toUpperCase()),
      referred_by: data.referredBy ?? null,
    };
    if (data.id) payload.id = data.id;

    const { data: created, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    return {
      id: created.id,
      email: created.email,
      passwordHash: created.password_hash ?? null,
      fullName: created.full_name,
      avatarUrl: created.avatar_url,
      role: created.role,
      selectedPlan: created.selected_plan ?? null,
      referralCode: created.referral_code,
      referredBy: created.referred_by,
      createdAt: new Date(created.created_at),
      updatedAt: new Date(created.updated_at),
    };
  },

  async update(id: string, updates: Partial<{ fullName: string; avatarUrl: string; role: string; selectedPlan: string }>): Promise<Profile | null> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.selectedPlan !== undefined) payload.selected_plan = updates.selectedPlan;

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash ?? null,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      selectedPlan: data.selected_plan ?? null,
      referralCode: data.referral_code,
      referredBy: data.referred_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async selectPlan(userId: string, planServiceId: string): Promise<Profile | null> {
    return this.update(userId, { selectedPlan: planServiceId });
  },

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const { error } = await supabase
      .from("profiles")
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq("id", userId);
    return !error;
  },
};

// -----------------------------------------------------------------------------
// Client Updates Repository
// -----------------------------------------------------------------------------

function mapClientUpdateRow(row: any): ClientUpdate {
  return {
    id: Number(row.id),
    userId: row.user_id,
    title: row.title,
    message: row.message,
    category: row.category ?? null,
    status: row.status === "published" ? "published" : "draft",
    createdBy: row.created_by,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const clientUpdatesRepository = {
  async getPublishedForUser(userId: string): Promise<ClientUpdate[]> {
    const { data, error } = await supabase
      .from("client_updates")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapClientUpdateRow);
  },

  async getForUser(userId: string): Promise<ClientUpdate[]> {
    const { data, error } = await supabase
      .from("client_updates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapClientUpdateRow);
  },

  async getById(id: number): Promise<ClientUpdate | null> {
    const { data, error } = await supabase
      .from("client_updates")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapClientUpdateRow(data) : null;
  },

  async create(data: {
    userId: string;
    title: string;
    message: string;
    category?: string | null;
    status: "draft" | "published";
    createdBy: string;
  }): Promise<ClientUpdate> {
    const publishedAt = data.status === "published" ? new Date().toISOString() : null;
    const { data: created, error } = await supabase
      .from("client_updates")
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        category: data.category ?? null,
        status: data.status,
        created_by: data.createdBy,
        published_at: publishedAt,
      })
      .select()
      .single();
    if (error) throw error;
    return mapClientUpdateRow(created);
  },

  async update(id: number, updates: {
    title?: string;
    message?: string;
    category?: string | null;
    status?: "draft" | "published";
  }): Promise<ClientUpdate | null> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.message !== undefined) payload.message = updates.message;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.status !== undefined) {
      payload.status = updates.status;
      payload.published_at = updates.status === "published" ? new Date().toISOString() : null;
    }
    const { data, error } = await supabase
      .from("client_updates")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapClientUpdateRow(data) : null;
  },

  async delete(id: number): Promise<boolean> {
    const { error, count } = await supabase
      .from("client_updates")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  },
};

// -----------------------------------------------------------------------------
// Attendance Repository
// -----------------------------------------------------------------------------

export const attendanceRepository = {
  async checkIn(userId: string, notes?: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          user_id: userId,
          date: today,
          check_in: new Date().toISOString(),
          status: "present",
          notes: notes ?? null,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(data.id),
      userId: data.user_id,
      date: data.date,
      checkIn: new Date(data.check_in),
      checkOut: data.check_out ? new Date(data.check_out) : null,
      status: data.status,
      durationMinutes: data.duration_minutes ?? 0,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async checkOut(userId: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const { data: current } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    let durationMinutes = 0;
    if (current && current.check_in) {
      durationMinutes = Math.max(0, Math.round((now.getTime() - new Date(current.check_in).getTime()) / 60000));
    }

    const { data, error } = await supabase
      .from("attendance")
      .update({
        check_out: now.toISOString(),
        duration_minutes: durationMinutes,
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)
      .eq("date", today)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: Number(data.id),
      userId: data.user_id,
      date: data.date,
      checkIn: new Date(data.check_in),
      checkOut: data.check_out ? new Date(data.check_out) : null,
      status: data.status,
      durationMinutes: data.duration_minutes ?? 0,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getUserAttendance(userId: string, limit = 30): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: Number(r.id),
      userId: r.user_id,
      date: r.date,
      checkIn: new Date(r.check_in),
      checkOut: r.check_out ? new Date(r.check_out) : null,
      status: r.status,
      durationMinutes: r.duration_minutes ?? 0,
      notes: r.notes,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    }));
  },

  async getAllAttendance(options: { date?: string; status?: string; limit?: number } = {}): Promise<AttendanceRecord[]> {
    let query = supabase.from("attendance").select("*").order("date", { ascending: false });
    if (options.date) query = query.eq("date", options.date);
    if (options.status) query = query.eq("status", options.status);
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: Number(r.id),
      userId: r.user_id,
      date: r.date,
      checkIn: new Date(r.check_in),
      checkOut: r.check_out ? new Date(r.check_out) : null,
      status: r.status,
      durationMinutes: r.duration_minutes ?? 0,
      notes: r.notes,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    }));
  },
};

// -----------------------------------------------------------------------------
// KYC Repository
// -----------------------------------------------------------------------------

export const kycRepository = {
  async submit(data: {
    userId: string;
    fullName: string;
    dateOfBirth?: string;
    country?: string;
    documentType: string;
    documentNumber: string;
    documentFrontUrl?: string;
    documentBackUrl?: string;
    selfieUrl?: string;
  }): Promise<KycVerification> {
    const { data: created, error } = await supabase
      .from("kyc_verifications")
      .upsert(
        {
          user_id: data.userId,
          full_name: data.fullName,
          date_of_birth: data.dateOfBirth ?? null,
          country: data.country ?? "US",
          document_type: data.documentType,
          document_number: data.documentNumber,
          document_front_url: data.documentFrontUrl ?? null,
          document_back_url: data.documentBackUrl ?? null,
          selfie_url: data.selfieUrl ?? null,
          status: "pending",
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(created.id),
      userId: created.user_id,
      fullName: created.full_name,
      dateOfBirth: created.date_of_birth,
      country: created.country,
      documentType: created.document_type,
      documentNumber: created.document_number,
      documentFrontUrl: created.document_front_url,
      documentBackUrl: created.document_back_url,
      selfieUrl: created.selfie_url,
      status: created.status,
      rejectionReason: created.rejection_reason,
      reviewedBy: created.reviewed_by,
      submittedAt: new Date(created.submitted_at),
      verifiedAt: created.verified_at ? new Date(created.verified_at) : null,
      createdAt: new Date(created.created_at),
      updatedAt: new Date(created.updated_at),
    };
  },

  async getByUserId(userId: string): Promise<KycVerification | null> {
    const { data, error } = await supabase
      .from("kyc_verifications")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: Number(data.id),
      userId: data.user_id,
      fullName: data.full_name,
      dateOfBirth: data.date_of_birth,
      country: data.country,
      documentType: data.document_type,
      documentNumber: data.document_number,
      documentFrontUrl: data.document_front_url,
      documentBackUrl: data.document_back_url,
      selfieUrl: data.selfie_url,
      status: data.status,
      rejectionReason: data.rejection_reason,
      reviewedBy: data.reviewed_by,
      submittedAt: new Date(data.submitted_at),
      verifiedAt: data.verified_at ? new Date(data.verified_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async listAll(options: { status?: string; limit?: number } = {}): Promise<KycVerification[]> {
    let query = supabase.from("kyc_verifications").select("*").order("submitted_at", { ascending: false });
    if (options.status) query = query.eq("status", options.status);
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: Number(d.id),
      userId: d.user_id,
      fullName: d.full_name,
      dateOfBirth: d.date_of_birth,
      country: d.country,
      documentType: d.document_type,
      documentNumber: d.document_number,
      documentFrontUrl: d.document_front_url,
      documentBackUrl: d.document_back_url,
      selfieUrl: d.selfie_url,
      status: d.status,
      rejectionReason: d.rejection_reason,
      reviewedBy: d.reviewed_by,
      submittedAt: new Date(d.submitted_at),
      verifiedAt: d.verified_at ? new Date(d.verified_at) : null,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  },

  async review(id: number, status: "verified" | "rejected", reason?: string, reviewer?: string): Promise<boolean> {
    const payload: Record<string, unknown> = {
      status,
      reviewed_by: reviewer ?? "admin",
      rejection_reason: status === "rejected" ? reason : null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error, count } = await supabase
      .from("kyc_verifications")
      .update(payload, { count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
  },
};

// -----------------------------------------------------------------------------
// Affiliate & Referrals Repository
// -----------------------------------------------------------------------------

export const affiliateRepository = {
  async registerReferral(referrerId: string, referredUserId: string, referralCode: string): Promise<AffiliateReferral> {
    const { data, error } = await supabase
      .from("affiliate_referrals")
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(data.id),
      referrerId: data.referrer_id,
      referredUserId: data.referred_user_id,
      referralCode: data.referral_code,
      status: data.status,
      commissionRate: Number(data.commission_rate),
      totalReward: Number(data.total_reward),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getUserReferrals(referrerId: string): Promise<AffiliateReferral[]> {
    const { data, error } = await supabase
      .from("affiliate_referrals")
      .select("*")
      .eq("referrer_id", referrerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: Number(d.id),
      referrerId: d.referrer_id,
      referredUserId: d.referred_user_id,
      referralCode: d.referral_code,
      status: d.status,
      commissionRate: Number(d.commission_rate),
      totalReward: Number(d.total_reward),
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  },

  async addReward(referredUserId: string, rewardAmount: number): Promise<void> {
    const { data: ref } = await supabase
      .from("affiliate_referrals")
      .select("id, total_reward")
      .eq("referred_user_id", referredUserId)
      .maybeSingle();

    if (ref) {
      const newTotal = Number(ref.total_reward || 0) + rewardAmount;
      await supabase
        .from("affiliate_referrals")
        .update({ total_reward: newTotal, updated_at: new Date().toISOString() })
        .eq("id", ref.id);
    }
  },
};

// -----------------------------------------------------------------------------
// Wallet Repository
// -----------------------------------------------------------------------------

export const walletRepository = {
  async getOrCreate(userId: string): Promise<Wallet> {
    const { data: existing } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return {
        id: Number(existing.id),
        userId: existing.user_id,
        balance: Number(existing.balance),
        pendingBalance: Number(existing.pending_balance),
        currency: existing.currency,
        isLocked: Boolean(existing.is_locked),
        createdAt: new Date(existing.created_at),
        updatedAt: new Date(existing.updated_at),
      };
    }

    const { data: created, error } = await supabase
      .from("wallets")
      .insert({ user_id: userId, balance: 0, pending_balance: 0, currency: "USD" })
      .select()
      .single();

    if (error) throw error;
    return {
      id: Number(created.id),
      userId: created.user_id,
      balance: Number(created.balance),
      pendingBalance: Number(created.pending_balance),
      currency: created.currency,
      isLocked: Boolean(created.is_locked),
      createdAt: new Date(created.created_at),
      updatedAt: new Date(created.updated_at),
    };
  },

  async addTransaction(data: {
    walletId: number;
    userId: string;
    type: "deposit" | "withdrawal" | "commission" | "payment" | "refund" | "adjustment";
    amount: number;
    fee?: number;
    description: string;
    referenceId?: string;
  }): Promise<WalletTransaction> {
    const { data: tx, error } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: data.walletId,
        user_id: data.userId,
        type: data.type,
        amount: data.amount,
        fee: data.fee ?? 0,
        status: "completed",
        description: data.description,
        reference_id: data.referenceId ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Adjust balance
    const delta = (data.type === "withdrawal" || data.type === "payment") ? -Math.abs(data.amount) : Math.abs(data.amount);
    const { data: w } = await supabase.from("wallets").select("balance").eq("id", data.walletId).single();
    if (w) {
      const updatedBalance = Number(w.balance || 0) + delta;
      await supabase.from("wallets").update({ balance: updatedBalance, updated_at: new Date().toISOString() }).eq("id", data.walletId);
    }

    return {
      id: Number(tx.id),
      walletId: Number(tx.wallet_id),
      userId: tx.user_id,
      type: tx.type,
      amount: Number(tx.amount),
      fee: Number(tx.fee),
      status: tx.status,
      description: tx.description,
      referenceId: tx.reference_id,
      createdAt: new Date(tx.created_at),
    };
  },

  async getTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: Number(t.id),
      walletId: Number(t.wallet_id),
      userId: t.user_id,
      type: t.type,
      amount: Number(t.amount),
      fee: Number(t.fee),
      status: t.status,
      description: t.description,
      referenceId: t.reference_id,
      createdAt: new Date(t.created_at),
    }));
  },
};

const mapPurchase = (row: any): Purchase => ({
  id: Number(row.id), userId: row.user_id, packageId: row.package_id, packageName: row.package_name,
  paypalOrderId: row.paypal_order_id, paypalCaptureId: row.paypal_capture_id ?? null,
  amount: Number(row.amount), currency: row.currency, status: row.status,
  purchasedAt: row.purchased_at ? new Date(row.purchased_at) : null, createdAt: new Date(row.created_at),
});

const mapWithdrawal = (row: any): Withdrawal => ({
  id: Number(row.id), userId: row.user_id, amount: Number(row.amount), currency: row.currency,
  method: row.method, payoutDetailsId: Number(row.payout_details_id), status: row.status,
  rejectionReason: row.rejection_reason ?? null, reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
  createdAt: new Date(row.created_at),
});

export const purchaseRepository = {
  async createPending(data: { userId: string; packageId: string; packageName: string; orderId: string; amount: number; currency: string }) {
    const { data: row, error } = await supabase.from("purchases").insert({
      user_id: data.userId, package_id: data.packageId, package_name: data.packageName,
      paypal_order_id: data.orderId, amount: data.amount, currency: data.currency, status: "PENDING",
    }).select().single();
    if (error) throw error;
    return mapPurchase(row);
  },

  async getByOrderId(orderId: string): Promise<Purchase | null> {
    const { data, error } = await supabase.from("purchases").select("*").eq("paypal_order_id", orderId).maybeSingle();
    if (error) throw error;
    return data ? mapPurchase(data) : null;
  },

  async markPaid(orderId: string, captureId: string): Promise<Purchase> {
    const { data, error } = await supabase.from("purchases").update({
      paypal_capture_id: captureId, status: "PAID", purchased_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("paypal_order_id", orderId).eq("status", "PENDING").select().maybeSingle();
    if (error) throw error;
    if (!data) {
      const existing = await this.getByOrderId(orderId);
      if (!existing || existing.status !== "PAID") throw new Error("Purchase could not be finalized");
      return existing;
    }
    const { error: profileError } = await supabase.from("profiles").update({ selected_plan: data.package_id, updated_at: new Date().toISOString() }).eq("id", data.user_id);
    if (profileError) throw profileError;
    return mapPurchase(data);
  },

  async listForUser(userId: string): Promise<Purchase[]> {
    const { data, error } = await supabase.from("purchases").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPurchase);
  },

  async hasPaidBpo(userId: string): Promise<boolean> {
    const { count, error } = await supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "PAID").in("package_id", ["bpo-starter", "bpo-growth", "bpo-enterprise"]);
    if (error) throw error;
    return (count ?? 0) > 0;
  },
};

export const withdrawalRepository = {
  async savePayoutDetail(data: { userId: string; method: "paypal" | "indian_bank"; encrypted: string; displayLabel: string }) {
    const { data: row, error } = await supabase.from("payout_details").upsert({
      user_id: data.userId, method: data.method, details_encrypted: data.encrypted, display_label: data.displayLabel, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,method" }).select("id,method,display_label,created_at").single();
    if (error) throw error;
    return { id: Number(row.id), method: row.method, displayLabel: row.display_label, createdAt: new Date(row.created_at) } as PayoutDetail;
  },

  async listPayoutDetails(userId: string): Promise<PayoutDetail[]> {
    const { data, error } = await supabase.from("payout_details").select("id,method,display_label,created_at").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({ id: Number(row.id), method: row.method, displayLabel: row.display_label, createdAt: new Date(row.created_at) }));
  },

  async getPayoutDetail(userId: string, id: number) {
    const { data, error } = await supabase.from("payout_details").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(userId: string, amount: number, currency: string, method: "paypal" | "indian_bank", payoutDetailsId: number): Promise<Withdrawal> {
    const wallet = await walletRepository.getOrCreate(userId);
    if (wallet.balance < amount) throw new Error("Insufficient wallet balance");
    const { count } = await supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "PENDING");
    if ((count ?? 0) > 0) throw new Error("A withdrawal is already pending");
    const { data, error } = await supabase.from("withdrawals").insert({ user_id: userId, amount, currency, method, payout_details_id: payoutDetailsId }).select().single();
    if (error) throw error;
    const { error: walletError } = await supabase.from("wallets").update({ balance: wallet.balance - amount, pending_balance: wallet.pendingBalance + amount, updated_at: new Date().toISOString() }).eq("id", wallet.id).eq("balance", wallet.balance);
    if (walletError) throw walletError;
    return mapWithdrawal(data);
  },

  async listForUser(userId: string): Promise<Withdrawal[]> {
    const { data, error } = await supabase.from("withdrawals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapWithdrawal);
  },

  async listAll(): Promise<Withdrawal[]> {
    const { data, error } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapWithdrawal);
  },

  async review(id: number, adminId: number, status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    const { data: withdrawal, error } = await supabase.from("withdrawals").select("*").eq("id", id).eq("status", "PENDING").maybeSingle();
    if (error) throw error;
    if (!withdrawal) throw new Error("Withdrawal not found or already reviewed");
    const { error: updateError } = await supabase.from("withdrawals").update({ status, rejection_reason: status === "REJECTED" ? rejectionReason ?? "Rejected by admin" : null, reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) throw updateError;
    const wallet = await walletRepository.getOrCreate(withdrawal.user_id);
    const nextPending = Math.max(0, wallet.pendingBalance - Number(withdrawal.amount));
    const nextBalance = status === "REJECTED" ? wallet.balance + Number(withdrawal.amount) : wallet.balance;
    await supabase.from("wallets").update({ balance: nextBalance, pending_balance: nextPending, updated_at: new Date().toISOString() }).eq("id", wallet.id);
    const reviewed = await supabase.from("withdrawals").select("*").eq("id", id).single();
    if (reviewed.error) throw reviewed.error;
    return mapWithdrawal(reviewed.data);
  },
};

// -----------------------------------------------------------------------------
// Retry Helper (Supabase compatible)
// -----------------------------------------------------------------------------

export async function withDbRetry<T>(operation: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delayMs = 150 * 2 ** (attempt - 1);
      console.warn(`${label} transient error; retrying in ${delayMs}ms`, { attempt });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`${label} failed after retries`);
}

export * from "./schema/index.js";
