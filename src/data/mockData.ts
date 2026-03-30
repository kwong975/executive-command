export interface Agent {
  id: string;
  name: string;
  role: string;
  purpose: string;
  status: "active" | "idle" | "error";
  avatar: string;
  currentTask: string;
  skills: string[];
  cronJobs: { name: string; schedule: string; lastRun: string; status: "ok" | "failed" }[];
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
    name: "Aria",
    role: "Growth Lead",
    purpose: "Drive user acquisition and activation across all channels",
    status: "active",
    avatar: "A",
    currentTask: "Analyzing Q1 campaign attribution data",
    skills: ["Marketing analytics", "Campaign management", "A/B testing", "Funnel optimization"],
    cronJobs: [
      { name: "Daily metrics pull", schedule: "06:00 UTC", lastRun: "2h ago", status: "ok" },
      { name: "Campaign health check", schedule: "12:00 UTC", lastRun: "8h ago", status: "ok" },
    ],
    recentWork: [
      { description: "Launched retargeting campaign for churned users", outcome: "success", timestamp: "2h ago" },
      { description: "A/B test on onboarding flow variant B", outcome: "success", timestamp: "1d ago" },
      { description: "Email sequence for enterprise leads", outcome: "failure", timestamp: "3d ago" },
    ],
    responsibilities: ["User acquisition", "Campaign execution", "Growth experiments", "Funnel reporting"],
  },
  {
    id: "a2",
    name: "Marcus",
    role: "Engineering Lead",
    purpose: "Ship reliable product features and maintain system health",
    status: "active",
    avatar: "M",
    currentTask: "Deploying API v2.3 with rate limiting improvements",
    skills: ["System architecture", "Code review", "CI/CD", "Performance optimization"],
    cronJobs: [
      { name: "Build & test suite", schedule: "Every push", lastRun: "35m ago", status: "ok" },
      { name: "Dependency audit", schedule: "Weekly", lastRun: "2d ago", status: "ok" },
      { name: "Performance benchmark", schedule: "Daily 03:00", lastRun: "5h ago", status: "failed" },
    ],
    recentWork: [
      { description: "Shipped search indexing improvements (3x faster)", outcome: "success", timestamp: "4h ago" },
      { description: "Fixed memory leak in websocket handler", outcome: "success", timestamp: "1d ago" },
      { description: "Attempted migration to new auth provider", outcome: "failure", timestamp: "2d ago" },
    ],
    responsibilities: ["Feature delivery", "Code quality", "Infrastructure", "Technical debt"],
  },
  {
    id: "a3",
    name: "Syssie",
    role: "System Operator",
    purpose: "Keep all internal systems healthy and coordinate between agents",
    status: "active",
    avatar: "S",
    currentTask: "Monitoring ingestion pipeline after config change",
    skills: ["System monitoring", "Agent coordination", "Issue triage", "Data ingestion"],
    cronJobs: [
      { name: "Health check all agents", schedule: "Every 5m", lastRun: "2m ago", status: "ok" },
      { name: "Ingestion freshness check", schedule: "Every 15m", lastRun: "8m ago", status: "ok" },
    ],
    recentWork: [
      { description: "Restarted Aria's campaign sync after timeout", outcome: "success", timestamp: "1h ago" },
      { description: "Escalated Marcus's failed performance benchmark", outcome: "success", timestamp: "5h ago" },
    ],
    responsibilities: ["System health", "Agent coordination", "Escalation management", "Data freshness"],
  },
  {
    id: "a4",
    name: "ThuyTM3",
    role: "Operations Manager",
    purpose: "Manage internal processes, commitments tracking, and team coordination",
    status: "idle",
    avatar: "T",
    currentTask: "Idle — awaiting next assignment",
    skills: ["Process management", "Commitment tracking", "Resource allocation", "Reporting"],
    cronJobs: [
      { name: "Commitment status sync", schedule: "Every 2h", lastRun: "45m ago", status: "ok" },
      { name: "Weekly summary generation", schedule: "Fri 17:00", lastRun: "3d ago", status: "ok" },
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
    purpose: "Synthesize customer feedback and surface insights to guide product direction",
    status: "error",
    avatar: "N",
    currentTask: "Blocked — Zendesk API rate limited",
    skills: ["Sentiment analysis", "Feedback synthesis", "Churn prediction", "Customer segmentation"],
    cronJobs: [
      { name: "Zendesk ticket ingestion", schedule: "Every 30m", lastRun: "2h ago", status: "failed" },
      { name: "NPS analysis", schedule: "Daily 09:00", lastRun: "1d ago", status: "ok" },
    ],
    recentWork: [
      { description: "Identified pricing confusion pattern in enterprise segment", outcome: "success", timestamp: "1d ago" },
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
    owner: "Aria",
    ownerAgentId: "a1",
    description: "Execute and optimize Q1 user acquisition campaigns across paid and organic channels.",
    goalIds: ["g2"],
    lastActivity: "2h ago",
    threads: [
      { id: "t1", title: "Retargeting campaign performance review", source: "Aria", timestamp: "2h ago", matterId: "m1", agentId: "a1", summary: "CTR up 12% after creative refresh. Recommending budget increase.", status: "open" },
      { id: "t2", title: "Landing page A/B test results", source: "Aria", timestamp: "1d ago", matterId: "m1", agentId: "a1", summary: "Variant B shows 18% higher conversion. Rolling out.", status: "resolved" },
    ],
    commitments: [
      { id: "c1", title: "Launch retargeting campaign", owner: "Aria", dueDate: "Mar 28", status: "done", matterId: "m1" },
      { id: "c2", title: "Deliver Q1 attribution report", owner: "Aria", dueDate: "Apr 2", status: "on-track", matterId: "m1" },
    ],
  },
  {
    id: "m2",
    title: "API v2.3 Release",
    status: "at-risk",
    owner: "Marcus",
    ownerAgentId: "a2",
    description: "Ship API v2.3 with rate limiting, improved error handling, and auth provider migration.",
    goalIds: ["g1"],
    lastActivity: "4h ago",
    threads: [
      { id: "t3", title: "Auth provider migration blocked", source: "Marcus", timestamp: "2d ago", matterId: "m2", agentId: "a2", summary: "New auth provider has undocumented breaking changes. Need decision on whether to proceed or roll back.", status: "open" },
      { id: "t4", title: "Rate limiting implementation complete", source: "Marcus", timestamp: "4h ago", matterId: "m2", agentId: "a2", summary: "Rate limiting shipped and tested. 99.8% of requests unaffected.", status: "resolved" },
    ],
    commitments: [
      { id: "c3", title: "Ship rate limiting", owner: "Marcus", dueDate: "Mar 27", status: "done", matterId: "m2" },
      { id: "c4", title: "Complete auth migration", owner: "Marcus", dueDate: "Mar 30", status: "blocked", matterId: "m2" },
      { id: "c5", title: "API v2.3 full release", owner: "Marcus", dueDate: "Apr 5", status: "at-risk", matterId: "m2" },
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
      { id: "t5", title: "Zendesk ingestion failure", source: "Noor", timestamp: "2h ago", matterId: "m3", agentId: "a5", summary: "Cannot pull latest tickets. Zendesk API rate limit hit. Need API key rotation or upgrade.", status: "open" },
      { id: "t6", title: "Pricing confusion in enterprise segment", source: "Noor", timestamp: "1d ago", matterId: "m3", agentId: "a5", summary: "Pattern identified: 40% of churned enterprises cite pricing clarity as issue.", status: "open" },
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
    description: "Compile and deliver Q1 operational review with commitment tracking and process improvements.",
    goalIds: ["g4"],
    lastActivity: "3d ago",
    threads: [
      { id: "t7", title: "Overdue commitment audit", source: "ThuyTM3", timestamp: "4d ago", matterId: "m4", agentId: "a4", summary: "3 commitments overdue in Q1 planning. Escalated to owners.", status: "resolved" },
    ],
    commitments: [
      { id: "c7", title: "Q1 ops summary document", owner: "ThuyTM3", dueDate: "Apr 7", status: "on-track", matterId: "m4" },
    ],
  },
];

export const unassignedThreads: Thread[] = [
  { id: "t8", title: "Unusual spike in support tickets from APAC region", source: "Auto-detected", timestamp: "6h ago", summary: "Support volume from APAC up 3x in last 48h. No matching incident found.", status: "open" },
  { id: "t9", title: "Competitor launched free tier — impact assessment needed", source: "News monitor", timestamp: "1d ago", summary: "Major competitor announced free tier. Potential impact on our acquisition funnel.", status: "pending" },
  { id: "t10", title: "Slack integration feature request from 3 enterprise accounts", source: "Noor", timestamp: "2d ago", summary: "Three separate enterprise accounts requesting Slack integration in last week.", status: "open" },
  { id: "t11", title: "Unresolved billing dispute — Acme Corp", source: "Finance system", timestamp: "3d ago", summary: "Acme Corp disputing $12K invoice. No owner assigned.", status: "open" },
];

export const goals: Goal[] = [
  { id: "g1", title: "Ship world-class developer platform", type: "long-term", progress: 45, linkedMatterIds: ["m2"] },
  { id: "g2", title: "Reach 10K active users by Q2", type: "annual", progress: 62, linkedMatterIds: ["m1"] },
  { id: "g3", title: "Reduce enterprise churn below 5%", type: "annual", progress: 30, linkedMatterIds: ["m3"] },
  { id: "g4", title: "Operational excellence — 95% commitment completion rate", type: "annual", progress: 78, linkedMatterIds: ["m4"] },
  { id: "g5", title: "Build autonomous AI-first organization", type: "long-term", progress: 25, linkedMatterIds: [] },
];

export const decisions: DecisionItem[] = [
  {
    id: "d1",
    title: "Proceed with auth provider migration or roll back?",
    context: "Marcus's auth migration hit undocumented breaking changes. Continuing risks the API v2.3 deadline. Rolling back means staying on deprecated provider.",
    urgency: "critical",
    source: "API v2.3 Release",
    agentId: "a2",
  },
  {
    id: "d2",
    title: "Upgrade Zendesk API plan to unblock Noor",
    context: "Noor is rate-limited on current plan. Upgrade costs ~$200/mo but unblocks churn investigation.",
    urgency: "important",
    source: "Customer Churn Investigation",
    agentId: "a5",
  },
  {
    id: "d3",
    title: "Assign owner to APAC support spike",
    context: "3x increase in APAC support volume with no incident or owner. Needs triage.",
    urgency: "important",
    source: "Unassigned",
    agentId: "a3",
  },
];

export const systemHealth = {
  overall: "yellow" as "green" | "yellow" | "red",
  details: [
    { label: "Noor — Zendesk API rate limited", status: "error" as const },
    { label: "Marcus — Performance benchmark failed", status: "warning" as const },
    { label: "Ingestion freshness", status: "ok" as const },
    { label: "All other agents operational", status: "ok" as const },
  ],
};
