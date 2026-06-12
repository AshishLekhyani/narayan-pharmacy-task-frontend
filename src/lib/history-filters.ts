import type { HistoryFilterMode } from "./history-schemas";

export const HISTORY_FILTER_OPTIONS: { value: HistoryFilterMode; label: string }[] = [
  { value: "all", label: "All Records" },
  { value: "high", label: "Critical Conflicts" },
  { value: "flagged", label: "AI Flagged" },
  { value: "safe", label: "Safe / Low Risk" },
];
