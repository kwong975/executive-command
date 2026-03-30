import { useState } from "react";
import { systemHealth } from "@/data/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusDot, InlineAction } from "@/components/shared";
import { X, MessageSquare, Play, AlertTriangle, Check } from "lucide-react";

const healthDot: Record<string, string> = { green: "active", yellow: "warning", red: "error" };

export function AppHeader({ title }: { title?: string }) {
  const [showSyssie, setShowSyssie] = useState(false);

  return (
    <>
      <div className="h-11 border-b flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          {title && <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>}
        </div>
        <button
          onClick={() => setShowSyssie(!showSyssie)}
          className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-secondary transition-colors"
        >
          <StatusDot status={healthDot[systemHealth.overall]} />
          <span className="text-[12px] text-muted-foreground font-mono">SYS</span>
        </button>
      </div>

      {showSyssie && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowSyssie(false)}>
          <div className="w-80 bg-background border-l h-full flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="h-11 flex items-center justify-between px-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <StatusDot status={healthDot[systemHealth.overall]} size="md" />
                <span className="text-sm font-semibold">Syssie</span>
              </div>
              <button onClick={() => setShowSyssie(false)} className="p-1 rounded hover:bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {systemHealth.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2 border-b border-border/30 last:border-0 group">
                  {issue.severity === "error" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-px" /> :
                   issue.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-px" /> :
                   <Check className="h-4 w-4 text-success shrink-0 mt-px" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{issue.label}</span>
                    {issue.action && (
                      <button className="block text-[12px] text-accent hover:text-accent/80 mt-1 flex items-center gap-1">
                        <Play className="h-3.5 w-3.5" />{issue.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2.5">
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors font-medium">
                <MessageSquare className="h-4 w-4" />Talk to Syssie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
