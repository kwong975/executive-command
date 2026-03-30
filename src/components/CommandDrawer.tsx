import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import { X, Send, Terminal, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  action?: { label: string; status: "pending" | "confirmed" | "done" | "failed" };
}

const store: Record<string, Message[]> = {};

const quickCommands = [
  "why is this blocked?",
  "assign to ThuyTM3",
  "fix failed cron",
  "run diagnostics",
  "merge matters",
  "summarize status",
];

export function CommandDrawer({ agent, onClose }: { agent: Agent | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agent) {
      if (!store[agent.id]) {
        store[agent.id] = [{ id: "init", role: "agent", content: `${agent.currentTask}. What do you need?` }];
      }
      setMessages(store[agent.id]);
    }
  }, [agent]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !agent) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    store[agent.id] = next;
    setInput("");

    const isAction = msg.startsWith("assign") || msg.startsWith("fix") || msg.startsWith("merge") || msg.startsWith("run");
    if (isAction) {
      setTimeout(() => {
        const preview: Message = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: `Proposed: ${msg}`,
          action: { label: "Confirm", status: "pending" },
        };
        const updated = [...next, preview];
        setMessages(updated);
        store[agent.id] = updated;
      }, 300);
    } else {
      setTimeout(() => {
        const reply: Message = { id: (Date.now() + 1).toString(), role: "agent", content: "Understood. Acting on that now." };
        const updated = [...next, reply];
        setMessages(updated);
        store[agent.id] = updated;
      }, 400);
    }
  };

  const confirmAction = (msgId: string) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id === msgId && m.action) {
          return { ...m, action: { ...m.action, status: "done" as const } };
        }
        return m;
      });
      const result: Message = {
        id: (Date.now() + 2).toString(),
        role: "system",
        content: "✓ Action completed successfully.",
      };
      const final = [...updated, result];
      if (agent) store[agent.id] = final;
      return final;
    });
  };

  if (!agent) return null;

  return (
    <div className="w-[300px] border-l border-border/30 flex flex-col shrink-0 bg-background">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span className="text-[13px] font-mono font-semibold">{agent.name}</span>
          <span className="text-[11px] text-muted-foreground">· {agent.role}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === "system" ? (
              <div className="bg-secondary/50 rounded-md px-3 py-2 text-[13px] leading-relaxed border border-border/20">
                <div className="flex items-center gap-2">
                  {msg.action?.status === "pending" && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
                  {msg.action?.status === "done" && <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />}
                  <span>{msg.content}</span>
                </div>
                {msg.action?.status === "pending" && (
                  <button
                    onClick={() => confirmAction(msg.id)}
                    className="mt-2 text-[11px] px-2.5 py-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-1.5 font-medium transition-colors shadow-sm shadow-accent/10"
                  >
                    <Zap className="h-3 w-3" />Confirm
                  </button>
                )}
              </div>
            ) : (
              <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[88%] rounded-md px-3 py-2 text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent/90 text-accent-foreground"
                    : "bg-secondary/60 text-foreground"
                )}>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick commands */}
      <div className="px-3 py-2 border-t border-border/20 flex flex-wrap gap-1">
        {quickCommands.map(cmd => (
          <button
            key={cmd}
            onClick={() => send(cmd)}
            className="text-[10px] px-1.5 py-1 rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-100 flex items-center gap-1 font-medium"
          >
            <Zap className="h-2.5 w-2.5 text-accent/60" />{cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`> ${agent.name.toLowerCase()}...`}
            className="flex-1 text-[13px] bg-secondary/80 rounded-md px-3 py-2 outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-accent/50 font-mono transition-shadow"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-20 transition-all shadow-sm shadow-accent/10"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}