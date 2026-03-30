import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { matters, unassignedThreads, agents, type Matter, type Thread } from "@/data/mockData";
import { CommandDrawer } from "@/components/CommandDrawer";
import {
  UserPlus, Archive, ArrowRight, X, ChevronRight, Link2,
  AlertTriangle, Check, MoreHorizontal, Play, ExternalLink
} from "lucide-react";

type Group = "attention" | "active" | "unassigned" | "stale";

const statusDot: Record<string, string> = {
  healthy: "bg-success",
  blocked: "bg-destructive",
  "at-risk": "bg-warning",
  stale: "bg-muted-foreground",
};

const cDot: Record<string, string> = {
  "on-track": "bg-success",
  overdue: "bg-destructive",
  done: "bg-muted-foreground",
  blocked: "bg-destructive",
  "at-risk": "bg-warning",
};

export default function MattersPage() {
  const [selected, setSelected] = useState<Matter | null>(null);
  const [threads, setThreads] = useState(unassignedThreads);
  const [chatAgent, setChatAgent] = useState<ReturnType<typeof agents.find>>(undefined);
  const [expandedGroup, setExpandedGroup] = useState<Record<Group, boolean>>({
    attention: true, active: true, unassigned: true, stale: true,
  });

  const needsAttention = matters.filter(m => m.status === "blocked" || m.status === "at-risk");
  const active = matters.filter(m => m.status === "healthy");
  const stale = matters.filter(m => m.status === "stale");

  const toggle = (g: Group) => setExpandedGroup(prev => ({ ...prev, [g]: !prev[g] }));

  const openChat = (matterId?: string) => {
    const m = matters.find(x => x.id === matterId);
    if (m) {
      const a = agents.find(x => x.id === m.ownerAgentId);
      setChatAgent(a);
    }
  };

  return (
    <AppLayout title="Matters">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Matter List */}
        <div className="w-72 border-r flex flex-col shrink-0 overflow-y-auto">
          {/* Needs Attention */}
          <GroupHeader
            label="Needs Attention"
            count={needsAttention.length}
            open={expandedGroup.attention}
            onToggle={() => toggle("attention")}
            accent="destructive"
          />
          {expandedGroup.attention && needsAttention.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} onChat={() => openChat(m.id)} />
          ))}

          {/* Active */}
          <GroupHeader
            label="Active"
            count={active.length}
            open={expandedGroup.active}
            onToggle={() => toggle("active")}
          />
          {expandedGroup.active && active.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} onChat={() => openChat(m.id)} />
          ))}

          {/* Unassigned */}
          <GroupHeader
            label="Unassigned"
            count={threads.length}
            open={expandedGroup.unassigned}
            onToggle={() => toggle("unassigned")}
            accent="warning"
          />
          {expandedGroup.unassigned && threads.map(t => (
            <UnassignedRow key={t.id} thread={t} onAssign={() => setThreads(prev => prev.filter(x => x.id !== t.id))} onDismiss={() => setThreads(prev => prev.filter(x => x.id !== t.id))} />
          ))}

          {/* Stale */}
          <GroupHeader
            label="Stale / Archive"
            count={stale.length}
            open={expandedGroup.stale}
            onToggle={() => toggle("stale")}
          />
          {expandedGroup.stale && stale.map(m => (
            <MatterRow key={m.id} matter={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} onChat={() => openChat(m.id)} stale />
          ))}
        </div>

        {/* CENTER — Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <MatterDetail matter={selected} onChat={() => openChat(selected.id)} />
          ) : (
            <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground">
              Select a matter to inspect
            </div>
          )}
        </div>

        {/* RIGHT — Command Drawer */}
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
      <span className="text-[10px] text-muted-foreground">{count}</span>
    </button>
  );
}

function MatterRow({ matter, selected, onClick, onChat, stale }: {
  matter: Matter; selected: boolean; onClick: () => void; onChat: () => void; stale?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-2 py-1 cursor-pointer border-b border-border/20 group transition-colors ${
        selected ? "bg-secondary" : "hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[matter.status]}`} />
        <span className="text-[11px] truncate">{matter.title}</span>
        {matter.overdueCount > 0 && (
          <span className="text-[9px] px-1 py-px rounded bg-destructive/15 text-destructive shrink-0">{matter.overdueCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] text-muted-foreground font-mono">{matter.owner}</span>
        {stale && (
          <button onClick={e => { e.stopPropagation(); }} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
            <Archive className="h-2.5 w-2.5" />
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onChat(); }} className="p-0.5 rounded hover:bg-accent/20 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function UnassignedRow({ thread, onAssign, onDismiss }: { thread: Thread; onAssign: () => void; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 border-b border-border/20 group hover:bg-secondary/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] truncate">{thread.title}</div>
        <div className="text-[9px] text-muted-foreground">{thread.source} · {thread.age || thread.timestamp}</div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onAssign} className="text-[9px] px-1 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
          <UserPlus className="h-2.5 w-2.5" />
        </button>
        <button onClick={onDismiss} className="text-[9px] px-1 py-0.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

function MatterDetail({ matter, onChat }: { matter: Matter; onChat: () => void }) {
  const agent = agents.find(a => a.id === matter.ownerAgentId);

  return (
    <div className="px-3 py-2 space-y-3 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusDot[matter.status]}`} />
          <span className="text-[12px] font-semibold">{matter.title}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{matter.businessUnit}</span>
          <span className={`text-[9px] px-1 py-px rounded ${
            matter.status === "healthy" ? "bg-success/10 text-success" :
            matter.status === "blocked" ? "bg-destructive/10 text-destructive" :
            matter.status === "at-risk" ? "bg-warning/10 text-warning" :
            "bg-muted text-muted-foreground"
          }`}>{matter.status}</span>
        </div>
        <div className="flex items-center gap-1">
          <InlineAction label="Reassign" icon={<UserPlus className="h-2.5 w-2.5" />} />
          <InlineAction label="Archive" icon={<Archive className="h-2.5 w-2.5" />} />
          <InlineAction label="Command" icon={<Play className="h-2.5 w-2.5" />} accent onClick={onChat} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>Owner: <span className="text-foreground font-medium">{matter.owner}</span></span>
        <span>Last: {matter.lastActivity}</span>
        {matter.goalIds.length > 0 && <span className="flex items-center gap-0.5"><Link2 className="h-2.5 w-2.5" /> {matter.goalIds.length} goals</span>}
      </div>

      <p className="text-[11px] text-foreground/70">{matter.description}</p>

      {/* Commitments */}
      <div>
        <SectionLabel>Commitments · {matter.commitments.length}</SectionLabel>
        {matter.commitments.map(c => (
          <div key={c.id} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0 group">
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
                c.status === "at-risk" ? "bg-warning/10 text-warning" :
                "bg-success/10 text-success"
              }`}>{c.status}</span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary">
                <Check className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary">
                <UserPlus className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Threads */}
      <div>
        <SectionLabel>Threads · {matter.threads.length}</SectionLabel>
        {matter.threads.map(t => (
          <div key={t.id} className="py-1 border-b border-border/20 last:border-0 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.status === "resolved" ? "bg-muted-foreground" : "bg-accent"}`} />
                <span className="text-[11px] truncate">{t.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] text-muted-foreground">{t.source} · {t.timestamp}</span>
                <span className={`text-[9px] px-1 py-px rounded ${
                  t.status === "resolved" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"
                }`}>{t.status}</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary">
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 pl-3">{t.summary}</div>
          </div>
        ))}
        {matter.threads.length === 0 && <div className="text-[10px] text-muted-foreground py-1">No threads</div>}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{children}</div>;
}

function InlineAction({ label, icon, accent, onClick }: { label: string; icon: React.ReactNode; accent?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
      accent ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`}>
      {icon}{label}
    </button>
  );
}
