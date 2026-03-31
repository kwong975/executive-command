import { useState } from "react";
import { X, Search } from "lucide-react";
import { StatusDot } from "@/components/shared";
import { useMatters } from "@/hooks/useMatters";
import { adaptMatterListItem } from "@/lib/matters-adapter";

interface MatterPickerModalProps {
  open: boolean;
  onSelect: (matterId: string) => void;
  onClose: () => void;
  title?: string;
}

export function MatterPickerModal({ open, onSelect, onClose, title = "Link Matter" }: MatterPickerModalProps) {
  const [search, setSearch] = useState("");
  const { data } = useMatters(100);

  if (!open) return null;

  const allMatters = (data?.matters || []).map(adaptMatterListItem);
  const filtered = search.trim()
    ? allMatters.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.owner.toLowerCase().includes(search.toLowerCase())
      )
    : allMatters;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card border border-border/50 rounded-lg shadow-xl w-[480px] max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="text-sm font-semibold">{title}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search matters..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {search ? "No matches" : "No matters available"}
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.id); onClose(); }}
                className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-3"
              >
                <StatusDot status={m.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.owner} · {m.overdueCount > 0 ? `${m.overdueCount} overdue` : m.status}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
