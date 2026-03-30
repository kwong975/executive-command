import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, InlineAction, DenseRow } from "@/components/shared";
import { useStrategy, useUnlinkMatter, useLinkMatter, useRunSeed, useArchiveGoal, useAddBUGoal, useAddDeptGoal } from "@/hooks/useStrategy";
import { MatterPickerModal } from "@/components/MatterPickerModal";
import { useNavigate } from "react-router-dom";
import {
  Target, ChevronRight, ChevronDown, Plus,
  X, AlertTriangle, Loader2, Users, ArrowRight,
  RefreshCw, Archive, FileText, Building2
} from "lucide-react";
import { toast } from "sonner";
import { ActionModal, ConfirmModal } from "@/components/ActionModal";

const BU_LABELS: Record<string, string> = {
  VNG: "VNG-CP",
  VNGG: "VNGG",
  ZP: "ZaloPay",
  GN: "GreenNode",
};

const BU_ORDER = ["VNG", "VNGG", "ZP", "GN"];

type GoalData = Record<string, unknown>;
type MatterData = Record<string, unknown>;

export default function StrategyPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useStrategy();
  const unlinkMatter = useUnlinkMatter();
  const linkMatter = useLinkMatter();
  const [linkingGoalId, setLinkingGoalId] = useState<string | null>(null);
  const [archivingGoalId, setArchivingGoalId] = useState<string | null>(null);
  const [showAddBU, setShowAddBU] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const runSeed = useRunSeed();
  const archiveGoal = useArchiveGoal();
  const addBUGoal = useAddBUGoal();
  const addDeptGoal = useAddDeptGoal();
  const [activeBU, setActiveBU] = useState("VNG");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = () => {
    runSeed.mutate(undefined, {
      onSuccess: (data) => {
        const d = data as Record<string, unknown>;
        const msg = `Created: ${d.created ?? 0}, Updated: ${d.updated ?? 0}`;
        setSeedResult(msg);
        toast.success(`Seed complete — ${msg}`);
        setTimeout(() => setSeedResult(null), 5000);
      },
      onError: (e) => toast.error(`Seed failed: ${e.message}`),
    });
  };

  const handleArchive = (goalId: string) => setArchivingGoalId(goalId);

  const confirmArchive = () => {
    if (!archivingGoalId) return;
    archiveGoal.mutate({ goalId: archivingGoalId, buCode: activeBU, reason: "dropped" }, {
      onSuccess: () => toast.success("Goal archived — snapshot saved"),
      onError: (e) => toast.error(`Archive failed: ${e.message}`),
    });
    setArchivingGoalId(null);
  };

  const handleAddBUGoal = (title: string) => {
    addBUGoal.mutate({ bu_code: activeBU, title: title || undefined }, {
      onSuccess: (data) => {
        const d = data as Record<string, unknown>;
        toast.success(`BU goal created: ${d.goal_id}`);
      },
      onError: (e) => toast.error(`Create failed: ${e.message}`),
    });
    setShowAddBU(false);
  };

  const handleAddDeptGoal = (title: string) => {
    if (!deptCode.trim() || !deptName.trim()) return;
    addDeptGoal.mutate({
      bu_code: activeBU,
      department_code: deptCode.trim().toUpperCase(),
      department_name: deptName.trim(),
      title: title || undefined,
    }, {
      onSuccess: (data) => {
        const d = data as Record<string, unknown>;
        toast.success(`Dept goal created: ${d.goal_id}`);
      },
      onError: (e) => toast.error(`Create failed: ${e.message}`),
    });
    setShowAddDept(false);
    setDeptCode("");
    setDeptName("");
  };

  const busData = (data?.bus as Array<Record<string, unknown>>) || [];
  const unlinkedMatters = (data?.unlinked_matters as number) || 0;

  const currentBU = busData.find(b => b.bu_code === activeBU);
  const goals = (currentBU?.goals as GoalData[]) || [];

  const companyGoals = goals.filter(g => g.level === "company");
  const buGoals = goals.filter(g => g.level === "bu");
  const deptGoals = goals.filter(g => g.level === "department");

  const deptsByCode: Record<string, GoalData[]> = {};
  for (const g of deptGoals) {
    const code = (g.department_code as string) || "OTHER";
    if (!deptsByCode[code]) deptsByCode[code] = [];
    deptsByCode[code].push(g);
  }

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) {
    return (
      <AppLayout title="Strategy">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-[13px]">Loading strategy...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Strategy">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* BU Tabs */}
        <div className="border-b border-border/30 px-4 flex items-center gap-1 shrink-0">
          {BU_ORDER.map(bu => {
            const buData = busData.find(b => b.bu_code === bu);
            const goalCount = ((buData?.goals as GoalData[]) || []).length;
            return (
              <button
                key={bu}
                onClick={() => setActiveBU(bu)}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeBU === bu
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {BU_LABELS[bu] || bu}
                {goalCount > 0 && <span className="ml-1.5 text-[10px] font-mono text-muted-foreground tabular-nums">{goalCount}</span>}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            {unlinkedMatters > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] text-warning mr-2">
                <AlertTriangle className="h-3 w-3" />
                {unlinkedMatters} unlinked
              </span>
            )}
            {seedResult && (
              <span className="text-[11px] text-success mr-2">{seedResult}</span>
            )}
            <button onClick={() => setShowAddBU(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-md transition-colors">
              <Plus className="h-3 w-3" />BU Goal
            </button>
            <button onClick={() => setShowAddDept(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-md transition-colors">
              <Building2 className="h-3 w-3" />Dept Goal
            </button>
            <button onClick={handleSeed} disabled={runSeed.isPending} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-md transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3 w-3 ${runSeed.isPending ? "animate-spin" : ""}`} />Seed
            </button>
          </div>
        </div>

        {/* Source info bar */}
        {currentBU?.source_file && (
          <div className="border-b border-border/15 px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground shrink-0 bg-secondary/20">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              <button onClick={() => { navigator.clipboard.writeText(currentBU.source_file as string); }} className="hover:text-foreground transition-colors font-mono" title="Click to copy path">
                {(currentBU.source_file as string).split("/").slice(-2).join("/")}
              </button>
            </span>
            {currentBU.version && <span>v{currentBU.version as number}</span>}
            {currentBU.effective_date && <span>effective {currentBU.effective_date as string}</span>}
            {currentBU.last_updated && <span>updated {currentBU.last_updated as string}</span>}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl">
          {companyGoals.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <Target className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">Long-Term Direction</span>
              </div>
              {companyGoals.map(g => (
                <GoalCard key={g.id as string} goal={g} expanded={expanded[g.id as string]} onToggle={() => toggleExpand(g.id as string)} navigate={navigate} onUnlink={(mid) => unlinkMatter.mutate(mid)} onArchive={() => handleArchive(g.id as string)} onLink={() => setLinkingGoalId(g.id as string)} />
              ))}
            </section>
          )}

          {buGoals.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <Target className="h-3.5 w-3.5 text-foreground/40" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Annual Goals</span>
              </div>
              {buGoals.map(g => (
                <GoalCard key={g.id as string} goal={g} expanded={expanded[g.id as string]} onToggle={() => toggleExpand(g.id as string)} navigate={navigate} onUnlink={(mid) => unlinkMatter.mutate(mid)} onArchive={() => handleArchive(g.id as string)} onLink={() => setLinkingGoalId(g.id as string)} />
              ))}
            </section>
          )}

          {Object.keys(deptsByCode).length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <Users className="h-3.5 w-3.5 text-foreground/40" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Department Goals</span>
              </div>
              {Object.entries(deptsByCode).map(([code, depts]) => (
                <div key={code} className="mb-4">
                  <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 pl-1 uppercase tracking-wider">
                    {(depts[0].department_name as string) || code}
                  </div>
                  {depts.map(g => (
                    <GoalCard key={g.id as string} goal={g} expanded={expanded[g.id as string]} onToggle={() => toggleExpand(g.id as string)} navigate={navigate} onUnlink={(mid) => unlinkMatter.mutate(mid)} onArchive={() => handleArchive(g.id as string)} onLink={() => setLinkingGoalId(g.id as string)} compact />
                  ))}
                </div>
              ))}
            </section>
          )}

          {goals.length === 0 && (
            <div className="text-[13px] text-muted-foreground py-8 text-center">
              No goals defined for {BU_LABELS[activeBU] || activeBU}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={!!archivingGoalId}
        title="Archive Goal"
        description={`This will snapshot the current strategy file, mark the goal as dropped, and re-seed CE. The snapshot is preserved in _history/.`}
        confirmLabel="Archive"
        destructive
        onConfirm={confirmArchive}
        onCancel={() => setArchivingGoalId(null)}
      />
      <ActionModal
        open={showAddBU}
        title="Add BU Goal"
        description={`Add a new goal to ${BU_LABELS[activeBU] || activeBU}`}
        inputLabel="Goal title"
        inputPlaceholder="Leave empty for draft..."
        confirmLabel="Create"
        onConfirm={handleAddBUGoal}
        onCancel={() => setShowAddBU(false)}
      />
      {showAddDept && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => { setShowAddDept(false); setDeptCode(""); setDeptName(""); }}>
          <div className="bg-card border border-border/40 rounded-lg shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3.5 border-b border-border/30">
              <h3 className="text-[14px] font-semibold text-foreground">Add Department Goal</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Add to {BU_LABELS[activeBU] || activeBU}</p>
            </div>
            <div className="px-4 py-3.5 space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Department code</label>
                <input type="text" value={deptCode} onChange={e => setDeptCode(e.target.value)} placeholder="e.g. HRC, FA, DTO"
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50" autoFocus />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Department name</label>
                <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Human Resources"
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/30 bg-secondary/10">
              <button onClick={() => { setShowAddDept(false); setDeptCode(""); setDeptName(""); }} className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleAddDeptGoal("")} disabled={!deptCode.trim() || !deptName.trim()}
                className="px-4 py-1.5 text-[13px] font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm shadow-accent/10">Create</button>
            </div>
          </div>
        </div>
      )}
      <MatterPickerModal
        open={!!linkingGoalId}
        onClose={() => setLinkingGoalId(null)}
        onSelect={(matterId) => {
          if (linkingGoalId) {
            linkMatter.mutate({ matterId, goalId: linkingGoalId }, {
              onSuccess: () => toast.success("Matter linked to goal"),
              onError: (e) => toast.error(`Link failed: ${e.message}`),
            });
          }
        }}
        title="Link Matter to Goal"
      />
    </AppLayout>
  );
}

function GoalCard({ goal, expanded, onToggle, navigate, onUnlink, onArchive, onLink, compact }: {
  goal: GoalData; expanded?: boolean; onToggle: () => void;
  navigate: (path: string) => void; onUnlink: (matterId: string) => void; onArchive: () => void; onLink: () => void; compact?: boolean;
}) {
  const matters = (goal.matters as MatterData[]) || [];
  const matterCount = (goal.matter_count as number) || 0;
  const blocked = (goal.blocked_count as number) || 0;
  const atRisk = (goal.at_risk_count as number) || 0;
  const metric = goal.success_metric as string;
  const target = goal.target as string;
  const owner = goal.owner as string;
  const hasProblems = blocked > 0 || atRisk > 0;
  const title = goal.title as string;
  const isDraft = title.startsWith("[DRAFT]") || !metric;

  return (
    <div className={`border rounded-lg mb-2 transition-all duration-100 ${
      hasProblems ? "border-destructive/30" : "border-border/25"
    } ${isDraft ? "opacity-70 border-dashed" : ""}`}>
      <div className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-secondary/20 transition-colors group" onClick={onToggle}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {matterCount > 0
            ? (expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />)
            : <span className="w-3" />}
          <span className={`${compact ? "text-[13px]" : "text-[13px]"} font-medium truncate`}>{title}</span>
          {isDraft && <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold uppercase shrink-0 border border-accent/20">Draft</span>}
          {blocked > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold shrink-0 border border-destructive/20">{blocked} blocked</span>}
          {atRisk > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-warning/15 text-warning font-semibold shrink-0 border border-warning/20">{atRisk} at risk</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {metric && target && (
            <span className="text-[11px] text-muted-foreground"><span className="font-mono tabular-nums">{target}</span> · {metric}</span>
          )}
          {owner && <span className="text-[11px] font-mono text-muted-foreground">{owner}</span>}
          {matterCount > 0
            ? <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md tabular-nums">{matterCount}</span>
            : <span className="text-[10px] text-warning font-semibold">gap</span>}
          <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1 rounded-md hover:bg-destructive/15 text-muted-foreground/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" title="Archive goal">
            <Archive className="h-3 w-3" />
          </button>
        </div>
      </div>

      {expanded && matters.length > 0 && (
        <div className="border-t border-border/15 px-3 py-1.5">
          {matters.map((m) => (
            <DenseRow key={m.id as string} onClick={() => navigate("/matters")}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <StatusDot status={(m.health_state as string) === "blocked" ? "blocked" : (m.health_state as string) === "at_risk" ? "at-risk" : "active"} />
                <span className="text-[13px] truncate">{m.title as string}</span>
                {(m.overdue as number) > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold tabular-nums">{m.overdue as number}</span>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-muted-foreground">{m.owner as string}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <InlineAction icon={<ArrowRight className="h-3 w-3" />} onClick={() => navigate("/matters")} />
                  <button onClick={(e) => { e.stopPropagation(); onUnlink(m.id as string); }} className="p-1 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </DenseRow>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onLink(); }} className="mt-1.5 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1 py-1 rounded-md hover:bg-secondary transition-colors font-medium">
            <Plus className="h-3 w-3" />Link another matter
          </button>
        </div>
      )}

      {expanded && matters.length === 0 && !isDraft && (
        <div className="border-t border-border/15 px-3.5 py-2.5 text-[11px] text-warning flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> No matters linked — execution gap
          </div>
          <InlineAction icon={<Plus className="h-3 w-3" />} label="Link matter" accent onClick={(e) => { e.stopPropagation(); onLink(); }} />
        </div>
      )}

      {expanded && isDraft && (
        <div className="border-t border-border/15 px-3.5 py-2.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3 w-3" /> Draft — finalize title, metric, and target in Obsidian vault, then re-seed
        </div>
      )}
    </div>
  );
}