import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { supabase } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
import { requireUserAuth } from "./user.js";

const router: IRouter = Router();
const STATUSES = ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "rescheduled", "no_show"];
const TYPES = ["project_meeting", "requirement_discussion", "review", "demo", "uat", "planning", "support", "other"];
const RSVP = ["pending", "accepted", "declined", "tentative"];
const NOTE_TYPES = ["summary", "discussion", "decision", "next_steps"];
const ACTION_STATUSES = ["open", "in_progress", "completed", "cancelled"];
const PRIORITIES = ["low", "medium", "high", "critical"];
type UserRequest = Request & { user?: { id: string; email: string } };
type AdminRequest = Request & { admin?: { id: number; username: string } };

function fail(res: Response, status: number, message: string): void { res.status(status).json({ success: false, error: message, message }); }
function id(value: unknown): number | null { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }
function iso(value: unknown): string | null { if (typeof value !== "string") return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString(); }
function validTimezone(value: unknown): value is string { if (typeof value !== "string" || !value.trim()) return false; try { Intl.DateTimeFormat("en-US", { timeZone: value }); return true; } catch { return false; } }

async function moduleGuard(_req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase.from("module_settings").select("enabled").eq("module_key", "meetings").maybeSingle();
    if (error) return res.status(500).json({ error: "Unable to verify meetings module" });
    if (data?.enabled === false) return fail(res, 503, "meetings is currently disabled");
    return next();
  } catch {
    return res.status(500).json({ error: "Unable to verify meetings module" });
  }
}

async function audit(actor: { userId?: string; adminId?: number }, action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  await supabase.from("audit_logs").insert({ actor_user_id: actor.userId ?? null, actor_admin_id: actor.adminId ?? null, action, entity_type: entityType, entity_id: entityId, metadata });
}

async function notifyUser(userId: string, type: string, title: string, body: string, entityId: string) {
  await supabase.from("notifications").insert({ recipient_user_id: userId, type, title, body, entity_type: "meeting", entity_id: entityId });
}

async function notifyAdmins(type: string, title: string, body: string, entityId: string) {
  const { data } = await supabase.from("admin_users").select("id");
  if (data?.length) await supabase.from("notifications").insert(data.map((admin: any) => ({ recipient_admin_id: admin.id, type, title, body, entity_type: "meeting", entity_id: entityId })));
}

async function projectForClient(projectId: number, clientId: string) {
  const { data, error } = await supabase.from("projects").select("id,client_id,name").eq("id", projectId).eq("client_id", clientId).maybeSingle();
  if (error) throw error;
  return data;
}

async function projectById(projectId: number) {
  const { data, error } = await supabase.from("projects").select("id,client_id,name").eq("id", projectId).maybeSingle();
  if (error) throw error;
  return data;
}

async function createReminders(meeting: any) {
  const offsets = [1440, 60, 15];
  await supabase.from("meeting_reminders").upsert(
    offsets.map((minutes_before) => ({
      meeting_id: meeting.id,
      minutes_before,
      // Reset sent_at so rescheduled meetings re-fire reminders
      sent_at: null,
      notify_at: new Date(new Date(meeting.starts_at).getTime() - minutes_before * 60000).toISOString(),
    })),
    { onConflict: "meeting_id,minutes_before" }
  );
}

// BUG 8 FIX: Use advisory lock pattern — mark reminders as sent atomically with a single UPDATE
// returning clause so concurrent requests never double-send.
async function dispatchDueReminders() {
  const now = new Date().toISOString();
  // Atomically claim pending reminders: update sent_at = now where still null, return claimed rows
  const { data: claimed } = await supabase
    .from("meeting_reminders")
    .update({ sent_at: now })
    .is("sent_at", null)
    .lte("notify_at", now)
    .select("*, meetings(client_id,title,status,starts_at)")
    .limit(100);

  for (const reminder of claimed || []) {
    if (!reminder.meetings) continue;
    if (!["cancelled", "completed"].includes(reminder.meetings.status)) {
      await notifyUser(
        reminder.meetings.client_id,
        "meeting_reminder",
        "Meeting reminder",
        `${reminder.meetings.title} starts in ${reminder.minutes_before} minutes`,
        String(reminder.meeting_id)
      );
    }
  }
}

async function authorizedParticipant(meetingId: number, actor: { userId?: string; adminId?: number }) {
  const query = supabase.from("meeting_participants").select("*").eq("meeting_id", meetingId);
  const { data } = actor.adminId
    ? await query.eq("admin_id", actor.adminId).maybeSingle()
    : await query.eq("user_id", actor.userId!).maybeSingle();
  return data;
}

async function clientMeeting(meetingId: number, clientId: string) {
  const { data, error } = await supabase.from("meetings").select("*").eq("id", meetingId).eq("client_id", clientId).maybeSingle();
  if (error) throw error;
  return data;
}

async function meetingView(meeting: any, clientId?: string) {
  const { data: participants, error: participantError } = await supabase
    .from("meeting_participants")
    .select("id,user_id,admin_id,participant_role,rsvp_status,responded_at,client_visible")
    .eq("meeting_id", meeting.id);
  if (participantError) throw participantError;

  // BUG 5 FIX: Use destructuring to fully omit admin_id from the object (not set to undefined)
  const visibleParticipants = clientId
    ? (participants || [])
        .filter((p: any) => p.client_visible || p.user_id === clientId)
        .map(({ admin_id: _adminId, ...rest }: any) => rest)
    : participants || [];

  let notesQuery = supabase
    .from("meeting_notes")
    .select("id,meeting_id,note_type,body,client_visible,created_at,updated_at")
    .eq("meeting_id", meeting.id)
    .order("created_at", { ascending: false });
  if (clientId) notesQuery = notesQuery.eq("client_visible", true);
  const { data: notes, error: noteError } = await notesQuery;
  if (noteError) throw noteError;

  // BUG 20 FIX: For client, only show action items explicitly assigned to them.
  // Removed the unsafe OR condition that could leak unassigned items from the same project
  // to users who are not the intended assignee.
  let actionQuery = supabase
    .from("meeting_action_items")
    .select("*")
    .eq("meeting_id", meeting.id)
    .order("due_date", { ascending: true });
  if (clientId) actionQuery = actionQuery.eq("assigned_user_id", clientId);
  const { data: actionItems, error: actionError } = await actionQuery;
  if (actionError) throw actionError;

  return { ...meeting, participants: visibleParticipants, notes: notes || [], action_items: actionItems || [] };
}

async function meetingActivity(meetingId: number) {
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_type", "meeting")
    .eq("entity_id", String(meetingId))
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── User Routes ───────────────────────────────────────────────────────────────

router.get("/meetings", requireUserAuth, moduleGuard, async (req: UserRequest, res) => {
  try {
    await dispatchDueReminders();
    let query = supabase.from("meetings").select("*").eq("client_id", req.user!.id).order("starts_at", { ascending: true });
    if (typeof req.query.status === "string" && STATUSES.includes(req.query.status)) query = query.eq("status", req.query.status);
    if (typeof req.query.projectId === "string" && id(req.query.projectId)) query = query.eq("project_id", id(req.query.projectId)!);
    if (typeof req.query.search === "string" && req.query.search.trim()) query = query.ilike("title", `%${req.query.search.trim()}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json(await Promise.all((data || []).map((meeting: any) => meetingView(meeting, req.user!.id))));
  } catch (error: any) { res.status(500).json({ error: "Failed to load meetings", details: error?.message }); }
});

router.get("/meetings/:id", requireUserAuth, moduleGuard, async (req: UserRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    if (!meetingId) return fail(res, 400, "Invalid meeting ID");
    const meeting = await clientMeeting(meetingId, req.user!.id);
    if (!meeting) return fail(res, 404, "Meeting not found");
    res.json({ ...(await meetingView(meeting, req.user!.id)), activity: await meetingActivity(meetingId) });
  } catch (error: any) { res.status(500).json({ error: "Failed to load meeting", details: error?.message }); }
});

router.post("/meetings/:id/rsvp", requireUserAuth, moduleGuard, async (req: UserRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    if (!meetingId || !RSVP.includes(req.body?.status)) return fail(res, 400, "Invalid meeting or RSVP status");
    // Security: always verify the meeting belongs to this client first (IDOR guard)
    const meeting = await clientMeeting(meetingId, req.user!.id);
    if (!meeting) return fail(res, 404, "Meeting not found");

    // BUG 6 FIX: If the client owns the meeting but has no participant row yet (admin
    // forgot to add them), auto-create one so they can always RSVP their own meeting.
    let participant = await authorizedParticipant(meetingId, { userId: req.user!.id });
    if (!participant) {
      const { data: inserted, error: insertError } = await supabase
        .from("meeting_participants")
        .insert({ meeting_id: meetingId, user_id: req.user!.id, participant_role: "client", client_visible: true, rsvp_status: "pending" })
        .select()
        .single();
      if (insertError) return fail(res, 403, "You are not a meeting participant and could not be added");
      participant = inserted;
    }

    const { data, error } = await supabase
      .from("meeting_participants")
      .update({ rsvp_status: req.body.status, responded_at: new Date().toISOString() })
      .eq("id", participant.id)
      .select()
      .single();
    if (error) throw error;
    await audit({ userId: req.user!.id }, "meeting_rsvp_changed", "meeting", String(meetingId), { status: req.body.status });
    if (meeting.organizer_admin_id) {
      await supabase.from("notifications").insert({
        recipient_admin_id: meeting.organizer_admin_id,
        type: "meeting_rsvp_changed",
        title: "Meeting RSVP updated",
        body: `${meeting.title}: ${req.body.status}`,
        entity_type: "meeting",
        entity_id: String(meetingId),
      });
    }
    res.json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to update RSVP", details: error?.message }); }
});

router.post("/meeting-requests", requireUserAuth, moduleGuard, async (req: UserRequest, res) => {
  try {
    const { projectId, subject, preferredStartsAt, preferredEndsAt, timezone = "UTC", reason } = req.body ?? {};
    const project = id(projectId) ? await projectForClient(id(projectId)!, req.user!.id) : null;
    const starts = iso(preferredStartsAt);
    const ends = iso(preferredEndsAt);
    if (!project) return fail(res, 403, "Request must belong to your project");
    // BUG 17 FIX: Validate equal times explicitly for a clean 400 instead of a 500 from DB constraint
    if (!subject?.trim() || !starts || !ends) return fail(res, 400, "Valid subject, preferred start and end time are required");
    if (new Date(ends) <= new Date(starts)) return fail(res, 400, "Preferred end time must be after start time");
    if (!validTimezone(timezone)) return fail(res, 422, "Invalid timezone identifier");
    if (!reason?.trim()) return fail(res, 400, "A reason for the meeting request is required");
    const { data, error } = await supabase.from("meeting_requests").insert({
      client_id: req.user!.id,
      project_id: project.id,
      subject: subject.trim(),
      preferred_starts_at: starts,
      preferred_ends_at: ends,
      timezone,
      reason: reason.trim(),
      status: "requested",
    }).select().single();
    if (error) throw error;
    await notifyAdmins("meeting_requested", "New meeting request", `${project.name}: ${data.subject}`, String(data.id));
    await audit({ userId: req.user!.id }, "meeting_requested", "meeting_request", String(data.id));
    res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to request meeting", details: error?.message }); }
});

router.get("/meeting-requests", requireUserAuth, moduleGuard, async (req: UserRequest, res) => {
  try {
    const { data, error } = await supabase.from("meeting_requests").select("*").eq("client_id", req.user!.id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: "Failed to load meeting requests", details: error?.message }); }
});

// ─── Admin Routes ──────────────────────────────────────────────────────────────

router.get("/admin/meetings", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    await dispatchDueReminders();
    let query = supabase.from("meetings").select("*").order("starts_at", { ascending: true });
    if (typeof req.query.status === "string" && STATUSES.includes(req.query.status)) query = query.eq("status", req.query.status);
    if (typeof req.query.clientId === "string") query = query.eq("client_id", req.query.clientId);
    if (typeof req.query.projectId === "string" && id(req.query.projectId)) query = query.eq("project_id", id(req.query.projectId)!);
    if (typeof req.query.search === "string" && req.query.search.trim()) query = query.ilike("title", `%${req.query.search.trim()}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json(await Promise.all((data || []).map((meeting: any) => meetingView(meeting))));
  } catch (error: any) { res.status(500).json({ error: "Failed to load admin meetings", details: error?.message }); }
});

router.get("/admin/meetings/:id", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    if (!meetingId) return fail(res, 400, "Invalid meeting ID");
    const { data: meeting, error } = await supabase.from("meetings").select("*").eq("id", meetingId).maybeSingle();
    if (error) throw error;
    if (!meeting) return fail(res, 404, "Meeting not found");
    res.json({ ...(await meetingView(meeting)), activity: await meetingActivity(meetingId) });
  } catch (error: any) { res.status(500).json({ error: "Failed to load admin meeting", details: error?.message }); }
});

router.post("/admin/meetings", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const {
      clientId, projectId, relatedTicketId, title, description,
      startsAt, endsAt, timezone = "UTC", meetingType = "project_meeting",
      location, agenda, participantUserIds = [], participantAdminIds = [],
      status = "scheduled", fromRequestId,
    } = req.body ?? {};

    const project = id(projectId) ? await projectById(id(projectId)!) : null;
    const starts = iso(startsAt);
    const ends = iso(endsAt);

    if (typeof clientId !== "string" || !project || project.client_id !== clientId) return fail(res, 403, "Project does not belong to client");
    if (!title?.trim() || !starts || !ends) return fail(res, 400, "Title, start time, and end time are required");
    if (new Date(ends) <= new Date(starts)) return fail(res, 400, "End time must be after start time");
    if (!validTimezone(timezone)) return fail(res, 422, "Invalid timezone identifier");
    if (!TYPES.includes(meetingType)) return fail(res, 400, "Invalid meeting type");
    if (!STATUSES.includes(status)) return fail(res, 400, "Invalid meeting status");
    if (!Array.isArray(participantUserIds) || !Array.isArray(participantAdminIds)) return fail(res, 400, "Invalid participants");

    const { data: clientProfile } = await supabase.from("profiles").select("id").eq("id", clientId).maybeSingle();
    if (!clientProfile) return fail(res, 404, "Client not found");

    // BUG 16 FIX: Check for overlapping meeting in same time slot for the same client
    const { data: overlap } = await supabase
      .from("meetings")
      .select("id,title")
      .eq("client_id", clientId)
      .not("status", "in", '("cancelled","completed")')
      .lt("starts_at", ends)
      .gt("ends_at", starts)
      .limit(1)
      .maybeSingle();
    if (overlap) return fail(res, 409, `Client already has a meeting "${overlap.title}" overlapping this time slot`);

    const { data, error } = await supabase.from("meetings").insert({
      client_id: clientId,
      project_id: project.id,
      related_ticket_id: id(relatedTicketId),
      title: title.trim(),
      description: description || null,
      starts_at: starts,
      ends_at: ends,
      timezone,
      meeting_type: meetingType,
      status,
      location: location || null,
      agenda: agenda || null,
      organizer_admin_id: req.admin!.id,
    }).select().single();
    if (error) throw error;

    const users = Array.from(new Set([clientId, ...participantUserIds.filter((v: any) => typeof v === "string")]));
    const admins = Array.from(new Set([req.admin!.id, ...participantAdminIds.map(Number).filter((v: number) => Number.isInteger(v) && v > 0)]));
    await supabase.from("meeting_participants").insert([
      ...users.map((userId) => ({ meeting_id: data.id, user_id: userId, participant_role: userId === clientId ? "client" : "participant", client_visible: userId === clientId })),
      ...admins.map((adminId) => ({ meeting_id: data.id, admin_id: adminId, participant_role: adminId === req.admin!.id ? "organizer" : "team", client_visible: false })),
    ]);

    await createReminders(data);

    await supabase.from("project_activity").insert({
      project_id: project.id,
      actor_admin_id: req.admin!.id,
      action: "meeting_scheduled",
      description: `Meeting ${data.title} was scheduled`,
      metadata: { meetingId: data.id },
    });

    await notifyUser(clientId, "meeting_scheduled", "Meeting scheduled", `${data.title} for ${new Date(starts).toLocaleString()}`, String(data.id));
    await audit({ adminId: req.admin!.id }, "meeting_created", "meeting", String(data.id), { projectId: project.id });

    // BUG 10 FIX: If this meeting was created from a meeting request, auto-link the request
    // and update its status to "scheduled" so the client sees the resolution.
    if (id(fromRequestId)) {
      await supabase
        .from("meeting_requests")
        .update({ meeting_id: data.id, status: "scheduled", reviewed_by_admin_id: req.admin!.id })
        .eq("id", id(fromRequestId)!);
      await notifyUser(clientId, "meeting_request_updated", "Meeting request scheduled", `Your request has been scheduled: ${data.title}`, String(id(fromRequestId)!));
    }

    res.status(201).json(await meetingView(data));
  } catch (error: any) { res.status(500).json({ error: "Failed to create meeting", details: error?.message }); }
});

router.patch("/admin/meetings/:id", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    if (!meetingId) return fail(res, 400, "Invalid meeting ID");
    const { data: existing, error: existingError } = await supabase.from("meetings").select("*").eq("id", meetingId).maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return fail(res, 404, "Meeting not found");

    const nextStarts = req.body.startsAt === undefined ? existing.starts_at : iso(req.body.startsAt);
    const nextEnds = req.body.endsAt === undefined ? existing.ends_at : iso(req.body.endsAt);
    if (!nextStarts || !nextEnds || new Date(nextEnds) <= new Date(nextStarts)) return fail(res, 400, "End time must be after start time");
    if (req.body.status !== undefined && !STATUSES.includes(req.body.status)) return fail(res, 400, "Invalid meeting status");
    if (req.body.meetingType !== undefined && !TYPES.includes(req.body.meetingType)) return fail(res, 400, "Invalid meeting type");

    const patch: Record<string, unknown> = {};
    for (const [source, target] of [
      ["title", "title"], ["description", "description"], ["location", "location"],
      ["agenda", "agenda"], ["timezone", "timezone"], ["meetingType", "meeting_type"], ["status", "status"],
    ]) { if (req.body[source] !== undefined) patch[target] = req.body[source]; }
    patch.starts_at = nextStarts;
    patch.ends_at = nextEnds;
    if (req.body.cancellationReason !== undefined) patch.cancellation_reason = req.body.cancellationReason;
    if (patch.timezone !== undefined && !validTimezone(patch.timezone)) return fail(res, 400, "Invalid timezone");

    const { data, error } = await supabase.from("meetings").update(patch).eq("id", meetingId).select().single();
    if (error) throw error;

    const rescheduled = existing.starts_at !== data.starts_at || existing.ends_at !== data.ends_at;
    await createReminders(data);
    await audit(
      { adminId: req.admin!.id },
      rescheduled ? "meeting_rescheduled" : patch.status ? "meeting_status_changed" : "meeting_updated",
      "meeting", String(meetingId),
      { previous: { startsAt: existing.starts_at, endsAt: existing.ends_at, status: existing.status }, changes: patch }
    );
    await notifyUser(
      existing.client_id,
      rescheduled ? "meeting_rescheduled" : patch.status === "cancelled" ? "meeting_cancelled" : "meeting_updated",
      rescheduled ? "Meeting rescheduled" : "Meeting updated",
      data.title,
      String(meetingId)
    );
    if (rescheduled || patch.status === "cancelled" || patch.status === "completed") {
      await supabase.from("project_activity").insert({
        project_id: existing.project_id,
        actor_admin_id: req.admin!.id,
        action: rescheduled ? "meeting_rescheduled" : `meeting_${patch.status}`,
        description: `Meeting ${data.title} was ${rescheduled ? "rescheduled" : patch.status}`,
        metadata: { meetingId },
      });
    }
    res.json(await meetingView(data));
  } catch (error: any) { res.status(500).json({ error: "Failed to update meeting", details: error?.message }); }
});

router.post("/admin/meetings/:id/notes", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    const { body, noteType = "summary", clientVisible = false, partnerVisible = false } = req.body ?? {};
    if (!meetingId || !body?.trim() || !NOTE_TYPES.includes(noteType)) return fail(res, 400, "Valid note fields are required");
    const { data: meeting } = await supabase.from("meetings").select("id,client_id").eq("id", meetingId).maybeSingle();
    if (!meeting) return fail(res, 404, "Meeting not found");
    const { data, error } = await supabase.from("meeting_notes").insert({
      meeting_id: meetingId,
      author_admin_id: req.admin!.id,
      note_type: noteType,
      body: body.trim(),
      client_visible: Boolean(clientVisible),
      partner_visible: Boolean(partnerVisible),
    }).select().single();
    if (error) throw error;
    await audit({ adminId: req.admin!.id }, "meeting_note_created", "meeting", String(meetingId), { noteId: data.id, clientVisible: Boolean(clientVisible), partnerVisible: Boolean(partnerVisible) });
    // Notify client if the note is marked client-visible
    if (Boolean(clientVisible)) {
      await notifyUser(meeting.client_id, "meeting_note_added", "New meeting note", `A note was added to your meeting`, String(meetingId));
    }
    res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to create meeting note", details: error?.message }); }
});

router.post("/admin/meetings/:id/action-items", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const meetingId = id(req.params.id);
    const { title, description, projectId, assignedUserId, assignedAdminId, dueDate, priority = "medium" } = req.body ?? {};
    if (!meetingId || !title?.trim() || !id(projectId) || !PRIORITIES.includes(priority)) return fail(res, 400, "Valid action item fields are required");
    const { data: meeting, error: meetingError } = await supabase.from("meetings").select("project_id,client_id,title").eq("id", meetingId).maybeSingle();
    if (meetingError) throw meetingError;
    if (!meeting) return fail(res, 404, "Meeting not found");
    if (meeting.project_id !== id(projectId)) return fail(res, 403, "Project does not match meeting");
    const { data, error } = await supabase.from("meeting_action_items").insert({
      meeting_id: meetingId,
      project_id: id(projectId),
      assigned_user_id: assignedUserId || null,
      assigned_admin_id: id(assignedAdminId),
      title: title.trim(),
      description: description || null,
      due_date: dueDate || null,
      priority,
      created_by_admin_id: req.admin!.id,
    }).select().single();
    if (error) throw error;
    await supabase.from("project_activity").insert({
      project_id: meeting.project_id,
      actor_admin_id: req.admin!.id,
      action: "meeting_action_item_created",
      description: `Action item "${data.title}" was created`,
      metadata: { meetingId, actionItemId: data.id },
    });
    if (assignedUserId) await notifyUser(assignedUserId, "meeting_action_item_assigned", "Meeting action item assigned", data.title, String(meetingId));
    await audit({ adminId: req.admin!.id }, "meeting_action_item_created", "meeting", String(meetingId), { actionItemId: data.id });
    res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to create action item", details: error?.message }); }
});

router.patch("/admin/action-items/:id", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const actionId = id(req.params.id);
    if (!actionId) return fail(res, 400, "Invalid action item ID");
    if (req.body.status !== undefined && !ACTION_STATUSES.includes(req.body.status)) return fail(res, 400, "Invalid action item status");
    if (req.body.priority !== undefined && !PRIORITIES.includes(req.body.priority)) return fail(res, 400, "Invalid action item priority");
    const { data: existing } = await supabase.from("meeting_action_items").select("*").eq("id", actionId).maybeSingle();
    if (!existing) return fail(res, 404, "Action item not found");
    const patch: Record<string, unknown> = {};
    for (const key of ["title", "description", "due_date", "priority", "status", "assigned_user_id", "assigned_admin_id"]) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    const { data, error } = await supabase.from("meeting_action_items").update(patch).eq("id", actionId).select().single();
    if (error) throw error;
    await audit({ adminId: req.admin!.id }, "meeting_action_item_updated", "meeting", String(existing.meeting_id), { actionItemId: actionId, changes: patch });
    res.json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to update action item", details: error?.message }); }
});

router.get("/admin/meeting-requests", requireAuth, moduleGuard, async (_req: AdminRequest, res) => {
  try {
    const { data, error } = await supabase.from("meeting_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: "Failed to load meeting requests", details: error?.message }); }
});

router.patch("/admin/meeting-requests/:id", requireAuth, moduleGuard, async (req: AdminRequest, res) => {
  try {
    const requestId = id(req.params.id);
    if (!requestId || !["pending_review", "rejected", "scheduled", "confirmed", "rescheduled"].includes(req.body?.status)) {
      return fail(res, 400, "Invalid request status");
    }
    const { data: existing } = await supabase.from("meeting_requests").select("*").eq("id", requestId).maybeSingle();
    if (!existing) return fail(res, 404, "Meeting request not found");
    const { data, error } = await supabase.from("meeting_requests").update({
      status: req.body.status,
      reviewed_by_admin_id: req.admin!.id,
      review_notes: req.body.reviewNotes || null,
    }).eq("id", requestId).select().single();
    if (error) throw error;
    await notifyUser(existing.client_id, "meeting_request_updated", "Meeting request updated", `${existing.subject}: ${req.body.status}`, String(requestId));
    await audit({ adminId: req.admin!.id }, "meeting_request_updated", "meeting_request", String(requestId), { status: req.body.status });
    res.json(data);
  } catch (error: any) { res.status(500).json({ error: "Failed to update meeting request", details: error?.message }); }
});

router.get("/admin/meetings/reminders/run", requireAuth, moduleGuard, async (_req: AdminRequest, res) => {
  try {
    await dispatchDueReminders();
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: "Failed to dispatch meeting reminders", details: error?.message }); }
});

export default router;
