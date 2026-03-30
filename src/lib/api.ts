/**
 * API client for Command Centre backend.
 *
 * Core endpoints: agent management, cron management, chat, actions, health.
 * Prototype endpoints (resolution, workbench, intelligence, etc.) archived — see _archive/command-centre/.
 */

const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Types ──

export type AgentStatus = "active" | "quiet" | "idle" | "degraded" | "unknown";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  accent_color: string;
  team: string | null;
  workspace_path: string;
}

export interface AgentDetail extends Agent {
  personality_snippet: string | null;
  tools: string[];
  workspace_files: Record<string, string>;
  cron_count: number;
  session_count: number;
}

export interface AgentRelationship {
  from_agent: string;
  to_agent: string;
  relationship: string;
  evidence_type: "observed" | "configured";
  strength: number;
}

export interface CronJob {
  id: string;
  name: string;
  agent: string;
  schedule: string;
  enabled: boolean;
  status: "success" | "degraded" | "failed" | "never_run";
  lastRun: string | null;
  nextRun: string | null;
  reliability: string;
  isCritical: boolean;
}

// ── API client ──

export const api = {
  // Health — minimal signal
  health: () => request<{ status: string; gateway_connected: boolean }>("/health"),
  status: () =>
    request<{
      gateway: string;
      agents: { id: string; status: string }[];
      crons: { total: number; enabled: number; failed: number };
    }>("/status"),

  // Agents
  listAgents: () =>
    request<{ agents: Agent[]; source: string; warning?: string }>("/agents"),
  getAgent: (id: string) => request<AgentDetail>(`/agents/${id}`),
  getAgentSessions: (id: string) =>
    request<{ sessions: Record<string, unknown>[]; warning?: string }>(
      `/agents/${id}/sessions`
    ),
  getRelationships: () =>
    request<{
      configured: AgentRelationship[];
      observed: AgentRelationship[];
    }>("/agents/relationships"),

  // Crons
  listCrons: () =>
    request<{ crons: CronJob[]; source?: string; warning?: string }>("/crons"),
  runCron: (id: string) =>
    request<{ result: unknown }>(`/crons/${id}/run`, { method: "POST" }),
  toggleCron: (id: string, enabled: boolean) =>
    request<{ result: unknown }>(`/crons/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  // Chat
  sendChat: (agentId: string, message: string) =>
    request<{ response: string; session_id?: string; raw?: unknown }>("/chat/send", {
      method: "POST",
      body: JSON.stringify({ agent_id: agentId, message }),
    }),
  getChatHistory: (sessionId: string) =>
    request<{ messages: unknown[] }>(`/chat/history/${sessionId}`),

  // Today (CE-backed aggregation)
  getToday: () => request<Record<string, unknown>>("/today"),

  // Strategy (CE-backed goal hierarchy)
  getStrategy: () => request<Record<string, unknown>>("/strategy"),
  linkMatterToGoal: (matterId: string, goalId: string) =>
    request<{ ok: boolean }>(`/strategy/link?matter_id=${matterId}&goal_id=${goalId}`, { method: "POST" }),
  unlinkMatterFromGoal: (matterId: string) =>
    request<{ ok: boolean }>(`/strategy/unlink?matter_id=${matterId}`, { method: "POST" }),

  // Strategy lifecycle
  runStrategySeed: () =>
    request<Record<string, unknown>>("/strategy/lifecycle/seed", { method: "POST" }),
  archiveGoal: (goalId: string, buCode: string, reason: string) =>
    request<Record<string, unknown>>("/strategy/lifecycle/archive-goal", {
      method: "POST", body: JSON.stringify({ goal_id: goalId, bu_code: buCode, reason }),
    }),
  addBUGoal: (data: { bu_code: string; title?: string; timeframe?: string; owner?: string; parent_goal_id?: string; success_metric?: string; target?: string }) =>
    request<Record<string, unknown>>("/strategy/lifecycle/add-bu-goal", {
      method: "POST", body: JSON.stringify(data),
    }),
  addDeptGoal: (data: { bu_code: string; department_code: string; department_name: string; title?: string; timeframe?: string; owner?: string; parent_goal_id?: string }) =>
    request<Record<string, unknown>>("/strategy/lifecycle/add-dept-goal", {
      method: "POST", body: JSON.stringify(data),
    }),
  getStrategySource: (buCode: string) =>
    request<Record<string, unknown>>(`/strategy/lifecycle/source/${buCode}`),

  // Matters (CE-backed)
  listMatters: (top = 50) =>
    request<{ matters: Record<string, unknown>[]; count: number }>(`/matters?top=${top}`),
  getMatter: (matterId: string) =>
    request<Record<string, unknown>>(`/matters/${matterId}`),
  listUnassigned: () =>
    request<{ threads: Record<string, unknown>[]; count: number }>("/matters/unassigned"),
  createMatter: (data: { title: string; matter_type?: string; goal_id?: string }) =>
    request<{ ok: boolean; matter_id: string }>("/matters", {
      method: "POST", body: JSON.stringify(data),
    }),
  patchMatter: (matterId: string, fields: Record<string, unknown>) =>
    request<{ ok: boolean }>(`/matters/${matterId}`, {
      method: "PATCH", body: JSON.stringify(fields),
    }),
  archiveMatter: (matterId: string) =>
    request<{ ok: boolean }>(`/matters/${matterId}/archive`, { method: "POST" }),
  assignThread: (threadId: string, matterId: string) =>
    request<{ ok: boolean }>(`/matters/threads/${threadId}/assign`, {
      method: "POST", body: JSON.stringify({ matter_id: matterId }),
    }),
  reassignThread: (threadId: string, newMatterId: string) =>
    request<{ ok: boolean }>(`/matters/threads/${threadId}/reassign`, {
      method: "POST", body: JSON.stringify({ new_matter_id: newMatterId }),
    }),
  closeThread: (threadId: string, reason = "operator_closed") =>
    request<{ ok: boolean }>(`/matters/threads/${threadId}/close`, {
      method: "POST", body: JSON.stringify({ reason }),
    }),
  updateCommitmentStatus: (commitmentId: string, status: string, reason?: string) =>
    request<{ ok: boolean }>(`/matters/commitments/${commitmentId}/status`, {
      method: "PATCH", body: JSON.stringify({ status, reason }),
    }),
  updateCommitment: (commitmentId: string, fields: Record<string, unknown>) =>
    request<{ ok: boolean }>(`/matters/commitments/${commitmentId}`, {
      method: "PATCH", body: JSON.stringify(fields),
    }),
  setPersonRole: (matterId: string, personKey: string, role: string) =>
    request<{ ok: boolean }>(`/matters/${matterId}/people`, {
      method: "POST", body: JSON.stringify({ person_key: personKey, role }),
    }),

  // Actions (legacy — deprecated for new work, use CE-backed /matters/* instead)
  executeAction: (actionType: string, targetType: string, targetId: string, payload: Record<string, unknown>) =>
    request<{ ok: boolean; action_id: string; result: Record<string, unknown> }>("/actions", {
      method: "POST",
      body: JSON.stringify({ action_type: actionType, target_entity_type: targetType, target_entity_id: targetId, payload }),
    }),
};
