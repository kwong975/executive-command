/**
 * Fake data for the Executive Command system.
 * Covers: Today (attention queue), Workbench (structural repair),
 * Execution (commitments), Strategy Scan, Goal Linking, Hygiene.
 */

// ── MATTERS (core entities) ──

export interface MatterItem {
  id: string;
  title: string;
  health: "blocked" | "at-risk" | "healthy" | "drifting";
  priority: "attention" | "review" | null;
  owner: string | null;
  coherence: "high" | "medium" | "low" | null;
  goal_name: string | null;
  goal_id: string | null;
  signal: string;
  commitment_count: number;
  overdue_count: number;
  thread_count: number;
  last_activity: string;
}

export const allMatters: MatterItem[] = [
  { id: "m-perf", title: "Performance & Incentive System 2026", health: "blocked", priority: "attention", owner: null, coherence: "high", goal_name: "Governance & performance framework", goal_id: "si-s1", signal: "16 overdue commitments, no owner", commitment_count: 42, overdue_count: 16, thread_count: 5, last_activity: "2h ago" },
  { id: "m-hrms", title: "HRMS Transformation", health: "blocked", priority: "attention", owner: null, coherence: "high", goal_name: "HR + LG + FA transformation delivery", goal_id: "dto-s1", signal: "7 overdue commitments, no owner", commitment_count: 15, overdue_count: 7, thread_count: 3, last_activity: "4h ago" },
  { id: "m-comp", title: "Compliance & Regulatory Framework", health: "blocked", priority: "attention", owner: null, coherence: "medium", goal_name: "Group governance & SOP modernization", goal_id: "lgc-s1", signal: "5 overdue, no owner assigned", commitment_count: 7, overdue_count: 5, thread_count: 2, last_activity: "1d ago" },
  { id: "m-kpi", title: "VNG 2026 KPI", health: "blocked", priority: "attention", owner: null, coherence: "high", goal_name: "Clear rules so BUs can run independently", goal_id: "cp-o1-2026", signal: "Blocked with 1 overdue commitment", commitment_count: 1, overdue_count: 1, thread_count: 1, last_activity: "3d ago" },
  { id: "m-erm", title: "ERM Risk Management Framework", health: "blocked", priority: "review", owner: null, coherence: "medium", goal_name: "Group governance & SOP modernization", goal_id: "lgc-s1", signal: "5 overdue, 18 open commitments", commitment_count: 18, overdue_count: 5, thread_count: 4, last_activity: "2d ago" },
  { id: "m-vngg-pub", title: "VNGG Publishing Growth", health: "blocked", priority: "review", owner: "chrisliu", coherence: "high", goal_name: "Diversified gaming revenue across SEA", goal_id: "vngg-lt-01", signal: "5 overdue commitments", commitment_count: 10, overdue_count: 5, thread_count: 3, last_activity: "6h ago" },
  { id: "m-vngg-strat", title: "VNGG Growth & Publishing Strategy", health: "at-risk", priority: "review", owner: "chrisliu", coherence: "medium", goal_name: "Diversified gaming revenue across SEA", goal_id: "vngg-lt-01", signal: "Owner overloaded with 22 open", commitment_count: 22, overdue_count: 11, thread_count: 6, last_activity: "3h ago" },
  { id: "m-dto", title: "DTO Department Review", health: "at-risk", priority: null, owner: "kellytran", coherence: "high", goal_name: "AI ready data platform", goal_id: "dto-s2", signal: "Owner overloaded", commitment_count: 8, overdue_count: 0, thread_count: 2, last_activity: "1d ago" },
  { id: "m-exec", title: "VNG Group Strategic Execution 2026", health: "healthy", priority: null, owner: "kelly", coherence: "high", goal_name: "Clear rules so BUs can run independently", goal_id: "cp-o1-2026", signal: "On track, 2 overdue", commitment_count: 5, overdue_count: 2, thread_count: 3, last_activity: "5d ago" },
  { id: "m-zp", title: "ZaloPay Growth & Development", health: "healthy", priority: null, owner: "kelly", coherence: "high", goal_name: "Path to profitability for ZaloPay", goal_id: "zp-lt-01", signal: "Active execution", commitment_count: 3, overdue_count: 0, thread_count: 1, last_activity: "3d ago" },
  { id: "m-cap", title: "Capital Markets", health: "healthy", priority: null, owner: "varuna", coherence: "high", goal_name: "Capital market (Fund raising + IPO)", goal_id: "fa-s3", signal: "On track", commitment_count: 2, overdue_count: 0, thread_count: 1, last_activity: "5d ago" },
  { id: "m-gmt", title: "GMT Monthly Review", health: "drifting", priority: null, owner: null, coherence: "low", goal_name: null, goal_id: null, signal: "No owner, no goal, drifting", commitment_count: 4, overdue_count: 0, thread_count: 2, last_activity: "45d ago" },
  { id: "m-fa-monthly", title: "VNG FA Monthly Meeting", health: "drifting", priority: null, owner: null, coherence: "low", goal_name: null, goal_id: null, signal: "No owner, no goal, stale", commitment_count: 3, overdue_count: 0, thread_count: 1, last_activity: "52d ago" },
  { id: "m-dev-review", title: "DEV Department Review", health: "healthy", priority: null, owner: "longld2", coherence: "medium", goal_name: null, goal_id: null, signal: "Active but no strategy link", commitment_count: 2, overdue_count: 0, thread_count: 1, last_activity: "2d ago" },
];

// ── COMMITMENTS ──

export interface CommitmentItem {
  id: string;
  title: string;
  owner: string;
  owner_display: string;
  due_date: string;
  status: "open" | "overdue" | "done" | "escalated";
  matter_id: string;
  matter_title: string;
  sync_status: "synced" | "drift" | "none";
  escalation: boolean;
}

export const allCommitments: CommitmentItem[] = [
  // Overdue
  { id: "c-01", title: "Finalize bonus pool calculation spreadsheet", owner: "thuytm3", owner_display: "ThuyTM3", due_date: "2026-03-16", status: "overdue", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  { id: "c-02", title: "Review three-scenario framework", owner: "thuytm3", owner_display: "ThuyTM3", due_date: "2026-03-16", status: "overdue", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  { id: "c-03", title: "Email to Thao re department budget alignment", owner: "kelly", owner_display: "Kelly", due_date: "2026-03-12", status: "overdue", matter_id: "m-kpi", matter_title: "VNG 2026 KPI", sync_status: "drift", escalation: false },
  { id: "c-04", title: "Discuss A4B new system with HEP team", owner: "kelly", owner_display: "Kelly", due_date: "2026-03-12", status: "overdue", matter_id: "m-hrms", matter_title: "HRMS Transformation", sync_status: "none", escalation: false },
  { id: "c-05", title: "Speak with TungVT6 regarding LGR role", owner: "kelly", owner_display: "Kelly", due_date: "2026-03-13", status: "overdue", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "none", escalation: false },
  { id: "c-06", title: "Complete HRMS vendor evaluation", owner: "kellytran", owner_display: "KellyTran", due_date: "2026-03-18", status: "overdue", matter_id: "m-hrms", matter_title: "HRMS Transformation", sync_status: "synced", escalation: true },
  { id: "c-07", title: "Support on analysis of WD7 decision", owner: "thuytm3", owner_display: "ThuyTM3", due_date: "2026-03-12", status: "overdue", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "none", escalation: false },
  { id: "c-08", title: "Finalize three-scenario framework", owner: "thuytm3", owner_display: "ThuyTM3", due_date: "2026-03-16", status: "overdue", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  // Escalated
  { id: "c-09", title: "Deliver KPMG compliance report", owner: "thuydt", owner_display: "ThuyDT", due_date: "2026-03-20", status: "escalated", matter_id: "m-comp", matter_title: "Compliance & Regulatory Framework", sync_status: "none", escalation: true },
  { id: "c-10", title: "ERM framework final draft", owner: "thuydt", owner_display: "ThuyDT", due_date: "2026-03-22", status: "escalated", matter_id: "m-erm", matter_title: "ERM Risk Management Framework", sync_status: "none", escalation: true },
  // Active
  { id: "c-11", title: "Prepare CEO briefing on STI structure", owner: "kelly", owner_display: "Kelly", due_date: "2026-04-15", status: "open", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  { id: "c-12", title: "Review the business case for Udoo upgrade", owner: "kellytran", owner_display: "KellyTran", due_date: "2026-03-31", status: "open", matter_id: "m-hrms", matter_title: "HRMS Transformation", sync_status: "synced", escalation: false },
  { id: "c-13", title: "Schedule deep-dive sessions with NC partners", owner: "davidc", owner_display: "DavidC", due_date: "2026-03-31", status: "open", matter_id: "m-vngg-pub", matter_title: "VNGG Publishing Growth", sync_status: "none", escalation: false },
  { id: "c-14", title: "Draft governance framework for CEO review", owner: "thaotxn", owner_display: "ThaoTXN", due_date: "2026-04-10", status: "open", matter_id: "m-exec", matter_title: "VNG Group Strategic Execution 2026", sync_status: "synced", escalation: false },
  { id: "c-15", title: "Compile procurement transformation roadmap", owner: "thongnv2", owner_display: "ThongNV2", due_date: "2026-04-12", status: "open", matter_id: "m-exec", matter_title: "VNG Group Strategic Execution 2026", sync_status: "none", escalation: false },
  // Done
  { id: "c-16", title: "Submit Q1 performance data", owner: "thuytm3", owner_display: "ThuyTM3", due_date: "2026-03-10", status: "done", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  { id: "c-17", title: "Complete 2025 performance reviews", owner: "thaotxn", owner_display: "ThaoTXN", due_date: "2026-03-08", status: "done", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", sync_status: "synced", escalation: false },
  { id: "c-18", title: "Deliver ZaloPay growth projection", owner: "kelly", owner_display: "Kelly", due_date: "2026-03-20", status: "done", matter_id: "m-zp", matter_title: "ZaloPay Growth & Development", sync_status: "synced", escalation: false },
];

// ── THREADS ──

export interface ThreadItem {
  id: string;
  title: string;
  source: "email" | "meeting" | "slack" | "document";
  confidence: "high" | "medium" | "low";
  matter_id: string | null;
  matter_title: string | null;
  last_activity: string;
  is_singleton: boolean;
}

export const allThreads: ThreadItem[] = [
  { id: "t-01", title: "BoD March 2026 — Incentive Framework", source: "meeting", confidence: "high", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", last_activity: "2d ago", is_singleton: false },
  { id: "t-02", title: "HR Compensation Review Q1", source: "meeting", confidence: "high", matter_id: "m-perf", matter_title: "Performance & Incentive System 2026", last_activity: "5d ago", is_singleton: false },
  { id: "t-03", title: "HRMS vendor comparison email chain", source: "email", confidence: "high", matter_id: "m-hrms", matter_title: "HRMS Transformation", last_activity: "1d ago", is_singleton: false },
  { id: "t-04", title: "CP HR & People Transformation 2026", source: "meeting", confidence: "medium", matter_id: null, matter_title: null, last_activity: "8d ago", is_singleton: true },
  { id: "t-05", title: "IRAS Notice — Company Tax", source: "email", confidence: "low", matter_id: null, matter_title: null, last_activity: "6d ago", is_singleton: true },
  { id: "t-06", title: "2026 CP KPI Proposal", source: "meeting", confidence: "medium", matter_id: null, matter_title: null, last_activity: "10d ago", is_singleton: true },
  { id: "t-07", title: "VNGG SEA publisher partnership", source: "email", confidence: "high", matter_id: "m-vngg-pub", matter_title: "VNGG Publishing Growth", last_activity: "3d ago", is_singleton: false },
  { id: "t-08", title: "ZaloPay Q1 growth review", source: "meeting", confidence: "high", matter_id: "m-zp", matter_title: "ZaloPay Growth & Development", last_activity: "3d ago", is_singleton: false },
  { id: "t-09", title: "GreenNode hardware pricing email", source: "email", confidence: "medium", matter_id: null, matter_title: null, last_activity: "12d ago", is_singleton: true },
  { id: "t-10", title: "Legal team offsite notes", source: "document", confidence: "low", matter_id: null, matter_title: null, last_activity: "20d ago", is_singleton: true },
];

// ── TODAY (Attention Queue) ──

export interface AttentionQueueItem {
  id: string;
  matter_id: string;
  title: string;
  health: "blocked" | "at-risk" | "drifting";
  key_metric: string;
  why: string;
  why_expanded: string[];
  top_commitments: { title: string; owner: string; status: string }[];
  recent_activity: string;
}

export const attentionQueue: AttentionQueueItem[] = [
  {
    id: "aq-1", matter_id: "m-perf", title: "Performance & Incentive System 2026", health: "blocked",
    key_metric: "16 overdue commitments",
    why: "No owner + 16 overdue — execution stalled",
    why_expanded: ["No owner assigned — cannot progress", "16 of 42 commitments are overdue", "Multiple stakeholders waiting on decisions", "Directly blocks O1: Governance framework"],
    top_commitments: [
      { title: "Finalize bonus pool calculation", owner: "ThuyTM3", status: "overdue" },
      { title: "Review three-scenario framework", owner: "ThuyTM3", status: "overdue" },
      { title: "Prepare CEO briefing on STI", owner: "Kelly", status: "open" },
    ],
    recent_activity: "Last activity 2h ago — no progress on blockers",
  },
  {
    id: "aq-2", matter_id: "m-hrms", title: "HRMS Transformation", health: "blocked",
    key_metric: "7 overdue commitments",
    why: "No owner + blocked vendor evaluation",
    why_expanded: ["No owner assigned", "7 overdue commitments blocking delivery", "Vendor evaluation past deadline", "Blocks O3: Platform delivery"],
    top_commitments: [
      { title: "Complete HRMS vendor evaluation", owner: "KellyTran", status: "overdue" },
      { title: "Review Udoo upgrade business case", owner: "KellyTran", status: "open" },
    ],
    recent_activity: "Vendor evaluation overdue by 14 days",
  },
  {
    id: "aq-3", matter_id: "m-comp", title: "Compliance & Regulatory Framework", health: "blocked",
    key_metric: "5 overdue, no owner",
    why: "Unowned — compliance risk accumulating",
    why_expanded: ["No owner assigned", "5 overdue commitments", "KPMG deliverable past deadline", "Regulatory risk if not addressed"],
    top_commitments: [
      { title: "Deliver KPMG compliance report", owner: "ThuyDT", status: "escalated" },
    ],
    recent_activity: "Escalated to leadership 3d ago — no response",
  },
  {
    id: "aq-4", matter_id: "m-vngg-strat", title: "VNGG Growth & Publishing Strategy", health: "at-risk",
    key_metric: "Owner overloaded (22 open)",
    why: "chrisliu has 32 commitments across 2 matters",
    why_expanded: ["Owner chrisliu has 32 total commitments", "11 overdue across this matter", "Also owns VNGG Publishing Growth (5 overdue)", "Capacity concern — needs rebalancing"],
    top_commitments: [
      { title: "Schedule deep-dive with NC partners", owner: "DavidC", status: "open" },
    ],
    recent_activity: "Active 3h ago but overdue count growing",
  },
  {
    id: "aq-5", matter_id: "m-kpi", title: "VNG 2026 KPI", health: "blocked",
    key_metric: "1 overdue, no owner",
    why: "Critical KPI matter with no ownership",
    why_expanded: ["No owner assigned", "1 overdue commitment", "Affects company-wide KPI alignment"],
    top_commitments: [
      { title: "Email to Thao re budget alignment", owner: "Kelly", status: "overdue" },
    ],
    recent_activity: "No activity for 3 days",
  },
  {
    id: "aq-6", matter_id: "m-erm", title: "ERM Risk Management Framework", health: "blocked",
    key_metric: "5 overdue, 18 open",
    why: "No owner — risk framework stalled",
    why_expanded: ["No owner assigned", "5 overdue commitments", "18 total open — large scope matter", "Blocks compliance objective"],
    top_commitments: [
      { title: "ERM framework final draft", owner: "ThuyDT", status: "escalated" },
    ],
    recent_activity: "Last meaningful progress 2d ago",
  },
];

// ── WORKBENCH (structural issues) ──

export interface WorkbenchItem {
  id: string;
  type: "attention_matter" | "review_matter" | "singleton_thread" | "title_upgrade";
  title: string;
  badge: "attention" | "review" | "singleton" | "title";
  thread_count?: number;
  coherence?: "high" | "medium" | "low";
  matter_id?: string;
  thread_id?: string;
  current_title?: string;
  suggested_title?: string;
  suggested_matter?: string;
  why_joined?: string;
  secondary_candidates?: string[];
}

export const workbenchQueue: WorkbenchItem[] = [
  { id: "wb-1", type: "attention_matter", title: "Performance & Incentive System 2026", badge: "attention", thread_count: 5, coherence: "high", matter_id: "m-perf", why_joined: "5 threads converge around the 2026 incentive redesign: BoD discussion, HR compensation review, STI framework, bonus pool, and performance cycle." },
  { id: "wb-2", type: "attention_matter", title: "HRMS Transformation", badge: "attention", thread_count: 3, coherence: "high", matter_id: "m-hrms", why_joined: "3 threads about HRMS vendor selection, system requirements, and migration planning." },
  { id: "wb-3", type: "review_matter", title: "ERM Risk Management Framework", badge: "review", thread_count: 4, coherence: "medium", matter_id: "m-erm", why_joined: "4 threads about ERM framework — coherence medium because some threads overlap with compliance.", secondary_candidates: ["Compliance & Regulatory Framework"] },
  { id: "wb-4", type: "singleton_thread", title: "CP HR & People Transformation 2026", badge: "singleton", thread_id: "t-04", suggested_matter: "Performance & Incentive System 2026" },
  { id: "wb-5", type: "singleton_thread", title: "IRAS Notice — Company Tax", badge: "singleton", thread_id: "t-05", suggested_matter: null },
  { id: "wb-6", type: "singleton_thread", title: "2026 CP KPI Proposal", badge: "singleton", thread_id: "t-06", suggested_matter: "VNG 2026 KPI" },
  { id: "wb-7", type: "singleton_thread", title: "GreenNode hardware pricing email", badge: "singleton", thread_id: "t-09", suggested_matter: "Hardware Hedging Program 2026" },
  { id: "wb-8", type: "singleton_thread", title: "Legal team offsite notes", badge: "singleton", thread_id: "t-10", suggested_matter: "Compliance & Regulatory Framework" },
  { id: "wb-9", type: "title_upgrade", title: "GMT Monthly Review", badge: "title", matter_id: "m-gmt", current_title: "GMT Monthly Review", suggested_title: "Group Management Team — Recurring Review" },
  { id: "wb-10", type: "title_upgrade", title: "VNG FA Monthly Meeting", badge: "title", matter_id: "m-fa-monthly", current_title: "VNG FA Monthly Meeting", suggested_title: "VNG Finance & Accounting — Monthly Operations Review" },
];

// ── STRATEGY SCAN ──

export interface BUScanCard {
  bu_code: string;
  bu_label: string;
  goal_count: number;
  linked_matters: number;
  coverage: "strong" | "emerging" | "weak";
  unlinked_count: number;
}

export const strategyScanCards: BUScanCard[] = [
  { bu_code: "VNG", bu_label: "VNG-CP", goal_count: 33, linked_matters: 8, coverage: "emerging", unlinked_count: 5 },
  { bu_code: "VNGG", bu_label: "VNGG", goal_count: 1, linked_matters: 2, coverage: "strong", unlinked_count: 0 },
  { bu_code: "ZP", bu_label: "ZaloPay", goal_count: 1, linked_matters: 1, coverage: "emerging", unlinked_count: 0 },
  { bu_code: "GN", bu_label: "GreenNode", goal_count: 1, linked_matters: 2, coverage: "strong", unlinked_count: 1 },
];

export interface BUGoalDetail {
  id: string;
  title: string;
  linked_matters: number;
  blocked: number;
  at_risk: number;
  owner: string;
}

export const strategyScanGoals: Record<string, BUGoalDetail[]> = {
  VNG: [
    { id: "cp-o1", title: "Clear rules so BUs can run independently", linked_matters: 4, blocked: 3, at_risk: 0, owner: "si" },
    { id: "cp-o2", title: "Build the data chain that drives investment decisions", linked_matters: 0, blocked: 0, at_risk: 0, owner: "si" },
    { id: "cp-o3", title: "Ship the platforms that let BUs help themselves", linked_matters: 1, blocked: 1, at_risk: 0, owner: "dto" },
    { id: "cp-o4", title: "Make AI the way CP works, not a side project", linked_matters: 1, blocked: 0, at_risk: 0, owner: "dto" },
  ],
  VNGG: [
    { id: "vngg-01", title: "Diversified gaming revenue across SEA", linked_matters: 2, blocked: 1, at_risk: 0, owner: "kelly" },
  ],
  ZP: [
    { id: "zp-01", title: "Path to profitability for ZaloPay", linked_matters: 1, blocked: 0, at_risk: 0, owner: "kelly" },
  ],
  GN: [
    { id: "gn-01", title: "GreenNode as scaled cloud provider", linked_matters: 2, blocked: 0, at_risk: 0, owner: "kelly" },
  ],
};

// ── GOAL LINKING ──

export interface GoalLinkItem {
  id: string;
  matter_id: string;
  matter_title: string;
  current_goal: string | null;
  recommended_goal: string;
  recommended_goal_id: string;
  confidence: "high" | "medium" | "low";
  alternatives: { goal: string; goal_id: string }[];
  margin: number; // 0-100, how much better than second option
  warning: string | null;
}

export const goalLinkingQueue: GoalLinkItem[] = [
  { id: "gl-1", matter_id: "m-dev-review", matter_title: "DEV Department Review", current_goal: null, recommended_goal: "TSE ways of working", recommended_goal_id: "tse-s1", confidence: "high", alternatives: [{ goal: "AI adoption + coding tools", goal_id: "tse-s4" }], margin: 78, warning: null },
  { id: "gl-2", matter_id: "m-gmt", matter_title: "GMT Monthly Review", current_goal: null, recommended_goal: "VNG 3.0 + Governance", recommended_goal_id: "hr-s1", confidence: "medium", alternatives: [{ goal: "Governance & performance framework", goal_id: "si-s1" }, { goal: "Group governance & SOP modernization", goal_id: "lgc-s1" }], margin: 34, warning: "Broad — could fit multiple objectives" },
  { id: "gl-3", matter_id: "m-fa-monthly", matter_title: "VNG FA Monthly Meeting", current_goal: null, recommended_goal: "Faster closing time", recommended_goal_id: "fa-s1", confidence: "medium", alternatives: [{ goal: "Innovation & automation", goal_id: "fa-s5" }], margin: 45, warning: null },
  { id: "gl-4", matter_id: "m-cap", matter_title: "Capital Markets", current_goal: "Capital market (Fund raising + IPO)", recommended_goal: "Capital market (Fund raising + IPO)", recommended_goal_id: "fa-s3", confidence: "high", alternatives: [], margin: 92, warning: null },
];

// ── HYGIENE ──

export interface ZombieMatter {
  id: string;
  title: string;
  last_activity: string;
  commitment_count: number;
  thread_count: number;
}

export const zombieMatters: ZombieMatter[] = [
  { id: "m-gmt", title: "GMT Monthly Review", last_activity: "45d ago", commitment_count: 4, thread_count: 2 },
  { id: "m-fa-monthly", title: "VNG FA Monthly Meeting", last_activity: "52d ago", commitment_count: 3, thread_count: 1 },
];

export interface StaleThread {
  id: string;
  title: string;
  source: string;
  last_activity: string;
  matter_title: string | null;
}

export const staleThreads: StaleThread[] = [
  { id: "t-10", title: "Legal team offsite notes", source: "document", last_activity: "20d ago", matter_title: null },
  { id: "t-09", title: "GreenNode hardware pricing email", source: "email", last_activity: "12d ago", matter_title: null },
  { id: "t-06", title: "2026 CP KPI Proposal", source: "meeting", last_activity: "10d ago", matter_title: null },
];

export interface TitleUpgrade {
  id: string;
  matter_id: string;
  current: string;
  suggested: string;
}

export const titleUpgrades: TitleUpgrade[] = [
  { id: "tu-1", matter_id: "m-gmt", current: "GMT Monthly Review", suggested: "Group Management Team — Recurring Review" },
  { id: "tu-2", matter_id: "m-fa-monthly", current: "VNG FA Monthly Meeting", suggested: "VNG Finance & Accounting — Monthly Operations Review" },
];

// ── OWNERSHIP SIDEBAR ──

export interface PersonLoad {
  person_key: string;
  display_name: string;
  commitment_count: number;
  overloaded: boolean;
}

export const personLoads: PersonLoad[] = [
  { person_key: "thuytm3", display_name: "ThuyTM3", commitment_count: 12, overloaded: true },
  { person_key: "kelly", display_name: "Kelly", commitment_count: 9, overloaded: true },
  { person_key: "kellytran", display_name: "KellyTran", commitment_count: 6, overloaded: false },
  { person_key: "chrisliu", display_name: "ChrisLiu", commitment_count: 5, overloaded: false },
  { person_key: "thuydt", display_name: "ThuyDT", commitment_count: 4, overloaded: false },
  { person_key: "thaotxn", display_name: "ThaoTXN", commitment_count: 3, overloaded: false },
  { person_key: "thongnv2", display_name: "ThongNV2", commitment_count: 2, overloaded: false },
  { person_key: "davidc", display_name: "DavidC", commitment_count: 1, overloaded: false },
  { person_key: "varuna", display_name: "Varuna", commitment_count: 1, overloaded: false },
  { person_key: "longld2", display_name: "LongLD2", commitment_count: 1, overloaded: false },
];
