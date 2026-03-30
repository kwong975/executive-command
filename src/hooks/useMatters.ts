/**
 * React hooks for the Matters surface.
 * All data comes from CE via CC backend — no direct mock data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Matters list — ranked by attention score. Polls every 30s. */
export function useMatters(top = 50) {
  return useQuery({
    queryKey: ["matters", top],
    queryFn: () => api.listMatters(top),
    refetchInterval: 30_000,
  });
}

/** Full matter detail. Enabled only when matterId is provided. */
export function useMatterDetail(matterId: string | null) {
  return useQuery({
    queryKey: ["matter-detail", matterId],
    queryFn: () => api.getMatter(matterId!),
    enabled: !!matterId,
  });
}

/** Unassigned threads. Polls every 30s. */
export function useUnassignedThreads() {
  return useQuery({
    queryKey: ["unassigned-threads"],
    queryFn: () => api.listUnassigned(),
    refetchInterval: 30_000,
  });
}

/** Create a new matter. */
export function useCreateMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; matter_type?: string; goal_id?: string }) =>
      api.createMatter(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matters"] }),
  });
}

/** Update matter fields. */
export function useUpdateMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, ...fields }: { matterId: string; canonical_title?: string; routing_owner?: string; priority?: number }) =>
      api.patchMatter(matterId, fields),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["matters"] });
      qc.invalidateQueries({ queryKey: ["matter-detail", vars.matterId] });
    },
  });
}

/** Archive a matter. */
export function useArchiveMatter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matterId: string) => api.archiveMatter(matterId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matters"] }),
  });
}

/** Assign thread to matter. */
export function useAssignThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, matterId }: { threadId: string; matterId: string }) =>
      api.assignThread(threadId, matterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matters"] });
      qc.invalidateQueries({ queryKey: ["unassigned-threads"] });
      qc.invalidateQueries({ queryKey: ["matter-detail"] });
    },
  });
}

/** Update commitment status. */
export function useUpdateCommitmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commitmentId, status, reason }: { commitmentId: string; status: string; reason?: string }) =>
      api.updateCommitmentStatus(commitmentId, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matters"] });
      qc.invalidateQueries({ queryKey: ["matter-detail"] });
    },
  });
}

/** Update commitment fields. */
export function useUpdateCommitment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commitmentId, ...fields }: { commitmentId: string; owner_person_key?: string; due_at?: string; title?: string }) =>
      api.updateCommitment(commitmentId, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matters"] });
      qc.invalidateQueries({ queryKey: ["matter-detail"] });
    },
  });
}

/** Set/update person role on matter. */
export function useSetPersonRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, personKey, role }: { matterId: string; personKey: string; role: string }) =>
      api.setPersonRole(matterId, personKey, role),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["matter-detail", vars.matterId] });
    },
  });
}
