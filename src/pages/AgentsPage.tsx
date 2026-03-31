import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AgentDrawer } from "@/components/AgentDrawer";
import { StatusDot, StatusPill, InlineAction } from "@/components/shared";
import { useAgentsLive } from "@/hooks/useAgentsLive";
import type { Agent } from "@/data/mockData";
import {
  Loader2, MessageSquare, ExternalLink, Activity,
  AlertTriangle, Clock, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const teams = [
  { id: "corporate", label: "Corporate Platform", active: true },
  { id: "finance", label: "Finance", active: false },
  { id: "engineering", label: "Product / Engineering", active: false },
  { id: "marketing", label: "Social / Marketing", active: false },
];

type DrawerFocus = "default" | "chat" | "activity";

export default function AgentsPage() {
  const { agents, isLoading } = useAgentsLive();
  const [selectedTeam, setSelectedTeam] = useState("corporate");
  const [drawerAgent, setDrawerAgent] = useState<Agent | null>(null);
  const [drawerFocus, setDrawerFocus] = useState<DrawerFocus>("default");

  const openDrawer = (agent: Agent, focus: DrawerFocus = "default") => {
    setDrawerAgent(agent);
    setDrawerFocus(focus);
  };

  if (isLoading) {
    return (
      <AppLayout title="Agents">
        <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading agents...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agents">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Team Navigation */}
        <div className="w-48 border-r border-border/50 flex flex-col shrink-0">
          <div className="px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">Teams</div>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-md text-sm flex items-center gap-2 transition-colors mb-0.5",
                  selectedTeam === team.id
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  !team.active && team.id !== "corporate" && "opacity-50"
                )}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{team.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content — Agent Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1200px]">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onOpen={() => openDrawer(agent, "default")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Agent Drawer */}
      <AgentDrawer
        agent={drawerAgent}
        onClose={() => setDrawerAgent(null)}
        initialFocus={drawerFocus}
      />
    </AppLayout>
  );
}

// ===== AGENT CARD =====

function AgentCard({
  agent,
  onOpen,
  onChat,
  onActivity,
}: {
  agent: Agent;
  onOpen: () => void;
  onChat: () => void;
  onActivity: () => void;
}) {
  const hasErrors = agent.failedLast24h > 0;
  const hasStalled = agent.stalledWork > 0;
  const degradedSkills = agent.skills.filter((s) => s.status === "degraded" || s.status === "disabled").length;

  // Build signals (max 3)
  const signals: { icon: React.ReactNode; text: string; type: "error" | "warning" | "info" }[] = [];
  if (hasErrors) {
    signals.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: `${agent.failedLast24h} failed in 24h`,
      type: "error",
    });
  }
  if (hasStalled) {
    signals.push({
      icon: <Clock className="h-3 w-3" />,
      text: `${agent.stalledWork} stalled`,
      type: "warning",
    });
  }
  if (degradedSkills > 0 && signals.length < 3) {
    signals.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: `${degradedSkills} skill${degradedSkills > 1 ? "s" : ""} degraded`,
      type: "warning",
    });
  }
  if (signals.length === 0) {
    // Last activity as info
    const lastAct = agent.activity[0];
    if (lastAct) {
      signals.push({
        icon: <Activity className="h-3 w-3" />,
        text: `Last: ${lastAct.time}`,
        type: "info",
      });
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-background p-4 flex flex-col gap-3 transition-all duration-150 hover:border-border hover:shadow-sm cursor-pointer group",
        agent.status === "error" && "border-destructive/30"
      )}
      onClick={onOpen}
    >
      {/* Top — Identity */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold shrink-0",
          agent.status === "error"
            ? "bg-destructive/10 text-destructive"
            : agent.status === "idle"
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-muted-foreground"
        )}>
          {agent.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{agent.name}</div>
          <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
        </div>
        <StatusPill status={agent.status} />
      </div>

      {/* Middle — Signals */}
      <div className="space-y-1.5">
        {signals.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 text-xs",
              s.type === "error"
                ? "text-destructive"
                : s.type === "warning"
                ? "text-warning"
                : "text-muted-foreground"
            )}
          >
            {s.icon}
            <span>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom — Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
        <InlineAction
          icon={<ExternalLink className="h-3 w-3" />}
          label="Open"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        />
        <InlineAction
          icon={<MessageSquare className="h-3 w-3" />}
          label="Chat"
          onClick={(e) => { e.stopPropagation(); onChat(); }}
        />
        <InlineAction
          icon={<Activity className="h-3 w-3" />}
          label="Activity"
          onClick={(e) => { e.stopPropagation(); onActivity(); }}
        />
      </div>
    </div>
  );
}
