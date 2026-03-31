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
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={handleCancel}>
      <div className="bg-card border border-border/50 rounded-lg shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={handleCancel} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {showInput && (
          <div className="px-4 py-3.5">
            {inputLabel && <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-widest">{inputLabel}</label>}
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-shadow"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter" && value.trim()) handleConfirm(); }}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/50 bg-secondary/20">
          <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-8">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={showInput && !value.trim()}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 shadow-sm h-8 ${
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export function ConfirmModal({
  open, title, description, onConfirm, onCancel,
  confirmLabel = "Confirm", destructive = false,
}: Omit<ActionModalProps, "showInput" | "inputLabel" | "inputPlaceholder" | "defaultValue" | "onConfirm"> & { onConfirm: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-card border border-border/50 rounded-lg shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/50 bg-secondary/20">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors h-8">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all shadow-sm h-8 ${
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
