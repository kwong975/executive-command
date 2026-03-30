import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStrategy() {
  return useQuery({
    queryKey: ["strategy"],
    queryFn: () => api.getStrategy(),
    refetchInterval: 60_000,
  });
}

export function useLinkMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, goalId }: { matterId: string; goalId: string }) =>
      api.linkMatterToGoal(matterId, goalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategy"] });
      qc.invalidateQueries({ queryKey: ["matters"] });
    },
  });
}

export function useUnlinkMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matterId: string) => api.unlinkMatterFromGoal(matterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategy"] });
      qc.invalidateQueries({ queryKey: ["matters"] });
    },
  });
}

export function useRunSeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.runStrategySeed(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategy"] }),
  });
}

export function useArchiveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, buCode, reason }: { goalId: string; buCode: string; reason: string }) =>
      api.archiveGoal(goalId, buCode, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategy"] }),
  });
}

export function useAddBUGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bu_code: string; title?: string; timeframe?: string; owner?: string; parent_goal_id?: string; success_metric?: string; target?: string }) =>
      api.addBUGoal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategy"] }),
  });
}

export function useAddDeptGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bu_code: string; department_code: string; department_name: string; title?: string; timeframe?: string; owner?: string; parent_goal_id?: string }) =>
      api.addDeptGoal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategy"] }),
  });
}
