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
  done: "bg-muted-foreground",
  blocked: "bg-destructive",
  error: "bg-destructive",
  failed: "bg-destructive",
  overdue: "bg-destructive",
  "at-risk": "bg-warning",
  warning: "bg-warning",
  degraded: "bg-warning",
  idle: "bg-muted-foreground",
  stale: "bg-muted-foreground",
  paused: "bg-muted-foreground",
  disabled: "bg-muted-foreground",
  open: "bg-accent",
  pending: "bg-warning",
  resolved: "bg-muted-foreground",
};

export function StatusDot({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const s = size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";
  return <div className={cn("rounded-full shrink-0", s, dotColor[status] || "bg-muted-foreground")} />;
}

// ===== STATUS PILL =====
const pillColor: Record<string, string> = {
  healthy: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  ok: "bg-success/10 text-success",
  "on-track": "bg-success/10 text-success",
  done: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
  error: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  overdue: "bg-destructive/10 text-destructive",
  "at-risk": "bg-warning/10 text-warning",
  warning: "bg-warning/10 text-warning",
  degraded: "bg-warning/10 text-warning",
  idle: "bg-muted text-muted-foreground",
  stale: "bg-muted text-muted-foreground",
  paused: "bg-muted text-muted-foreground",
  disabled: "bg-muted text-muted-foreground",
  open: "bg-accent/10 text-accent",
  pending: "bg-warning/10 text-warning",
  resolved: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", pillColor[status] || "bg-muted text-muted-foreground")}>
      {status}
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
    <div className="flex items-center gap-2 mb-1 px-2">
      <span className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        accent === "destructive" ? "text-destructive" :
        accent === "warning" ? "text-warning" : "text-muted-foreground"
      )}>
        {children}
      </span>
      {count !== undefined && (
        <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
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
      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left border-b border-border/30 hover:bg-secondary/30 transition-colors sticky top-0 bg-background z-10"
    >
      <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-90")} />
      <span className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : "text-muted-foreground"
      )}>
        {label}
      </span>
      <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
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
        "text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors font-medium",
        accent
          ? "bg-accent text-accent-foreground hover:bg-accent/90"
          : destructive
          ? "hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
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
        "flex items-center justify-between px-2.5 py-1.5 group transition-colors border-b border-border/15",
        selected ? "bg-secondary" : "hover:bg-secondary/40",
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
  const icon = type === "ok" ? <Check className="h-3 w-3 text-success" /> :
    type === "error" ? <AlertTriangle className="h-3 w-3 text-destructive" /> :
    <AlertTriangle className="h-3 w-3 text-warning" />;
  return (
    <div className="flex items-center justify-between py-1 group">
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn(
          "text-[13px]",
          type === "error" ? "text-destructive" : type === "warn" ? "text-warning" : "text-success"
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
  return <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{children}</div>;
}

// ===== LABEL =====
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-xs font-semibold uppercase tracking-wider mb-1", className || "text-muted-foreground")}>{children}</div>;
}
