import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Pause, Loader2, HelpCircle, type LucideIcon } from "lucide-react";

export type StatusType = "healthy" | "warning" | "critical" | "pending" | "paused" | "running" | "idle" | "offline" | "degraded" | "active" | "quiet" | "unknown";

const statusConfig: Record<StatusType, { icon: LucideIcon; colorClass: string; bgClass: string; label: string }> = {
  healthy:  { icon: CheckCircle2,  colorClass: "text-success",  bgClass: "bg-success/10",  label: "Healthy" },
  warning:  { icon: AlertTriangle, colorClass: "text-warning",  bgClass: "bg-warning/10",  label: "Warning" },
  critical: { icon: XCircle,       colorClass: "text-critical", bgClass: "bg-critical/10", label: "Critical" },
  degraded: { icon: AlertTriangle, colorClass: "text-warning",  bgClass: "bg-warning/10",  label: "Degraded" },
  pending:  { icon: Clock,         colorClass: "text-info",     bgClass: "bg-info/10",     label: "Pending" },
  paused:   { icon: Pause,         colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "Paused" },
  running:  { icon: Loader2,       colorClass: "text-primary",  bgClass: "bg-primary/10",  label: "Running" },
  idle:     { icon: Clock,         colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "Idle" },
  offline:  { icon: XCircle,       colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "Offline" },
  active:   { icon: CheckCircle2,  colorClass: "text-success",  bgClass: "bg-success/10",  label: "Active" },
  quiet:    { icon: Clock,         colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "Quiet" },
  unknown:  { icon: HelpCircle,    colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "Unknown" },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, size = "sm", pulse = false, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.unknown;
  const Icon = config.icon;
  const isRunning = status === "running";

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md font-medium",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      config.colorClass, config.bgClass,
      className
    )}>
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", isRunning && "animate-spin", pulse && "animate-status-pulse")} />
      {label || config.label}
    </span>
  );
}
