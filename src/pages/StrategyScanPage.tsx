import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusDot, StatusPill } from "@/components/shared";
import { useStrategy } from "@/hooks/useStrategy";
import { useMatters } from "@/hooks/useMatters";
import { adaptMatterListItem } from "@/lib/matters-adapter";
import { useNavigate } from "react-router-dom";
import {
  Loader2, AlertTriangle, Target, Building2, ArrowRight,
  TrendingDown, CheckCircle2, Minus
} from "lucide-react";

const BU_ORDER = ["VNG", "VNGG", "ZP", "GN"];
const BU_LABELS: Record<string, string> = { VNG: "VNG-CP", VNGG: "VNGG", ZP: "ZaloPay", GN: "GreenNode" };

type GoalData = Record<string, unknown>;

export default function StrategyScanPage() {
  const navigate = useNavigate();
  const { data: stratData, isLoading: stratLoading } = useStrategy();
  const { data: mattersData } = useMatters(100);
  const [activeBU, setActiveBU] = useState("VNG");

  const busData = (stratData?.bus as Array<Record<string, unknown>>) || [];
  const unlinkedMatters = (stratData?.unlinked_matters as number) || 0;

  // Aggregate data for active BU
  const scan = useMemo(() => {
    const bu = busData.find(b => b.bu_code === activeBU);
    if (!bu) return null;

    const goals = (bu.goals as GoalData[]) || [];
    const cpObjectives = goals.filter(g => g.level === "company");
    const strategicGoals = goals.filter(g => g.goal_type === "strategic" && g.level === "department");
    const operationalGoals = goals.filter(g => g.goal_type === "operational");

    const totalLinked = goals.reduce((s, g) => s + ((g.matter_count as number) || 0), 0);
    const blockedGoals = goals.filter(g => ((g.blocked_count as number) || 0) > 0);
    const atRiskGoals = goals.filter(g => ((g.at_risk_count as number) || 0) > 0);
    const unlinkedGoals = goals.filter(g => g.level === "department" && ((g.matter_count as number) || 0) === 0);

    // Objective coverage
    const objectiveCoverage = cpObjectives.map(obj => {
      const children = goals.filter(g => g.parent_goal_id === obj.id);
      const childMatters = children.reduce((s, g) => s + ((g.matter_count as number) || 0), 0);
      const directMatters = (obj.matter_count as number) || 0;
      const totalMatters = directMatters + childMatters;
      const childBlocked = children.filter(g => ((g.blocked_count as number) || 0) > 0).length;
      const childAtRisk = children.filter(g => ((g.at_risk_count as number) || 0) > 0).length;

      let coverage: "strong" | "emerging" | "weak" = "weak";
      if (totalMatters >= 3) coverage = "strong";
      else if (totalMatters >= 1) coverage = "emerging";

      return {
        id: obj.id as string,
        title: obj.title as string,
        childCount: children.length,
        matterCount: totalMatters,
        blockedCount: childBlocked,
        atRiskCount: childAtRisk,
        coverage,
      };
    });

    // Department heatmap
    const deptMap: Record<string, { name: string; goals: number; linked: number; unassigned: number; blocked: number; atRisk: number }> = {};
    for (const g of goals) {
      if (g.level !== "department") continue;
      const code = (g.department_code as string) || "OTHER";
      const name = (g.department_name as string) || code;
      if (!deptMap[code]) deptMap[code] = { name, goals: 0, linked: 0, unassigned: 0, blocked: 0, atRisk: 0 };
      deptMap[code].goals++;
      deptMap[code].linked += (g.matter_count as number) || 0;
      if (((g.matter_count as number) || 0) === 0) deptMap[code].unassigned++;
      if (((g.blocked_count as number) || 0) > 0) deptMap[code].blocked++;
      if (((g.at_risk_count as number) || 0) > 0) deptMap[code].atRisk++;
    }
    const departments = Object.entries(deptMap)
      .map(([code, d]) => ({ code, ...d }))
      .sort((a, b) => (b.blocked + b.atRisk) - (a.blocked + a.atRisk) || b.unassigned - a.unassigned);

    return {
      totalGoals: goals.length,
      strategicCount: strategicGoals.length + cpObjectives.length,
      operationalCount: operationalGoals.length,
      totalLinked,
      blockedGoals,
      atRiskGoals,
      unlinkedGoals,
      objectiveCoverage,
      departments,
      operationalGoals,
    };
  }, [busData, activeBU]);

  // Unassigned matters from matters hook
  const allMatters = (mattersData?.matters || []).map(adaptMatterListItem);
  const unassignedMatterCount = allMatters.filter(m => !m.goalIds || m.goalIds.length === 0).length;

  if (stratLoading) {
    return (
      <AppLayout title="Strategy Scan">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-[13px]">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Strategy Scan">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* BU Tabs */}
        <div className="border-b border-border/30 px-4 flex items-center gap-1 shrink-0">
          {BU_ORDER.map(bu => (
            <button
              key={bu}
              onClick={() => setActiveBU(bu)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                activeBU === bu
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {BU_LABELS[bu]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {scan ? (
            <div className="max-w-5xl px-5 py-4 space-y-6">

              {/* ── 1. STRATEGY HEALTH SUMMARY ── */}
              <section>
                <div className="grid grid-cols-4 gap-3">
                  <StatCard label="Goals" value={scan.totalGoals} sub={`${scan.strategicCount} strategic · ${scan.operationalCount} operational`} />
                  <StatCard label="Linked Matters" value={scan.totalLinked} status={scan.totalLinked === 0 ? "critical" : undefined} />
                  <StatCard label="Unlinked" value={unlinkedMatters} status={unlinkedMatters > 5 ? "warning" : undefined} sub={`${scan.unlinkedGoals.length} goals with 0 matters`} />
                  <StatCard label="At Risk" value={scan.blockedGoals.length + scan.atRiskGoals.length} status={(scan.blockedGoals.length + scan.atRiskGoals.length) > 0 ? "critical" : "healthy"} sub={`${scan.blockedGoals.length} blocked · ${scan.atRiskGoals.length} at risk`} />
                </div>
              </section>

              {/* ── 2. CP OBJECTIVE COVERAGE ── */}
              <section>
                <ScanHeader icon={Target} label="CP Objective Coverage" />
                <div className="space-y-1.5">
                  {scan.objectiveCoverage.map(obj => (
                    <div
                      key={obj.id}
                      onClick={() => navigate("/strategy")}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-border/30 hover:bg-secondary/30 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CoverageIndicator coverage={obj.coverage} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate">{obj.title}</div>
                          <div className="text-[11px] text-muted-foreground">{obj.childCount} goals</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <MetricPair label="matters" value={obj.matterCount} warn={obj.matterCount === 0} />
                        {obj.blockedCount > 0 && <MetricPair label="blocked" value={obj.blockedCount} critical />}
                        {obj.atRiskCount > 0 && <MetricPair label="at risk" value={obj.atRiskCount} warn />}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── 3. DEPARTMENT HEATMAP ── */}
              <section>
                <ScanHeader icon={Building2} label="Department Heatmap" />
                <div className="space-y-px">
                  {scan.departments.map(dept => {
                    const worst = dept.blocked > 0 ? "blocked" : dept.atRisk > 0 ? "at-risk" : "on-track";
                    const signal = dept.blocked > 0 ? `${dept.blocked} blocked` : dept.unassigned > 0 ? `${dept.unassigned} unlinked` : "";
                    return (
                      <div
                        key={dept.code}
                        onClick={() => navigate("/strategy")}
                        className="flex items-center justify-between px-3.5 py-2 hover:bg-secondary/30 cursor-pointer transition-colors border-b border-border/15 group"
                      >
                        <div className="flex items-center gap-3 w-40">
                          <StatusDot status={worst} />
                          <span className="text-[13px] font-medium">{dept.name}</span>
                        </div>
                        <div className="flex items-center gap-5 shrink-0">
                          <MetricPair label="goals" value={dept.goals} />
                          <MetricPair label="linked" value={dept.linked} warn={dept.linked === 0} />
                          <MetricPair label="gaps" value={dept.unassigned} warn={dept.unassigned > 0} />
                          {signal && <span className="text-[11px] text-destructive font-medium w-20 text-right">{signal}</span>}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── 4. EXECUTION GAPS ── */}
              <section>
                <ScanHeader icon={TrendingDown} label="Execution Gaps" accent="destructive" />
                <div className="space-y-4">
                  {/* A. Unlinked goals */}
                  {scan.unlinkedGoals.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Goals with zero matters</div>
                      <div className="space-y-px">
                        {scan.unlinkedGoals.slice(0, 8).map(g => (
                          <div key={g.id as string} className="flex items-center justify-between px-3 py-1.5 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate("/strategy")}>
                            <div className="flex items-center gap-2 min-w-0">
                              <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                              <span className="text-[13px] truncate">{g.title as string}</span>
                              {g.department_code && <span className="text-[11px] text-muted-foreground font-mono shrink-0">{g.department_code as string}</span>}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{g.owner as string}</span>
                          </div>
                        ))}
                        {scan.unlinkedGoals.length > 8 && (
                          <div className="text-[11px] text-muted-foreground px-3 py-1">+{scan.unlinkedGoals.length - 8} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* B. Weak objectives */}
                  {scan.objectiveCoverage.filter(o => o.coverage === "weak").length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Objectives with no execution</div>
                      {scan.objectiveCoverage.filter(o => o.coverage === "weak").map(o => (
                        <div key={o.id} className="flex items-center gap-2 px-3 py-1.5 text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span className="text-[13px]">{o.title}</span>
                          <span className="text-[11px]">— 0 matters</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {scan.unlinkedGoals.length === 0 && scan.objectiveCoverage.every(o => o.coverage !== "weak") && (
                    <div className="flex items-center gap-2 px-3 py-2 text-success text-[13px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> No critical execution gaps detected
                    </div>
                  )}
                </div>
              </section>

              {/* ── 5. OPERATIONAL WATCHLIST ── */}
              {scan.operationalGoals.length > 0 && (
                <section>
                  <ScanHeader icon={Minus} label="Operational Watchlist" />
                  <div className="space-y-px">
                    {scan.operationalGoals.map(g => {
                      const blocked = ((g.blocked_count as number) || 0) > 0;
                      const atRisk = ((g.at_risk_count as number) || 0) > 0;
                      const noMatters = ((g.matter_count as number) || 0) === 0;
                      if (!blocked && !atRisk && !noMatters) return null;
                      return (
                        <div key={g.id as string} className="flex items-center justify-between px-3.5 py-2 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate("/strategy")}>
                          <div className="flex items-center gap-2">
                            <StatusDot status={blocked ? "blocked" : atRisk ? "at-risk" : "warning"} />
                            <span className="text-[13px]">{g.title as string}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{g.department_code as string}</span>
                          </div>
                          <StatusPill status={blocked ? "blocked" : atRisk ? "at-risk" : "idle"} />
                        </div>
                      );
                    })}
                    {scan.operationalGoals.every(g => ((g.blocked_count as number) || 0) === 0 && ((g.at_risk_count as number) || 0) === 0 && ((g.matter_count as number) || 0) > 0) && (
                      <div className="flex items-center gap-2 px-3 py-2 text-success text-[13px]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All operational goals on track
                      </div>
                    )}
                  </div>
                </section>
              )}

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground">
              No data for {BU_LABELS[activeBU]}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ── Sub-components ──

function ScanHeader({ icon: Icon, label, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; accent?: "destructive" }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Icon className={`h-3.5 w-3.5 ${accent === "destructive" ? "text-destructive" : "text-accent"}`} />
      <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${accent === "destructive" ? "text-destructive" : "text-accent"}`}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, status }: { label: string; value: number; sub?: string; status?: "critical" | "warning" | "healthy" }) {
  const border = status === "critical" ? "border-destructive/30" : status === "warning" ? "border-warning/30" : "border-border/30";
  return (
    <div className={`rounded-lg border ${border} px-4 py-3 bg-card`}>
      <div className={`text-2xl font-semibold tabular-nums ${status === "critical" ? "text-destructive" : status === "warning" ? "text-warning" : "text-foreground"}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function CoverageIndicator({ coverage }: { coverage: "strong" | "emerging" | "weak" }) {
  const config = {
    strong: { color: "bg-success", label: "Strong" },
    emerging: { color: "bg-warning", label: "Emerging" },
    weak: { color: "bg-destructive", label: "Weak" },
  }[coverage];
  return (
    <div className={`h-8 w-1.5 rounded-full ${config.color}`} title={config.label} />
  );
}

function MetricPair({ label, value, warn, critical }: { label: string; value: number; warn?: boolean; critical?: boolean }) {
  const color = critical ? "text-destructive" : warn ? "text-warning" : "text-foreground";
  return (
    <div className="text-center">
      <div className={`text-[14px] font-semibold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
