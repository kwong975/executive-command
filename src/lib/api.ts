/**
 * API client for Agent Command.
 *
 * DEFAULT: fake data mode (works in Lovable, preview, offline).
 * OPT-IN: real backend via VITE_USE_REAL_API=true.
 * FALLBACK: if real API fails, returns fake data instead of erroring.
 */

import {
  fakeToday, fakeStrategy, fakeMatters, fakeMatterDetail, fakeUnassigned,
  fakeHealth, fakeStatus,
} from "./fake-data";
import { agents as mockAgents } from "@/data/mockData";

/** True only when explicitly opted into real API AND it's available. */
export const IS_MOCK_MODE = !(
  typeof import.meta !== "undefined" &&
  import.meta.env?.VITE_USE_REAL_API === "true"
);

const BASE_URL = "/api";

/** Make a real API request. Returns null on failure (for fallback). */
async function tryRequest<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fake delay to simulate network latency. */
const fake = <T>(data: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(structuredClone(data) as T), ms));

/**
 * Try real API first (if enabled), fall back to fake data on failure.
 * In mock mode, skip the real API entirely.
 */
function withFallback<T>(realPath: string, fakeData: T, options?: RequestInit): Promise<T> {
  if (IS_MOCK_MODE) return fake(fakeData);
  return tryRequest<T>(realPath, options).then(result => result ?? structuredClone(fakeData) as T);
}

function withFallbackMutation<T>(realPath: string, fakeData: T, options?: RequestInit): Promise<T> {
  if (IS_MOCK_MODE) return fake(fakeData);
  return tryRequest<T>(realPath, options).then(result => result ?? structuredClone(fakeData) as T);
}

// ── Types ──

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

// ── Fake agent data from mockData ──
const fakeAgentList = {
  agents: mockAgents.map(a => ({
    id: a.id, name: a.name, role: a.role, emoji: a.avatar,
    status: a.status as AgentStatus, accent_color: "#3B82F6", team: null,
    workspace_path: "", personality_snippet: a.purpose,
    skills: a.skills.map(s => s.name), tools: [], boundaries: a.responsibilities,
    cron_count: a.cronJobs.length, openclaw: {},
  })),
  source: "mock",
};

// ── API client ──

export const api = {
  // Health
  health: () => withFallback("/health", fakeHealth),
  status: () => withFallback("/status", fakeStatus),

  // Today
  getToday: () => withFallback("/today", fakeToday),

  // Strategy
  getStrategy: () => withFallback("/strategy", fakeStrategy),
  linkMatterToGoal: (matterId: string, goalId: string) =>
    withFallbackMutation(`/strategy/link?matter_id=${matterId}&goal_id=${goalId}`, { ok: true }, { method: "POST" }),
  unlinkMatterFromGoal: (matterId: string) =>
    withFallbackMutation(`/strategy/unlink?matter_id=${matterId}`, { ok: true }, { method: "POST" }),
  runStrategySeed: () =>
    withFallbackMutation("/strategy/lifecycle/seed", { ok: true, created: 0, updated: 36 }, { method: "POST" }),
  archiveGoal: (goalId: string, buCode: string, reason: string) =>
    withFallbackMutation("/strategy/lifecycle/archive-goal", { ok: true, goal_id: goalId, new_status: reason }, { method: "POST", body: JSON.stringify({ goal_id: goalId, bu_code: buCode, reason }) }),
  addBUGoal: (data: Record<string, unknown>) =>
    withFallbackMutation("/strategy/lifecycle/add-bu-goal", { ok: true, goal_id: "new-goal" }, { method: "POST", body: JSON.stringify(data) }),
  addDeptGoal: (data: Record<string, unknown>) =>
    withFallbackMutation("/strategy/lifecycle/add-dept-goal", { ok: true, goal_id: "new-dept-goal" }, { method: "POST", body: JSON.stringify(data) }),
  getStrategySource: (buCode: string) =>
    withFallback(`/strategy/lifecycle/source/${buCode}`, { path: `05-strategy/${buCode.toLowerCase()}.md`, version: 2, effective_date: "2026-04-01" }),

  // Matters
  listMatters: (top = 50) => withFallback(`/matters?top=${top}`, fakeMatters),
  getMatter: (matterId: string) => withFallback(`/matters/${matterId}`, fakeMatterDetail),
  listUnassigned: () => withFallback("/matters/unassigned", fakeUnassigned),
  createMatter: (data: Record<string, unknown>) =>
    withFallbackMutation("/matters", { ok: true, matter_id: "new-matter" }, { method: "POST", body: JSON.stringify(data) }),
  patchMatter: (matterId: string, fields: Record<string, unknown>) =>
    withFallbackMutation(`/matters/${matterId}`, { ok: true }, { method: "PATCH", body: JSON.stringify(fields) }),
  archiveMatter: (matterId: string) =>
    withFallbackMutation(`/matters/${matterId}/archive`, { ok: true }, { method: "POST" }),
  assignThread: (threadId: string, matterId: string) =>
    withFallbackMutation(`/matters/threads/${threadId}/assign`, { ok: true }, { method: "POST", body: JSON.stringify({ matter_id: matterId }) }),
  reassignThread: (threadId: string, newMatterId: string) =>
    withFallbackMutation(`/matters/threads/${threadId}/reassign`, { ok: true }, { method: "POST", body: JSON.stringify({ new_matter_id: newMatterId }) }),
  closeThread: (threadId: string, reason = "operator_closed") =>
    withFallbackMutation(`/matters/threads/${threadId}/close`, { ok: true }, { method: "POST", body: JSON.stringify({ reason }) }),
  updateCommitmentStatus: (commitmentId: string, status: string, reason?: string) =>
    withFallbackMutation(`/matters/commitments/${commitmentId}/status`, { ok: true }, { method: "PATCH", body: JSON.stringify({ status, reason }) }),
  updateCommitment: (commitmentId: string, fields: Record<string, unknown>) =>
    withFallbackMutation(`/matters/commitments/${commitmentId}`, { ok: true }, { method: "PATCH", body: JSON.stringify(fields) }),
  setPersonRole: (matterId: string, personKey: string, role: string) =>
    withFallbackMutation(`/matters/${matterId}/people`, { ok: true }, { method: "POST", body: JSON.stringify({ person_key: personKey, role }) }),

  // Agents
  listAgents: () => withFallback("/agents", fakeAgentList),
  getAgent: (id: string) => withFallback(`/agents/${id}`, {
    id, name: id, role: "Agent", emoji: "🤖", status: "active" as AgentStatus,
    accent_color: "#3B82F6", team: null, workspace_path: "",
    personality_snippet: null, tools: [], workspace_files: {}, cron_count: 0, session_count: 0,
  }),
  getAgentSessions: (id: string) => withFallback(`/agents/${id}/sessions`, { sessions: [] }),
  getRelationships: () => withFallback("/agents/relationships", { configured: [], observed: [] }),

  // Crons
  listCrons: () => withFallback("/crons", { crons: [] }),
  runCron: (id: string) => withFallbackMutation(`/crons/${id}/run`, { result: { ok: true } }, { method: "POST" }),
  toggleCron: (id: string, enabled: boolean) =>
    withFallbackMutation(`/crons/${id}/toggle`, { result: { ok: true } }, { method: "POST", body: JSON.stringify({ enabled }) }),

  // Chat
  sendChat: (agentId: string, message: string) =>
    withFallbackMutation("/chat/send", { response: `[Preview] ${agentId}: "${message}" — mock response`, session_id: "mock" }, { method: "POST", body: JSON.stringify({ agent_id: agentId, message }) }),
  getChatHistory: (sessionId: string) => withFallback(`/chat/history/${sessionId}`, { messages: [] }),

  // Legacy
  executeAction: (actionType: string, targetType: string, targetId: string, payload: Record<string, unknown>) =>
    withFallbackMutation("/actions", { ok: true, action_id: "mock", result: {} }, { method: "POST", body: JSON.stringify({ action_type: actionType, target_entity_type: targetType, target_entity_id: targetId, payload }) }),
};
