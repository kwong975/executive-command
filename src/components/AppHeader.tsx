import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { systemHealth } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

const statusColor = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
};

const detailStatusColor = {
  ok: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
};

export function AppHeader({ title }: { title: string }) {
  const [showHealth, setShowHealth] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between border-b px-4 bg-surface-elevated relative">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowHealth(!showHealth)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <div className={`h-2 w-2 rounded-full ${statusColor[systemHealth.overall]}`} />
          <span className="text-xs text-muted-foreground font-medium">System</span>
        </button>

        <AnimatePresence>
          {showHealth && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute right-0 top-full mt-2 w-72 bg-surface-elevated border rounded-lg shadow-lg p-4 z-50"
            >
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">System Health</p>
              <div className="space-y-2.5">
                {systemHealth.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${detailStatusColor[d.status]} shrink-0`} />
                    <span className="text-sm text-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
