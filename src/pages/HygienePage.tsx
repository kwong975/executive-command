import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SectionLabel, InlineAction, DenseRow } from "@/components/shared";
import { zombieMatters, staleThreads, titleUpgrades } from "@/lib/command-data";
import { showActionToast } from "@/components/ActionToast";
import {
  Archive, X, Pencil, CheckCircle2, Zap, Trash2, Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HygienePage() {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const zombies = zombieMatters.filter(z => !removedIds.has(z.id));
  const stale = staleThreads.filter(t => !removedIds.has(t.id));
  const titles = titleUpgrades.filter(t => !removedIds.has(t.id));

  const resolve = useCallback((id: string, msg: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    showActionToast("success", msg);
  }, []);

  const batchArchiveZombies = () => {
    zombies.forEach(z => setRemovedIds(prev => new Set(prev).add(z.id)));
    showActionToast("success", `Archived ${zombies.length} zombie matters`);
  };

  const batchCloseStale = () => {
    stale.forEach(t => setRemovedIds(prev => new Set(prev).add(t.id)));
    showActionToast("success", `Closed ${stale.length} stale threads`);
  };

  const batchAcceptTitles = () => {
    titles.forEach(t => setRemovedIds(prev => new Set(prev).add(t.id)));
    showActionToast("success", `Accepted ${titles.length} title upgrades`);
  };

  const totalItems = zombies.length + stale.length + titles.length;

  if (totalItems === 0) {
    return (
      <AppLayout title="Hygiene">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <div className="text-lg font-semibold">System clean</div>
            <div className="text-sm text-muted-foreground">No cleanup items remaining</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Hygiene">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5 space-y-6">

          {/* ZOMBIE MATTERS */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel count={zombies.length} accent="destructive">Zombie Matters</SectionLabel>
              {zombies.length > 1 && (
                <InlineAction icon={<Archive className="h-3 w-3" />} label="Archive all" destructive onClick={batchArchiveZombies} />
              )}
            </div>
            <div className="space-y-px">
              {zombies.map(z => (
                <DenseRow key={z.id}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Archive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{z.title}</div>
                      <div className="text-xs text-muted-foreground">Last activity: {z.last_activity} · {z.commitment_count} commits · {z.thread_count} threads</div>
                    </div>
                  </div>
                  <InlineAction
                    icon={<Archive className="h-3 w-3" />}
                    label="Archive"
                    destructive
                    onClick={() => resolve(z.id, `"${z.title}" archived`)}
                  />
                </DenseRow>
              ))}
            </div>
          </section>

          {/* STALE THREADS */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel count={stale.length} accent="warning">Stale Threads</SectionLabel>
              {stale.length > 1 && (
                <InlineAction icon={<X className="h-3 w-3" />} label="Close all" destructive onClick={batchCloseStale} />
              )}
            </div>
            <div className="space-y-px">
              {stale.map(t => (
                <DenseRow key={t.id}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground">{t.source} · Last activity: {t.last_activity}</div>
                    </div>
                  </div>
                  <InlineAction
                    icon={<X className="h-3 w-3" />}
                    label="Close"
                    destructive
                    onClick={() => resolve(t.id, `"${t.title}" closed`)}
                  />
                </DenseRow>
              ))}
            </div>
          </section>

          {/* TITLE UPGRADES */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel count={titles.length}>Title Upgrades</SectionLabel>
              {titles.length > 1 && (
                <InlineAction icon={<Pencil className="h-3 w-3" />} label="Accept all" accent onClick={batchAcceptTitles} />
              )}
            </div>
            <div className="space-y-px">
              {titles.map(t => (
                <DenseRow key={t.id}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm">
                        <span className="line-through text-muted-foreground">{t.current}</span>
                        <span className="mx-2 text-muted-foreground/50">→</span>
                        <span className="font-medium">{t.suggested}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <InlineAction icon={<CheckCircle2 className="h-3 w-3" />} label="Accept" accent onClick={() => resolve(t.id, `Title updated to "${t.suggested}"`)} />
                    <InlineAction label="Reject" onClick={() => resolve(t.id, `Title upgrade rejected`)} />
                  </div>
                </DenseRow>
              ))}
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
