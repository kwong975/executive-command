/**
 * Adapts real CC agent/cron API data → Lovable Agent type.
 */

import type { Agent, Skill, CronJob, ActivityEntry } from "@/data/mockData";

/** Adapt a real agent from /api/agents → Lovable Agent type. */
export function adaptAgent(
  a: Record<string, unknown>,
  crons: Record<string, unknown>[],
): Agent {
  const agentId = (a.id as string) || (a.name as string) || "";
  const agentName = (a.name as string) || agentId;

  // Filter crons belonging to this agent
  const agentCrons = crons.filter(c =>
    (c.agentId as string) === agentId ||
    (c.sessionTarget as string)?.toLowerCase() === agentName.toLowerCase()
  );

  // Build skills from agent's skills/tools arrays
  const skillNames = (a.skills as string[]) || (a.tools as string[]) || [];
  const skills: Skill[] = skillNames.map((name, i) => ({
    id: `${agentId}-skill-${i}`,
    name,
    status: "active" as const,
    description: "",
    lastRun: "",
    lastOutcome: "success" as const,
    runs: 0,
  }));

  // Build cron jobs
  const cronJobs: CronJob[] = agentCrons.map(c => {
    const state = c.state as Record<string, unknown> | undefined;
    const health = c.health as string | undefined;
    const lastStatus = state?.lastStatus as string || "";
    const lastRunAt = state?.lastRunAt as string || state?.lastRun as string || "";
    const nextRunAt = state?.nextRunAt as string || "";

    let status: CronJob["status"] = "ok";
    if (health === "failed" || lastStatus === "failed" || lastStatus === "error") status = "failed";
    else if (!(c.enabled as boolean)) status = "paused";

    return {
      name: (c.name as string) || (c.id as string) || "",
      schedule: (c.schedule as string) || "",
      lastRun: lastRunAt ? formatTime(lastRunAt) : "never",
      status,
      skillId: "",
      nextRun: nextRunAt ? formatTime(nextRunAt) : undefined,
    };
  });

  // Derive signals
  const failedLast24h = cronJobs.filter(j => j.status === "failed").length;
  const stalledWork = 0; // would need matters data — skip for now

  // Build responsibilities from agent's boundaries or role
  const boundaries = (a.boundaries as string[]) || [];
  const responsibilities = boundaries.length > 0 ? boundaries : [(a.role as string) || ""];

  // Personality as purpose
  const purpose = (a.personality_snippet as string) || (a.role as string) || "";

  const statusRaw = (a.status as string) || "unknown";
  const status: Agent["status"] = statusRaw === "active" ? "active" : statusRaw === "error" ? "error" : "idle";

  return {
    id: agentId,
    name: agentName,
    role: (a.role as string) || "",
    purpose,
    status,
    avatar: (a.emoji as string) || agentName.charAt(0).toUpperCase(),
    currentTask: "",
    workingOn: [],
    skills,
    cronJobs,
    activity: [],
    responsibilities,
    failedLast24h,
    stalledWork,
  };
}

function formatTime(ts: string): string {
  if (!ts) return "";
  try {
    // Handle both ISO and ms-since-epoch
    const d = typeof ts === "number" || /^\d+$/.test(ts) ? new Date(Number(ts)) : new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 1) return `${Math.round(diffH * 60)}m ago`;
    if (diffH < 24) return `${Math.round(diffH)}h ago`;
    return `${Math.round(diffH / 24)}d ago`;
  } catch {
    return ts;
  }
}
