import { useState } from "react";
import { systemHealth } from "@/data/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusDot } from "@/components/shared";
import { X, MessageSquare, Play, AlertTriangle, Check, Sun, Moon, Monitor } from "lucide-react";
import { IS_MOCK_MODE } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

const healthDot: Record<string, string> = { green: "active", yellow: "warning", red: "error" };

export function AppHeader({ title }: { title?: string }) {
  const [showSyssie, setShowSyssie] = useState(false);
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: "light" | "dark" | "system"; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Light" },
    { value: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Dark" },
    { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "System" },
  ];

  return (
    <>
      <div className="h-11 border-b border-border/50 flex items-center justify-between px-3 shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          {title && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>
          )}
          {IS_MOCK_MODE && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium border border-accent/20">
              Preview
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                title={opt.label}
                className={`p-1.5 rounded transition-colors ${
                  theme === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.icon}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSyssie(!showSyssie)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-secondary transition-all duration-100"
          >
            <StatusDot status={healthDot[systemHealth.overall]} />
            <span className="text-xs text-muted-foreground font-mono tracking-wide">SYS</span>
          </button>
        </div>
      </div>

      {showSyssie && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowSyssie(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div
            className="relative w-80 bg-background border-l border-border/50 h-full flex flex-col animate-slide-in-right shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <StatusDot status={healthDot[systemHealth.overall]} size="md" />
                <span className="text-sm font-semibold">Syssie</span>
                <span className="text-xs text-muted-foreground">System Operator</span>
              </div>
              <button onClick={() => setShowSyssie(false)} className="p-1 rounded-md hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {systemHealth.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0 group">
                  {issue.severity === "error" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> :
                   issue.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" /> :
                   <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm leading-relaxed">{issue.label}</span>
                    {issue.action && (
                      <button className="mt-1.5 text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-medium transition-colors">
                        <Play className="h-3 w-3" />{issue.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 p-3">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors font-medium">
                <MessageSquare className="h-3.5 w-3.5" />Talk to Syssie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
