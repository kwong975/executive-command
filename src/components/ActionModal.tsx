import { useState } from "react";
import { X } from "lucide-react";

interface ActionModalProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  destructive?: boolean;
  /** If false, no text input — just a confirm/cancel dialog */
  showInput?: boolean;
}

export function ActionModal({
  open, title, description, onConfirm, onCancel,
  confirmLabel = "Confirm", inputLabel, inputPlaceholder = "",
  defaultValue = "", destructive = false, showInput = true,
}: ActionModalProps) {
  const [value, setValue] = useState(defaultValue);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(value.trim());
    setValue("");
  };

  const handleCancel = () => {
    onCancel();
    setValue("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={handleCancel}>
      <div className="bg-card border border-border rounded-lg shadow-xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={handleCancel} className="p-1 rounded hover:bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Input */}
        {showInput && (
          <div className="px-4 py-3">
            {inputLabel && <label className="text-[12px] text-muted-foreground mb-1 block">{inputLabel}</label>}
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter" && value.trim()) handleConfirm(); }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-secondary/10">
          <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={showInput && !value.trim()}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation-only modal (no text input).
 */
export function ConfirmModal({
  open, title, description, onConfirm, onCancel,
  confirmLabel = "Confirm", destructive = false,
}: Omit<ActionModalProps, "showInput" | "inputLabel" | "inputPlaceholder" | "defaultValue" | "onConfirm"> & { onConfirm: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-card border border-border rounded-lg shadow-xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-secondary/10">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
