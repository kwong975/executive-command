import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { matters, unassignedThreads, agents, goals, type Matter, type Thread } from "@/data/mockData";
import { CommandDrawer } from "@/components/CommandDrawer";
import {
  UserPlus, Archive, ArrowRight, X, ChevronRight, Link2,
  Check, Play, ExternalLink, Plus, GitMerge,
  FileText, Users, Mail, Calendar, Cog
} from "lucide-react";

type Group = "attention" | "active" | "unassigned" | "stale";

const statusDot: Record<string, string> = {
  healthy: "bg-success", blocked: "bg-destructive", "at-risk": "bg-warning", stale: "bg-muted-foreground",
};
const cDot: Record<string, string> = {
  "on-track": "bg-success", overdue: "bg-destructive", done: "bg-muted-foreground", blocked: "bg-destructive", "at-risk": "bg-warning",
};
const artifactIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-2.5 w-2.5" />,
  meeting: <Calendar className="h-2.5 w-2.5" />,
  document: <FileText className="h-2.5 w-2.5" />,
  slack: <ExternalLink className="h-2.5 w-2.5" />,
  system: <Cog className="h-2.5 w-2.5" />,
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
        <div className="w-64 border-r flex flex-col shrink-0 overflow-y-auto">
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

          {/* Create matter */}
          <div className="px-2 py-1.5 border-t border-border/30">
            <button className="w-full text-[9px] py-1 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors">
              <Plus className="h-2.5 w-2.5" />New matter
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
            <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground font-mono">
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

function GroupHeader({ label, count, open, onToggle, accent }: {
  label: string; count: number; open: boolean; onToggle: () => void; accent?: string;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-1.5 px-2 py-1 text-left border-b border-border/30 hover:bg-secondary/30 transition-colors sticky top-0 bg-background z-10">
      <ChevronRight className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className="text-[9px] font-mono text-muted-foreground">{count}</span>
    </button>
  );
}

function MatterRow({ matter, selected, onClick, onChat, stale }: {
  matter: Matter; selected: boolean; onClick: () => void; onChat: () => void; stale?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-2 py-1 cursor-pointer border-b border-border/15 group transition-colors ${
        selected ? "bg-secondary" : "hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[matter.status]}`} />
        <span className="text-[11px] truncate">{matter.title}</span>
        {matter.overdueCount > 0 && (
          <span className="text-[8px] px-1 py-px rounded bg-destructive/15 text-destructive shrink-0">{matter.overdueCount}</span>
        )}
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <span className="text-[9px] text-muted-foreground font-mono">{matter.owner}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); }} className="p-0.5 rounded hover:bg-secondary"><UserPlus className="h-2.5 w-2.5 text-muted-foreground" /></button>
          {stale && <button onClick={e => { e.stopPropagation(); }} className="p-0.5 rounded hover:bg-secondary"><Archive className="h-2.5 w-2.5 text-muted-foreground" /></button>}
          <button onClick={e => { e.stopPropagation(); onChat(); }} className="p-0.5 rounded hover:bg-accent/20"><Play className="h-2.5 w-2.5 text-muted-foreground" /></button>
        </div>
      </div>
    </div>
  );
}

function UnassignedRow({ thread, onAssign, onDismiss }: { thread: Thread; onAssign: () => void; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 border-b border-border/15 group hover:bg-secondary/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] truncate">{thread.title}</div>
        <div className="text-[9px] text-muted-foreground">{thread.source} · {thread.age || thread.timestamp}</div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onAssign} className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5">
          <UserPlus className="h-2 w-2" />Assign
        </button>
        <button onClick={onAssign} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5">
          <Link2 className="h-2 w-2" />Link
        </button>
        <button onClick={onDismiss} className="p-0.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
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
    <div className="px-3 py-2 space-y-2 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusDot[matter.status]}`} />
          <span className="text-[12px] font-semibold">{matter.title}</span>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1 py-px rounded">{matter.businessUnit}</span>
          <span className={`text-[9px] px-1 py-px rounded ${
            matter.status === "healthy" ? "bg-success/10 text-success" :
            matter.status === "blocked" ? "bg-destructive/10 text-destructive" :
            matter.status === "at-risk" ? "bg-warning/10 text-warning" :
            "bg-muted text-muted-foreground"
          }`}>{matter.status}</span>
        </div>
        <div className="flex items-center gap-1">
          <InlineBtn icon={<UserPlus className="h-2.5 w-2.5" />} label="Reassign" />
          <InlineBtn icon={<GitMerge className="h-2.5 w-2.5" />} label="Split" />
          <InlineBtn icon={<Archive className="h-2.5 w-2.5" />} label="Archive" />
          <InlineBtn icon={<Link2 className="h-2.5 w-2.5" />} label="Link" />
          <InlineBtn icon={<Play className="h-2.5 w-2.5" />} label="Command" accent onClick={onChat} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>Owner: <span className="text-foreground font-medium">{matter.owner}</span></span>
        <span>Last: {matter.lastActivity}</span>
        {linkedGoals.length > 0 && (
          <span className="flex items-center gap-0.5">
            <Link2 className="h-2.5 w-2.5" />
            {linkedGoals.map(g => g.title).join(", ")}
          </span>
        )}
      </div>

      <p className="text-[10px] text-foreground/60">{matter.description}</p>

      {/* Tab bar */}
      <div className="border-b border-border/30 flex items-center">
        {detailTabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-2 py-1 text-[10px] font-medium border-b transition-colors ${
              tab === t.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-[8px] font-mono ml-0.5">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Threads */}
      {tab === "threads" && (
        <div>
          {matter.threads.map(t => (
            <div key={t.id} className="py-1 border-b border-border/15 last:border-0 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.status === "resolved" ? "bg-muted-foreground" : "bg-accent"}`} />
                  <span className="text-[11px] truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] text-muted-foreground">{t.source} · {t.timestamp}</span>
                  <span className={`text-[9px] px-1 py-px rounded ${t.status === "resolved" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`}>{t.status}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-0.5 rounded hover:bg-secondary"><ArrowRight className="h-2.5 w-2.5 text-muted-foreground" /></button>
                    <button className="p-0.5 rounded hover:bg-secondary"><GitMerge className="h-2.5 w-2.5 text-muted-foreground" /></button>
                    <button className="p-0.5 rounded hover:bg-secondary"><X className="h-2.5 w-2.5 text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 pl-3">{t.summary}</div>
            </div>
          ))}
          {matter.threads.length === 0 && <div className="text-[10px] text-muted-foreground py-1">No threads</div>}
        </div>
      )}

      {/* Commitments */}
      {tab === "commitments" && (
        <div>
          {matter.commitments.map(c => (
            <div key={c.id} className="flex items-center justify-between py-1 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${cDot[c.status]}`} />
                <span className="text-[11px]">{c.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground">{c.owner}</span>
                <span className="text-[9px] text-muted-foreground">{c.dueDate}</span>
                <span className={`text-[9px] px-1 py-px rounded ${
                  c.status === "done" ? "bg-muted text-muted-foreground" :
                  c.status === "blocked" || c.status === "overdue" ? "bg-destructive/10 text-destructive" :
                  c.status === "at-risk" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}>{c.status}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-0.5 rounded hover:bg-secondary"><Check className="h-2.5 w-2.5 text-muted-foreground" /></button>
                  <button className="p-0.5 rounded hover:bg-secondary"><UserPlus className="h-2.5 w-2.5 text-muted-foreground" /></button>
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
            <div key={ar.id} className="flex items-center justify-between py-1 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {artifactIcon[ar.source] || <FileText className="h-2.5 w-2.5" />}
                <span className="text-[11px] text-foreground">{ar.title}</span>
                <span className="text-[9px]">{ar.source}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] text-muted-foreground">{ar.timestamp}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-0.5 rounded hover:bg-secondary"><ExternalLink className="h-2.5 w-2.5 text-muted-foreground" /></button>
                  <button className="p-0.5 rounded hover:bg-secondary"><X className="h-2.5 w-2.5 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
          {matter.artifacts.length === 0 && <div className="text-[10px] text-muted-foreground py-1">No artifacts</div>}
        </div>
      )}

      {/* People */}
      {tab === "people" && (
        <div>
          {matter.people.map(p => (
            <div key={p.id} className="flex items-center justify-between py-1 border-b border-border/15 last:border-0 group">
              <div className="flex items-center gap-1.5">
                <Users className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[11px]">{p.name}</span>
                <span className={`text-[9px] px-1 py-px rounded ${
                  p.role === "owner" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                }`}>{p.role}</span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {p.role !== "owner" && <button className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">Make owner</button>}
                <button className="p-0.5 rounded hover:bg-destructive/15"><X className="h-2.5 w-2.5 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
          ))}
          <button className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground mt-1 flex items-center gap-0.5">
            <Plus className="h-2 w-2" />Add person
          </button>
        </div>
      )}
    </div>
  );
}

function InlineBtn({ label, icon, accent, onClick }: { label: string; icon: React.ReactNode; accent?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors ${
      accent ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`}>
      {icon}{label}
    </button>
  );
}
