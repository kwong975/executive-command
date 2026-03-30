import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Adaptive poll interval: 10s on success, 60s on error. */
const adaptiveInterval = (query: { state: { error: unknown } }) =>
  query.state.error ? 60_000 : 10_000;

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: () => api.status(),
    refetchInterval: adaptiveInterval,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.health(),
    refetchInterval: adaptiveInterval,
  });
}
