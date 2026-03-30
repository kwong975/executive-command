import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import { X, Send, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

const messageStore: Record<string, Message[]> = {};

function getInitialMessage(agent: Agent): Message {
  return {
    id: "init",
    role: "agent",
    content: `${agent.currentTask}. What do you need?`,
    timestamp: "now",
  };
}

export function AgentChatDrawer({ agent, onClose }: { agent: Agent | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agent) {
      if (!messageStore[agent.id]) {
        messageStore[agent.id] = [getInitialMessage(agent)];
      }
      setMessages(messageStore[agent.id]);
    }
  }, [agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !agent) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: "now" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    messageStore[agent.id] = newMessages;
    setInput("");

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Understood. I'll look into that and follow up shortly.",
        timestamp: "now",
      };
      const updated = [...newMessages, reply];
      setMessages(updated);
      messageStore[agent.id] = updated;
    }, 600);
  };

  if (!agent) return null;

  return (
    <div className="w-80 border-l flex flex-col shrink-0 bg-background">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-accent" />
          <span className="text-xs font-medium">{agent.name}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded px-2.5 py-1.5 text-xs ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Command ${agent.name}...`}
            className="flex-1 text-xs bg-secondary rounded px-2.5 py-1.5 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="p-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-30 transition-all"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
