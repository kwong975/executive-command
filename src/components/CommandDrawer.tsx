import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import { X, Send, Terminal, Zap, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

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

    // Simulate action preview
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
    <div className="w-60 border-l flex flex-col shrink-0 bg-background">
      {/* Header */}
      <div className="h-7 flex items-center justify-between px-2 border-b shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-2.5 w-2.5 text-accent" />
          <span className="text-[10px] font-mono font-semibold">{agent.name}</span>
          <span className="text-[9px] text-muted-foreground">· {agent.role}</span>
        </div>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-secondary">
          <X className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1">
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === "system" ? (
              <div className="bg-secondary/60 rounded px-1.5 py-1 text-[10px] leading-relaxed border border-border/30">
                <div className="flex items-center gap-1">
                  {msg.action?.status === "pending" && <AlertTriangle className="h-2.5 w-2.5 text-warning shrink-0" />}
                  {msg.action?.status === "done" && <CheckCircle className="h-2.5 w-2.5 text-success shrink-0" />}
                  <span>{msg.content}</span>
                </div>
                {msg.action?.status === "pending" && (
                  <button
                    onClick={() => confirmAction(msg.id)}
                    className="mt-1 text-[9px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-0.5"
                  >
                    <Zap className="h-2 w-2" />Confirm
                  </button>
                )}
              </div>
            ) : (
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded px-1.5 py-1 text-[10px] leading-relaxed ${
                  msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick commands */}
      <div className="px-2 py-1 border-t border-border/30 flex flex-wrap gap-0.5">
        {quickCommands.map(cmd => (
          <button key={cmd} onClick={() => send(cmd)} className="text-[8px] px-1 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-0.5">
            <Zap className="h-2 w-2" />{cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`> ${agent.name.toLowerCase()}...`}
            className="flex-1 text-[10px] bg-secondary rounded px-2 py-1 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent font-mono"
          />
          <button onClick={() => send()} disabled={!input.trim()} className="p-1 rounded bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-20">
            <Send className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
