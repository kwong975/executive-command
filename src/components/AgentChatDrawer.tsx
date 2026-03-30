import { useState, useRef, useEffect } from "react";
import { type Agent } from "@/data/mockData";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

const initialMessages: Record<string, Message[]> = {};

function getInitialMessage(agent: Agent): Message {
  return {
    id: "init",
    role: "agent",
    content: `Hi, I'm ${agent.name}. ${agent.currentTask}. How can I help?`,
    timestamp: "Just now",
  };
}

export function AgentChatDrawer({ agent, onClose }: { agent: Agent | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agent) {
      if (!initialMessages[agent.id]) {
        initialMessages[agent.id] = [getInitialMessage(agent)];
      }
      setMessages(initialMessages[agent.id]);
    }
  }, [agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !agent) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: "Just now" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    initialMessages[agent.id] = newMessages;
    setInput("");

    // Simulate response
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Understood. I'll look into that and follow up shortly.",
        timestamp: "Just now",
      };
      const updated = [...newMessages, reply];
      setMessages(updated);
      initialMessages[agent.id] = updated;
    }, 800);
  };

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="border-l bg-surface-elevated flex flex-col overflow-hidden shrink-0"
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
                {agent.avatar}
              </div>
              <div>
                <p className="text-sm font-display font-semibold">{agent.name}</p>
                <p className="text-[11px] text-muted-foreground">{agent.role}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Message ${agent.name}...`}
                className="flex-1 text-sm bg-muted rounded-md px-3 py-2 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
