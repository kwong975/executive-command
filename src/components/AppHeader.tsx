import { useState } from "react";
import { systemHealth } from "@/data/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { X, MessageSquare, Play, AlertTriangle, Check } from "lucide-react";

const healthDot = { green: "bg-success", yellow: "bg-warning", red: "bg-destructive" };

export function AppHeader({ title }: { title?: string }) {
  const [showSyssie, setShowSyssie] = useState(false);

  return (
    <>
      <div className="h-7 border-b flex items-center justify-between px-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          {title && <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>}
        </div>
        <button
          onClick={() => setShowSyssie(!showSyssie)}
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-secondary transition-colors"
        >
          <div className={`h-1.5 w-1.5 rounded-full ${healthDot[systemHealth.overall]}`} />
          <span className="text-[9px] text-muted-foreground font-mono">SYS</span>
        </button>
      </div>

      {showSyssie && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowSyssie(false)}>
          <div className="w-72 bg-background border-l h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="h-7 flex items-center justify-between px-2.5 border-b shrink-0">
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${healthDot[systemHealth.overall]}`} />
                <span className="text-[10px] font-semibold">Syssie</span>
              </div>
              <button onClick={() => setShowSyssie(false)} className="p-0.5 rounded hover:bg-secondary">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {systemHealth.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 py-1 border-b border-border/30 last:border-0 group">
                  {issue.severity === "error" ? <AlertTriangle className="h-2.5 w-2.5 text-destructive shrink-0 mt-px" /> :
                   issue.severity === "warning" ? <AlertTriangle className="h-2.5 w-2.5 text-warning shrink-0 mt-px" /> :
                   <Check className="h-2.5 w-2.5 text-success shrink-0 mt-px" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px]">{issue.label}</span>
                    {issue.action && (
                      <button className="block text-[9px] text-accent hover:text-accent/80 mt-0.5 flex items-center gap-0.5">
                        <Play className="h-2 w-2" />{issue.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-1.5">
              <button className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-secondary text-[10px] text-foreground hover:bg-secondary/80 transition-colors">
                <MessageSquare className="h-2.5 w-2.5" />Talk to Syssie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
