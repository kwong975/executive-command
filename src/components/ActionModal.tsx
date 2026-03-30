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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={handleCancel}>
      <div className="bg-card border border-border/40 rounded-lg shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
            {description && <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={handleCancel} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {showInput && (
          <div className="px-4 py-3.5">
            {inputLabel && <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">{inputLabel}</label>}
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-shadow"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter" && value.trim()) handleConfirm(); }}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/30 bg-secondary/10">
          <button onClick={handleCancel} className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={showInput && !value.trim()}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all disabled:opacity-50 shadow-sm ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/10"
                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/10"
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card border border-border/40 rounded-lg shadow-2xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4">
          <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
          {description && <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/30 bg-secondary/10">
          <button onClick={onCancel} className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all shadow-sm ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/10"
                : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/10"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}