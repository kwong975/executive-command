import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import {
  X, Send, Terminal, Zap, CheckCircle, AlertTriangle,
  Clock, Activity, MessageSquare, FileText, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot, StatusPill } from "@/components/shared";

// ===== TYPES =====
interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  time?: string;
  action?: { label: string; status: "pending" | "confirmed" | "done" | "failed" };
}

const store: Record<string, Message[]> = {};

const quickCommands = [
  "status report",
  "what's blocked?",
  "reassign work",
  "run diagnostics",
  "summarize activity",
];

type DrawerFocus = "default" | "chat" | "activity";

export function AgentDrawer({
  agent,
  onClose,
  initialFocus = "default",
}: {
  agent: Agent | null;
  onClose: () => void;
  initialFocus?: DrawerFocus;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent) {
      if (!store[agent.id]) {
        store[agent.id] = [
          {
            id: "init",
            role: "agent",
            content: `${agent.currentTask}. How can I help?`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      }
      setMessages(store[agent.id]);
    }
  }, [agent]);

  useEffect(() => {
    if (agent && initialFocus === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [agent, initialFocus]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !agent) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, time: now };
    const next = [...messages, userMsg];
    setMessages(next);
    store[agent.id] = next;
    setInput("");

    const isAction = msg.startsWith("assign") || msg.startsWith("reassign") || msg.startsWith("fix") || msg.startsWith("run");
    if (isAction) {
      setTimeout(() => {
        const preview: Message = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: `Proposed: ${msg}`,
          time: now,
          action: { label: "Confirm", status: "pending" },
        };
        const updated = [...next, preview];
        setMessages(updated);
        store[agent.id] = updated;
      }, 300);
    } else {
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "Understood. Acting on that now.",
          time: now,
        };
        const updated = [...next, reply];
        setMessages(updated);
        store[agent.id] = updated;
      }, 400);
    }
  };

  const confirmAction = (msgId: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id === msgId && m.action) return { ...m, action: { ...m.action, status: "done" as const } };
        return m;
      });
      const result: Message = { id: (Date.now() + 2).toString(), role: "system", content: "✓ Action completed successfully." };
      const final = [...updated, result];
      if (agent) store[agent.id] = final;
      return final;
    });
  };

  if (!agent) return null;

  const openCommitments = 3; // mock
  const recentActivityCount = agent.activity.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[1100px] bg-background border-l border-border/50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold bg-secondary px-2.5 py-1 rounded-md text-muted-foreground">
              {agent.avatar}
            </span>
            <span className="text-sm font-semibold">{agent.name}</span>
            <span className="text-xs text-muted-foreground">· {agent.role}</span>
            <StatusPill status={agent.status} />
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* 3-column body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* LEFT — Agent Context */}
          <div className="w-[240px] border-r border-border/30 flex flex-col overflow-y-auto shrink-0">
            <div className="p-4 space-y-5">
              {/* Identity */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Agent</div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-mono font-bold text-muted-foreground">
                    {agent.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.role}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{agent.purpose}</p>
              </div>

              {/* Status */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Status</div>
                <div className="flex items-center gap-2">
                  <StatusDot status={agent.status} size="md" />
                  <span className="text-sm capitalize">{agent.status}</span>
                </div>
                {agent.currentTask && (
                  <p className="text-xs text-muted-foreground mt-1.5">{agent.currentTask}</p>
                )}
              </div>

              {/* Current Focus */}
              {agent.workingOn.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Current Focus</div>
                  <div className="space-y-1.5">
                    {agent.workingOn.map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground/80 leading-relaxed">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Metrics</div>
                <div className="space-y-1.5">
                  <MetricRow label="Open commitments" value={openCommitments} />
                  <MetricRow label="Recent activity" value={recentActivityCount} />
                  <MetricRow
                    label="Failed (24h)"
                    value={agent.failedLast24h}
                    alert={agent.failedLast24h > 0}
                  />
                  <MetricRow
                    label="Stalled work"
                    value={agent.stalledWork}
                    alert={agent.stalledWork > 0}
                  />
                </div>
              </div>

              {/* Skills summary */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Skills</div>
                <div className="space-y-1">
                  {agent.skills.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1">
                      <span className="text-xs font-mono">{s.name}</span>
                      <StatusDot status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER — Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="h-10 border-b border-border/30 px-4 flex items-center gap-2 shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "system" ? (
                    <div className="bg-secondary/50 rounded-md px-3 py-2.5 text-sm leading-relaxed border border-border/30">
                      <div className="flex items-center gap-2">
                        {msg.action?.status === "pending" && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
                        {msg.action?.status === "done" && <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />}
                        <span className="flex-1">{msg.content}</span>
                        {msg.time && <span className="text-xs text-muted-foreground/60 shrink-0">{msg.time}</span>}
                      </div>
                      {msg.action?.status === "pending" && (
                        <button
                          onClick={() => confirmAction(msg.id)}
                          className="mt-2 text-xs px-2.5 py-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-1.5 font-medium transition-colors shadow-sm h-7"
                        >
                          <Zap className="h-3 w-3" />
                          Confirm
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className="flex flex-col max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-md px-3 py-2 text-sm leading-relaxed",
                            msg.role === "user"
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary/60 text-foreground"
                          )}
                        >
                          {msg.content}
                        </div>
                        {msg.time && (
                          <span className={cn(
                            "text-[10px] text-muted-foreground/50 mt-0.5",
                            msg.role === "user" ? "text-right" : "text-left"
                          )}>{msg.time}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Quick commands */}
            <div className="px-4 py-2 border-t border-border/20 flex flex-wrap gap-1.5">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all font-medium"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Ask ${agent.name}…`}
                  className="flex-1 text-sm bg-secondary rounded-md px-3 py-2 outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent/50 transition-shadow"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-20 transition-all shadow-sm h-9 w-9 flex items-center justify-center"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Activity Log */}
          <div className="w-[280px] border-l border-border/30 flex flex-col overflow-hidden shrink-0">
            <div className="h-10 border-b border-border/30 px-4 flex items-center gap-2 shrink-0">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Activity Log</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {agent.activity.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "px-4 py-2.5 border-b border-border/20 flex items-start gap-2.5",
                    entry.outcome === "failure" && "bg-destructive/5"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {entry.outcome === "failure" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    ) : entry.outcome === "pending" ? (
                      <Clock className="h-3.5 w-3.5 text-warning" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 text-success/70" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{entry.time}</span>
                      <span className="text-xs text-foreground/80 truncate">{entry.action}</span>
                    </div>
                    {entry.detail && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{entry.detail}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Cron history */}
              <div className="px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Cron Jobs</div>
                {agent.cronJobs.map((cron, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <StatusDot status={cron.status} />
                      <span className="text-xs">{cron.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{cron.lastRun}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xs font-mono tabular-nums font-semibold",
          alert ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
