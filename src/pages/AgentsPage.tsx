import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AgentDetailView } from "@/components/AgentDetailView";
import { CommandDrawer } from "@/components/CommandDrawer";
import { StatusDot } from "@/components/shared";
import { useAgentsLive } from "@/hooks/useAgentsLive";
import type { Agent } from "@/data/mockData";
import { Loader2 } from "lucide-react";

export default function AgentsPage() {
  const { agents, isLoading } = useAgentsLive();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);

  const selected = agents.find(a => a.id === selectedId) || agents[0] || null;

  if (isLoading) {
    return (
      <AppLayout title="Agents">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /><span className="text-[13px]">Loading agents...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agents">
      <div className="flex flex-1 overflow-hidden">
        {/* Agent list */}
        <div className="w-52 border-r flex flex-col shrink-0 overflow-y-auto">
          <div className="py-1">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
                  selected?.id === a.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <StatusDot status={a.status} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-[12px] text-muted-foreground truncate">{a.role}</div>
                </div>
                {a.failedLast24h > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-destructive/15 text-destructive font-medium shrink-0">{a.failedLast24h}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <AgentDetailView agent={selected} onOpenChat={() => setChatAgent(selected)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No agents found</div>
        )}
        <CommandDrawer agent={chatAgent} onClose={() => setChatAgent(null)} />
      </div>
    </AppLayout>
  );
}
