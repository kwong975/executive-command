/**
 * React hook for the Today surface.
 * Single endpoint returns all sections in one call.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useToday() {
  return useQuery({
    queryKey: ["today"],
    queryFn: () => api.getToday(),
    refetchInterval: 30_000,
  });
}
