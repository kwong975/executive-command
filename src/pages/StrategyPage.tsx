import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction } from "@/components/shared";
import { goals as mockGoals, matters as mockMatters, type Goal, type Matter } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import {
  Plus, ChevronRight, ChevronDown, AlertTriangle,
  Loader2, Link2, User, Edit3, Check, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ===== STRATEGY DATA MODEL =====

interface StrategyPillar {
  id: string;
  name: string;
  description: string;
  objectiveIds: string[];
}

interface Objective {
  id: string;
  name: string;
  description: string;
  pillarId: string;
  deptGoalIds: string[];
}

interface DeptGoal {
  id: string;
  name: string;
  owner: string;
  goalType: "strategic" | "operational";
  objectiveId: string;
  matterIds: string[];
  blockedCount: number;
  coverage: "strong" | "emerging" | "weak";
}

// Build graph data from mock
const pillars: StrategyPillar[] = [
  {
    id: "sp1",
    name: "Platform Leadership",
    description: "Establish market-leading platform across all BUs",
    objectiveIds: ["o1", "o2"],
  },
  {
    id: "sp2",
    name: "Customer Excellence",
    description: "Reduce churn and increase customer lifetime value",
    objectiveIds: ["o3"],
  },
  {
    id: "sp3",
    name: "Operational Autonomy",
    description: "Build AI-first autonomous operations",
    objectiveIds: ["o4"],
  },
];

const objectives: Objective[] = [
  { id: "o1", name: "Ship world-class developer platform", description: "Best-in-class APIs, SDKs, and developer tools", pillarId: "sp1", deptGoalIds: ["dg1", "dg2"] },
  { id: "o2", name: "Reach 10K active users by Q2", description: "Grow platform adoption through paid & organic", pillarId: "sp1", deptGoalIds: ["dg3"] },
  { id: "o3", name: "Reduce enterprise churn below 5%", description: "Identify and fix root causes of churn", pillarId: "sp2", deptGoalIds: ["dg4", "dg5"] },
  { id: "o4", name: "Operational excellence — 95% commitment rate", description: "AI-driven ops with high reliability", pillarId: "sp3", deptGoalIds: ["dg6"] },
];

const deptGoalsData: DeptGoal[] = [
  { id: "dg1", name: "API v2.3 full release", owner: "Rigby", goalType: "strategic", objectiveId: "o1", matterIds: ["m2"], blockedCount: 1, coverage: "emerging" },
  { id: "dg2", name: "99.95% platform uptime", owner: "Syssie", goalType: "operational", objectiveId: "o1", matterIds: ["m6"], blockedCount: 0, coverage: "strong" },
  { id: "dg3", name: "Q1 growth campaign execution", owner: "Atlas", goalType: "strategic", objectiveId: "o2", matterIds: ["m1"], blockedCount: 0, coverage: "strong" },
  { id: "dg4", name: "Customer churn root cause analysis", owner: "Noor", goalType: "strategic", objectiveId: "o3", matterIds: ["m3"], blockedCount: 1, coverage: "weak" },
  { id: "dg5", name: "Expand payment coverage", owner: "Rigby", goalType: "operational", objectiveId: "o3", matterIds: ["m5"], blockedCount: 0, coverage: "weak" },
  { id: "dg6", name: "Q1 ops review & commitment tracking", owner: "ThuyTM3", goalType: "operational", objectiveId: "o4", matterIds: ["m4"], blockedCount: 0, coverage: "strong" },
];

const coverageColor = {
  strong: "bg-success",
  emerging: "bg-warning",
  weak: "bg-destructive",
};

const coverageLabel = {
  strong: "Strong",
  emerging: "Emerging",
  weak: "Weak",
};

// ===== MAIN PAGE =====

export default function StrategyPage() {
  const navigate = useNavigate();
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedDeptGoals, setExpandedDeptGoals] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number; highlight?: boolean }[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleObjective = (id: string) => {
    setExpandedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        // max 3 expanded
        if (next.size >= 3) {
          const first = next.values().next().value;
          if (first) next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  };

  const toggleDeptGoal = (id: string) => {
    setExpandedDeptGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEdit = (nodeId: string, currentValue: string) => {
    setEditingNode(nodeId);
    setEditValue(currentValue);
  };

  const saveEdit = (nodeId: string) => {
    if (editValue.trim()) {
      toast.success(`Updated: "${editValue.trim()}"`);
    }
    setEditingNode(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditValue("");
  };

  // Calculate connections
  const updateConnections = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const lines: typeof connections = [];

    const getCenter = (id: string): { x: number; y: number } | null => {
      const el = nodeRefs.current[id];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left - rect.left + scrollLeft + r.width,
        y: r.top - rect.top + scrollTop + r.height / 2,
      };
    };

    const getLeft = (id: string): { x: number; y: number } | null => {
      const el = nodeRefs.current[id];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left - rect.left + scrollLeft,
        y: r.top - rect.top + scrollTop + r.height / 2,
      };
    };

    // Pillar → Objective
    for (const p of pillars) {
      const from = getCenter(p.id);
      if (!from) continue;
      for (const oId of p.objectiveIds) {
        const to = getLeft(oId);
        if (!to) continue;
        const isHovered = hoveredNode === p.id || hoveredNode === oId;
        lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, highlight: isHovered });
      }
    }

    // Objective → DeptGoal (only if expanded)
    for (const o of objectives) {
      if (!expandedObjectives.has(o.id)) continue;
      const from = getCenter(o.id);
      if (!from) continue;
      for (const dgId of o.deptGoalIds) {
        const to = getLeft(dgId);
        if (!to) continue;
        const isHovered = hoveredNode === o.id || hoveredNode === dgId;
        lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, highlight: isHovered });
      }
    }

    // DeptGoal → Matter (only if expanded)
    for (const dg of deptGoalsData) {
      if (!expandedDeptGoals.has(dg.id)) continue;
      const from = getCenter(dg.id);
      if (!from) continue;
      for (const mId of dg.matterIds) {
        const to = getLeft(`matter-${mId}`);
        if (!to) continue;
        const isHovered = hoveredNode === dg.id || hoveredNode === `matter-${mId}`;
        lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, highlight: isHovered });
      }
    }

    setConnections(lines);
  }, [expandedObjectives, expandedDeptGoals, hoveredNode]);

  useEffect(() => {
    updateConnections();
    const timer = setTimeout(updateConnections, 100);
    return () => clearTimeout(timer);
  }, [updateConnections]);

  useEffect(() => {
    window.addEventListener("resize", updateConnections);
    return () => window.removeEventListener("resize", updateConnections);
  }, [updateConnections]);

  // Determine which dept goals & matters to show
  const visibleDeptGoals = deptGoalsData.filter(dg =>
    objectives.some(o => expandedObjectives.has(o.id) && o.deptGoalIds.includes(dg.id))
  );

  const visibleMatterIds = new Set<string>();
  for (const dg of deptGoalsData) {
    if (expandedDeptGoals.has(dg.id)) {
      dg.matterIds.forEach(id => visibleMatterIds.add(id));
    }
  }
  const visibleMatters = mockMatters.filter(m => visibleMatterIds.has(m.id));

  return (
    <AppLayout title="Strategy">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header bar */}
        <div className="h-11 border-b border-border/50 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strategy Execution Map</span>
            <span className="text-xs text-muted-foreground">
              {pillars.length} pillars · {objectives.length} objectives · {deptGoalsData.length} dept goals · {mockMatters.length} matters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" /> Strong
              <span className="h-2 w-2 rounded-full bg-warning ml-2" /> Emerging
              <span className="h-2 w-2 rounded-full bg-destructive ml-2" /> Weak
            </span>
          </div>
        </div>

        {/* Graph area */}
        <div ref={containerRef} className="flex-1 overflow-auto relative p-6">
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minWidth: "100%", minHeight: "100%" }}>
            {connections.map((c, i) => (
              <path
                key={i}
                d={`M ${c.x1} ${c.y1} C ${c.x1 + 60} ${c.y1}, ${c.x2 - 60} ${c.y2}, ${c.x2} ${c.y2}`}
                fill="none"
                stroke={c.highlight ? "hsl(var(--accent))" : "hsl(var(--border))"}
                strokeWidth={c.highlight ? 2 : 1}
                opacity={c.highlight ? 0.8 : 0.4}
                className="transition-all duration-150"
              />
            ))}
          </svg>

          {/* 4-column layout */}
          <div className="relative z-10 flex gap-10 min-h-full" style={{ minWidth: "1100px" }}>
            {/* Column 1: Strategy Pillars */}
            <div className="w-[220px] shrink-0 flex flex-col gap-3 pt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Strategy Pillars
              </div>
              {pillars.map(p => (
                <GraphNode
                  key={p.id}
                  ref={(el) => { nodeRefs.current[p.id] = el; }}
                  onMouseEnter={() => setHoveredNode(p.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  highlighted={hoveredNode === p.id}
                >
                  <EditableText
                    value={p.name}
                    editing={editingNode === p.id}
                    onStartEdit={() => startEdit(p.id, p.name)}
                    onSave={() => saveEdit(p.id)}
                    onCancel={cancelEdit}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    className="text-sm font-semibold"
                  />
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                  <div className="text-xs text-muted-foreground mt-2 font-mono tabular-nums">
                    {p.objectiveIds.length} objectives
                  </div>
                </GraphNode>
              ))}
            </div>

            {/* Column 2: Objectives */}
            <div className="w-[250px] shrink-0 flex flex-col gap-3 pt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Objectives
              </div>
              {objectives.map(o => {
                const isExpanded = expandedObjectives.has(o.id);
                const dgs = deptGoalsData.filter(dg => o.deptGoalIds.includes(dg.id));
                const totalMatters = dgs.reduce((s, dg) => s + dg.matterIds.length, 0);
                const totalBlocked = dgs.reduce((s, dg) => s + dg.blockedCount, 0);

                return (
                  <GraphNode
                    key={o.id}
                    ref={(el) => { nodeRefs.current[o.id] = el; }}
                    onClick={() => toggleObjective(o.id)}
                    onMouseEnter={() => setHoveredNode(o.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    highlighted={hoveredNode === o.id}
                    expandable
                    expanded={isExpanded}
                  >
                    <EditableText
                      value={o.name}
                      editing={editingNode === o.id}
                      onStartEdit={() => startEdit(o.id, o.name)}
                      onSave={() => saveEdit(o.id)}
                      onCancel={cancelEdit}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      className="text-sm font-medium"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">{totalMatters} matters</span>
                      {totalBlocked > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold tabular-nums">
                          {totalBlocked} blocked
                        </span>
                      )}
                    </div>
                    {/* Hover action */}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                      <InlineAction icon={<Plus className="h-3 w-3" />} label="Add dept goal" onClick={(e) => { e.stopPropagation(); toast.info("Add dept goal flow"); }} />
                    </div>
                  </GraphNode>
                );
              })}
            </div>

            {/* Column 3: Department Goals */}
            <div className="w-[260px] shrink-0 flex flex-col gap-3 pt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Department Goals
              </div>
              {visibleDeptGoals.length === 0 && (
                <div className="text-xs text-muted-foreground px-1 py-4">
                  Click an objective to expand dept goals
                </div>
              )}
              {visibleDeptGoals.map(dg => {
                const isExpanded = expandedDeptGoals.has(dg.id);
                return (
                  <GraphNode
                    key={dg.id}
                    ref={(el) => { nodeRefs.current[dg.id] = el; }}
                    onClick={() => toggleDeptGoal(dg.id)}
                    onMouseEnter={() => setHoveredNode(dg.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    highlighted={hoveredNode === dg.id}
                    expandable
                    expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("h-2 w-2 rounded-full shrink-0", coverageColor[dg.coverage])} />
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{coverageLabel[dg.coverage]}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{dg.goalType}</span>
                    </div>
                    <EditableText
                      value={dg.name}
                      editing={editingNode === dg.id}
                      onStartEdit={() => startEdit(dg.id, dg.name)}
                      onSave={() => saveEdit(dg.id)}
                      onCancel={cancelEdit}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      className="text-sm font-medium"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {dg.owner}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">{dg.matterIds.length} matters</span>
                      {dg.blockedCount > 0 && (
                        <span className="text-xs text-destructive font-semibold">{dg.blockedCount} blocked</span>
                      )}
                    </div>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                      <InlineAction icon={<Link2 className="h-3 w-3" />} label="Link matter" onClick={(e) => { e.stopPropagation(); toast.info("Link matter flow"); }} />
                      <InlineAction icon={<User className="h-3 w-3" />} label="Assign" onClick={(e) => { e.stopPropagation(); toast.info("Assign owner flow"); }} />
                    </div>
                  </GraphNode>
                );
              })}
            </div>

            {/* Column 4: Matters */}
            <div className="w-[240px] shrink-0 flex flex-col gap-3 pt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Matters
              </div>
              {visibleMatters.length === 0 && (
                <div className="text-xs text-muted-foreground px-1 py-4">
                  Expand a dept goal to see linked matters
                </div>
              )}
              {visibleMatters.map(m => (
                <div
                  key={m.id}
                  ref={(el) => { nodeRefs.current[`matter-${m.id}`] = el; }}
                  onMouseEnter={() => setHoveredNode(`matter-${m.id}`)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => navigate("/matters")}
                  className={cn(
                    "rounded-lg border p-3.5 cursor-pointer transition-all duration-150 group",
                    hoveredNode === `matter-${m.id}` ? "border-accent/50 shadow-sm bg-accent/5" : "border-border/40 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={m.status} />
                    <span className="text-sm font-medium truncate">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{m.owner}</span>
                    <span>{m.lastActivity}</span>
                    {m.overdueCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold tabular-nums">{m.overdueCount}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty states for expanded dept goals with no matters */}
              {deptGoalsData
                .filter(dg => expandedDeptGoals.has(dg.id) && dg.matterIds.length === 0)
                .map(dg => (
                  <div
                    key={`empty-${dg.id}`}
                    className="rounded-lg border border-dashed border-warning/40 p-3.5"
                  >
                    <div className="flex items-center gap-2 text-xs text-warning mb-2">
                      <AlertTriangle className="h-3 w-3" />
                      No execution yet
                    </div>
                    <InlineAction
                      icon={<Plus className="h-3 w-3" />}
                      label="Create matter"
                      accent
                      onClick={() => toast.info("Create matter flow")}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ===== GRAPH NODE =====

const GraphNode = ({
  ref,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  highlighted,
  expandable,
  expanded,
}: {
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  highlighted?: boolean;
  expandable?: boolean;
  expanded?: boolean;
}) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "rounded-lg border p-3.5 transition-all duration-150 group relative",
        onClick && "cursor-pointer",
        highlighted ? "border-accent/50 shadow-sm bg-accent/5" : "border-border/40 hover:border-border",
      )}
    >
      {expandable && (
        <div className="absolute top-3 right-3">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// ===== EDITABLE TEXT =====

function EditableText({
  value,
  editing,
  onStartEdit,
  onSave,
  onCancel,
  editValue,
  setEditValue,
  className,
}: {
  value: string;
  editing: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editValue: string;
  setEditValue: (v: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          className="flex-1 text-sm bg-secondary rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent/50 border border-border/50"
        />
        <button onClick={onSave} className="p-1 rounded hover:bg-success/20 text-success transition-colors">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={onCancel} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground transition-colors">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group/edit">
      <span className={className}>{value}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
        className="p-0.5 rounded hover:bg-secondary text-muted-foreground/0 group-hover/edit:text-muted-foreground transition-all"
      >
        <Edit3 className="h-3 w-3" />
      </button>
    </div>
  );
}
