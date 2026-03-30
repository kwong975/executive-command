import React from "react";
import {
  AlertTriangle, Check, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== STATUS DOT =====
const dotColor: Record<string, string> = {
  healthy: "bg-success",
  active: "bg-success",
  ok: "bg-success",
  "on-track": "bg-success",
  done: "bg-muted-foreground/50",
  blocked: "bg-destructive",
  error: "bg-destructive",
  failed: "bg-destructive",
  overdue: "bg-destructive",
  "at-risk": "bg-warning",
  warning: "bg-warning",
  degraded: "bg-warning",
  idle: "bg-muted-foreground/50",
  stale: "bg-muted-foreground/40",
  paused: "bg-muted-foreground/50",
  disabled: "bg-muted-foreground/40",
  open: "bg-accent",
  pending: "bg-warning",
  resolved: "bg-muted-foreground/40",
};

export function StatusDot({ status, size = "sm", pulse }: { status: string; size?: "sm" | "md"; pulse?: boolean }) {
  const s = size === "md" ? "h-2.5 w-2.5" : "h-[7px] w-[7px]";
  const isError = ["blocked", "error", "failed", "destructive"].includes(status);
  return (
    <div className={cn(
      "rounded-full shrink-0",
      s,
      dotColor[status] || "bg-muted-foreground/40",
      (pulse || isError) && "animate-pulse"
    )} />
  );
}

// ===== STATUS PILL =====
const pillColor: Record<string, string> = {
  healthy: "bg-success/10 text-success border-success/20",
  active: "bg-success/10 text-success border-success/20",
  ok: "bg-success/10 text-success border-success/20",
  "on-track": "bg-success/10 text-success border-success/20",
  done: "bg-muted/60 text-muted-foreground border-border/30",
  blocked: "bg-destructive/10 text-destructive border-destructive/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  "at-risk": "bg-warning/10 text-warning border-warning/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  degraded: "bg-warning/10 text-warning border-warning/20",
  idle: "bg-muted/60 text-muted-foreground border-border/30",
  stale: "bg-muted/60 text-muted-foreground border-border/30",
  paused: "bg-muted/60 text-muted-foreground border-border/30",
  disabled: "bg-muted/60 text-muted-foreground border-border/30",
  open: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-muted/60 text-muted-foreground border-border/30",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn(
      "text-[11px] px-2 py-0.5 rounded-md font-medium leading-none border capitalize",
      pillColor[status] || "bg-muted/60 text-muted-foreground border-border/30"
    )}>
      {status.replace("-", " ")}
    </span>
  );
}

// ===== SECTION LABEL =====
export function SectionLabel({ children, count, accent }: {
  children: React.ReactNode;
  count?: number;
  accent?: "destructive" | "warning";
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2 px-3">
      <span className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.08em]",
        accent === "destructive" ? "text-destructive" :
        accent === "warning" ? "text-warning" : "text-muted-foreground"
      )}>
        {children}
      </span>
      {count !== undefined && (
        <span className={cn(
          "text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md",
          accent === "destructive" ? "bg-destructive/10 text-destructive" :
          accent === "warning" ? "bg-warning/10 text-warning" :
          "bg-secondary text-muted-foreground"
        )}>{count}</span>
      )}
    </div>
  );
}

// ===== GROUP HEADER (collapsible) =====
export function GroupHeader({ label, count, open, onToggle, accent }: {
  label: string; count: number; open: boolean; onToggle: () => void; accent?: "destructive" | "warning";
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-left border-b border-border/20 hover:bg-secondary/40 transition-colors sticky top-0 bg-background/95 backdrop-blur-sm z-10"
    >
      <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform duration-150", open && "rotate-90")} />
      <span className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.08em]",
        accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "text-muted-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md",
        accent === "destructive" ? "bg-destructive/10 text-destructive" :
        accent === "warning" ? "bg-warning/10 text-warning" :
        "bg-secondary text-muted-foreground"
      )}>{count}</span>
    </button>
  );
}

// ===== INLINE ACTION BUTTON =====
export function InlineAction({ icon, label, accent, destructive, onClick, className: cls }: {
  icon?: React.ReactNode;
  label?: string;
  accent?: boolean;
  destructive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] px-2 py-1 rounded-md flex items-center gap-1 transition-all duration-150 font-medium",
        accent
          ? "bg-accent/90 text-accent-foreground hover:bg-accent shadow-sm shadow-accent/10"
          : destructive
          ? "hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
          : "bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary",
        cls
      )}
    >
      {icon}{label}
    </button>
  );
}

// ===== DENSE ROW =====
export function DenseRow({ children, selected, onClick, className: cls, urgencyBorder }: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  urgencyBorder?: "critical" | "high" | "medium";
}) {
  const borderCls = urgencyBorder === "critical" ? "border-l-2 border-l-destructive" :
    urgencyBorder === "high" ? "border-l-2 border-l-warning" : "";
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-[7px] group transition-all duration-100 border-b border-border/10",
        selected ? "bg-secondary/80 shadow-inner" : "hover:bg-secondary/30",
        onClick && "cursor-pointer",
        borderCls,
        cls
      )}
    >
      {children}
    </div>
  );
}

// ===== SIGNAL (for agent overview) =====
export function Signal({ type, text, action }: { type: "ok" | "warn" | "error"; text: string; action?: string }) {
  const icon = type === "ok" ? <Check className="h-3.5 w-3.5 text-success" /> :
    type === "error" ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> :
    <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
  return (
    <div className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={cn(
          "text-[13px]",
          type === "error" ? "text-destructive" : type === "warn" ? "text-warning" : "text-muted-foreground"
        )}>{text}</span>
      </div>
      {action && (
        <InlineAction label={action} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}

// ===== COLUMN LABEL =====
export function ColLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">{children}</div>;
}

// ===== LABEL =====
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] mb-2", className || "text-muted-foreground")}>{children}</div>;
}

// ===== PANEL HEADER =====
export function PanelHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("h-11 border-b border-border/30 px-4 flex items-center justify-between shrink-0", className)}>
      {children}
    </div>
  );
}

// ===== TAB BAR =====
export function TabBar({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number; alert?: boolean }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-border/30 px-4 flex items-center shrink-0">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-3 py-2 text-[13px] font-medium border-b-2 transition-colors relative",
            active === t.id
              ? "border-accent text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 text-[10px] font-mono tabular-nums text-muted-foreground">{t.count}</span>
          )}
          {t.alert && (
            <span className="ml-1 text-[10px] text-destructive font-bold">!</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ===== EMPTY STATE =====
export function EmptyState({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-muted-foreground py-3 px-3">
      {icon}
      <span>{text}</span>
    </div>
  );
}