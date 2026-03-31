import { X, UserPlus, ArrowRight, CheckCircle2, Clock, AlertTriangle, Zap, Archive, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot, StatusPill, InlineAction } from "@/components/shared";
import { showActionToast } from "@/components/ActionToast";

// ── Types ──

export type ResolutionItemType = "matter" | "commitment" | "system";

export interface ResolutionItem {
  id: string;
  type: ResolutionItemType;
  title: string;
  status: string;
  owner?: string;
  matterId?: string;
  matterTitle?: string;
  reasons: string[];
  objective?: string;
  participants?: string[];
  recentActivity?: string;
  dueDate?: string;
  overdueCount?: number;
  openCount?: number;
}

interface ResolutionDrawerProps {
  item: ResolutionItem | null;
  onClose: () => void;
  onAction: (action: string, itemId: string) => void;
}

// ── Actions by item type ──

function getActions(item: ResolutionItem): { id: string; label: string; icon: React.ReactNode; primary?: boolean; destructive?: boolean }[] {
  const actions: { id: string; label: string; icon: React.ReactNode; primary?: boolean; destructive?: boolean }[] = [];

  if (!item.owner || item.owner === "unassigned") {
    actions.push({ id: "assign", label: "Assign Owner", icon: <UserPlus className="h-3.5 w-3.5" />, primary: true });
  } else {
    actions.push({ id: "reassign", label: "Reassign", icon: <UserPlus className="h-3.5 w-3.5" /> });
  }

  if (item.type === "matter") {
    actions.push({ id: "open_matter", label: "Open Matter", icon: <ArrowRight className="h-3.5 w-3.5" /> });
    actions.push({ id: "add_commitment", label: "Add Commitment", icon: <Zap className="h-3.5 w-3.5" /> });
  }

  if (item.type === "commitment") {
    actions.push({ id: "resolve", label: "Mark Resolved", icon: <CheckCircle2 className="h-3.5 w-3.5" />, primary: !actions.some(a => a.primary) });
    actions.push({ id: "open_matter", label: "Open Matter", icon: <ArrowRight className="h-3.5 w-3.5" /> });
  }

  if (item.type === "system") {
    actions.push({ id: "run_cleanup", label: "Run Cleanup", icon: <Archive className="h-3.5 w-3.5" />, primary: !actions.some(a => a.primary) });
  }

  actions.push({ id: "snooze", label: "Snooze", icon: <Clock className="h-3.5 w-3.5" /> });

  return actions;
}

// ── Component ──

export function ResolutionDrawer({ item, onClose, onAction }: ResolutionDrawerProps) {
  if (!item) return null;

  const actions = getActions(item);

  const handleAction = (actionId: string) => {
    onAction(actionId, item.id);

    const labels: Record<string, string> = {
      assign: `Owner assignment started for "${item.title}"`,
      reassign: `Reassignment started for "${item.title}"`,
      resolve: `"${item.title}" marked as resolved`,
      open_matter: `Opening matter "${item.matterTitle || item.title}"`,
      add_commitment: `Adding commitment to "${item.title}"`,
      run_cleanup: `Cleanup started for "${item.title}"`,
      snooze: `"${item.title}" snoozed`,
    };

    showActionToast("success", labels[actionId] || `Action "${actionId}" completed`);
    
    if (["resolve", "snooze"].includes(actionId)) {
      setTimeout(onClose, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Drawer panel */}
      <div
        className="relative w-[460px] max-w-full h-full bg-background border-l border-border/40 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/30 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusDot status={item.status} size="md" />
                <StatusPill status={item.status} />
                {item.type !== "matter" && (
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
                    {item.type}
                  </span>
                )}
              </div>
              <h2 className="text-[15px] font-semibold text-foreground leading-snug">{item.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn(
                  "text-[12px] font-mono",
                  item.owner && item.owner !== "unassigned" ? "text-foreground/70" : "text-destructive"
                )}>
                  {item.owner && item.owner !== "unassigned" ? item.owner : "No owner"}
                </span>
                {item.overdueCount !== undefined && item.overdueCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-semibold tabular-nums">
                    {item.overdueCount} overdue
                  </span>
                )}
                {item.openCount !== undefined && item.openCount > 0 && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {item.openCount} open
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0 mt-0.5"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Why this needs attention */}
          <div className="px-5 py-4 border-b border-border/20">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
                Why This Needs Attention
              </span>
            </div>
            <ul className="space-y-1.5">
              {item.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/80 leading-relaxed">
                  <span className="text-muted-foreground/60 mt-0.5 shrink-0">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Context */}
          <div className="px-5 py-4 border-b border-border/20">
            <div className="flex items-center gap-2 mb-2.5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Context
              </span>
            </div>
            <div className="space-y-2.5">
              {item.objective && (
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 w-16 pt-0.5">Objective</span>
                  <span className="text-[13px] text-foreground/80">{item.objective}</span>
                </div>
              )}
              {item.matterTitle && item.type !== "matter" && (
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 w-16 pt-0.5">Matter</span>
                  <span className="text-[13px] text-foreground/80">{item.matterTitle}</span>
                </div>
              )}
              {item.dueDate && (
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 w-16 pt-0.5">Due</span>
                  <span className="text-[13px] text-foreground/80">{item.dueDate}</span>
                </div>
              )}
              {item.participants && item.participants.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 w-16 pt-0.5">People</span>
                  <div className="flex flex-wrap gap-1">
                    {item.participants.map(p => (
                      <span key={p} className="text-[11px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.recentActivity && (
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0 w-16 pt-0.5">Activity</span>
                  <span className="text-[13px] text-muted-foreground">{item.recentActivity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="px-5 py-4 border-t border-border/30 shrink-0 bg-card/50">
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2.5 block">
            Actions
          </span>
          <div className="flex flex-wrap gap-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all duration-150",
                  action.primary
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm shadow-accent/15"
                    : action.destructive
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                    : "bg-secondary hover:bg-secondary/80 text-foreground/80 hover:text-foreground"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
