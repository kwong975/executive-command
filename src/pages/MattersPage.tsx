import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CommandDrawer } from "@/components/CommandDrawer";
import { GroupHeader, StatusDot, StatusPill, InlineAction, DenseRow } from "@/components/shared";
import { useMatters, useMatterDetail, useUnassignedThreads, useArchiveMatter, useAssignThread, useUpdateCommitmentStatus, useCreateMatter, useSetPersonRole } from "@/hooks/useMatters";
import { adaptMatterListItem, adaptMatterDetail, adaptUnassignedThread } from "@/lib/matters-adapter";
import { agents, goals, type Matter, type Thread } from "@/data/mockData";
import {
  UserPlus, Archive, ArrowRight, X, Link2,
  Check, Play, ExternalLink, Plus, GitMerge,
  FileText, Users, Mail, Calendar, Cog, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ActionModal } from "@/components/ActionModal";

type Group = "attention" | "active" | "unassigned" | "stale";

const artifactIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  meeting: <Calendar className="h-3 w-3" />,
  document: <FileText className="h-3 w-3" />,
  slack: <ExternalLink className="h-3 w-3" />,
  system: <Cog className="h-3 w-3" />,
};

export default function MattersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<(typeof agents)[number] | undefined>(undefined);
  const [expandedGroup, setExpandedGroup] = useState<Record<Group, boolean>>({
    attention: true, active: true, unassigned: true, stale: true,
  });
  const [detailTab, setDetailTab] = useState<"threads" | "commitments" | "artifacts" | "people">("threads");

  // Live data from CE via CC backend
  const { data: mattersData, isLoading: mattersLoading } = useMatters();
  const { data: detailData } = useMatterDetail(selectedId);
  const { data: unassignedData } = useUnassignedThreads();
  const archiveMatter = useArchiveMatter();
  const assignThread = useAssignThread();
  const updateCommitmentStatus = useUpdateCommitmentStatus();
  const createMatter = useCreateMatter();
  const setPersonRole = useSetPersonRole();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Adapt CE data → frontend types
  const allMatters: Matter[] = (mattersData?.matters || []).map(adaptMatterListItem);
  const selected: Matter | null = detailData ? adaptMatterDetail(detailData as Record<string, unknown>) : allMatters.find(m => m.id === selectedId) || null;
  const unassignedThreads: Thread[] = (unassignedData?.threads || []).map(adaptUnassignedThread);

  // Group matters by status
  const needsAttention = allMatters.filter(m => m.status === "blocked" || m.status === "at-risk");
  const active = allMatters.filter(m => m.status === "healthy");
  const stale = allMatters.filter(m => m.status === "stale");

  const toggle = (g: Group) => setExpandedGroup(prev => ({ ...prev, [g]: !prev[g] }));

  const openChat = (matterId?: string) => {
    const m = allMatters.find(x => x.id === matterId);
    if (m) setChatAgent(agents.find(x => x.id === m.ownerAgentId));
  };

  const linkedGoals = selected ? goals.filter(g => selected.goalIds.includes(g.id)) : [];

  const handleArchive = (matterId: string) => {
    archiveMatter.mutate(matterId, {
      onSuccess: () => { toast.success("Matter archived"); if (selectedId === matterId) setSelectedId(null); },
      onError: (e) => toast.error(`Archive failed: ${e.message}`),
    });
  };

  const handleAssign = (threadId: string) => {
    if (!selectedId) { toast.info("Select a matter first"); return; }
    assignThread.mutate({ threadId, matterId: selectedId }, {
      onSuccess: () => toast.success("Thread assigned"),
      onError: (e) => toast.error(`Assign failed: ${e.message}`),
    });
  };

  const handleCreateMatter = (title: string) => {
    if (title.trim()) {
      createMatter.mutate({ title: title.trim() }, {
        onSuccess: () => toast.success("Matter created"),
        onError: (e) => toast.error(`Create failed: ${e.message}`),
      });
    }
    setShowCreateModal(false);
  };

  const handleAssignOwner = (personKey: string) => {
    if (!selectedId) return;
    setPersonRole.mutate({ matterId: selectedId, personKey, role: "accountable" }, {
      onSuccess: () => toast.success(`Owner set to ${personKey}`),
      onError: (e) => toast.error(`Assign failed: ${e.message}`),
    });
  };

  const handleCompleteCommitment = (commitmentId: string) => {
    updateCommitmentStatus.mutate({ commitmentId, status: "done" }, {
      onSuccess: () => toast.success("Commitment completed"),
      onError: (e) => toast.error(`Update failed: ${e.message}`),
    });
  };

  return (
    <AppLayout title="Matters">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Queue */}
        <div className="w-72 border-r flex flex-col shrink-0 overflow-y-auto">
          {mattersLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-[13px]">Loading matters...</span>
            </div>
          ) : (
            <>
              <GroupHeader label="Needs Attention" count={needsAttention.length} open={expandedGroup.attention} onToggle={() => toggle("attention")} accent="destructive" />
              {expandedGroup.attention && needsAttention.map(m => (
                <MatterRow key={m.id} matter={m} selected={selectedId === m.id} onClick={() => { setSelectedId(m.id); setDetailTab("threads"); }} onChat={() => openChat(m.id)} onArchive={() => handleArchive(m.id)} />
              ))}

              <GroupHeader label="Active" count={active.length} open={expandedGroup.active} onToggle={() => toggle("active")} />
              {expandedGroup.active && active.map(m => (
                <MatterRow key={m.id} matter={m} selected={selectedId === m.id} onClick={() => { setSelectedId(m.id); setDetailTab("threads"); }} onChat={() => openChat(m.id)} onArchive={() => handleArchive(m.id)} />
              ))}

              <GroupHeader label="Unassigned" count={unassignedThreads.length} open={expandedGroup.unassigned} onToggle={() => toggle("unassigned")} accent="warning" />
              {expandedGroup.unassigned && unassignedThreads.map(t => (
                <UnassignedRow key={t.id} thread={t} onAssign={() => handleAssign(t.id)} onDismiss={() => {}} />
              ))}

              <GroupHeader label="Stale / Archive" count={stale.length} open={expandedGroup.stale} onToggle={() => toggle("stale")} />
              {expandedGroup.stale && stale.map(m => (
                <MatterRow key={m.id} matter={m} selected={selectedId === m.id} onClick={() => { setSelectedId(m.id); setDetailTab("threads"); }} onChat={() => openChat(m.id)} onArchive={() => handleArchive(m.id)} stale />
              ))}

              <div className="px-2.5 py-2 border-t border-border/30">
                <button onClick={() => setShowCreateModal(true)} className="w-full text-[12px] py-1.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors font-medium">
                  <Plus className="h-3 w-3" />New matter
                </button>
              </div>
              <ActionModal
                open={showCreateModal}
                title="Create Matter"
                inputLabel="Title"
                inputPlaceholder="Matter title..."
                confirmLabel="Create"
                onConfirm={handleCreateMatter}
                onCancel={() => setShowCreateModal(false)}
              />
            </>
          )}
        </div>

        {/* CENTER — Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <MatterDetail
              matter={selected}
              linkedGoals={linkedGoals}
              tab={detailTab}
              onTabChange={setDetailTab}
              onChat={() => openChat(selected.id)}
              onCompleteCommitment={handleCompleteCommitment}
              onAssignOwner={handleAssignOwner}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground font-mono">
              {mattersLoading ? "Loading..." : allMatters.length === 0 ? "No matters found" : "Select a matter to inspect"}
            </div>
          )}
        </div>

        {/* RIGHT — Command */}
        <CommandDrawer agent={chatAgent || null} onClose={() => setChatAgent(undefined)} />
      </div>
    </AppLayout>
  );
}

// ===== Sub-Components =====

function MatterRow({ matter, selected, onClick, onChat, onArchive, stale }: {
  matter: Matter; selected: boolean; onClick: () => void; onChat: () => void; onArchive: () => void; stale?: boolean;
}) {
  return (
    <DenseRow selected={selected} onClick={onClick}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <StatusDot status={matter.status} />
        <span className="text-sm truncate">{matter.title}</span>
        {matter.overdueCount > 0 && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive shrink-0 font-medium">{matter.overdueCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[12px] text-muted-foreground font-mono">{matter.owner}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); }} className="p-1 rounded hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
          {stale && <button onClick={e => { e.stopPropagation(); onArchive(); }} className="p-1 rounded hover:bg-secondary"><Archive className="h-3 w-3 text-muted-foreground" /></button>}
          <button onClick={e => { e.stopPropagation(); onChat(); }} className="p-1 rounded hover:bg-accent/20"><Play className="h-3 w-3 text-muted-foreground" /></button>
        </div>
      </div>
    </DenseRow>
  );
}

function UnassignedRow({ thread, onAssign, onDismiss }: { thread: Thread; onAssign: () => void; onDismiss: () => void }) {
  return (
    <DenseRow>
      <div className="min-w-0 flex-1">
        <div className="text-sm truncate">{thread.title}</div>
        <div className="text-[12px] text-muted-foreground">{thread.source} · {thread.age || thread.timestamp}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <InlineAction onClick={onAssign} icon={<UserPlus className="h-3 w-3" />} label="Assign" accent />
        <InlineAction onClick={onAssign} icon={<Link2 className="h-3 w-3" />} label="Link" />
        <button onClick={onDismiss} className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>
    </DenseRow>
  );
}

function MatterDetail({ matter, linkedGoals, tab, onTabChange, onChat, onCompleteCommitment, onAssignOwner }: {
  matter: Matter;
  linkedGoals: typeof goals;
  tab: "threads" | "commitments" | "artifacts" | "people";
  onTabChange: (t: "threads" | "commitments" | "artifacts" | "people") => void;
  onChat: () => void;
  onCompleteCommitment: (id: string) => void;
  onAssignOwner: (personKey: string) => void;
}) {
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);

  const detailTabs = [
    { id: "threads" as const, label: "Threads", count: matter.threads.length },
    { id: "commitments" as const, label: "Commitments", count: matter.commitments.length },
    { id: "artifacts" as const, label: "Artifacts", count: matter.artifacts.length },
    { id: "people" as const, label: "People", count: matter.people.length },
  ];

  return (
    <div className="px-4 py-3 space-y-3 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot status={matter.status} size="md" />
          <span className="text-sm font-semibold">{matter.title}</span>
          {matter.businessUnit && <span className="text-[12px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{matter.businessUnit}</span>}
          <StatusPill status={matter.status} />
        </div>
        <div className="flex items-center gap-1.5 relative">
          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Assign Owner" onClick={() => setShowOwnerPicker(!showOwnerPicker)} />
          <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" />
          <InlineAction icon={<Play className="h-3 w-3" />} label="Command" accent onClick={onChat} />
          {showOwnerPicker && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
              {matter.people.length > 0 ? matter.people.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onAssignOwner(p.id); setShowOwnerPicker(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium">{p.name.charAt(0)}</div>
                  <span>{p.name}</span>
                  {p.role === "owner" && <span className="text-[11px] text-accent ml-auto">current</span>}
                </button>
              )) : (
                <div className="px-3 py-2 text-[13px] text-muted-foreground">No participants yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
        <span>Owner: <span className="text-foreground font-medium">{matter.owner}</span></span>
        {matter.people.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {matter.people.slice(0, 3).map(p => p.name).join(", ")}
            {matter.people.length > 3 && <span className="text-muted-foreground">+{matter.people.length - 3}</span>}
          </span>
        )}
        {matter.lastActivity && <span>Last: {matter.lastActivity}</span>}
        {linkedGoals.length > 0 && (
          <span className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {linkedGoals.map(g => g.title).join(", ")}
          </span>
        )}
      </div>

      {matter.description && <p className="text-[13px] text-foreground/60">{matter.description}</p>}

      {/* Tab bar */}
      <div className="border-b border-border/30 flex items-center">
        {detailTabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-3 py-1.5 text-[13px] font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-[11px] font-mono ml-1">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Threads */}
      {tab === "threads" && (
        <div>
          {matter.threads.map(t => (
            <div key={t.id} className="py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={t.status} />
                  <span className="text-sm truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-muted-foreground">{t.source} · {t.timestamp}</span>
                  <StatusPill status={t.status} />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded hover:bg-secondary"><ArrowRight className="h-3 w-3 text-muted-foreground" /></button>
                    <button className="p-1 rounded hover:bg-secondary"><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
              {t.summary !== t.title && <div className="text-[13px] text-muted-foreground mt-0.5 pl-4">{t.summary}</div>}
            </div>
          ))}
          {matter.threads.length === 0 && <div className="text-[13px] text-muted-foreground py-2">No threads</div>}
        </div>
      )}

      {/* Commitments */}
      {tab === "commitments" && (
        <div>
          {matter.commitments.map(c => (
            <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-2">
                <StatusDot status={c.status} />
                <span className="text-sm">{c.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">{c.owner}</span>
                <span className="text-[12px] text-muted-foreground">{c.dueDate}</span>
                <StatusPill status={c.status} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onCompleteCommitment(c.id)} className="p-1 rounded hover:bg-secondary"><Check className="h-3 w-3 text-muted-foreground" /></button>
                  <button className="p-1 rounded hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
          {matter.commitments.length === 0 && <div className="text-[13px] text-muted-foreground py-2">No commitments</div>}
        </div>
      )}

      {/* Artifacts */}
      {tab === "artifacts" && (
        <div>
          {matter.artifacts.map(ar => (
            <div key={ar.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-2 text-muted-foreground">
                {artifactIcon[ar.source] || <FileText className="h-3 w-3" />}
                <span className="text-sm text-foreground">{ar.title}</span>
                <span className="text-[12px]">{ar.source}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[12px] text-muted-foreground">{ar.timestamp}</span>
              </div>
            </div>
          ))}
          {matter.artifacts.length === 0 && <div className="text-[13px] text-muted-foreground py-2">No artifacts</div>}
        </div>
      )}

      {/* People */}
      {tab === "people" && (() => {
        const owner = matter.people.find(p => p.role === "owner");
        const others = matter.people.filter(p => p.role !== "owner");
        return (
          <div>
            {/* Accountable owner */}
            {owner ? (
              <div className="flex items-center justify-between py-2 border-b border-border/30 mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-[11px] font-semibold text-accent">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{owner.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">Owner</span>
                </div>
                <InlineAction label="Reassign" icon={<UserPlus className="h-3 w-3" />} />
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 border-b border-border/30 mb-1 text-warning">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-sm">No owner assigned</span>
                </div>
                <InlineAction label="Assign owner" accent />
              </div>
            )}

            {/* Participants */}
            {others.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{p.name}</span>
                  <span className="text-[12px] text-muted-foreground">{p.role}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <InlineAction label="Make owner" />
                  <button className="p-1 rounded hover:bg-destructive/15"><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
            ))}
            {matter.people.length === 0 && <div className="text-[13px] text-muted-foreground py-2">No people</div>}
          </div>
        );
      })()}
    </div>
  );
}
