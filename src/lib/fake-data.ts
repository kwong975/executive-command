/**
 * Fake data for all API endpoints.
 * Used when running without the real backend (e.g. in Lovable).
 * Reflects the real product model: strategic/operational goals, O1-O4, departments, matters.
 */

// ── TODAY ──

export const fakeToday = {
  decisions: [
    { title: "Performance & Incentive System 2026", context: "Blocked with 16 overdue commitments and no owner", action: "Assign an owner", matter_id: "m-perf", actions: ["open_matter", "assign_owner"], priority: 1 },
    { title: "HRMS Transformation", context: "Blocked with 7 overdue commitments and no owner", action: "Assign an owner", matter_id: "m-hrms", actions: ["open_matter", "assign_owner"], priority: 1 },
    { title: "3 active matters have no owner", context: "Top: Compliance & Regulatory Framework", action: "Assign owners", actions: ["open_matter", "assign_owner"], priority: 2 },
    { title: "You have 7 overdue commitments", context: "Oldest: Email to Thao re department budget alignment", action: "Review and resolve", actions: ["open_matter"], priority: 3 },
    { title: "162 unassigned threads", context: "11 have open commitments", action: "Run cleanup or bulk-assign", actions: ["run_cleanup"], priority: 4 },
  ],
  attention: [
    { id: "m-perf", title: "Performance & Incentive System 2026", type: "blocked", urgency: "critical", overdue: 16, open: 42, owner: "unassigned" },
    { id: "m-hrms", title: "HRMS Transformation", type: "blocked", urgency: "critical", overdue: 7, open: 15, owner: "unassigned" },
    { id: "m-kpi", title: "VNG 2026 KPI", type: "blocked", urgency: "critical", overdue: 1, open: 1, owner: "unassigned" },
    { id: "m-comp", title: "Compliance & Regulatory Framework", type: "blocked", urgency: "critical", overdue: 5, open: 7, owner: "unassigned" },
    { id: "m-erm", title: "ERM Risk Management Framework", type: "blocked", urgency: "critical", overdue: 5, open: 18, owner: "unassigned" },
    { id: "m-vngg-pub", title: "VNGG Publishing Growth", type: "blocked", urgency: "critical", overdue: 5, open: 10, owner: "chrisliu" },
    { id: "m-vngg-strat", title: "VNGG Growth & Publishing Strategy", type: "overloaded", urgency: "warning", open: 22, owner: "chrisliu" },
  ],
  deadlines: [
    { id: "c1", title: "Review the business case for Udoo upgrade", due_at: "2026-03-31", owner_person_key: "kellytran" },
    { id: "c2", title: "Schedule deep-dive sessions with NC partners", due_at: "2026-03-31", owner_person_key: "davidc" },
    { id: "c3", title: "Finalize bonus pool calculation spreadsheet", due_at: "2026-04-02", owner_person_key: "thuytm3" },
  ],
  ceo_overdue: [
    { title: "Email to Thao re department budget alignment", due_at: "12-Mar-2026", matter_title: "VNG 2026 KPI" },
    { title: "Discuss A4B new system with HEP team", due_at: "12-Mar-2026", matter_title: "HRMS Transformation" },
    { title: "Speak with TungVT6 regarding LGR role", due_at: "13-Mar-2026", matter_title: "Performance & Incentive" },
  ],
  ceo_open: [],
  waiting_overdue: [
    { title: "Support on analysis of WD7 decision", owner_person_key: "thuytm3", due_at: "12-Mar-2026", matter_title: "FA Close" },
    { title: "Finalize three-scenario framework", owner_person_key: "thuytm3", due_at: "16-Mar-2026", matter_title: "Performance & Incentive" },
    { title: "Complete HRMS vendor evaluation", owner_person_key: "kellytran", due_at: "18-Mar-2026", matter_title: "HRMS Transformation" },
  ],
  waiting_aging: [
    { title: "Draft governance framework for CEO review", owner_person_key: "thaotxn", matter_title: "VNG 3.0 Governance" },
    { title: "Compile procurement transformation roadmap", owner_person_key: "thongnv2", matter_title: "Procurement" },
  ],
  cleanup: { unassigned_threads: 162, unassigned_with_commits: 11, no_accountable: [
    { id: "m1", title: "GMT Monthly Review", open: 4 },
    { id: "m2", title: "VNG FA Monthly Meeting", open: 3 },
    { id: "m3", title: "DEV Department Review", open: 2 },
  ]},
  recently_resolved: [
    { canonical_title: "2025 Performance Reviews", closed_reason: "all_commitments_done" },
    { canonical_title: "VNG SnI 2026 Planning", closed_reason: "operator_resolved" },
  ],
  system: { active_matters: 21, active_threads: 244, open_commitments: 457, queue_size: 20 },
};

// ── STRATEGY ──

const cpObjectives = [
  { id: "cp-o1-2026", title: "Clear rules so BUs can run independently", description: "BUs know what to comply with, self-serve, or request.", level: "company", bu_code: "VNG", goal_type: "strategic", strategy_pillar: 1, owner: "si", priority: 1, success_metric: "Unified service catalog + governance", target: "Catalog CEO-approved, SOPs enforced", status: "active", parent_goal_id: null, department_code: null, department_name: null, timeframe: "2026", matter_count: 5, blocked_count: 1, at_risk_count: 0, matters: [
    { id: "m-kpi", title: "VNG 2026 KPI", status: "active", health_state: "blocked", owner: "unassigned", overdue: 1 },
  ]},
  { id: "cp-o2-2026", title: "Build the data chain that drives investment decisions", description: "WD7 close feeds dashboards feeds portfolio decisions.", level: "company", bu_code: "VNG", goal_type: "strategic", strategy_pillar: 2, owner: "si", priority: 2, success_metric: "WD7 close + strategic insights", target: "T+7WD P&L, driver model piloted", status: "active", parent_goal_id: null, department_code: null, department_name: null, timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "cp-o3-2026", title: "Ship the platforms that let BUs help themselves", description: "HRMS, FA automation, tech catalog shipped.", level: "company", bu_code: "VNG", goal_type: "strategic", strategy_pillar: 3, owner: "dto", priority: 3, success_metric: "Platform delivery on-track", target: "HR as product, FA 95%+, tech catalog live", status: "active", parent_goal_id: null, department_code: null, department_name: null, timeframe: "2026", matter_count: 1, blocked_count: 1, at_risk_count: 0, matters: [
    { id: "m-hrms", title: "HRMS Transformation", status: "active", health_state: "blocked", owner: "unassigned", overdue: 7 },
  ]},
  { id: "cp-o4-2026", title: "Make AI the way CP works, not a side project", description: "80%+ MAU on AI tools, measured gains.", level: "company", bu_code: "VNG", goal_type: "strategic", strategy_pillar: 4, owner: "dto", priority: 4, success_metric: "80%+ MAU + productivity", target: ">=80% MAU, 50% code by AI", status: "active", parent_goal_id: null, department_code: null, department_name: null, timeframe: "2026", matter_count: 1, blocked_count: 0, at_risk_count: 0, matters: [
    { id: "m-dto", title: "DTO Department Review", status: "active", health_state: "overloaded", owner: "kellytran", overdue: 0 },
  ]},
];

const deptGoals = [
  // O1 children (10)
  { id: "hr-s1", title: "VNG 3.0 + Governance", level: "department", bu_code: "VNG", department_code: "HR", department_name: "Human Resources", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thaotxn", priority: 1, strategy_pillar: 1, success_metric: "Governance signoff", target: "CEO-approved frameworks", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "cbc-s1", title: "VNG 3.0 — Service catalog", level: "department", bu_code: "VNG", department_code: "CBC", department_name: "Corporate Brand & Communications", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thaotxn", priority: 1, strategy_pillar: 1, success_metric: "Catalog approved", target: "CEO-approved", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "lgc-s1", title: "Group governance & SOP modernization", level: "department", bu_code: "VNG", department_code: "LGC", department_name: "Legal & Compliance", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thuydt", priority: 1, strategy_pillar: 1, success_metric: "KPMG framework", target: "SOPs modernized", status: "active", timeframe: "2026", matter_count: 2, blocked_count: 2, at_risk_count: 0, matters: [
    { id: "m-comp", title: "Compliance & Regulatory Framework", status: "active", health_state: "blocked", owner: "unassigned", overdue: 5 },
    { id: "m-erm", title: "ERM Risk Management Framework", status: "active", health_state: "blocked", owner: "unassigned", overdue: 5 },
  ]},
  { id: "si-s1", title: "Governance & performance framework", level: "department", bu_code: "VNG", department_code: "SI", department_name: "Strategy & Investment", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thuytm3", priority: 1, strategy_pillar: 1, success_metric: "Framework endorsed", target: "STI/LTI + CP KPI", status: "active", timeframe: "2026", matter_count: 2, blocked_count: 1, at_risk_count: 0, matters: [
    { id: "m-perf", title: "Performance & Incentive System 2026", status: "active", health_state: "blocked", owner: "unassigned", overdue: 16 },
    { id: "m-kpi", title: "VNG 2026 KPI", status: "active", health_state: "blocked", owner: "unassigned", overdue: 1 },
  ]},
  { id: "si-s2", title: "VNG 3.0 restructuring", level: "department", bu_code: "VNG", department_code: "SI", department_name: "Strategy & Investment", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thuytm3", priority: 2, strategy_pillar: 1, success_metric: "CEO updates", target: "Monthly + VNGG 3.0", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "si-s3", title: "CP Service Catalog Integration", level: "department", bu_code: "VNG", department_code: "SI", department_name: "Strategy & Investment", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thuytm3", priority: 3, strategy_pillar: 1, success_metric: "Unified catalog", target: "CEO-approved", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "proc-s1", title: "Procurement Transformation", level: "department", bu_code: "VNG", department_code: "PROC", department_name: "Procurement", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "thongnv2", priority: 1, strategy_pillar: 1, success_metric: "Roadmap approved", target: "CEO-approved", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "tse-s1", title: "TSE ways of working", level: "department", bu_code: "VNG", department_code: "TSE", department_name: "Technology & Systems Engineering", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "longld2", priority: 1, strategy_pillar: 1, success_metric: "Service catalog", target: "With SLAs", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "tse-s2", title: "Security transformation (VNG 3.0)", level: "department", bu_code: "VNG", department_code: "TSE", department_name: "Technology & Systems Engineering", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "longld2", priority: 2, strategy_pillar: 1, success_metric: "Security model", target: "Risk framework", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "fa-s2", title: "VNG 3.0 governance enhancement", level: "department", bu_code: "VNG", department_code: "FA", department_name: "Finance & Accounting (Group)", goal_type: "strategic", parent_goal_id: "cp-o1-2026", owner: "raymond", priority: 2, strategy_pillar: 1, success_metric: "Governance standardization", target: "Catalog by tiers", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  // O2 children (4)
  { id: "si-s4", title: "Strategic exploration", level: "department", bu_code: "VNG", department_code: "SI", department_name: "Strategy & Investment", goal_type: "strategic", parent_goal_id: "cp-o2-2026", owner: "thuytm3", priority: 4, strategy_pillar: 2, success_metric: "Analyses delivered", target: ">=3 strategic analyses", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "fa-s1", title: "Faster closing time", level: "department", bu_code: "VNG", department_code: "FA", department_name: "Finance & Accounting (Group)", goal_type: "strategic", parent_goal_id: "cp-o2-2026", owner: "raymond", priority: 1, strategy_pillar: 2, success_metric: "Close cycle", target: "T+7WD P&L", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "fa-s3", title: "Capital market (Fund raising + IPO)", level: "department", bu_code: "VNG", department_code: "FA", department_name: "Finance & Accounting (Group)", goal_type: "strategic", parent_goal_id: "cp-o2-2026", owner: "raymond", priority: 3, strategy_pillar: 2, success_metric: "Capital markets", target: "IPO + offshore", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "fa-s4", title: "Strategic insights + driver-based model", level: "department", bu_code: "VNG", department_code: "FA", department_name: "Finance & Accounting (Group)", goal_type: "strategic", parent_goal_id: "cp-o2-2026", owner: "raymond", priority: 4, strategy_pillar: 2, success_metric: "Driver model", target: "Designed Q2, pilot Q4", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  // O3 children (5)
  { id: "hr-s2", title: "HR as a product — model definition & delivery", level: "department", bu_code: "VNG", department_code: "HR", department_name: "Human Resources", goal_type: "strategic", parent_goal_id: "cp-o3-2026", owner: "thaotxn", priority: 2, strategy_pillar: 3, success_metric: "Product model", target: "Three-product model", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "dto-s1", title: "HR + LG + FA transformation delivery", level: "department", bu_code: "VNG", department_code: "DTO", department_name: "Digital Transformation Office", goal_type: "strategic", parent_goal_id: "cp-o3-2026", owner: "kellytran", priority: 1, strategy_pillar: 3, success_metric: "Milestone delivery", target: "95% on-track", status: "active", timeframe: "2026", matter_count: 1, blocked_count: 1, at_risk_count: 0, matters: [{ id: "m-hrms", title: "HRMS Transformation", status: "active", health_state: "blocked", owner: "unassigned", overdue: 7 }] },
  { id: "dto-s3", title: "Tech service catalog with SLAs", level: "department", bu_code: "VNG", department_code: "DTO", department_name: "Digital Transformation Office", goal_type: "strategic", parent_goal_id: "cp-o3-2026", owner: "kellytran", priority: 3, strategy_pillar: 3, success_metric: "Catalog with SLAs", target: "DTO/TSE/A4B", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "a4b-s1", title: "Instantia project", level: "department", bu_code: "VNG", department_code: "A4B", department_name: "Apps for Business", goal_type: "strategic", parent_goal_id: "cp-o3-2026", owner: "trannn2", priority: 1, strategy_pillar: 3, success_metric: "Milestones", target: "Delivered", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "tse-s3", title: "FA transformation + infrastructure", level: "department", bu_code: "VNG", department_code: "TSE", department_name: "Technology & Systems Engineering", goal_type: "strategic", parent_goal_id: "cp-o3-2026", owner: "longld2", priority: 3, strategy_pillar: 3, success_metric: "FA milestones", target: "95% on-track", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  // O4 children (10)
  { id: "hr-s3", title: "AI adoption across organization", level: "department", bu_code: "VNG", department_code: "HR", department_name: "Human Resources", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "thaotxn", priority: 3, strategy_pillar: 4, success_metric: "AI adoption", target: "Quantified gains", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "cbc-s2", title: "AI adoption in CBC workflow", level: "department", bu_code: "VNG", department_code: "CBC", department_name: "Corporate Brand & Communications", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "thaotxn", priority: 2, strategy_pillar: 4, success_metric: "Productivity", target: "Measurable gains", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "lgc-s2", title: "Tech adoption in legal workflow", level: "department", bu_code: "VNG", department_code: "LGC", department_name: "Legal & Compliance", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "thuydt", priority: 2, strategy_pillar: 4, success_metric: "Tech business case", target: "Approved", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "si-s5", title: "AI-first operations", level: "department", bu_code: "VNG", department_code: "SI", department_name: "Strategy & Investment", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "thuytm3", priority: 5, strategy_pillar: 4, success_metric: "AI-first rate", target: "100%", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "dto-s2", title: "AI ready data platform", level: "department", bu_code: "VNG", department_code: "DTO", department_name: "Digital Transformation Office", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "kellytran", priority: 2, strategy_pillar: 4, success_metric: "Platform operational", target: "Built", status: "active", timeframe: "2026", matter_count: 1, blocked_count: 0, at_risk_count: 0, matters: [{ id: "m-dto", title: "DTO Department Review", status: "active", health_state: "overloaded", owner: "kellytran", overdue: 0 }] },
  { id: "dto-s4", title: "AI Coding & Data Tools — 80% MAU", level: "department", bu_code: "VNG", department_code: "DTO", department_name: "Digital Transformation Office", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "kellytran", priority: 4, strategy_pillar: 4, success_metric: "MAU + code ratio", target: "80% MAU, 50% code", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "a4b-s2", title: "AI Coding Tools Adoption", level: "department", bu_code: "VNG", department_code: "A4B", department_name: "Apps for Business", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "trannn2", priority: 2, strategy_pillar: 4, success_metric: "Coding adoption", target: "80% MAU", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "a4b-s3", title: "TDF/VNGWay adoption", level: "department", bu_code: "VNG", department_code: "A4B", department_name: "Apps for Business", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "trannn2", priority: 3, strategy_pillar: 4, success_metric: "TDF adoption", target: ">=80%", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "tse-s4", title: "AI adoption + coding tools", level: "department", bu_code: "VNG", department_code: "TSE", department_name: "Technology & Systems Engineering", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "longld2", priority: 4, strategy_pillar: 4, success_metric: "AI + coding", target: "30% time reduction", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "fa-s5", title: "Innovation & automation", level: "department", bu_code: "VNG", department_code: "FA", department_name: "Finance & Accounting (Group)", goal_type: "strategic", parent_goal_id: "cp-o4-2026", owner: "raymond", priority: 5, strategy_pillar: 4, success_metric: "Automation efficiency", target: ">=70% with gains", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  // Operational (3)
  { id: "cbc-op1", title: "Strategic partnership and events program", level: "department", bu_code: "VNG", department_code: "CBC", department_name: "Corporate Brand & Communications", goal_type: "operational", parent_goal_id: null, owner: "thaotxn", priority: 10, success_metric: "Events delivered", target: "4 flagship events", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "proc-op1", title: "Procurement cost optimization", level: "department", bu_code: "VNG", department_code: "PROC", department_name: "Procurement", goal_type: "operational", parent_goal_id: null, owner: "thongnv2", priority: 10, success_metric: "Cost savings", target: "Measurable savings", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
  { id: "cfoo-op1", title: "ESOP & capital table management", level: "department", bu_code: "VNG", department_code: "CFOO", department_name: "CFO Office", goal_type: "operational", parent_goal_id: null, owner: "varuna", priority: 10, success_metric: "ESOP milestones", target: "On-schedule", status: "active", timeframe: "2026", matter_count: 0, blocked_count: 0, at_risk_count: 0, matters: [] },
];

// Light goals for other BUs
const vnggGoals = [
  { id: "vngg-lt-01", title: "Diversified gaming revenue across SEA", level: "bu", bu_code: "VNGG", goal_type: "strategic", owner: "kelly", priority: 1, success_metric: "SEA revenue share", target: "30% by 2028", status: "active", timeframe: "2026-2028", parent_goal_id: null, department_code: null, department_name: null, matter_count: 2, blocked_count: 1, at_risk_count: 0, matters: [
    { id: "m-vngg-pub", title: "VNGG Publishing Growth", status: "active", health_state: "blocked", owner: "chrisliu", overdue: 5 },
    { id: "m-vngg-strat", title: "VNGG Growth & Publishing Strategy", status: "active", health_state: "overloaded", owner: "chrisliu", overdue: 11 },
  ]},
];
const zpGoals = [
  { id: "zp-lt-01", title: "Path to profitability for ZaloPay", level: "bu", bu_code: "ZP", goal_type: "strategic", owner: "kelly", priority: 1, success_metric: "Operating margin", target: "Breakeven by 2027", status: "active", timeframe: "2026-2028", parent_goal_id: null, department_code: null, department_name: null, matter_count: 1, blocked_count: 0, at_risk_count: 0, matters: [
    { id: "m-zp", title: "ZaloPay Growth & Development", status: "active", health_state: "healthy", owner: "kelly", overdue: 0 },
  ]},
];
const gnGoals = [
  { id: "gn-lt-01", title: "GreenNode as scaled cloud provider", level: "bu", bu_code: "GN", goal_type: "strategic", owner: "kelly", priority: 1, success_metric: "External revenue", target: "40% by 2028", status: "active", timeframe: "2026-2028", parent_goal_id: null, department_code: null, department_name: null, matter_count: 2, blocked_count: 0, at_risk_count: 0, matters: [
    { id: "m-cap", title: "Capital Markets", status: "active", health_state: "healthy", owner: "kelly", overdue: 0 },
    { id: "m-hw", title: "Hardware Hedging Program 2026", status: "active", health_state: "healthy", owner: "kelly", overdue: 0 },
  ]},
];

export const fakeStrategy = {
  bus: [
    { bu_code: "VNG", goals: [...cpObjectives, ...deptGoals], source_file: "05-strategy/cp-objectives-2026.md", version: 2, effective_date: "2026-04-01", last_updated: "2026-03-31" },
    { bu_code: "VNGG", goals: vnggGoals },
    { bu_code: "ZP", goals: zpGoals },
    { bu_code: "GN", goals: gnGoals },
  ],
  total_goals: cpObjectives.length + deptGoals.length + vnggGoals.length + zpGoals.length + gnGoals.length,
  total_linked_matters: 12,
  unlinked_matters: 9,
};

// ── MATTERS ──

export const fakeMatters = {
  matters: [
    { id: "m-perf", canonical_title: "Performance & Incentive System 2026", status: "active", health_state: "blocked", routing_owner: "unassigned", priority: 5, severity: 3, attention_score: 0.9, overdue_commitments: 16, open_commitments: 42, total_commitments: 42, last_activity_at: "2026-03-29", goal_id: "si-s1", bu: "VNG", participants: ["thuytm3", "thaotxn", "camvtd"], created_at: "2026-01-15" },
    { id: "m-hrms", canonical_title: "HRMS Transformation", status: "active", health_state: "blocked", routing_owner: "unassigned", priority: 4, severity: 3, attention_score: 0.85, overdue_commitments: 7, open_commitments: 15, total_commitments: 15, last_activity_at: "2026-03-28", goal_id: "dto-s1", bu: "VNG", participants: ["kellytran", "longld2"], created_at: "2026-02-01" },
    { id: "m-comp", canonical_title: "Compliance & Regulatory Framework", status: "active", health_state: "blocked", routing_owner: "unassigned", priority: 3, severity: 2, attention_score: 0.7, overdue_commitments: 5, open_commitments: 7, total_commitments: 7, last_activity_at: "2026-03-27", goal_id: "lgc-s1", bu: "VNG", participants: ["thuydt"], created_at: "2026-01-20" },
    { id: "m-kpi", canonical_title: "VNG 2026 KPI", status: "active", health_state: "blocked", routing_owner: "unassigned", priority: 3, severity: 2, attention_score: 0.65, overdue_commitments: 1, open_commitments: 1, total_commitments: 1, last_activity_at: "2026-03-25", goal_id: "si-s1", bu: "VNG", participants: ["thuytm3"], created_at: "2026-01-10" },
    { id: "m-erm", canonical_title: "ERM Risk Management Framework", status: "active", health_state: "blocked", routing_owner: "unassigned", priority: 3, severity: 2, attention_score: 0.6, overdue_commitments: 5, open_commitments: 18, total_commitments: 18, last_activity_at: "2026-03-26", goal_id: "lgc-s1", bu: "VNG", participants: ["thuydt", "kelly"], created_at: "2026-02-05" },
    { id: "m-vngg-pub", canonical_title: "VNGG Publishing Growth", status: "active", health_state: "blocked", routing_owner: "chrisliu", priority: 3, severity: 2, attention_score: 0.55, overdue_commitments: 5, open_commitments: 10, total_commitments: 10, last_activity_at: "2026-03-29", bu: "VNGG", participants: ["chrisliu"], created_at: "2026-01-08" },
    { id: "m-dto", canonical_title: "DTO Department Review", status: "active", health_state: "overloaded", routing_owner: "kellytran", priority: 2, severity: 1, attention_score: 0.4, overdue_commitments: 0, open_commitments: 8, total_commitments: 8, last_activity_at: "2026-03-28", goal_id: "dto-s2", bu: "VNG", participants: ["kellytran", "longld2"], created_at: "2026-03-01" },
    { id: "m-vngg-strat", canonical_title: "VNGG Growth & Publishing Strategy", status: "active", health_state: "overloaded", routing_owner: "chrisliu", priority: 2, severity: 1, attention_score: 0.35, overdue_commitments: 11, open_commitments: 22, total_commitments: 22, last_activity_at: "2026-03-29", bu: "VNGG", participants: ["chrisliu", "kelly"], created_at: "2025-12-01" },
    { id: "m-exec", canonical_title: "VNG Group Strategic Execution 2026", status: "active", health_state: "healthy", routing_owner: "kelly", priority: 2, severity: 1, attention_score: 0.3, overdue_commitments: 2, open_commitments: 5, total_commitments: 5, last_activity_at: "2026-03-20", goal_id: "cp-o1-2026", bu: "VNG", participants: ["kelly", "thuytm3", "raymond"], created_at: "2026-01-02" },
    { id: "m-zp", canonical_title: "ZaloPay Growth & Development", status: "active", health_state: "healthy", routing_owner: "kelly", priority: 2, severity: 1, attention_score: 0.2, overdue_commitments: 0, open_commitments: 3, total_commitments: 3, last_activity_at: "2026-03-25", bu: "ZP", participants: ["kelly"], created_at: "2026-02-15" },
    { id: "m-cap", canonical_title: "Capital Markets", status: "active", health_state: "healthy", routing_owner: "varuna", priority: 2, severity: 1, attention_score: 0.15, overdue_commitments: 0, open_commitments: 2, total_commitments: 2, last_activity_at: "2026-03-22", goal_id: "fa-s3", bu: "GN", participants: ["varuna", "raymond"], created_at: "2026-02-20" },
    { id: "m-hw", canonical_title: "Hardware Hedging Program 2026", status: "active", health_state: "healthy", routing_owner: "kelly", priority: 1, severity: 1, attention_score: 0.1, overdue_commitments: 0, open_commitments: 1, total_commitments: 1, last_activity_at: "2026-03-18", bu: "GN", participants: ["kelly"], created_at: "2026-03-10" },
    { id: "m-gmt", canonical_title: "GMT Monthly Review", status: "active", health_state: "drifting", routing_owner: "unassigned", priority: 1, severity: 1, attention_score: 0.08, overdue_commitments: 0, open_commitments: 4, total_commitments: 4, last_activity_at: "2026-02-15", bu: "VNG", participants: [], created_at: "2025-11-01" },
    { id: "m-fa-monthly", canonical_title: "VNG FA Monthly Meeting", status: "active", health_state: "drifting", routing_owner: "unassigned", priority: 1, severity: 1, attention_score: 0.06, overdue_commitments: 0, open_commitments: 3, total_commitments: 3, last_activity_at: "2026-02-10", bu: "VNG", participants: [], created_at: "2025-10-15" },
    { id: "m-dev-review", canonical_title: "DEV Department Review", status: "active", health_state: "healthy", routing_owner: "longld2", priority: 1, severity: 1, attention_score: 0.05, overdue_commitments: 0, open_commitments: 2, total_commitments: 2, last_activity_at: "2026-03-20", bu: "VNG", participants: ["longld2"], created_at: "2026-03-15" },
  ],
  count: 15,
};

export const fakeMatterDetail = {
  id: "m-perf", canonical_title: "Performance & Incentive System 2026", status: "active", health_state: "blocked", routing_owner: "unassigned", goal_id: "si-s1",
  threads: [
    { id: "t1", title: "BoD March 2026 — Incentive Framework", state: "active", thread_type: "meeting", last_activity_at: "2026-03-28", matter_id: "m-perf" },
    { id: "t2", title: "HR Compensation Review Q1", state: "active", thread_type: "meeting", last_activity_at: "2026-03-25", matter_id: "m-perf" },
  ],
  commitments: [
    { id: "c1", title: "Finalize bonus pool calculation", status: "overdue", owner_person_key: "thuytm3", owner_display_name: "ThuyTM3", due_at: "2026-03-16" },
    { id: "c2", title: "Review three-scenario framework", status: "overdue", owner_person_key: "thuytm3", owner_display_name: "ThuyTM3", due_at: "2026-03-16" },
    { id: "c3", title: "Prepare CEO briefing on STI structure", status: "open", owner_person_key: "kelly", owner_display_name: "Kelly", due_at: "2026-04-15" },
  ],
  artifacts: [
    { id: "a1", title: "BoD Meeting March 2026", source_type: "meeting", artifact_at: "2026-03-15" },
    { id: "a2", title: "HR Comp Review Follow-up", source_type: "email", artifact_at: "2026-03-20" },
  ],
  persons: [
    { person_key: "thuytm3", display_name: "ThuyTM3", role: "stakeholder" },
    { person_key: "thaotxn", display_name: "ThaoTXN", role: "stakeholder" },
    { person_key: "camvtd", display_name: "CamVTD", role: "stakeholder" },
    { person_key: "kelly", display_name: "Kelly", role: "stakeholder" },
  ],
};

export const fakeUnassigned = {
  threads: [
    { id: "ut1", title: "CP HR & People Transformation 2026", thread_type: "meeting", last_activity_at: "2026-03-20" },
    { id: "ut2", title: "IRAS Notice — Company Tax", thread_type: "email", last_activity_at: "2026-03-22" },
    { id: "ut3", title: "2026 CP KPI Proposal", thread_type: "meeting", last_activity_at: "2026-03-18" },
  ],
  count: 162,
};

// ── HEALTH ──

export const fakeHealth = { status: "ok", gateway_connected: true };
export const fakeStatus = { gateway: "connected", agents: [{ id: "atlas", status: "active" }, { id: "syssie", status: "active" }, { id: "rigby", status: "idle" }], crons: { total: 5, enabled: 5, failed: 0 } };
