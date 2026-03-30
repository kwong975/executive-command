import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { matters, unassignedThreads, agents, goals, type Matter, type Thread } from "@/data/mockData";
import { CommandDrawer } from "@/components/CommandDrawer";
import { GroupHeader, StatusDot, StatusPill, InlineAction, DenseRow } from "@/components/shared";
import {
  UserPlus, Archive, ArrowRight, X, Link2,
  Check, Play, ExternalLink, Plus, GitMerge,
  FileText, Users, Mail, Calendar, Cog
} from "lucide-react";

type Group = "attention" | "active" | "unassigned" | "stale";

const artifactIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  meeting: <Calendar className="h-3 w-3" />,
  document: <FileText className="h-3 w-3" />,
  slack: <ExternalLink className="h-3 w-3" />,
  system: <Cog className="h-3 w-3" />,
};

export default function MattersPage() {
  const [selected, setSelected] = useState<Matter | null>(null);
  const [threads, setThreads] = useState(unassignedThreads);
  const [chatAgent, setChatAgent] = useState<ReturnType<typeof agents.find>>(undefined);
  const [expandedGroup, setExpandedGroup] = useState<Record<Group, boolean>>({
    attention: true, active: true, unassigned: true, stale: true,
  });
  const [detailTab, setDetailTab] = useState<"threads" | "commitments" | "artifacts" | "people">("threads");

  const needsAttention = matters.filter(m => m.status === "blocked" || m.status === "at-risk");
  const active = matters.filter(m => m.status === "healthy");
  const stale = matters.filter(m => m.status === "stale");

  const toggle = (g: Group) => setExpandedGroup(prev => ({ ...prev, [g]: !prev[g] }));

  const openChat = (matterId?: string) => {
    const m = matters.find(x => x.id === matterId);
    if (m) setChatAgent(agents.find(x => x.id === m.ownerAgentId));
  };

  const linkedGoals = selected ? goals.filter(g => selected.goalIds.includes(g.id)) : [];

  return (
    <AppLayout title="Matters">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Queue */}
        <div className="w-72 border-r flex flex-col shrink-0 overflow-y-auto">
          <GroupHeader label="Needs Attention" count={needsAttention.length} open={expandedGroup.attention} onToggle={() => toggle("attention")} accent="destructive" />
          {expandedGroup.attention && needsAttention.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => { setSelected(m); setDetailTab("threads"); }} onChat={() => openChat(m.id)} />
          ))}

          <GroupHeader label="Active" count={active.length} open={expandedGroup.active} onToggle={() => toggle("active")} />
          {expandedGroup.active && active.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => { setSelected(m); setDetailTab("threads"); }} onChat={() => openChat(m.id)} />
          ))}

          <GroupHeader label="Unassigned" count={threads.length} open={expandedGroup.unassigned} onToggle={() => toggle("unassigned")} accent="warning" />
          {expandedGroup.unassigned && threads.map(t => (
            <UnassignedRow key={t.id} thread={t} onAssign={() => setThreads(prev => prev.filter(x => x.id !== t.id))} onDismiss={() => setThreads(prev => prev.filter(x => x.id !== t.id))} />
          ))}

          <GroupHeader label="Stale / Archive" count={stale.length} open={expandedGroup.stale} onToggle={() => toggle("stale")} />
          {expandedGroup.stale && stale.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => { setSelected(m); setDetailTab("threads"); }} onChat={() => openChat(m.id)} stale />
          ))}

          <div className="px-2.5 py-2 border-t border-border/30">
            <button className="w-full text-[11px] py-1.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors font-medium">
              <Plus className="h-3 w-3" />New matter
            </button>
          </div>
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
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground font-mono">
              Select a matter to inspect
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

function MatterRow({ matter, selected, onClick, onChat, stale }: {
  matter: Matter; selected: boolean; onClick: () => void; onChat: () => void; stale?: boolean;
}) {
  return (
    <DenseRow selected={selected} onClick={onClick}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <StatusDot status={matter.status} />
        <span className="text-[13px] truncate">{matter.title}</span>
        {matter.overdueCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive shrink-0 font-medium">{matter.overdueCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-muted-foreground font-mono">{matter.owner}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); }} className="p-1 rounded hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
          {stale && <button onClick={e => { e.stopPropagation(); }} className="p-1 rounded hover:bg-secondary"><Archive className="h-3 w-3 text-muted-foreground" /></button>}
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
        <div className="text-[13px] truncate">{thread.title}</div>
        <div className="text-[11px] text-muted-foreground">{thread.source} · {thread.age || thread.timestamp}</div>
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

function MatterDetail({ matter, linkedGoals, tab, onTabChange, onChat }: {
  matter: Matter;
  linkedGoals: typeof goals;
  tab: "threads" | "commitments" | "artifacts" | "people";
  onTabChange: (t: "threads" | "commitments" | "artifacts" | "people") => void;
  onChat: () => void;
}) {
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
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{matter.businessUnit}</span>
          <StatusPill status={matter.status} />
        </div>
        <div className="flex items-center gap-1.5">
          <InlineAction icon={<UserPlus className="h-3 w-3" />} label="Reassign" />
          <InlineAction icon={<GitMerge className="h-3 w-3" />} label="Split" />
          <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive" />
          <InlineAction icon={<Link2 className="h-3 w-3" />} label="Link" />
          <InlineAction icon={<Play className="h-3 w-3" />} label="Command" accent onClick={onChat} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
        <span>Owner: <span className="text-foreground font-medium">{matter.owner}</span></span>
        <span>Last: {matter.lastActivity}</span>
        {linkedGoals.length > 0 && (
          <span className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {linkedGoals.map(g => g.title).join(", ")}
          </span>
        )}
      </div>

      <p className="text-[12px] text-foreground/60">{matter.description}</p>

      {/* Tab bar */}
      <div className="border-b border-border/30 flex items-center">
        {detailTabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-3 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-[10px] font-mono ml-1">{t.count}</span>
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
                  <span className="text-[13px] truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground">{t.source} · {t.timestamp}</span>
                  <StatusPill status={t.status} />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded hover:bg-secondary"><ArrowRight className="h-3 w-3 text-muted-foreground" /></button>
                    <button className="p-1 rounded hover:bg-secondary"><GitMerge className="h-3 w-3 text-muted-foreground" /></button>
                    <button className="p-1 rounded hover:bg-secondary"><X className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5 pl-4">{t.summary}</div>
            </div>
          ))}
          {matter.threads.length === 0 && <div className="text-[12px] text-muted-foreground py-2">No threads</div>}
        </div>
      )}

      {/* Commitments */}
      {tab === "commitments" && (
        <div>
          {matter.commitments.map(c => (
            <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-2">
                <StatusDot status={c.status} />
                <span className="text-[13px]">{c.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{c.owner}</span>
                <span className="text-[11px] text-muted-foreground">{c.dueDate}</span>
                <StatusPill status={c.status} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-secondary"><Check className="h-3 w-3 text-muted-foreground" /></button>
                  <button className="p-1 rounded hover:bg-secondary"><UserPlus className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artifacts */}
      {tab === "artifacts" && (
        <div>
          {matter.artifacts.map(ar => (
            <div key={ar.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-2 text-muted-foreground">
                {artifactIcon[ar.source] || <FileText className="h-3 w-3" />}
                <span className="text-[13px] text-foreground">{ar.title}</span>
                <span className="text-[11px]">{ar.source}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground">{ar.timestamp}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-secondary"><ExternalLink className="h-3 w-3 text-muted-foreground" /></button>
                  <button className="p-1 rounded hover:bg-secondary"><X className="h-3 w-3 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
          {matter.artifacts.length === 0 && <div className="text-[12px] text-muted-foreground py-2">No artifacts</div>}
        </div>
      )}

      {/* People */}
      {tab === "people" && (
        <div>
          {matter.people.map(p => (
            <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-[13px]">{p.name}</span>
                <StatusPill status={p.role === "owner" ? "active" : "idle"} />
                <span className="text-[11px] text-muted-foreground">{p.role}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {p.role !== "owner" && <InlineAction label="Make owner" />}
                <button className="p-1 rounded hover:bg-destructive/15"><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
          ))}
          <button className="text-[11px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 font-medium">
            <Plus className="h-3 w-3" />Add person
          </button>
        </div>
      )}
    </div>
  );
}
