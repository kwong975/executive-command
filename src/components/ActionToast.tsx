import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export function showActionToast(type: ToastType, message: string) {
  addToastFn?.(type, message);
}

export function ActionToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const styles: Record<ToastType, string> = {
    success: "bg-success/10 text-success border-success/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-accent/10 text-accent border-accent/20",
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    error: <XCircle className="h-4 w-4 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
    info: <Info className="h-4 w-4 shrink-0" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 border",
          styles[t.type]
        )}>
          {icons[t.type]}
          {t.message}
        </div>
      ))}
    </div>
  );
}
