/**
 * React hooks for the Agents surface — live data from CC backend.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adaptAgent } from "@/lib/agents-adapter";
import type { Agent } from "@/data/mockData";

/** All agents with cron data merged in. Polls every 15s. */
export function useAgentsLive() {
  const agentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.listAgents(),
    refetchInterval: 15_000,
  });

  const cronsQuery = useQuery({
    queryKey: ["crons"],
    queryFn: () => api.listCrons(),
    refetchInterval: 15_000,
  });

  const agents: Agent[] = (agentsQuery.data?.agents || []).map(a =>
    adaptAgent(a as unknown as Record<string, unknown>, (cronsQuery.data?.crons || []) as unknown as Record<string, unknown>[])
  );

  return {
    agents,
    isLoading: agentsQuery.isLoading || cronsQuery.isLoading,
    error: agentsQuery.error || cronsQuery.error,
  };
}

/** Run a cron job manually. */
export function useRunCron() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cronId: string) => api.runCron(cronId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crons"] }),
  });
}

/** Toggle a cron job enabled/disabled. */
export function useToggleCron() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cronId, enabled }: { cronId: string; enabled: boolean }) =>
      api.toggleCron(cronId, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crons"] }),
  });
}

/** Send a chat message to an agent. */
export function useSendChat() {
  return useMutation({
    mutationFn: ({ agentId, message }: { agentId: string; message: string }) =>
      api.sendChat(agentId, message),
  });
}
