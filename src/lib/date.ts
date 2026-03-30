/**
 * Date formatting helpers for UI rendering.
 *
 * All data in state/adapters uses raw ISO timestamps.
 * These helpers format at render time only.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format an ISO timestamp as a short display date.
 *
 * Returns "Today", "Yesterday", or "Mar 16" style string.
 * Returns empty string for null/undefined/invalid input.
 */
export function formatDisplayDate(ts: string | null | undefined): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts; // Pass through non-ISO strings as-is

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = (today.getTime() - target.getTime()) / 86_400_000;

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  } catch {
    return ts; // Pass through on error
  }
}

/**
 * Format an ISO timestamp as a relative string.
 *
 * Returns "today", "yesterday", "3d ago", "2w ago", "1mo ago".
 */
export function formatRelative(ts: string | null | undefined): string {
  if (!ts) return "";
  try {
    const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return "";
  }
}

/**
 * Parse any date string to a numeric sort key (milliseconds).
 *
 * Handles ISO timestamps, "Mar 16" display dates, and relative strings.
 * For relative strings like "today"/"yesterday", uses current date.
 */
export function toSortKey(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;

  // ISO timestamp: "2026-03-16T10:00:00"
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso.getTime();

  // Display date: "Mar 16"
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const parts = dateStr.toLowerCase().split(" ");
  if (parts.length === 2 && parts[0] in months) {
    const month = months[parts[0]];
    const day = parseInt(parts[1]) || 1;
    return new Date(new Date().getFullYear(), month, day).getTime();
  }

  // Relative: "today", "yesterday", "3d ago"
  if (dateStr === "today" || dateStr === "Today") return Date.now();
  if (dateStr === "yesterday" || dateStr === "Yesterday") return Date.now() - 86_400_000;

  return 0;
}
