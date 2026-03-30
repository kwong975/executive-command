export interface Skill {
  id: string;
  name: string;
  status: "active" | "degraded" | "disabled";
  description: string;
  inputs: string[];
  outputs: string[];
  lastExecution: string;
  lastOutcome: "success" | "failure";
  executionCount: number;
}

export interface CronJob {
  name: string;
  schedule: string;
  lastRun: string;
  status: "ok" | "failed" | "paused";
  skillId: string;
  nextRun?: string;
  recentRuns?: { time: string; status: "ok" | "failed" }[];
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
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
  currentItems: string[];
  skills: Skill[];
  cronJobs: CronJob[];
  activity: ActivityEntry[];
  recentWork: { description: string; outcome: "success" | "failure"; timestamp: string }[];
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
  status: "healthy" | "blocked" | "at-risk";
  owner: string;
  ownerAgentId: string;
  description: string;
  goalIds: string[];
  threads: Thread[];
  commitments: Commitment[];
  lastActivity: string;
}

export interface Goal {
  id: string;
  title: string;
  type: "long-term" | "annual";
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

export const agents: Agent[] = [
  {
    id: "a1",
    name: "Atlas",
    role: "Chief of Staff",
    purpose: "Orchestrate daily operations, prepare briefings, and ensure executive alignment across all agents.",
    status: "active",
    avatar: "AT",
    currentTask: "Preparing morning briefing for leadership review",
    currentItems: [
      "Handling morning briefing",
      "3 matters blocked awaiting assignment",
      "Coordinating with Syssie on system health",
    ],
    skills: [
      { id: "s1", name: "meeting_prep", status: "active", description: "Prepares meeting agendas and context briefs from active matters and threads.", inputs: ["calendar_events", "active_matters"], outputs: ["meeting_brief_doc"], lastExecution: "35m ago", lastOutcome: "success", executionCount: 284 },
      { id: "s2", name: "daily_briefing", status: "active", description: "Generates a daily summary of decisions needed, blocked work, and agent status.", inputs: ["agent_statuses", "decisions_queue", "matters"], outputs: ["briefing_document"], lastExecution: "1h ago", lastOutcome: "success", executionCount: 127 },
      { id: "s3", name: "resolve_commitments", status: "degraded", description: "Checks commitment deadlines and escalates overdue items to owners.", inputs: ["commitments_table"], outputs: ["escalation_messages"], lastExecution: "3h ago", lastOutcome: "failure", executionCount: 89 },
      { id: "s4", name: "strategy_alignment", status: "active", description: "Maps active matters to strategic goals and flags misalignment.", inputs: ["matters", "goals"], outputs: ["alignment_report"], lastExecution: "6h ago", lastOutcome: "success", executionCount: 42 },
      { id: "s5", name: "thread_triage", status: "active", description: "Classifies incoming threads and assigns to appropriate matters or agents.", inputs: ["unassigned_threads"], outputs: ["assignment_actions"], lastExecution: "20m ago", lastOutcome: "success", executionCount: 512 },
    ],
    cronJobs: [
      { name: "Morning Briefing", schedule: "0 6 * * *", lastRun: "1h ago", status: "ok", skillId: "s2", nextRun: "Tomorrow 06:00", recentRuns: [{ time: "Today 06:00", status: "ok" }, { time: "Yesterday 06:00", status: "ok" }, { time: "2d ago 06:00", status: "ok" }] },
      { name: "Meeting Prep", schedule: "*/5 * * * *", lastRun: "3m ago", status: "ok", skillId: "s1", nextRun: "In 2 minutes", recentRuns: [{ time: "3m ago", status: "ok" }, { time: "8m ago", status: "ok" }, { time: "13m ago", status: "ok" }] },
      { name: "Commitment Check", schedule: "0 */2 * * *", lastRun: "45m ago", status: "failed", skillId: "s3", nextRun: "In 1h 15m", recentRuns: [{ time: "45m ago", status: "failed" }, { time: "2h ago", status: "ok" }, { time: "4h ago", status: "ok" }] },
      { name: "Evening Close", schedule: "0 18 * * *", lastRun: "Yesterday 18:00", status: "ok", skillId: "s4", nextRun: "Today 18:00" },
    ],
    activity: [
      { id: "act1", timestamp: "06:00", action: "Generated morning briefing", outcome: "success" },
      { id: "act2", timestamp: "05:58", action: "Triaged 4 incoming threads", outcome: "success", detail: "2 assigned to matters, 1 to Noor, 1 left unassigned" },
      { id: "act3", timestamp: "05:50", action: "Commitment lifecycle check", outcome: "failure", detail: "Database timeout on commitments table" },
      { id: "act4", timestamp: "05:45", action: "Meeting prep for 09:00 standup", outcome: "success" },
      { id: "act5", timestamp: "05:30", action: "Strategy alignment scan", outcome: "success", detail: "1 matter flagged as misaligned" },
      { id: "act6", timestamp: "04:00", action: "Evening close report", outcome: "success" },
      { id: "act7", timestamp: "03:55", action: "Commitment check", outcome: "success", detail: "2 overdue commitments escalated" },
    ],
    recentWork: [
      { description: "Generated morning briefing with 3 decision items", outcome: "success", timestamp: "1h ago" },
      { description: "Triaged 4 threads from overnight ingestion", outcome: "success", timestamp: "1h ago" },
      { description: "Commitment lifecycle run (DB timeout)", outcome: "failure", timestamp: "2h ago" },
    ],
    responsibilities: ["Daily briefings", "Meeting preparation", "Commitment tracking", "Thread triage", "Strategy alignment"],
  },
  {
    id: "a2",
    name: "Rigby",
    role: "Engineering Lead",
    purpose: "Ship reliable product features and maintain system health across all technical infrastructure.",
    status: "active",
    avatar: "RG",
    currentTask: "Deploying API v2.3 with rate limiting improvements",
    currentItems: [
      "Deploying API v2.3 rate limiting",
      "Auth provider migration blocked — needs decision",
      "Performance benchmark investigation",
    ],
    skills: [
      { id: "s6", name: "code_review", status: "active", description: "Automated code review for PRs against style and security standards.", inputs: ["pull_requests"], outputs: ["review_comments"], lastExecution: "20m ago", lastOutcome: "success", executionCount: 1032 },
      { id: "s7", name: "deploy_pipeline", status: "active", description: "Manages CI/CD pipeline execution and rollback procedures.", inputs: ["build_artifacts", "deploy_config"], outputs: ["deploy_status"], lastExecution: "4h ago", lastOutcome: "success", executionCount: 345 },
      { id: "s8", name: "perf_benchmark", status: "degraded", description: "Runs performance benchmarks against staging environment.", inputs: ["benchmark_suite"], outputs: ["perf_report"], lastExecution: "5h ago", lastOutcome: "failure", executionCount: 89 },
      { id: "s9", name: "incident_response", status: "active", description: "Detects and responds to production incidents with automated triage.", inputs: ["monitoring_alerts"], outputs: ["incident_report", "mitigation_actions"], lastExecution: "2d ago", lastOutcome: "success", executionCount: 23 },
    ],
    cronJobs: [
      { name: "Build & Test Suite", schedule: "on push", lastRun: "35m ago", status: "ok", skillId: "s6", recentRuns: [{ time: "35m ago", status: "ok" }, { time: "2h ago", status: "ok" }] },
      { name: "Dependency Audit", schedule: "0 0 * * 1", lastRun: "2d ago", status: "ok", skillId: "s7" },
      { name: "Performance Benchmark", schedule: "0 3 * * *", lastRun: "5h ago", status: "failed", skillId: "s8", recentRuns: [{ time: "5h ago", status: "failed" }, { time: "Yesterday 03:00", status: "ok" }] },
    ],
    activity: [
      { id: "act8", timestamp: "07:20", action: "Code review on PR #482", outcome: "success", detail: "3 comments, approved" },
      { id: "act9", timestamp: "06:30", action: "Deployed rate limiting to staging", outcome: "success" },
      { id: "act10", timestamp: "03:00", action: "Performance benchmark run", outcome: "failure", detail: "Staging env timeout — resource contention" },
      { id: "act11", timestamp: "Yesterday 16:00", action: "Shipped search indexing improvements", outcome: "success", detail: "3x query speed improvement" },
      { id: "act12", timestamp: "Yesterday 11:00", action: "Fixed memory leak in websocket handler", outcome: "success" },
    ],
    recentWork: [
      { description: "Shipped search indexing improvements (3x faster)", outcome: "success", timestamp: "4h ago" },
      { description: "Fixed memory leak in websocket handler", outcome: "success", timestamp: "1d ago" },
      { description: "Auth provider migration attempt — breaking changes", outcome: "failure", timestamp: "2d ago" },
    ],
    responsibilities: ["Feature delivery", "Code quality", "Infrastructure", "Technical debt"],
  },
  {
    id: "a3",
    name: "Syssie",
    role: "System Operator",
    purpose: "Keep all internal systems healthy and coordinate between agents when issues arise.",
    status: "active",
    avatar: "SY",
    currentTask: "Monitoring ingestion pipeline after config change",
    currentItems: [
      "Monitoring ingestion pipeline",
      "Tracking Noor's Zendesk rate limit issue",
    ],
    skills: [
      { id: "s10", name: "health_monitor", status: "active", description: "Continuous monitoring of all agent health and system endpoints.", inputs: ["agent_heartbeats", "system_metrics"], outputs: ["health_status"], lastExecution: "2m ago", lastOutcome: "success", executionCount: 8420 },
      { id: "s11", name: "agent_coordination", status: "active", description: "Routes work between agents and resolves conflicts.", inputs: ["agent_queues"], outputs: ["routing_actions"], lastExecution: "15m ago", lastOutcome: "success", executionCount: 1203 },
      { id: "s12", name: "issue_triage", status: "active", description: "Classifies and prioritizes system issues for escalation.", inputs: ["error_logs", "alerts"], outputs: ["triage_report"], lastExecution: "1h ago", lastOutcome: "success", executionCount: 456 },
    ],
    cronJobs: [
      { name: "Agent Health Check", schedule: "*/5 * * * *", lastRun: "2m ago", status: "ok", skillId: "s10", recentRuns: [{ time: "2m ago", status: "ok" }, { time: "7m ago", status: "ok" }, { time: "12m ago", status: "ok" }] },
      { name: "Ingestion Freshness", schedule: "*/15 * * * *", lastRun: "8m ago", status: "ok", skillId: "s10" },
    ],
    activity: [
      { id: "act13", timestamp: "07:25", action: "Health check — all agents nominal", outcome: "success" },
      { id: "act14", timestamp: "06:30", action: "Restarted Noor's Zendesk sync", outcome: "success", detail: "Rate limit still active — will retry in 30m" },
      { id: "act15", timestamp: "05:50", action: "Escalated Rigby's perf benchmark failure", outcome: "success" },
    ],
    recentWork: [
      { description: "Restarted Noor's Zendesk sync after timeout", outcome: "success", timestamp: "1h ago" },
      { description: "Escalated Rigby's failed performance benchmark", outcome: "success", timestamp: "5h ago" },
    ],
    responsibilities: ["System health", "Agent coordination", "Escalation management", "Data freshness"],
  },
  {
    id: "a4",
    name: "ThuyTM3",
    role: "Operations Manager",
    purpose: "Manage internal processes, commitments tracking, and team coordination.",
    status: "idle",
    avatar: "TM",
    currentTask: "Idle — awaiting next assignment",
    currentItems: [
      "No active items",
    ],
    skills: [
      { id: "s13", name: "process_management", status: "active", description: "Manages and optimizes internal operational processes.", inputs: ["process_definitions"], outputs: ["process_updates"], lastExecution: "3d ago", lastOutcome: "success", executionCount: 67 },
      { id: "s14", name: "commitment_tracking", status: "active", description: "Tracks all commitments across matters and flags overdue items.", inputs: ["commitments_table"], outputs: ["status_report"], lastExecution: "45m ago", lastOutcome: "success", executionCount: 234 },
      { id: "s15", name: "weekly_summary", status: "active", description: "Generates weekly operational summary with KPIs and blockers.", inputs: ["matters", "commitments", "activity_logs"], outputs: ["weekly_report"], lastExecution: "3d ago", lastOutcome: "success", executionCount: 18 },
    ],
    cronJobs: [
      { name: "Commitment Status Sync", schedule: "0 */2 * * *", lastRun: "45m ago", status: "ok", skillId: "s14" },
      { name: "Weekly Summary", schedule: "0 17 * * 5", lastRun: "3d ago", status: "ok", skillId: "s15" },
    ],
    activity: [
      { id: "act16", timestamp: "3d ago", action: "Generated weekly ops summary", outcome: "success" },
      { id: "act17", timestamp: "4d ago", action: "Flagged 3 overdue commitments", outcome: "success", detail: "In Q1 planning matter" },
    ],
    recentWork: [
      { description: "Generated weekly ops summary for leadership", outcome: "success", timestamp: "3d ago" },
      { description: "Flagged 3 overdue commitments in Q1 planning matter", outcome: "success", timestamp: "4d ago" },
    ],
    responsibilities: ["Commitment tracking", "Process optimization", "Team coordination", "Status reporting"],
  },
  {
    id: "a5",
    name: "Noor",
    role: "Customer Intelligence",
    purpose: "Synthesize customer feedback and surface insights to guide product direction.",
    status: "error",
    avatar: "NR",
    currentTask: "Blocked — Zendesk API rate limited",
    currentItems: [
      "Zendesk ingestion blocked (rate limited)",
      "Pricing confusion analysis pending data",
    ],
    skills: [
      { id: "s16", name: "sentiment_analysis", status: "active", description: "Analyzes customer feedback for sentiment patterns.", inputs: ["support_tickets", "reviews"], outputs: ["sentiment_report"], lastExecution: "1d ago", lastOutcome: "success", executionCount: 156 },
      { id: "s17", name: "feedback_synthesis", status: "degraded", description: "Synthesizes feedback into actionable product insights.", inputs: ["ticket_data", "survey_responses"], outputs: ["insights_report"], lastExecution: "2h ago", lastOutcome: "failure", executionCount: 89 },
      { id: "s18", name: "churn_prediction", status: "active", description: "Predicts churn risk based on engagement and support patterns.", inputs: ["user_activity", "support_history"], outputs: ["churn_risk_scores"], lastExecution: "1d ago", lastOutcome: "success", executionCount: 34 },
      { id: "s19", name: "zendesk_sync", status: "disabled", description: "Pulls tickets from Zendesk API for analysis.", inputs: ["zendesk_api"], outputs: ["ticket_data"], lastExecution: "2h ago", lastOutcome: "failure", executionCount: 2103 },
    ],
    cronJobs: [
      { name: "Zendesk Ticket Ingestion", schedule: "*/30 * * * *", lastRun: "2h ago", status: "failed", skillId: "s19", recentRuns: [{ time: "2h ago", status: "failed" }, { time: "2.5h ago", status: "failed" }, { time: "3h ago", status: "failed" }] },
      { name: "NPS Analysis", schedule: "0 9 * * *", lastRun: "1d ago", status: "ok", skillId: "s16" },
    ],
    activity: [
      { id: "act18", timestamp: "05:30", action: "Zendesk sync attempt", outcome: "failure", detail: "HTTP 429 — rate limited" },
      { id: "act19", timestamp: "05:00", action: "Zendesk sync attempt", outcome: "failure", detail: "HTTP 429 — rate limited" },
      { id: "act20", timestamp: "Yesterday 09:00", action: "NPS analysis completed", outcome: "success" },
      { id: "act21", timestamp: "Yesterday 14:00", action: "Identified pricing confusion pattern", outcome: "success", detail: "40% of churned enterprises cite pricing" },
    ],
    recentWork: [
      { description: "Identified pricing confusion in enterprise segment", outcome: "success", timestamp: "1d ago" },
      { description: "Zendesk sync failed — rate limited", outcome: "failure", timestamp: "2h ago" },
    ],
    responsibilities: ["Customer feedback analysis", "Churn signals", "Product insights", "Support trends"],
  },
];

export const matters: Matter[] = [
  {
    id: "m1",
    title: "Q1 Growth Campaign",
    status: "healthy",
    owner: "Atlas",
    ownerAgentId: "a1",
    description: "Execute and optimize Q1 user acquisition campaigns across paid and organic channels.",
    goalIds: ["g2"],
    lastActivity: "2h ago",
    threads: [
      { id: "t1", title: "Retargeting campaign performance review", source: "Atlas", timestamp: "2h ago", matterId: "m1", agentId: "a1", summary: "CTR up 12% after creative refresh.", status: "open" },
      { id: "t2", title: "Landing page A/B test results", source: "Atlas", timestamp: "1d ago", matterId: "m1", agentId: "a1", summary: "Variant B shows 18% higher conversion.", status: "resolved" },
    ],
    commitments: [
      { id: "c1", title: "Launch retargeting campaign", owner: "Atlas", dueDate: "Mar 28", status: "done", matterId: "m1" },
      { id: "c2", title: "Deliver Q1 attribution report", owner: "Atlas", dueDate: "Apr 2", status: "on-track", matterId: "m1" },
    ],
  },
  {
    id: "m2",
    title: "API v2.3 Release",
    status: "at-risk",
    owner: "Rigby",
    ownerAgentId: "a2",
    description: "Ship API v2.3 with rate limiting, improved error handling, and auth provider migration.",
    goalIds: ["g1"],
    lastActivity: "4h ago",
    threads: [
      { id: "t3", title: "Auth provider migration blocked", source: "Rigby", timestamp: "2d ago", matterId: "m2", agentId: "a2", summary: "New auth provider has undocumented breaking changes.", status: "open" },
      { id: "t4", title: "Rate limiting implementation complete", source: "Rigby", timestamp: "4h ago", matterId: "m2", agentId: "a2", summary: "Rate limiting shipped. 99.8% requests unaffected.", status: "resolved" },
    ],
    commitments: [
      { id: "c3", title: "Ship rate limiting", owner: "Rigby", dueDate: "Mar 27", status: "done", matterId: "m2" },
      { id: "c4", title: "Complete auth migration", owner: "Rigby", dueDate: "Mar 30", status: "blocked", matterId: "m2" },
      { id: "c5", title: "API v2.3 full release", owner: "Rigby", dueDate: "Apr 5", status: "at-risk", matterId: "m2" },
    ],
  },
  {
    id: "m3",
    title: "Customer Churn Investigation",
    status: "blocked",
    owner: "Noor",
    ownerAgentId: "a5",
    description: "Investigate recent uptick in enterprise churn and identify root causes.",
    goalIds: ["g3"],
    lastActivity: "2h ago",
    threads: [
      { id: "t5", title: "Zendesk ingestion failure", source: "Noor", timestamp: "2h ago", matterId: "m3", agentId: "a5", summary: "Cannot pull latest tickets. API rate limited.", status: "open" },
      { id: "t6", title: "Pricing confusion in enterprise segment", source: "Noor", timestamp: "1d ago", matterId: "m3", agentId: "a5", summary: "40% of churned enterprises cite pricing.", status: "open" },
    ],
    commitments: [
      { id: "c6", title: "Deliver churn analysis report", owner: "Noor", dueDate: "Apr 1", status: "blocked", matterId: "m3" },
    ],
  },
  {
    id: "m4",
    title: "Q1 Ops Review",
    status: "healthy",
    owner: "ThuyTM3",
    ownerAgentId: "a4",
    description: "Compile and deliver Q1 operational review.",
    goalIds: ["g4"],
    lastActivity: "3d ago",
    threads: [
      { id: "t7", title: "Overdue commitment audit", source: "ThuyTM3", timestamp: "4d ago", matterId: "m4", agentId: "a4", summary: "3 commitments overdue. Escalated.", status: "resolved" },
    ],
    commitments: [
      { id: "c7", title: "Q1 ops summary document", owner: "ThuyTM3", dueDate: "Apr 7", status: "on-track", matterId: "m4" },
    ],
  },
];

export const unassignedThreads: Thread[] = [
  { id: "t8", title: "Unusual spike in support tickets from APAC region", source: "Auto-detected", timestamp: "6h ago", summary: "Support volume from APAC up 3x in last 48h.", status: "open" },
  { id: "t9", title: "Competitor launched free tier", source: "News monitor", timestamp: "1d ago", summary: "Major competitor announced free tier. Impact assessment needed.", status: "pending" },
  { id: "t10", title: "Slack integration request from 3 enterprise accounts", source: "Noor", timestamp: "2d ago", summary: "Three enterprise accounts requesting Slack integration.", status: "open" },
  { id: "t11", title: "Unresolved billing dispute — Acme Corp", source: "Finance", timestamp: "3d ago", summary: "Acme Corp disputing $12K invoice. No owner.", status: "open" },
];

export const goals: Goal[] = [
  { id: "g1", title: "Ship world-class developer platform", type: "long-term", progress: 45, linkedMatterIds: ["m2"] },
  { id: "g2", title: "Reach 10K active users by Q2", type: "annual", progress: 62, linkedMatterIds: ["m1"] },
  { id: "g3", title: "Reduce enterprise churn below 5%", type: "annual", progress: 30, linkedMatterIds: ["m3"] },
  { id: "g4", title: "Operational excellence — 95% commitment rate", type: "annual", progress: 78, linkedMatterIds: ["m4"] },
  { id: "g5", title: "Build autonomous AI-first organization", type: "long-term", progress: 25, linkedMatterIds: [] },
];

export const decisions: DecisionItem[] = [
  { id: "d1", title: "Proceed with auth provider migration or roll back?", context: "Rigby's auth migration hit breaking changes. Risks API v2.3 deadline.", urgency: "critical", source: "API v2.3 Release", agentId: "a2" },
  { id: "d2", title: "Upgrade Zendesk API plan to unblock Noor", context: "Noor is rate-limited. Upgrade costs ~$200/mo but unblocks churn investigation.", urgency: "important", source: "Customer Churn Investigation", agentId: "a5" },
  { id: "d3", title: "Assign owner to APAC support spike", context: "3x increase in APAC support volume with no incident or owner.", urgency: "important", source: "Unassigned", agentId: "a3" },
];

export const systemHealth = {
  overall: "yellow" as "green" | "yellow" | "red",
  details: [
    { label: "Noor — Zendesk API rate limited", status: "error" as const },
    { label: "Rigby — Performance benchmark failed", status: "warning" as const },
    { label: "Ingestion freshness", status: "ok" as const },
    { label: "All other agents operational", status: "ok" as const },
  ],
};
