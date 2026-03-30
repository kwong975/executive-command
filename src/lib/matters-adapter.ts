/**
 * Adapts CE matter data shapes to the frontend types expected by MattersPage.
 *
 * CE returns sqlite Row dicts. The frontend expects the types from mockData.ts.
 * This adapter bridges them without coupling either side.
 */

import type { Matter, Thread, Commitment, Artifact, Person } from "@/data/mockData";

/** Map CE health_state/execution_state → frontend status */
function deriveMatterStatus(m: Record<string, unknown>): Matter["status"] {
  const health = m.health_state as string | undefined;
  const status = m.status as string;
  if (status === "resolved" || status === "archived") return "stale";
  if (health === "blocked") return "blocked";
  if (health === "at_risk" || health === "overloaded") return "at-risk";
  if (health === "drifting") return "stale";
  return "healthy";
}

function adaptThread(t: Record<string, unknown>): Thread {
  const state = t.state as string;
  return {
    id: t.id as string,
    title: t.title as string,
    source: (t.thread_type as string) || "meeting",
    timestamp: (t.last_activity_at as string) || (t.created_at as string) || "",
    summary: (t.title as string) || "",
    status: state === "active" ? "open" : state === "closed" ? "resolved" : "pending",
    matterId: t.matter_id as string | undefined,
    age: t.last_activity_at as string | undefined,
  };
}

function adaptArtifact(a: Record<string, unknown>): Artifact {
  const sourceType = a.source_type as string;
  return {
    id: a.id as string,
    title: (a.title as string) || (a.source_ref as string) || "Untitled",
    source: (sourceType === "email" ? "email" : sourceType === "meeting" ? "meeting" : "document") as Artifact["source"],
    timestamp: (a.artifact_at as string) || "",
    matterId: "",
  };
}

function adaptPerson(p: Record<string, unknown>): Person {
  const role = p.role as string;
  const key = (p.person_key as string) || "";
  const displayName = (p.display_name as string) || humanizeKey(key);
  return {
    id: key,
    name: displayName,
    role: role === "accountable" ? "owner" : role === "executor" ? "participant" : "stakeholder",
    matterId: (p.matter_id as string) || "",
  };
}

function humanizeKey(key: string): string {
  if (!key) return "Unknown";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function adaptCommitment(c: Record<string, unknown>): Commitment {
  const status = c.status as string;
  const statusMap: Record<string, Commitment["status"]> = {
    open: "on-track",
    overdue: "overdue",
    done: "done",
    done_pending_verify: "done",
    waiting: "blocked",
    dropped: "done",
    candidate: "on-track",
  };
  const ownerKey = (c.owner_person_key as string) || "unassigned";
  const ownerDisplay = (c.owner_display_name as string) || humanizeKey(ownerKey);
  return {
    id: c.id as string,
    title: c.title as string,
    owner: ownerDisplay,
    dueDate: (c.due_at as string) || "",
    status: statusMap[status] || "on-track",
    matterId: "",
  };
}

/** Adapt a CE matter list item → frontend Matter (without nested detail). */
export function adaptMatterListItem(m: Record<string, unknown>): Matter {
  const overdueCount = (m.overdue_commitments as number) || (m.overdue_count as number) || 0;
  const openCount = (m.open_commitments as number) || 0;
  return {
    id: m.id as string,
    title: (m.canonical_title as string) || "",
    status: deriveMatterStatus(m),
    owner: humanizeKey((m.routing_owner as string) || "unassigned"),
    ownerAgentId: "",
    description: "",
    businessUnit: (m.bu as string) || "",
    goalIds: m.goal_id ? [m.goal_id as string] : [],
    threads: [],
    commitments: [],
    artifacts: [],
    people: [],
    lastActivity: (m.last_activity_at as string) || "",
    overdueCount,
  };
}

/** Adapt a CE matter detail → frontend Matter (with nested detail). */
export function adaptMatterDetail(d: Record<string, unknown>): Matter {
  const base = adaptMatterListItem(d);
  const threads = (d.threads as Record<string, unknown>[]) || [];
  const commitments = (d.commitments as Record<string, unknown>[]) || [];
  const artifacts = (d.artifacts as Record<string, unknown>[]) || [];
  const persons = (d.persons as Record<string, unknown>[]) || [];

  return {
    ...base,
    description: (d.description as string) || "",
    threads: threads.map(adaptThread),
    commitments: commitments.map(adaptCommitment),
    artifacts: artifacts.map(adaptArtifact),
    people: persons.map(adaptPerson),
  };
}

/** Adapt CE unassigned threads → frontend Thread[]. */
export function adaptUnassignedThread(t: Record<string, unknown>): Thread {
  return {
    id: t.id as string,
    title: t.title as string,
    source: (t.thread_type as string) || "meeting",
    timestamp: (t.last_activity_at as string) || (t.created_at as string) || "",
    summary: (t.title as string) || "",
    status: "open",
    age: t.last_activity_at as string | undefined,
  };
}
