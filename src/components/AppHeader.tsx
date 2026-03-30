import { useState } from "react";
import { systemHealth } from "@/data/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { X, MessageSquare } from "lucide-react";

const sevColor = { ok: "text-success", warning: "text-warning", error: "text-destructive" };
const healthDot = { green: "bg-success", yellow: "bg-warning", red: "bg-destructive" };

export function AppHeader({ title }: { title?: string }) {
  const [showSyssie, setShowSyssie] = useState(false);

  return (
    <>
      <div className="h-8 border-b flex items-center justify-between px-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          {title && <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</span>}
        </div>
        <button
          onClick={() => setShowSyssie(!showSyssie)}
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-secondary transition-colors"
        >
          <div className={`h-1.5 w-1.5 rounded-full ${healthDot[systemHealth.overall]}`} />
          <span className="text-[10px] text-muted-foreground font-mono">SYS</span>
        </button>
      </div>

      {showSyssie && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowSyssie(false)}>
          <div className="w-80 bg-background border-l h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-8 flex items-center justify-between px-3 border-b shrink-0">
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${healthDot[systemHealth.overall]}`} />
                <span className="text-[11px] font-medium">Syssie — System Status</span>
              </div>
              <button onClick={() => setShowSyssie(false)} className="p-0.5 rounded hover:bg-secondary">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {systemHealth.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/40 last:border-0">
                  <span className={`text-[10px] mt-0.5 ${sevColor[issue.severity]}`}>●</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px]">{issue.label}</span>
                    {issue.action && (
                      <button className="block text-[10px] text-accent hover:underline mt-0.5">{issue.action}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-secondary text-[11px] text-foreground hover:bg-secondary/80 transition-colors">
                <MessageSquare className="h-3 w-3" />
                Talk to Syssie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}