/**
 * Centralized status/state mappings for the design system.
 *
 * Every status concept in the product maps to a visual treatment here.
 * Components consume these mappings — they never hardcode colors or icons.
 */

// ── Matter lifecycle ──

export type MatterStatus = "active" | "resolved" | "archived";

export const matterStatusLabel: Record<MatterStatus, string> = {
  active: "Active",
  resolved: "Resolved",
  archived: "Archived",
};

// ── Matter execution state (derived, not stored) ──

export type ExecutionState = "new" | "progressing" | "stalled" | "blocked" | "drifting";

export const executionStateConfig: Record<ExecutionState, { label: string; color: string; bg: string }> = {
  new:         { label: "New",         color: "text-muted-foreground", bg: "bg-muted" },
  progressing: { label: "Progressing", color: "text-success",         bg: "bg-success/10" },
  stalled:     { label: "Stalled",     color: "text-warning",         bg: "bg-warning/10" },
  blocked:     { label: "Blocked",     color: "text-critical",        bg: "bg-critical/10" },
  drifting:    { label: "Drifting",    color: "text-warning",         bg: "bg-warning/10" },
};

// ── Matter health state ──

export type HealthState = "healthy" | "at_risk" | "blocked" | "overloaded" | "drifting" | "completed";

export const healthStateConfig: Record<HealthState, { label: string; color: string; bg: string }> = {
  healthy:    { label: "Healthy",    color: "text-success",          bg: "bg-success/10" },
  at_risk:    { label: "At Risk",    color: "text-warning",          bg: "bg-warning/10" },
  blocked:    { label: "Blocked",    color: "text-critical",         bg: "bg-critical/10" },
  overloaded: { label: "Overloaded", color: "text-warning",          bg: "bg-warning/10" },
  drifting:   { label: "Drifting",   color: "text-warning",          bg: "bg-warning/10" },
  completed:  { label: "Completed",  color: "text-muted-foreground", bg: "bg-muted" },
};

// ── Commitment status ──

export type CommitmentStatus = "open" | "overdue" | "done" | "done_pending_verify" | "waiting" | "dropped" | "candidate";

export const commitmentStatusConfig: Record<CommitmentStatus, { label: string; color: string; bg: string; dot: string }> = {
  open:                { label: "Open",     color: "text-info",             bg: "bg-info/10",     dot: "bg-info" },
  overdue:             { label: "Overdue",  color: "text-critical",         bg: "bg-critical/10", dot: "bg-critical" },
  done:                { label: "Done",     color: "text-success",          bg: "bg-success/10",  dot: "bg-success" },
  done_pending_verify: { label: "Verifying", color: "text-success",         bg: "bg-success/10",  dot: "bg-success" },
  waiting:             { label: "Waiting",  color: "text-muted-foreground", bg: "bg-muted",       dot: "bg-muted-foreground" },
  dropped:             { label: "Dropped",  color: "text-muted-foreground", bg: "bg-muted",       dot: "bg-muted-foreground" },
  candidate:           { label: "Candidate", color: "text-muted-foreground", bg: "bg-muted",      dot: "bg-muted-foreground" },
};

// ── Commitment ownership type ──

export type OwnershipType = "ceo_owned" | "delegated" | "waiting_on";

export const ownershipTypeConfig: Record<OwnershipType, { label: string; description: string }> = {
  ceo_owned:  { label: "My Action",   description: "You need to do this" },
  delegated:  { label: "Delegated",   description: "Someone else is doing it, you're tracking" },
  waiting_on: { label: "Waiting On",  description: "You're blocked pending someone else" },
};

// ── Thread state ──

export type ThreadState = "active" | "stale" | "closed" | "merged";

export const threadStateConfig: Record<ThreadState, { label: string; color: string }> = {
  active: { label: "Active", color: "text-success" },
  stale:  { label: "Stale",  color: "text-warning" },
  closed: { label: "Closed", color: "text-muted-foreground" },
  merged: { label: "Merged", color: "text-muted-foreground" },
};

// ── Agent status ──

export type AgentStatus = "active" | "quiet" | "idle" | "degraded" | "unknown";

export const agentStatusConfig: Record<AgentStatus, { label: string; color: string; dot: string }> = {
  active:   { label: "Active",   color: "text-success",          dot: "bg-success" },
  quiet:    { label: "Quiet",    color: "text-muted-foreground", dot: "bg-muted-foreground" },
  idle:     { label: "Idle",     color: "text-muted-foreground", dot: "bg-muted-foreground" },
  degraded: { label: "Degraded", color: "text-warning",          dot: "bg-warning" },
  unknown:  { label: "Unknown",  color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

// ── Cron health ──

export type CronHealth = "success" | "degraded" | "failed" | "never_run";

export const cronHealthConfig: Record<CronHealth, { label: string; color: string; dot: string }> = {
  success:   { label: "Healthy",   color: "text-success",          dot: "bg-success" },
  degraded:  { label: "Degraded",  color: "text-warning",          dot: "bg-warning" },
  failed:    { label: "Failed",    color: "text-critical",         dot: "bg-critical" },
  never_run: { label: "Never Run", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

// ── System confidence (minimal health signal) ──

export type SystemConfidence = "connected" | "degraded" | "disconnected" | "unknown";

export const systemConfidenceConfig: Record<SystemConfidence, { label: string; dot: string }> = {
  connected:    { label: "Connected",    dot: "bg-success" },
  degraded:     { label: "Degraded",     dot: "bg-warning" },
  disconnected: { label: "Disconnected", dot: "bg-critical" },
  unknown:      { label: "Checking...",  dot: "bg-muted-foreground" },
};
