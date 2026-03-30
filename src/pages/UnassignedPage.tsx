import { AppLayout } from "@/components/AppLayout";
import { unassignedThreads } from "@/data/mockData";
import { Inbox, UserPlus } from "lucide-react";
import { useState } from "react";

export default function UnassignedPage() {
  const [threads, setThreads] = useState(unassignedThreads);

  const handleAssign = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  return (
    <AppLayout title="Unassigned">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Nothing falling through the cracks.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {threads.length} items need ownership
              </p>
              <div className="space-y-1">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className="rounded border bg-surface-elevated py-2.5 px-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.source} · {t.timestamp}</p>
                      </div>
                      <button
                        onClick={() => handleAssign(t.id)}
                        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
