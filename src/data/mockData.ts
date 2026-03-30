// ===== TYPES =====

export interface Skill {
  id: string;
  name: string;
  status: "active" | "degraded" | "disabled";
  description: string;
  lastRun: string;
  lastOutcome: "success" | "failure";
  runs: number;
}

export interface CronJob {
  name: string;
  schedule: string;
  lastRun: string;
  status: "ok" | "failed" | "paused";
  skillId: string;
  nextRun?: string;
  history?: { time: string; ok: boolean }[];
}

export interface ActivityEntry {
  id: string;
  time: string;
  action: string;
  outcome: "success" | "failure" | "pending";
  detail?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  purpose: string;
  status: "active" | "idle" | "error";
  avatar: string;
  currentTask: string;
  workingOn: string[];
  skills: Skill[];
  cronJobs: CronJob[];
  activity: ActivityEntry[];
  responsibilities: string[];
}

export interface Thread {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  matterId?: string;
  agentId?: string;
  summary: string;
  status: "open" | "resolved" | "pending";
}

export interface Commitment {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "on-track" | "overdue" | "done" | "blocked" | "at-risk";
  matterId: string;
}

export interface Matter {
  id: string;
  title: string;
  status: "healthy" | "blocked" | "at-risk" | "stale";
  owner: string;
  ownerAgentId: string;
  description: string;
  businessUnit: string;
  goalIds: string[];
  threads: Thread[];
  commitments: Commitment[];
  lastActivity: string;
}

export interface Goal {
  id: string;
  title: string;
  type: "long-term" | "annual";
  businessUnit: string;
  progress: number;
  linkedMatterIds: string[];
}

export interface DecisionItem {
  id: string;
  title: string;
  context: string;
  urgency: "critical" | "important" | "normal";
  source: string;
  agentId: string;
}

// ===== AGENTS =====

export const agents: Agent[] = [
  {
    id: "a1",
    name: "Atlas",
    role: "Chief of Staff",
    purpose: "Orchestrate daily operations, prepare briefings, align execution to strategy.",
    status: "active",
    avatar: "AT",
    currentTask: "Preparing morning briefing",
    workingOn: [
      "Morning briefing for leadership",
      "3 matters blocked — awaiting assignment",
      "Coordinating Syssie on ingestion delay",
    ],
    skills: [
      { id: "s1", name: "meeting_prep", status: "active", description: "Prepares meeting agendas from active matters.", lastRun: "35m ago", lastOutcome: "success", runs: 284 },
      { id: "s2", name: "daily_briefing", status: "active", description: "Daily summary of decisions, blockers, agent status.", lastRun: "1h ago", lastOutcome: "success", runs: 127 },
      { id: "s3", name: "resolve_commitments", status: "degraded", description: "Checks deadlines, escalates overdue items.", lastRun: "3h ago", lastOutcome: "failure", runs: 89 },
      { id: "s4", name: "strategy_alignment", status: "active", description: "Maps matters to goals, flags misalignment.", lastRun: "6h ago", lastOutcome: "success", runs: 42 },
      { id: "s5", name: "thread_triage", status: "active", description: "Classifies incoming threads, assigns to matters/agents.", lastRun: "20m ago", lastOutcome: "success", runs: 512 },
    ],
    cronJobs: [
      { name: "Morning Briefing", schedule: "0 6 * * *", lastRun: "1h ago", status: "ok", skillId: "s2", nextRun: "Tomorrow 06:00", history: [{ time: "Today 06:00", ok: true }, { time: "Yesterday 06:00", ok: true }] },
      { name: "Meeting Prep", schedule: "*/5 * * * *", lastRun: "3m ago", status: "ok", skillId: "s1", nextRun: "2m" },
      { name: "Commitment Check", schedule: "0 */2 * * *", lastRun: "45m ago", status: "failed", skillId: "s3", nextRun: "1h 15m", history: [{ time: "45m ago", ok: false }, { time: "2h ago", ok: true }] },
      { name: "Evening Close", schedule: "0 18 * * *", lastRun: "Yesterday 18:00", status: "ok", skillId: "s4", nextRun: "Today 18:00" },
    ],
    activity: [
      { id: "a1-1", time: "06:00", action: "Generated morning briefing", outcome: "success" },
      { id: "a1-2", time: "05:58", action: "Triaged 4 incoming threads", outcome: "success", detail: "2→matters, 1→Noor, 1 unassigned" },
      { id: "a1-3", time: "05:50", action: "Commitment lifecycle check", outcome: "failure", detail: "DB timeout" },
      { id: "a1-4", time: "05:45", action: "Meeting prep for 09:00 standup", outcome: "success" },
      { id: "a1-5", time: "05:30", action: "Strategy alignment scan", outcome: "success", detail: "1 matter misaligned" },
    ],
    responsibilities: ["Daily briefings", "Meeting prep", "Commitment tracking", "Thread triage", "Strategy alignment"],
  },
  {
    id: "a2",
    name: "Rigby",
    role: "Engineering Lead",
    purpose: "Ship reliable product features and maintain technical infrastructure.",
    status: "active",
    avatar: "RG",
    currentTask: "Deploying API v2.3 rate limiting",
    workingOn: [
      "API v2.3 rate limiting deploy",
      "Auth migration blocked — needs decision",
      "Perf benchmark investigation",
    ],
    skills: [
      { id: "s6", name: "code_review", status: "active", description: "Automated PR review for style and security.", lastRun: "20m ago", lastOutcome: "success", runs: 1032 },
      { id: "s7", name: "deploy_pipeline", status: "active", description: "CI/CD execution and rollback.", lastRun: "4h ago", lastOutcome: "success", runs: 345 },
      { id: "s8", name: "perf_benchmark", status: "degraded", description: "Runs perf benchmarks on staging.", lastRun: "5h ago", lastOutcome: "failure", runs: 89 },
      { id: "s9", name: "incident_response", status: "active", description: "Production incident detection and triage.", lastRun: "2d ago", lastOutcome: "success", runs: 23 },
    ],
    cronJobs: [
      { name: "Build & Test", schedule: "on push", lastRun: "35m ago", status: "ok", skillId: "s6" },
      { name: "Dep Audit", schedule: "0 0 * * 1", lastRun: "2d ago", status: "ok", skillId: "s7" },
      { name: "Perf Benchmark", schedule: "0 3 * * *", lastRun: "5h ago", status: "failed", skillId: "s8", history: [{ time: "5h ago", ok: false }, { time: "Yesterday", ok: true }] },
    ],
    activity: [
      { id: "a2-1", time: "07:20", action: "Code review PR #482", outcome: "success", detail: "3 comments, approved" },
      { id: "a2-2", time: "06:30", action: "Deployed rate limiting to staging", outcome: "success" },
      { id: "a2-3", time: "03:00", action: "Perf benchmark run", outcome: "failure", detail: "Staging timeout" },
    ],
    responsibilities: ["Feature delivery", "Code quality", "Infrastructure", "Tech debt"],
  },
  {
    id: "a3",
    name: "Syssie",
    role: "System Operator",
    purpose: "Keep all internal systems healthy and coordinate between agents.",
    status: "active",
    avatar: "SY",
    currentTask: "Monitoring ingestion pipeline",
    workingOn: [
      "Ingestion pipeline monitoring",
      "Tracking Noor's Zendesk rate limit",
    ],
    skills: [
      { id: "s10", name: "health_monitor", status: "active", description: "Continuous agent and system endpoint monitoring.", lastRun: "2m ago", lastOutcome: "success", runs: 8420 },
      { id: "s11", name: "agent_coordination", status: "active", description: "Routes work between agents, resolves conflicts.", lastRun: "15m ago", lastOutcome: "success", runs: 1203 },
      { id: "s12", name: "issue_triage", status: "active", description: "Classifies and prioritizes system issues.", lastRun: "1h ago", lastOutcome: "success", runs: 456 },
    ],
    cronJobs: [
      { name: "Agent Health", schedule: "*/5 * * * *", lastRun: "2m ago", status: "ok", skillId: "s10" },
      { name: "Ingestion Check", schedule: "*/15 * * * *", lastRun: "8m ago", status: "ok", skillId: "s10" },
    ],
    activity: [
      { id: "a3-1", time: "07:25", action: "Health check — all nominal", outcome: "success" },
      { id: "a3-2", time: "06:30", action: "Restarted Noor's Zendesk sync", outcome: "success", detail: "Rate limit still active" },
      { id: "a3-3", time: "05:50", action: "Escalated Rigby's perf failure", outcome: "success" },
    ],
    responsibilities: ["System health", "Agent coordination", "Escalation", "Data freshness"],
  },
  {
    id: "a4",
    name: "ThuyTM3",
    role: "Operations Manager",
    purpose: "Manage internal processes, commitment tracking, team coordination.",
    status: "idle",
    avatar: "TM",
    currentTask: "Idle — awaiting assignment",
    workingOn: [],
    skills: [
      { id: "s13", name: "process_mgmt", status: "active", description: "Manages and optimizes operational processes.", lastRun: "3d ago", lastOutcome: "success", runs: 67 },
      { id: "s14", name: "commitment_tracker", status: "active", description: "Tracks commitments, flags overdue items.", lastRun: "45m ago", lastOutcome: "success", runs: 234 },
      { id: "s15", name: "weekly_summary", status: "active", description: "Generates weekly ops summary with blockers.", lastRun: "3d ago", lastOutcome: "success", runs: 18 },
    ],
    cronJobs: [
      { name: "Commitment Sync", schedule: "0 */2 * * *", lastRun: "45m ago", status: "ok", skillId: "s14" },
      { name: "Weekly Summary", schedule: "0 17 * * 5", lastRun: "3d ago", status: "ok", skillId: "s15" },
    ],
    activity: [
      { id: "a4-1", time: "3d ago", action: "Generated weekly ops summary", outcome: "success" },
      { id: "a4-2", time: "4d ago", action: "Flagged 3 overdue commitments", outcome: "success", detail: "Q1 planning" },
    ],
    responsibilities: ["Commitment tracking", "Process optimization", "Coordination", "Reporting"],
  },
  {
    id: "a5",
    name: "Noor",
    role: "Customer Intelligence",
    purpose: "Synthesize customer feedback, surface insights for product direction.",
    status: "error",
    avatar: "NR",
    currentTask: "Blocked — Zendesk API rate limited",
    workingOn: [
      "Zendesk ingestion blocked (rate limited)",
      "Pricing confusion analysis pending data",
    ],
    skills: [
      { id: "s16", name: "sentiment_analysis", status: "active", description: "Analyzes customer feedback for sentiment patterns.", lastRun: "1d ago", lastOutcome: "success", runs: 156 },
      { id: "s17", name: "feedback_synthesis", status: "degraded", description: "Synthesizes feedback into product insights.", lastRun: "2h ago", lastOutcome: "failure", runs: 89 },
      { id: "s18", name: "churn_prediction", status: "active", description: "Predicts churn risk from engagement patterns.", lastRun: "1d ago", lastOutcome: "success", runs: 34 },
      { id: "s19", name: "zendesk_sync", status: "disabled", description: "Pulls tickets from Zendesk API.", lastRun: "2h ago", lastOutcome: "failure", runs: 2103 },
    ],
    cronJobs: [
      { name: "Zendesk Ingestion", schedule: "*/30 * * * *", lastRun: "2h ago", status: "failed", skillId: "s19", history: [{ time: "2h ago", ok: false }, { time: "2.5h ago", ok: false }, { time: "3h ago", ok: false }] },
      { name: "NPS Analysis", schedule: "0 9 * * *", lastRun: "1d ago", status: "ok", skillId: "s16" },
    ],
    activity: [
      { id: "a5-1", time: "05:30", action: "Zendesk sync", outcome: "failure", detail: "HTTP 429 — rate limited" },
      { id: "a5-2", time: "05:00", action: "Zendesk sync", outcome: "failure", detail: "HTTP 429 — rate limited" },
      { id: "a5-3", time: "Yesterday", action: "NPS analysis", outcome: "success" },
      { id: "a5-4", time: "Yesterday", action: "Pricing confusion pattern identified", outcome: "success", detail: "40% of churned enterprises cite pricing" },
    ],
    responsibilities: ["Feedback analysis", "Churn signals", "Product insights", "Support trends"],
  },
];

// ===== MATTERS =====

export const matters: Matter[] = [
  {
    id: "m1", title: "Q1 Growth Campaign", status: "healthy", owner: "Atlas", ownerAgentId: "a1",
    description: "Execute Q1 user acquisition across paid and organic channels.",
    businessUnit: "VNG-CP", goalIds: ["g2"], lastActivity: "2h ago",
    threads: [
      { id: "t1", title: "Retargeting campaign review", source: "Atlas", timestamp: "2h ago", matterId: "m1", agentId: "a1", summary: "CTR up 12% after creative refresh.", status: "open" },
      { id: "t2", title: "Landing page A/B results", source: "Atlas", timestamp: "1d ago", matterId: "m1", agentId: "a1", summary: "Variant B +18% conversion. Rolling out.", status: "resolved" },
    ],
    commitments: [
      { id: "c1", title: "Launch retargeting campaign", owner: "Atlas", dueDate: "Mar 28", status: "done", matterId: "m1" },
      { id: "c2", title: "Deliver Q1 attribution report", owner: "Atlas", dueDate: "Apr 2", status: "on-track", matterId: "m1" },
    ],
  },
  {
    id: "m2", title: "API v2.3 Release", status: "at-risk", owner: "Rigby", ownerAgentId: "a2",
    description: "Ship API v2.3 with rate limiting, error handling, auth migration.",
    businessUnit: "VNGG", goalIds: ["g1"], lastActivity: "4h ago",
    threads: [
      { id: "t3", title: "Auth migration blocked", source: "Rigby", timestamp: "2d ago", matterId: "m2", agentId: "a2", summary: "New auth provider has breaking changes. Need decision.", status: "open" },
      { id: "t4", title: "Rate limiting shipped", source: "Rigby", timestamp: "4h ago", matterId: "m2", agentId: "a2", summary: "99.8% requests unaffected.", status: "resolved" },
    ],
    commitments: [
      { id: "c3", title: "Ship rate limiting", owner: "Rigby", dueDate: "Mar 27", status: "done", matterId: "m2" },
      { id: "c4", title: "Complete auth migration", owner: "Rigby", dueDate: "Mar 30", status: "blocked", matterId: "m2" },
      { id: "c5", title: "API v2.3 full release", owner: "Rigby", dueDate: "Apr 5", status: "at-risk", matterId: "m2" },
    ],
  },
  {
    id: "m3", title: "Customer Churn Investigation", status: "blocked", owner: "Noor", ownerAgentId: "a5",
    description: "Investigate enterprise churn uptick and identify root causes.",
    businessUnit: "ZP", goalIds: ["g3"], lastActivity: "2h ago",
    threads: [
      { id: "t5", title: "Zendesk ingestion failure", source: "Noor", timestamp: "2h ago", matterId: "m3", agentId: "a5", summary: "API rate limited. Cannot pull tickets.", status: "open" },
      { id: "t6", title: "Pricing confusion signal", source: "Noor", timestamp: "1d ago", matterId: "m3", agentId: "a5", summary: "40% churned enterprises cite pricing.", status: "open" },
    ],
    commitments: [
      { id: "c6", title: "Deliver churn analysis report", owner: "Noor", dueDate: "Apr 1", status: "blocked", matterId: "m3" },
    ],
  },
  {
    id: "m4", title: "Q1 Ops Review", status: "healthy", owner: "ThuyTM3", ownerAgentId: "a4",
    description: "Q1 operational review with commitment tracking.",
    businessUnit: "GN", goalIds: ["g4"], lastActivity: "3d ago",
    threads: [
      { id: "t7", title: "Overdue commitment audit", source: "ThuyTM3", timestamp: "4d ago", matterId: "m4", agentId: "a4", summary: "3 commitments overdue. Escalated.", status: "resolved" },
    ],
    commitments: [
      { id: "c7", title: "Q1 ops summary document", owner: "ThuyTM3", dueDate: "Apr 7", status: "on-track", matterId: "m4" },
    ],
  },
  {
    id: "m5", title: "Zalo Pay Integration", status: "stale", owner: "Rigby", ownerAgentId: "a2",
    description: "Payment gateway integration with Zalo Pay for Vietnamese market.",
    businessUnit: "ZP", goalIds: ["g5"], lastActivity: "12d ago",
    threads: [],
    commitments: [
      { id: "c8", title: "Complete sandbox testing", owner: "Rigby", dueDate: "Mar 15", status: "overdue", matterId: "m5" },
    ],
  },
  {
    id: "m6", title: "VNGG Platform Reliability", status: "healthy", owner: "Syssie", ownerAgentId: "a3",
    description: "Maintain 99.9% uptime for VNGG gaming platform services.",
    businessUnit: "VNGG", goalIds: ["g1"], lastActivity: "2m ago",
    threads: [
      { id: "t8a", title: "Latency spike in SEA region", source: "Syssie", timestamp: "1h ago", matterId: "m6", agentId: "a3", summary: "P99 latency up 40ms. Investigating CDN.", status: "open" },
    ],
    commitments: [
      { id: "c9", title: "Achieve 99.9% uptime Q1", owner: "Syssie", dueDate: "Mar 31", status: "on-track", matterId: "m6" },
    ],
  },
];

// ===== UNASSIGNED THREADS =====

export const unassignedThreads: Thread[] = [
  { id: "t8", title: "APAC support ticket spike (3x)", source: "Auto-detected", timestamp: "6h ago", summary: "Support volume from APAC up 3x. No incident found.", status: "open" },
  { id: "t9", title: "Competitor free tier — impact assessment", source: "News monitor", timestamp: "1d ago", summary: "Major competitor announced free tier.", status: "pending" },
  { id: "t10", title: "Slack integration request ×3 enterprise", source: "Noor", timestamp: "2d ago", summary: "Three enterprise accounts requesting Slack integration.", status: "open" },
  { id: "t11", title: "Billing dispute — Acme Corp $12K", source: "Finance", timestamp: "3d ago", summary: "Acme Corp disputing $12K invoice. No owner.", status: "open" },
  { id: "t12", title: "GN mobile app crash reports increasing", source: "Syssie", timestamp: "4h ago", summary: "Crash rate up 2.1% on Android in GN app.", status: "open" },
];

// ===== GOALS =====

export const goals: Goal[] = [
  // VNG-CP
  { id: "g2", title: "Reach 10K active users by Q2", type: "annual", businessUnit: "VNG-CP", progress: 62, linkedMatterIds: ["m1"] },
  { id: "g6", title: "Establish VNG-CP as market leader in cloud platform", type: "long-term", businessUnit: "VNG-CP", progress: 35, linkedMatterIds: ["m1"] },
  // VNGG
  { id: "g1", title: "Ship world-class developer platform", type: "long-term", businessUnit: "VNGG", progress: 45, linkedMatterIds: ["m2", "m6"] },
  { id: "g7", title: "99.95% platform uptime", type: "annual", businessUnit: "VNGG", progress: 91, linkedMatterIds: ["m6"] },
  // ZP
  { id: "g3", title: "Reduce enterprise churn below 5%", type: "annual", businessUnit: "ZP", progress: 30, linkedMatterIds: ["m3"] },
  { id: "g5", title: "Expand payment coverage to 3 new gateways", type: "annual", businessUnit: "ZP", progress: 15, linkedMatterIds: ["m5"] },
  // GN
  { id: "g4", title: "Operational excellence — 95% commitment rate", type: "annual", businessUnit: "GN", progress: 78, linkedMatterIds: ["m4"] },
  { id: "g8", title: "Build autonomous AI-first organization", type: "long-term", businessUnit: "GN", progress: 25, linkedMatterIds: [] },
];

// ===== DECISIONS =====

export const decisions: DecisionItem[] = [
  { id: "d1", title: "Auth migration: proceed or rollback?", context: "Rigby's migration hit breaking changes. Risks API v2.3 deadline. Rollback means staying on deprecated provider.", urgency: "critical", source: "API v2.3 Release", agentId: "a2" },
  { id: "d2", title: "Upgrade Zendesk API to unblock Noor", context: "Rate limited on current plan. ~$200/mo upgrade unblocks churn investigation.", urgency: "important", source: "Churn Investigation", agentId: "a5" },
  { id: "d3", title: "Assign APAC support spike", context: "3x volume increase, no owner, no incident. Needs triage.", urgency: "important", source: "Unassigned", agentId: "a3" },
];

// ===== SYSTEM HEALTH =====

export const systemHealth = {
  overall: "yellow" as "green" | "yellow" | "red",
  issues: [
    { label: "Noor — Zendesk API rate limited", severity: "error" as const, action: "Upgrade API plan" },
    { label: "Rigby — Perf benchmark failing", severity: "warning" as const, action: "Investigate staging resources" },
    { label: "Atlas — Commitment check DB timeout", severity: "warning" as const, action: "Check DB connections" },
    { label: "Ingestion pipeline", severity: "ok" as const },
    { label: "Agent heartbeats", severity: "ok" as const },
  ],
};

export const businessUnits = ["VNG-CP", "VNGG", "ZP", "GN"] as const;
export type BusinessUnit = typeof businessUnits[number];
