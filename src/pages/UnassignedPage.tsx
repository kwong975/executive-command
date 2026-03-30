import { AppHeader } from "@/components/AppHeader";
import { AppLayout } from "@/components/AppLayout";
import { unassignedThreads, agents } from "@/data/mockData";
import { motion } from "framer-motion";
import { Inbox, UserPlus } from "lucide-react";
import { useState } from "react";

export default function UnassignedPage() {
  const [threads, setThreads] = useState(unassignedThreads);

  const handleAssign = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  return (
    <AppLayout>
      <AppHeader title="Unassigned" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nothing falling through the cracks.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {threads.length} items need ownership
              </p>
              <div className="space-y-2">
                {threads.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-lg border bg-surface-elevated p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm">{t.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.summary}</p>
                        <p className="text-xs text-muted-foreground mt-2">{t.source} · {t.timestamp}</p>
                      </div>
                      <button
                        onClick={() => handleAssign(t.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assign
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
