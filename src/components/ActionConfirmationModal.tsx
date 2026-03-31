import { useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationLevel = "standard" | "high_risk";

interface ActionConfirmationModalProps {
  open: boolean;
  level: ConfirmationLevel;
  title: string;
  description: string;
  confirmLabel: string;
  surface: string;
  onConfirm: (reason: string, guardrail: GuardrailMetadata) => void;
  onCancel: () => void;
}

export interface GuardrailMetadata {
  confirmed: boolean;
  confirmation_type: ConfirmationLevel;
  client_surface: string;
  client_timestamp: string;
  reason?: string;
}

export function ActionConfirmationModal({
  open, level, title, description, confirmLabel, surface, onConfirm, onCancel,
}: ActionConfirmationModalProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const isHighRisk = level === "high_risk";

  const handleConfirm = () => {
    const guardrail: GuardrailMetadata = {
      confirmed: true,
      confirmation_type: level,
      client_surface: surface,
      client_timestamp: new Date().toISOString(),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    };
    onConfirm(reason.trim(), guardrail);
    setReason("");
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onCancel}>
      <div className={cn("bg-card border rounded-lg shadow-xl w-[420px] overflow-hidden",
        isHighRisk ? "border-destructive/40" : "border-border/50"
      )} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={cn("flex items-center gap-3 px-5 py-4 border-b",
          isHighRisk ? "border-destructive/20 bg-destructive/5" : "border-border/50"
        )}>
          {isHighRisk
            ? <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            : <Shield className="h-5 w-5 text-warning shrink-0" />
          }
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        {/* Reason input */}
        <div className="px-5 py-4">
          <label className="text-xs text-muted-foreground">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Why are you making this change?"
            rows={2}
            className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/50 bg-secondary/20">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-8"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors h-8 shadow-sm",
              isHighRisk
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guarded action config ──

export const GUARDED_ACTIONS: Record<string, { level: ConfirmationLevel; title: string; description: string; confirmLabel: string }> = {
  drop_commitment: {
    level: "standard",
    title: "Drop Commitment",
    description: "This commitment will be marked as dropped and removed from active tracking.",
    confirmLabel: "Drop commitment",
  },
  archive_thread: {
    level: "standard",
    title: "Archive Thread",
    description: "This thread and its commitments will be archived. You can reopen later if needed.",
    confirmLabel: "Archive thread",
  },
  archive_issue: {
    level: "high_risk",
    title: "Archive Matter",
    description: "This matter will be archived. All child threads will remain but the matter will no longer surface.",
    confirmLabel: "Archive matter",
  },
  resolve_commitment: {
    level: "standard",
    title: "Mark Resolved",
    description: "This commitment will be marked as done.",
    confirmLabel: "Mark resolved",
  },
  move_commitment: {
    level: "standard",
    title: "Move Commitment",
    description: "This commitment will be moved to a different thread.",
    confirmLabel: "Move commitment",
  },
  relink_thread: {
    level: "high_risk",
    title: "Relink Thread",
    description: "This thread will be moved to a different matter. This changes the matter graph structure.",
    confirmLabel: "Relink thread",
  },
};
