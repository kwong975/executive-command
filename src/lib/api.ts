/**
 * API client for Agent Command.
 *
 * When running in Lovable (no backend), all methods return fake data.
 * When running with the real backend, set VITE_USE_REAL_API=true.
 *
 * The method interface matches the real backend contract exactly.
 */

import {
  fakeToday, fakeStrategy, fakeMatters, fakeMatterDetail, fakeUnassigned,
  fakeHealth, fakeStatus,
} from "./fake-data";
import { agents as mockAgents } from "@/data/mockData";

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === "true";
const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!USE_REAL_API) {
    throw new Error("Real API disabled — should not reach here");
  }
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// Fake delay to simulate network
const fake = <T>(data: T, ms = 150): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(structuredClone(data) as T), ms));

// ── Types (kept for contract reference) ──

export type AgentStatus = "active" | "quiet" | "idle" | "degraded" | "unknown";

export interface Agent {
  id: string; name: string; role: string; emoji: string; status: AgentStatus;
  accent_color: string; team: string | null; workspace_path: string;
}
export interface AgentDetail extends Agent {
  personality_snippet: string | null; tools: string[];
  workspace_files: Record<string, string>; cron_count: number; session_count: number;
}
export interface AgentRelationship {
  from_agent: string; to_agent: string; relationship: string;
  evidence_type: "observed" | "configured"; strength: number;
}
export interface CronJob {
  id: string; name: string; agent: string; schedule: string; enabled: boolean;
  status: "success" | "degraded" | "failed" | "never_run";
  lastRun: string | null; nextRun: string | null; reliability: string; isCritical: boolean;
}

// ── API client ──

export const api = {
  // Health
  health: () => USE_REAL_API
    ? request<{ status: string; gateway_connected: boolean }>("/health")
    : fake(fakeHealth),
  status: () => USE_REAL_API
    ? request<Record<string, unknown>>("/status")
    : fake(fakeStatus),

  // Today
  getToday: () => USE_REAL_API
    ? request<Record<string, unknown>>("/today")
    : fake(fakeToday),

  // Strategy
  getStrategy: () => USE_REAL_API
    ? request<Record<string, unknown>>("/strategy")
    : fake(fakeStrategy),
  linkMatterToGoal: (matterId: string, goalId: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/strategy/link?matter_id=${matterId}&goal_id=${goalId}`, { method: "POST" })
    : fake({ ok: true }),
  unlinkMatterFromGoal: (matterId: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/strategy/unlink?matter_id=${matterId}`, { method: "POST" })
    : fake({ ok: true }),
  runStrategySeed: () => USE_REAL_API
    ? request<Record<string, unknown>>("/strategy/lifecycle/seed", { method: "POST" })
    : fake({ ok: true, created: 0, updated: 36 }),
  archiveGoal: (goalId: string, buCode: string, reason: string) => USE_REAL_API
    ? request<Record<string, unknown>>("/strategy/lifecycle/archive-goal", { method: "POST", body: JSON.stringify({ goal_id: goalId, bu_code: buCode, reason }) })
    : fake({ ok: true, goal_id: goalId, new_status: reason }),
  addBUGoal: (data: Record<string, unknown>) => USE_REAL_API
    ? request<Record<string, unknown>>("/strategy/lifecycle/add-bu-goal", { method: "POST", body: JSON.stringify(data) })
    : fake({ ok: true, goal_id: "new-goal-id" }),
  addDeptGoal: (data: Record<string, unknown>) => USE_REAL_API
    ? request<Record<string, unknown>>("/strategy/lifecycle/add-dept-goal", { method: "POST", body: JSON.stringify(data) })
    : fake({ ok: true, goal_id: "new-dept-goal-id" }),
  getStrategySource: (buCode: string) => USE_REAL_API
    ? request<Record<string, unknown>>(`/strategy/lifecycle/source/${buCode}`)
    : fake({ path: "05-strategy/cp-objectives-2026.md", version: 2, effective_date: "2026-04-01" }),

  // Matters
  listMatters: (top = 50) => USE_REAL_API
    ? request<{ matters: Record<string, unknown>[]; count: number }>(`/matters?top=${top}`)
    : fake(fakeMatters),
  getMatter: (matterId: string) => USE_REAL_API
    ? request<Record<string, unknown>>(`/matters/${matterId}`)
    : fake(fakeMatterDetail),
  listUnassigned: () => USE_REAL_API
    ? request<{ threads: Record<string, unknown>[]; count: number }>("/matters/unassigned")
    : fake(fakeUnassigned),
  createMatter: (data: Record<string, unknown>) => USE_REAL_API
    ? request<{ ok: boolean; matter_id: string }>("/matters", { method: "POST", body: JSON.stringify(data) })
    : fake({ ok: true, matter_id: "new-matter" }),
  patchMatter: (matterId: string, fields: Record<string, unknown>) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/${matterId}`, { method: "PATCH", body: JSON.stringify(fields) })
    : fake({ ok: true }),
  archiveMatter: (matterId: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/${matterId}/archive`, { method: "POST" })
    : fake({ ok: true }),
  assignThread: (threadId: string, matterId: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/threads/${threadId}/assign`, { method: "POST", body: JSON.stringify({ matter_id: matterId }) })
    : fake({ ok: true }),
  reassignThread: (threadId: string, newMatterId: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/threads/${threadId}/reassign`, { method: "POST", body: JSON.stringify({ new_matter_id: newMatterId }) })
    : fake({ ok: true }),
  closeThread: (threadId: string, reason = "operator_closed") => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/threads/${threadId}/close`, { method: "POST", body: JSON.stringify({ reason }) })
    : fake({ ok: true }),
  updateCommitmentStatus: (commitmentId: string, status: string, reason?: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/commitments/${commitmentId}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) })
    : fake({ ok: true }),
  updateCommitment: (commitmentId: string, fields: Record<string, unknown>) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/commitments/${commitmentId}`, { method: "PATCH", body: JSON.stringify(fields) })
    : fake({ ok: true }),
  setPersonRole: (matterId: string, personKey: string, role: string) => USE_REAL_API
    ? request<{ ok: boolean }>(`/matters/${matterId}/people`, { method: "POST", body: JSON.stringify({ person_key: personKey, role }) })
    : fake({ ok: true }),

  // Agents
  listAgents: () => USE_REAL_API
    ? request<{ agents: Agent[]; source: string }>("/agents")
    : fake({ agents: mockAgents.map(a => ({ id: a.id, name: a.name, role: a.role, emoji: a.avatar, status: a.status as AgentStatus, accent_color: "#3B82F6", team: null, workspace_path: "", personality_snippet: a.purpose, skills: a.skills.map(s => s.name), tools: [], boundaries: a.responsibilities, cron_count: a.cronJobs.length, openclaw: {} })), source: "mock" }),
  getAgent: (id: string) => USE_REAL_API
    ? request<AgentDetail>(`/agents/${id}`)
    : fake({ id, name: id, role: "Agent", emoji: "🤖", status: "active" as AgentStatus, accent_color: "#3B82F6", team: null, workspace_path: "", personality_snippet: null, tools: [], workspace_files: {}, cron_count: 0, session_count: 0 }),
  getAgentSessions: (id: string) => USE_REAL_API
    ? request<{ sessions: Record<string, unknown>[] }>(`/agents/${id}/sessions`)
    : fake({ sessions: [] }),
  getRelationships: () => USE_REAL_API
    ? request<{ configured: AgentRelationship[]; observed: AgentRelationship[] }>("/agents/relationships")
    : fake({ configured: [], observed: [] }),

  // Crons
  listCrons: () => USE_REAL_API
    ? request<{ crons: CronJob[] }>("/crons")
    : fake({ crons: [] }),
  runCron: (id: string) => USE_REAL_API
    ? request<{ result: unknown }>(`/crons/${id}/run`, { method: "POST" })
    : fake({ result: { ok: true } }),
  toggleCron: (id: string, enabled: boolean) => USE_REAL_API
    ? request<{ result: unknown }>(`/crons/${id}/toggle`, { method: "POST", body: JSON.stringify({ enabled }) })
    : fake({ result: { ok: true } }),

  // Chat
  sendChat: (agentId: string, message: string) => USE_REAL_API
    ? request<{ response: string }>("/chat/send", { method: "POST", body: JSON.stringify({ agent_id: agentId, message }) })
    : fake({ response: `[Mock] ${agentId} received: "${message}". This is a simulated response.`, session_id: "mock-session" }),
  getChatHistory: (sessionId: string) => USE_REAL_API
    ? request<{ messages: unknown[] }>(`/chat/history/${sessionId}`)
    : fake({ messages: [] }),

  // Legacy actions (deprecated — kept for backward compat)
  executeAction: (actionType: string, targetType: string, targetId: string, payload: Record<string, unknown>) => USE_REAL_API
    ? request<{ ok: boolean; action_id: string; result: Record<string, unknown> }>("/actions", { method: "POST", body: JSON.stringify({ action_type: actionType, target_entity_type: targetType, target_entity_id: targetId, payload }) })
    : fake({ ok: true, action_id: "mock-action", result: {} }),
};
