import { Router, type IRouter, type Request, type Response } from "express";
import { supabase } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
import { requireFeature, requireUserAuth } from "./user.js";

const router: IRouter = Router();
const PROJECT_STATUSES = ["planning", "design", "development", "ai_training", "integration", "testing", "uat", "deployment", "completed", "on_hold", "cancelled"];
const MILESTONE_STATUSES = ["not_started", "in_progress", "at_risk", "completed", "on_hold"];
const TASK_PRIORITIES = ["low", "medium", "high", "critical"];
const TASK_STATUSES = ["todo", "in_progress", "blocked", "review", "completed"];
const DELIVERABLE_STATUSES = ["submitted", "under_review", "changes_requested", "resubmitted", "approved"];

type UserRequest = Request & { user?: { id: string; email: string } };
type AdminRequest = Request & { admin?: { id: number; username: string } };

function fail(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message, error: message });
}

function numberId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function projectForUser(id: number, userId: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("client_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function recordActivity(projectId: number, action: string, description: string, actor: { userId?: string; adminId?: number }, metadata: Record<string, unknown> = {}) {
  const { error } = await supabase.from("project_activity").insert({ project_id: projectId, actor_user_id: actor.userId ?? null, actor_admin_id: actor.adminId ?? null, action, description, metadata });
  if (error) throw error;
}

async function notifyProjectClient(clientId: string, type: string, title: string, body: string, projectId: number) {
  const { error } = await supabase.from("notifications").insert({ recipient_user_id: clientId, type, title, body, entity_type: "project", entity_id: String(projectId) });
  if (error) throw error;
}

async function recalculateProgress(projectId: number) {
  const { data: project, error: projectError } = await supabase.from("projects").select("manual_progress_percent").eq("id", projectId).single();
  if (projectError) throw projectError;
  if (project.manual_progress_percent !== null) return Number(project.manual_progress_percent);
  const { data: milestones, error: milestoneError } = await supabase.from("project_milestones").select("completion_percent").eq("project_id", projectId);
  if (milestoneError) throw milestoneError;
  const { data: tasks, error: taskError } = await supabase.from("project_tasks").select("completion_percent").eq("project_id", projectId);
  if (taskError) throw taskError;
  const values = (milestones || []).map((item: any) => Number(item.completion_percent));
  if (!values.length) values.push(...(tasks || []).map((item: any) => Number(item.completion_percent)));
  const progress = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  await supabase.from("projects").update({ progress_percent: progress }).eq("id", projectId);
  return progress;
}

async function projectDetails(projectId: number, clientId?: string) {
  let projectQuery = supabase.from("projects").select("*").eq("id", projectId);
  if (clientId) projectQuery = projectQuery.eq("client_id", clientId);
  const { data: project, error: projectError } = await projectQuery.maybeSingle();
  if (projectError) throw projectError;
  if (!project) return null;
  const [members, milestones, tasks, deliverables, activity, meetings] = await Promise.all([
    supabase.from("project_members").select("*").eq("project_id", projectId).eq("active", true).then((result) => result),
    supabase.from("project_milestones").select("*").eq("project_id", projectId).order("due_date", { ascending: true }).then((result) => result),
    supabase.from("project_tasks").select("*").eq("project_id", projectId).order("due_date", { ascending: true }).then((result) => result),
    supabase.from("project_deliverables").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).then((result) => result),
    supabase.from("project_activity").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(100).then((result) => result),
    supabase.from("meetings").select("id,title,status,starts_at,ends_at,timezone,location").eq("project_id", projectId).order("starts_at", { ascending: true }).then((result) => result),
  ]);
  for (const result of [members, milestones, tasks, deliverables, activity, meetings]) if (result.error) throw result.error;
  const clientTasks = clientId ? (tasks.data || []).filter((item: any) => item.client_visible).map((item: any) => {
    const { internal_notes: _internalNotes, ...visibleTask } = item;
    return visibleTask;
  }) : tasks.data || [];
  const clientActivity = clientId ? (activity.data || []).map((item: any) => {
    if (!item.metadata?.changes || (!Object.prototype.hasOwnProperty.call(item.metadata.changes, "internalNotes") && !Object.prototype.hasOwnProperty.call(item.metadata.changes, "internal_notes"))) return item;
    const { internalNotes: _internalNotes, internal_notes: _internalNotesDb, ...visibleChanges } = item.metadata.changes;
    return { ...item, metadata: { ...item.metadata, changes: visibleChanges } };
  }) : activity.data || [];
  return {
    ...project,
    project_members: clientId ? (members.data || []).filter((item: any) => item.client_visible) : members.data || [],
    project_milestones: milestones.data || [],
    project_tasks: clientTasks,
    project_deliverables: clientId ? (deliverables.data || []).filter((item: any) => item.client_visible) : deliverables.data || [],
    project_activity: clientActivity,
    project_meetings: clientId ? (meetings.data || []).filter((item: any) => item.status !== "cancelled") : meetings.data || [],
  };
}

router.get("/projects", requireUserAuth, requireFeature("projects"), async (req: UserRequest, res) => {
  try {
    const { data, error } = await supabase.from("projects").select("*").eq("client_id", req.user!.id).order("updated_at", { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (error: any) { console.error("Client projects list error:", error?.message); return res.status(500).json({ error: "Failed to load projects" }); }
});

router.get("/projects/:id", requireUserAuth, requireFeature("projects"), async (req: UserRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid project ID");
    const project = await projectDetails(id, req.user!.id);
    if (!project) return fail(res, 404, "Project not found");
    return res.json(project);
  } catch (error: any) { console.error("Client project detail error:", error?.message); return res.status(500).json({ error: "Failed to load project" }); }
});

router.get("/admin/projects", requireAuth, async (req: AdminRequest, res) => {
  try {
    let query = supabase.from("projects").select("*").order("updated_at", { ascending: false });
    if (typeof req.query.status === "string" && PROJECT_STATUSES.includes(req.query.status)) query = query.eq("status", req.query.status);
    if (typeof req.query.clientId === "string") query = query.eq("client_id", req.query.clientId);
    if (typeof req.query.search === "string" && req.query.search.trim()) query = query.ilike("name", `%${req.query.search.trim()}%`);
    const { data, error } = await query;
    if (error) throw error;
    return res.json(data || []);
  } catch (error: any) { console.error("Admin projects list error:", error?.message); return res.status(500).json({ error: "Failed to load projects" }); }
});

router.get("/admin/projects/:id", requireAuth, async (req: AdminRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid project ID");
    const project = await projectDetails(id);
    if (!project) return fail(res, 404, "Project not found");
    return res.json(project);
  } catch (error: any) { console.error("Admin project detail error:", error?.message); return res.status(500).json({ error: "Failed to load project" }); }
});

router.post("/admin/projects", requireAuth, async (req: AdminRequest, res) => {
  try {
    const { clientId, name, projectType = "Custom Project", status = "planning", startDate, expectedEndDate, budget, description, scope, objectives, technologies = [] } = req.body ?? {};
    if (typeof clientId !== "string" || !name?.trim()) return fail(res, 400, "clientId and name are required");
    if (!PROJECT_STATUSES.includes(status)) return fail(res, 400, "Invalid project status");
    const { data: client, error: clientError } = await supabase.from("profiles").select("id").eq("id", clientId).maybeSingle();
    if (clientError) throw clientError;
    if (!client) return fail(res, 404, "Client not found");
    const { data, error } = await supabase.from("projects").insert({ client_id: clientId, name: name.trim(), project_type: projectType, status, start_date: startDate || null, expected_end_date: expectedEndDate || null, budget: budget === undefined || budget === "" ? null : Number(budget), description: description || null, scope: scope || null, objectives: objectives || null, technologies: Array.isArray(technologies) ? technologies : [], created_by: req.admin!.id }).select().single();
    if (error) throw error;
    await recordActivity(data.id, "project_created", `Project ${data.name} was created`, { adminId: req.admin!.id });
    await notifyProjectClient(clientId, "project_assigned", "New project assigned", data.name, data.id);
    return res.status(201).json(data);
  } catch (error: any) { console.error("Admin project create error:", error?.message); return res.status(500).json({ error: "Failed to create project" }); }
});

router.patch("/admin/projects/:id", requireAuth, async (req: AdminRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid project ID");
    const { status, progressPercent, manualProgressPercent, name, projectType, startDate, expectedEndDate, budget, description, scope, objectives, technologies } = req.body ?? {};
    if (status !== undefined && !PROJECT_STATUSES.includes(status)) return fail(res, 400, "Invalid project status");
    const { data: existing, error: existingError } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return fail(res, 404, "Project not found");
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (projectType !== undefined) patch.project_type = projectType;
    if (status !== undefined) patch.status = status;
    if (progressPercent !== undefined || manualProgressPercent !== undefined) {
      const value = manualProgressPercent ?? progressPercent;
      if (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 100) return fail(res, 400, "Progress must be between 0 and 100");
      patch.manual_progress_percent = Number(value); patch.progress_percent = Number(value);
    }
    if (manualProgressPercent === null) { patch.manual_progress_percent = null; patch.progress_percent = await recalculateProgress(id); }
    if (startDate !== undefined) patch.start_date = startDate || null;
    if (expectedEndDate !== undefined) patch.expected_end_date = expectedEndDate || null;
    if (budget !== undefined) patch.budget = budget === "" || budget === null ? null : Number(budget);
    if (description !== undefined) patch.description = description;
    if (scope !== undefined) patch.scope = scope;
    if (objectives !== undefined) patch.objectives = objectives;
    if (technologies !== undefined) patch.technologies = Array.isArray(technologies) ? technologies : [];
    const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().single();
    if (error) throw error;
    if (status && status !== existing.status) await notifyProjectClient(existing.client_id, "project_status_changed", "Project status changed", `${data.name}: ${status}`, id);
    if (patch.progress_percent !== undefined) await notifyProjectClient(existing.client_id, "project_progress_changed", "Project progress updated", `${data.name}: ${data.progress_percent}%`, id);
    await recordActivity(id, status && status !== existing.status ? "project_status_changed" : "project_updated", `Project ${data.name} was updated`, { adminId: req.admin!.id }, { changes: patch });
    return res.json(data);
  } catch (error: any) { console.error("Admin project update error:", error?.message); return res.status(500).json({ error: "Failed to update project" }); }
});

router.post("/admin/projects/:id/milestones", requireAuth, async (req: AdminRequest, res) => {
  try {
    const projectId = numberId(req.params.id); if (!projectId) return fail(res, 400, "Invalid project ID");
    const { name, description, startDate, dueDate, status = "not_started", completionPercent = 0, notes } = req.body ?? {};
    if (!name?.trim() || !MILESTONE_STATUSES.includes(status)) return fail(res, 400, "Valid milestone name and status are required");
    if (!Number.isInteger(Number(completionPercent)) || Number(completionPercent) < 0 || Number(completionPercent) > 100) return fail(res, 400, "Completion must be between 0 and 100");
    const project = await supabase.from("projects").select("client_id,name").eq("id", projectId).maybeSingle();
    if (project.error) throw project.error; if (!project.data) return fail(res, 404, "Project not found");
    const { data, error } = await supabase.from("project_milestones").insert({ project_id: projectId, name: name.trim(), description: description || null, start_date: startDate || null, due_date: dueDate || null, status, completion_percent: Number(completionPercent), notes: notes || null }).select().single();
    if (error) throw error;
    await recalculateProgress(projectId); await recordActivity(projectId, "milestone_created", `Milestone ${data.name} was created`, { adminId: req.admin!.id }); await notifyProjectClient(project.data.client_id, "milestone_created", "New project milestone", `${project.data.name}: ${data.name}`, projectId);
    return res.status(201).json(data);
  } catch (error: any) { console.error("Milestone create error:", error?.message); return res.status(500).json({ error: "Failed to create milestone" }); }
});

router.patch("/admin/milestones/:id", requireAuth, async (req: AdminRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid milestone ID");
    const { name, description, startDate, dueDate, status, completionPercent, notes } = req.body ?? {};
    if (status !== undefined && !MILESTONE_STATUSES.includes(status)) return fail(res, 400, "Invalid milestone status");
    const { data: existing, error: existingError } = await supabase.from("project_milestones").select("*, projects(client_id,name)").eq("id", id).maybeSingle();
    if (existingError) throw existingError; if (!existing) return fail(res, 404, "Milestone not found");
    const patch: Record<string, unknown> = {}; if (name !== undefined) patch.name = String(name).trim(); if (description !== undefined) patch.description = description; if (startDate !== undefined) patch.start_date = startDate || null; if (dueDate !== undefined) patch.due_date = dueDate || null; if (status !== undefined) patch.status = status; if (completionPercent !== undefined) { if (Number(completionPercent) < 0 || Number(completionPercent) > 100) return fail(res, 400, "Completion must be between 0 and 100"); patch.completion_percent = Number(completionPercent); } if (notes !== undefined) patch.notes = notes;
    const { data, error } = await supabase.from("project_milestones").update(patch).eq("id", id).select().single(); if (error) throw error;
    await recalculateProgress(existing.project_id); await recordActivity(existing.project_id, "milestone_updated", `Milestone ${data.name} was updated`, { adminId: req.admin!.id }, { changes: patch }); return res.json(data);
  } catch (error: any) { console.error("Milestone update error:", error?.message); return res.status(500).json({ error: "Failed to update milestone" }); }
});

router.post("/admin/projects/:id/tasks", requireAuth, async (req: AdminRequest, res) => {
  try {
    const projectId = numberId(req.params.id); if (!projectId) return fail(res, 400, "Invalid project ID");
    const { milestoneId, name, description, assignedUserId, assignedName, priority = "medium", status = "todo", startDate, dueDate, estimatedEffort, internalNotes, clientVisible = true, completionPercent = 0 } = req.body ?? {};
    if (!name?.trim() || !TASK_PRIORITIES.includes(priority) || !TASK_STATUSES.includes(status)) return fail(res, 400, "Valid task name, priority, and status are required");
    if (!Number.isInteger(Number(completionPercent)) || Number(completionPercent) < 0 || Number(completionPercent) > 100) return fail(res, 400, "Completion must be between 0 and 100");
    const { data: project, error: projectError } = await supabase.from("projects").select("client_id,name").eq("id", projectId).maybeSingle(); if (projectError) throw projectError; if (!project) return fail(res, 404, "Project not found");
    const { data, error } = await supabase.from("project_tasks").insert({ project_id: projectId, milestone_id: numberId(milestoneId), name: name.trim(), description: description || null, assigned_user_id: assignedUserId || null, assigned_name: assignedName || null, priority, status, start_date: startDate || null, due_date: dueDate || null, estimated_effort: estimatedEffort || null, internal_notes: internalNotes || null, client_visible: Boolean(clientVisible), completion_percent: Number(completionPercent) }).select().single(); if (error) throw error;
    await recalculateProgress(projectId); await recordActivity(projectId, "task_created", `Task ${data.name} was created`, { adminId: req.admin!.id }); await notifyProjectClient(project.client_id, "project_task_created", "New project task", `${project.name}: ${data.name}`, projectId); return res.status(201).json(data);
  } catch (error: any) { console.error("Task create error:", error?.message); return res.status(500).json({ error: "Failed to create task" }); }
});

router.patch("/admin/tasks/:id", requireAuth, async (req: AdminRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid task ID");
    const { name, description, milestoneId, assignedUserId, assignedName, priority, status, startDate, dueDate, estimatedEffort, internalNotes, clientVisible, completionPercent } = req.body ?? {};
    if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) return fail(res, 400, "Invalid task priority"); if (status !== undefined && !TASK_STATUSES.includes(status)) return fail(res, 400, "Invalid task status");
    const { data: existing, error: existingError } = await supabase.from("project_tasks").select("*, projects(client_id,name)").eq("id", id).maybeSingle(); if (existingError) throw existingError; if (!existing) return fail(res, 404, "Task not found");
    const patch: Record<string, unknown> = {}; if (name !== undefined) patch.name = String(name).trim(); if (description !== undefined) patch.description = description; if (milestoneId !== undefined) patch.milestone_id = numberId(milestoneId); if (assignedUserId !== undefined) patch.assigned_user_id = assignedUserId || null; if (assignedName !== undefined) patch.assigned_name = assignedName; if (priority !== undefined) patch.priority = priority; if (status !== undefined) patch.status = status; if (startDate !== undefined) patch.start_date = startDate || null; if (dueDate !== undefined) patch.due_date = dueDate || null; if (estimatedEffort !== undefined) patch.estimated_effort = estimatedEffort; if (internalNotes !== undefined) patch.internal_notes = internalNotes; if (clientVisible !== undefined) patch.client_visible = Boolean(clientVisible); if (completionPercent !== undefined) { if (Number(completionPercent) < 0 || Number(completionPercent) > 100) return fail(res, 400, "Completion must be between 0 and 100"); patch.completion_percent = Number(completionPercent); }
    const { data, error } = await supabase.from("project_tasks").update(patch).eq("id", id).select().single(); if (error) throw error; await recalculateProgress(existing.project_id); await recordActivity(existing.project_id, status ? "task_status_changed" : "task_updated", `Task ${data.name} was updated`, { adminId: req.admin!.id }, { changes: patch }); if (status === "completed") await notifyProjectClient(existing.projects.client_id, "project_task_completed", "Project task completed", `${existing.projects.name}: ${data.name}`, existing.project_id); return res.json(data);
  } catch (error: any) { console.error("Task update error:", error?.message); return res.status(500).json({ error: "Failed to update task" }); }
});

router.post("/admin/projects/:id/deliverables", requireAuth, async (req: AdminRequest, res) => {
  try {
    const projectId = numberId(req.params.id); if (!projectId) return fail(res, 400, "Invalid project ID"); const { milestoneId, name, description, filePath, status = "submitted", clientVisible = true } = req.body ?? {}; if (!name?.trim() || !DELIVERABLE_STATUSES.includes(status)) return fail(res, 400, "Valid deliverable name and status are required"); const { data: project, error: projectError } = await supabase.from("projects").select("client_id,name").eq("id", projectId).maybeSingle(); if (projectError) throw projectError; if (!project) return fail(res, 404, "Project not found"); const { data, error } = await supabase.from("project_deliverables").insert({ project_id: projectId, milestone_id: numberId(milestoneId), name: name.trim(), description: description || null, file_path: filePath || null, status, client_visible: Boolean(clientVisible) }).select().single(); if (error) throw error; await recordActivity(projectId, "deliverable_submitted", `Deliverable ${data.name} was submitted`, { adminId: req.admin!.id }); await notifyProjectClient(project.client_id, "deliverable_submitted", "New project deliverable", `${project.name}: ${data.name}`, projectId); return res.status(201).json(data);
  } catch (error: any) { console.error("Deliverable create error:", error?.message); return res.status(500).json({ error: "Failed to create deliverable" }); }
});

router.patch("/admin/deliverables/:id", requireAuth, async (req: AdminRequest, res) => {
  try {
    const id = numberId(req.params.id); if (!id) return fail(res, 400, "Invalid deliverable ID"); const { name, description, filePath, status, reviewNotes, clientVisible } = req.body ?? {}; if (status !== undefined && !DELIVERABLE_STATUSES.includes(status)) return fail(res, 400, "Invalid deliverable status"); const { data: existing, error: existingError } = await supabase.from("project_deliverables").select("*, projects(client_id,name)").eq("id", id).maybeSingle(); if (existingError) throw existingError; if (!existing) return fail(res, 404, "Deliverable not found"); const patch: Record<string, unknown> = {}; if (name !== undefined) patch.name = String(name).trim(); if (description !== undefined) patch.description = description; if (filePath !== undefined) patch.file_path = filePath; if (status !== undefined) { patch.status = status; patch.reviewed_at = ["approved", "changes_requested"].includes(status) ? new Date().toISOString() : null; } if (reviewNotes !== undefined) patch.review_notes = reviewNotes; if (clientVisible !== undefined) patch.client_visible = Boolean(clientVisible); const { data, error } = await supabase.from("project_deliverables").update(patch).eq("id", id).select().single(); if (error) throw error; await recordActivity(existing.project_id, status === "approved" ? "deliverable_approved" : status === "changes_requested" ? "deliverable_changes_requested" : "deliverable_updated", `Deliverable ${data.name} was updated`, { adminId: req.admin!.id }, { changes: patch }); if (status) await notifyProjectClient(existing.projects.client_id, status === "approved" ? "deliverable_approved" : "deliverable_updated", "Deliverable status changed", `${existing.projects.name}: ${data.name}`, existing.project_id); return res.json(data);
  } catch (error: any) { console.error("Deliverable update error:", error?.message); return res.status(500).json({ error: "Failed to update deliverable" }); }
});

export default router;
