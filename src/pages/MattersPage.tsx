import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CommandDrawer } from "@/components/CommandDrawer";
import { StatusDot, StatusPill, InlineAction, TabBar, EmptyState, PanelHeader } from "@/components/shared";
import { useMatters, useMatterDetail, useArchiveMatter, useUpdateCommitmentStatus, useSetPersonRole } from "@/hooks/useMatters";
import { adaptMatterListItem, adaptMatterDetail } from "@/lib/matters-adapter";
import { agents, goals, type Matter } from "@/data/mockData";
import { fakeStrategy } from "@/lib/fake-data";
import {
  UserPlus, Archive, X, Link2, Check, Plus,
  FileText, Users, Mail, Calendar, Cog, Loader2,
  AlertTriangle, Clock, Eye, Inbox, Trash2, ExternalLink, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ===== TYPES =====

type BU = "VNG" | "VNGG" | "ZP" | "GN";
type Lane = "review" | "gaps" | "active" | "intake" | "archive";

interface MatterCard {
  id: string;
  title: string;
  status: string;
  healthState: string;
  owner: string;
  bu: string;
  goalId?: string;
  goalTitle?: string;
  objectiveTitle?: string;
  overdueCount: number;
  openCommitments: number;
  totalCommitments: number;
  lastActivity: string;
  participants: string[];
  createdAt: string;
  lane: Lane;
  warnings: string[];
}

// ===== LANE CONFIG =====

const lanes: { id: Lane; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "review", label: "Review Now", icon: <AlertTriangle className="h-3.5 w-3.5" />, description: "Blocked, overdue, no owner" },
  { id: "gaps", label: "Linking Gaps", icon: <Link2 className="h-3.5 w-3.5" />, description: "No strategy link or participants" },
  { id: "active", label: "Active Execution", icon: <Check className="h-3.5 w-3.5" />, description: "Owned and progressing" },
  { id: "intake", label: "Intake / Triage", icon: <Inbox className="h-3.5 w-3.5" />, description: "New and unreviewed" },
  { id: "archive", label: "Archive / Clean", icon: <Trash2 className="h-3.5 w-3.5" />, description: "Stale or merge candidates" },
];

const buTabs = ["VNG", "VNGG", "ZP", "GN"];

// ===== GOAL LOOKUP =====

function buildGoalLookup() {
  const lookup: Record<string, { goalTitle: string; objectiveTitle: string }> = {};
  for (const bu of fakeStrategy.bus) {
    for (const g of bu.goals) {
      const obj = bu.goals.find(o => o.id === (g as any).parent_goal_id);
      lookup[g.id] = {
        goalTitle: g.title,
        objectiveTitle: obj ? obj.title : g.title,
      };
    }
  }
  return lookup;
}

const goalLookup = buildGoalLookup();

// ===== LANE CLASSIFIER =====

function classifyLane(m: Record<string, unknown>): Lane {
  const health = m.health_state as string;
  const owner = m.routing_owner as string;
  const overdue = (m.overdue_commitments as number) || 0;
  const lastActivity = m.last_activity_at as string;
  const goalId = m.goal_id as string | undefined;
  const participants = (m.participants as string[]) || [];

  // Archive: stale / drifting
  if (health === "drifting") return "archive";
  const daysSinceActivity = lastActivity ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000) : 999;
  if (daysSinceActivity > 30) return "archive";

  // Review Now: no owner, blocked, overdue
  if (owner === "unassigned" || !owner) return "review";
  if (health === "blocked" && overdue > 0) return "review";

  // Gaps: no strategy link or no participants
  if (!goalId && participants.length === 0) return "gaps";
  if (!goalId) return "gaps";

  // Intake: recent creation (less than 7 days of activity)
  const created = m.created_at as string;
  if (created) {
    const daysSinceCreated = Math.floor((Date.now() - new Date(created).getTime()) / 86400000);
    if (daysSinceCreated < 14 && (m.open_commitments as number) <= 2) return "intake";
  }

  return "active";
}

// ===== ARTIFACT ICONS =====
const artifactIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  meeting: <Calendar className="h-3 w-3" />,
  document: <FileText className="h-3 w-3" />,
  slack: <ExternalLink className="h-3 w-3" />,
  system: <Cog className="h-3 w-3" />,
};

// ===== MAIN COMPONENT =====

export default function MattersPage() {
  const [selectedBU, setSelectedBU] = useState<BU>("VNG");
  const [selectedLane, setSelectedLane] = useState<Lane>("review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<(typeof agents)[number] | undefined>(undefined);
  const [detailTab, setDetailTab] = useState<"threads" | "commitments" | "artifacts" | "people">("threads");

  const { data: mattersData, isLoading } = useMatters();
  const { data: detailData } = useMatterDetail(selectedId);
  const archiveMatter = useArchiveMatter();
  const updateCommitmentStatus = useUpdateCommitmentStatus();
  const setPersonRole = useSetPersonRole();

  // Build enriched matter cards
  const allCards: MatterCard[] = useMemo(() => {
    const raw = (mattersData?.matters || []) as Record<string, unknown>[];
    return raw.map(m => {
      const goalId = m.goal_id as string | undefined;
      const gl = goalId ? goalLookup[goalId] : undefined;
      const warnings: string[] = [];
      const owner = (m.routing_owner as string) || "unassigned";
      if (owner === "unassigned") warnings.push("No owner");
      if (!goalId) warnings.push("No strategy link");
      if ((m.participants as string[] || []).length === 0) warnings.push("No participants");
      if ((m.health_state as string) === "blocked") warnings.push("Blocked");

      return {
        id: m.id as string,
        title: (m.canonical_title as string) || "",
        status: m.status as string,
        healthState: m.health_state as string,
        owner,
        bu: (m.bu as string) || "VNG",
        goalId,
        goalTitle: gl?.goalTitle,
        objectiveTitle: gl?.objectiveTitle,
        overdueCount: (m.overdue_commitments as number) || 0,
        openCommitments: (m.open_commitments as number) || 0,
        totalCommitments: (m.total_commitments as number) || 0,
        lastActivity: (m.last_activity_at as string) || "",
        participants: (m.participants as string[]) || [],
        createdAt: (m.created_at as string) || "",
        lane: classifyLane(m),
        warnings,
      };
    });
  }, [mattersData]);

  // Filter by BU
  const buFiltered = allCards.filter(m => m.bu === selectedBU);

  // Count per lane per BU
  const laneCounts = useMemo(() => {
    const counts: Record<Lane, number> = { review: 0, gaps: 0, active: 0, intake: 0, archive: 0 };
    buFiltered.forEach(m => counts[m.lane]++);
    return counts;
  }, [buFiltered]);

  // Count per BU
  const buCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    buTabs.forEach(bu => { counts[bu] = allCards.filter(m => m.bu === bu).length; });
    return counts;
  }, [allCards]);

  // Lane filtered matters
  const laneMatters = buFiltered.filter(m => m.lane === selectedLane);

  // Selected detail
  const selectedMatter: Matter | null = detailData
    ? adaptMatterDetail(detailData as Record<string, unknown>)
    : selectedId
    ? (() => {
        const items = (mattersData?.matters || []) as Record<string, unknown>[];
        const found = items.find(m => (m.id as string) === selectedId);
        return found ? adaptMatterListItem(found) : null;
      })()
    : null;

  const linkedGoals = selectedMatter ? goals.filter(g => selectedMatter.goalIds.includes(g.id)) : [];

  const handleArchive = (matterId: string) => {
    archiveMatter.mutate(matterId, {
      onSuccess: () => { toast.success("Matter archived"); if (selectedId === matterId) setSelectedId(null); },
      onError: (e) => toast.error(`Archive failed: ${e.message}`),
    });
  };

  const handleCompleteCommitment = (commitmentId: string) => {
    updateCommitmentStatus.mutate({ commitmentId, status: "done" }, {
      onSuccess: () => toast.success("Commitment completed"),
      onError: (e) => toast.error(`Update failed: ${e.message}`),
    });
  };

  const handleAssignOwner = (personKey: string) => {
    if (!selectedId) return;
    setPersonRole.mutate({ matterId: selectedId, personKey, role: "accountable" }, {
      onSuccess: () => toast.success(`Owner set to ${personKey}`),
      onError: (e) => toast.error(`Assign failed: ${e.message}`),
    });
  };

  const openChat = (matterId?: string) => {
    const items = (mattersData?.matters || []) as Record<string, unknown>[];
    const m = items.find(x => (x.id as string) === matterId);
    if (m) setChatAgent(agents.find(x => x.id === (m as any).ownerAgentId));
  };

  return (
    <AppLayout title="Matters">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* BU TABS */}
        <div className="border-b border-border/50 px-4 flex items-center gap-1 shrink-0 bg-background/95 backdrop-blur-sm">
          {buTabs.map(bu => (
            <button
              key={bu}
              onClick={() => { setSelectedBU(bu as BU); setSelectedId(null); }}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
                selectedBU === bu
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {bu}
              <span className="ml-2 text-xs font-mono tabular-nums text-muted-foreground">{buCounts[bu]}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — REVIEW LANES */}
          <div className="w-56 border-r border-border/50 flex flex-col shrink-0 bg-background">
            <div className="px-3 py-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Review Lanes</span>
            </div>
            {lanes.map(lane => {
              const count = laneCounts[lane.id];
              const isActive = selectedLane === lane.id;
              const hasIssues = lane.id === "review" && count > 0;
              return (
                <button
                  key={lane.id}
                  onClick={() => { setSelectedLane(lane.id); setSelectedId(null); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all border-l-2",
                    isActive
                      ? "bg-secondary/80 border-l-accent text-foreground"
                      : "border-l-transparent hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "shrink-0",
                    hasIssues && !isActive ? "text-destructive" : isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {lane.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{lane.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{lane.description}</div>
                  </div>
                  <span className={cn(
                    "text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-md shrink-0",
                    hasIssues ? "bg-destructive/15 text-destructive font-semibold" : "bg-secondary text-muted-foreground"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CENTER — MATTER BOARD */}
          <div className="flex-1 overflow-y-auto">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{lanes.find(l => l.id === selectedLane)?.label}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground font-mono">{laneMatters.length} matters</span>
              </div>
            </PanelHeader>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : laneMatters.length === 0 ? (
              <EmptyState text={`No matters in ${lanes.find(l => l.id === selectedLane)?.label}`} />
            ) : (
              <div className="p-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
                {laneMatters.map(card => (
                  <MatterCardComponent
                    key={card.id}
                    card={card}
                    selected={selectedId === card.id}
                    onClick={() => { setSelectedId(card.id); setDetailTab("threads"); }}
                    onArchive={() => handleArchive(card.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — DETAIL DRAWER */}
          {selectedMatter ? (
            <div className="w-[420px] border-l border-border/50 flex flex-col shrink-0 overflow-y-auto bg-background">
              <MatterDetailPanel
                matter={selectedMatter}
                card={allCards.find(c => c.id === selectedId) || null}
                linkedGoals={linkedGoals}
                tab={detailTab}
                onTabChange={setDetailTab}
                onClose={() => setSelectedId(null)}
                onCompleteCommitment={handleCompleteCommitment}
                onAssignOwner={handleAssignOwner}
                onChat={() => openChat(selectedMatter.id)}
              />
            </div>
          ) : null}

          <CommandDrawer agent={chatAgent || null} onClose={() => setChatAgent(undefined)} />
        </div>
      </div>
    </AppLayout>
  );
}

// ===== MATTER CARD =====

function MatterCardComponent({ card, selected, onClick, onArchive }: {
  card: MatterCard; selected: boolean; onClick: () => void; onArchive: () => void;
}) {
  const healthColor: Record<string, string> = {
    blocked: "border-l-destructive",
    at_risk: "border-l-warning",
    overloaded: "border-l-warning",
    drifting: "border-l-muted-foreground/40",
    healthy: "border-l-success",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border/50 p-3.5 cursor-pointer transition-all duration-150 border-l-[3px] group",
        healthColor[card.healthState] || "border-l-border",
        selected ? "bg-secondary/80 ring-1 ring-accent/30" : "bg-card hover:bg-secondary/40"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate leading-snug">{card.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground">{card.bu}</span>
            <StatusPill status={card.healthState === "blocked" ? "blocked" : card.healthState === "overloaded" ? "at-risk" : card.healthState === "drifting" ? "stale" : "healthy"} />
          </div>
        </div>
        {card.overdueCount > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold tabular-nums shrink-0">
            {card.overdueCount} overdue
          </span>
        )}
      </div>

      {/* Owner */}
      <div className="flex items-center gap-2 mb-2">
        {card.owner === "unassigned" ? (
          <span className="text-xs text-warning flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />No owner
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Owner: <span className="text-foreground font-medium">{card.owner}</span>
          </span>
        )}
        {card.participants.length > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />{card.participants.length}
          </span>
        )}
      </div>

      {/* Strategy linkage */}
      <div className="mb-2.5">
        {card.goalTitle ? (
          <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Link2 className="h-3 w-3 text-accent shrink-0" />
            <span className="truncate">{card.goalTitle}</span>
          </div>
        ) : (
          <span className="text-xs text-warning flex items-center gap-1">
            <Link2 className="h-3 w-3" />Unlinked
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="font-mono tabular-nums">{card.openCommitments}/{card.totalCommitments} open</span>
        <span>Last: {card.lastActivity}</span>
      </div>

      {/* Warnings */}
      {card.warnings.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.warnings.map(w => (
            <span key={w} className="text-xs px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Inline Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {card.owner === "unassigned" && (
          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign owner" accent onClick={e => e.stopPropagation()} />
        )}
        {!card.goalId && (
          <InlineAction icon={<Link2 className="h-3 w-3" />} label="Link goal" onClick={e => e.stopPropagation()} />
        )}
        <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" onClick={e => { e.stopPropagation(); onArchive(); }} />
        <InlineAction icon={<Eye className="h-3 w-3" />} label="Open" onClick={e => { e.stopPropagation(); onClick(); }} />
      </div>
    </div>
  );
}

// ===== DETAIL PANEL =====

function MatterDetailPanel({ matter, card, linkedGoals, tab, onTabChange, onClose, onCompleteCommitment, onAssignOwner, onChat }: {
  matter: Matter;
  card: MatterCard | null;
  linkedGoals: typeof goals;
  tab: "threads" | "commitments" | "artifacts" | "people";
  onTabChange: (t: "threads" | "commitments" | "artifacts" | "people") => void;
  onClose: () => void;
  onCompleteCommitment: (id: string) => void;
  onAssignOwner: (personKey: string) => void;
  onChat: () => void;
}) {
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);

  const detailTabs = [
    { id: "threads", label: "Threads", count: matter.threads.length },
    { id: "commitments", label: "Commitments", count: matter.commitments.length },
    { id: "artifacts", label: "Artifacts", count: matter.artifacts.length },
    { id: "people", label: "People", count: matter.people.length },
  ];

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <StatusDot status={matter.status} size="md" />
            <span className="text-sm font-semibold truncate">{matter.title}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {card?.bu && <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{card.bu}</span>}
          <StatusPill status={matter.status} />
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Owner: <span className={cn("font-medium", matter.owner === "Unassigned" ? "text-warning" : "text-foreground")}>{matter.owner}</span></span>
          </div>
          {card?.goalTitle && (
            <div className="flex items-center gap-1 text-accent">
              <Link2 className="h-3 w-3" />
              <span className="truncate">{card.goalTitle}</span>
            </div>
          )}
          {matter.lastActivity && <span>Last activity: {matter.lastActivity}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-3 relative">
          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign owner" onClick={() => setShowOwnerPicker(!showOwnerPicker)} />
          <InlineAction icon={<Link2 className="h-3 w-3" />} label="Link goal" />
          <InlineAction icon={<Users className="h-3 w-3" />} label="Add people" />
          <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" />
          {showOwnerPicker && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-popover border border-border/50 rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
              {matter.people.length > 0 ? matter.people.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onAssignOwner(p.id); setShowOwnerPicker(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2.5"
                >
                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{p.name.charAt(0)}</div>
                  <span>{p.name}</span>
                  {p.role === "owner" && <span className="text-xs text-accent ml-auto font-medium">current</span>}
                </button>
              )) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No participants yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabBar tabs={detailTabs} active={tab} onChange={(id) => onTabChange(id as typeof tab)} />

      {/* Content */}
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        {tab === "threads" && (
          <div>
            {matter.threads.map(t => (
              <div key={t.id} className="py-2 border-b border-border/20 last:border-0 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={t.status} />
                    <span className="text-sm truncate font-medium">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{t.source} · {t.timestamp}</span>
                    <StatusPill status={t.status} />
                  </div>
                </div>
                {t.summary !== t.title && <div className="text-xs text-muted-foreground mt-1 pl-[19px]">{t.summary}</div>}
              </div>
            ))}
            {matter.threads.length === 0 && <EmptyState text="No threads" />}
          </div>
        )}

        {tab === "commitments" && (
          <div>
            {matter.commitments.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0 group">
                <div className="flex items-center gap-2">
                  <StatusDot status={c.status} />
                  <span className="text-sm font-medium">{c.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{c.owner}</span>
                  <span className="text-xs text-muted-foreground">{c.dueDate}</span>
                  <StatusPill status={c.status} />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onCompleteCommitment(c.id)} className="p-1 rounded-md hover:bg-secondary"><Check className="h-3 w-3 text-muted-foreground" /></button>
                    <button className="p-1 rounded-md hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
            ))}
            {matter.commitments.length === 0 && <EmptyState text="No commitments" />}
          </div>
        )}

        {tab === "artifacts" && (
          <div>
            {matter.artifacts.map(ar => (
              <div key={ar.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {artifactIcon[ar.source] || <FileText className="h-3 w-3" />}
                  <span className="text-sm text-foreground">{ar.title}</span>
                  <span className="text-xs">{ar.source}</span>
                </div>
                <span className="text-xs text-muted-foreground">{ar.timestamp}</span>
              </div>
            ))}
            {matter.artifacts.length === 0 && <EmptyState text="No artifacts" />}
          </div>
        )}

        {tab === "people" && (() => {
          const owner = matter.people.find(p => p.role === "owner");
          const others = matter.people.filter(p => p.role !== "owner");
          return (
            <div>
              {owner ? (
                <div className="flex items-center justify-between py-2.5 border-b border-border/30 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                      {owner.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{owner.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold border border-accent/20">Owner</span>
                  </div>
                  <InlineAction label="Reassign" icon={<UserPlus className="h-3 w-3" />} />
                </div>
              ) : (
                <div className="flex items-center justify-between py-2.5 border-b border-border/30 mb-1 text-warning">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm">No owner assigned</span>
                  </div>
                  <InlineAction label="Assign owner" accent />
                </div>
              )}
              {others.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0 group">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.role}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <InlineAction label="Make owner" />
                    <button className="p-1 rounded-md hover:bg-destructive/15 transition-colors"><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
                  </div>
                </div>
              ))}
              {matter.people.length === 0 && <EmptyState text="No people" />}
            </div>
          );
        })()}
      </div>
    </>
  );
}
