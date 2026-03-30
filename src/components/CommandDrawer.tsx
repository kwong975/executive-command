import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import { X, Send, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

const store: Record<string, Message[]> = {};

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

  const send = () => {
    if (!input.trim() || !agent) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    store[agent.id] = next;
    setInput("");
    setTimeout(() => {
      const reply: Message = { id: (Date.now() + 1).toString(), role: "agent", content: "Understood. Acting on that now." };
      const updated = [...next, reply];
      setMessages(updated);
      store[agent.id] = updated;
    }, 500);
  };

  if (!agent) return null;

  return (
    <div className="w-72 border-l flex flex-col shrink-0 bg-background">
      <div className="h-8 flex items-center justify-between px-2.5 border-b shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3 w-3 text-accent" />
          <span className="text-[11px] font-mono font-medium">{agent.name}</span>
          <span className="text-[10px] text-muted-foreground">· {agent.role}</span>
        </div>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-secondary">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded px-2 py-1 text-[11px] leading-relaxed ${
              msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t p-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`> command ${agent.name.toLowerCase()}...`}
            className="flex-1 text-[11px] bg-secondary rounded px-2 py-1.5 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent font-mono"
          />
          <button onClick={send} disabled={!input.trim()} className="p-1 rounded bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-20">
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
