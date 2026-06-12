"use client";

import { Download, Loader2, Search, Trash2 } from "lucide-react";
import PortalDropdown from "../PortalDropdown";
import { HISTORY_FILTER_OPTIONS } from "../../lib/history-filters";
import type { HistoryFilterMode } from "../../lib/history-schemas";

type HistoryToolbarProps = {
  searchQuery: string;
  filterMode: HistoryFilterMode;
  isFetching: boolean;
  isExporting: boolean;
  selectedCount: number;
  isDeleting: boolean;
  canExport: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: HistoryFilterMode) => void;
  onExport: () => void;
  onDeleteRequest: () => void;
};

export default function HistoryToolbar({
  searchQuery,
  filterMode,
  isFetching,
  isExporting,
  selectedCount,
  isDeleting,
  canExport,
  onSearchChange,
  onFilterChange,
  onExport,
  onDeleteRequest,
}: HistoryToolbarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center bg-surface px-4 py-2 rounded-lg border border-outline-variant focus-within:border-primary transition-colors flex-1 lg:w-96">
        <Search className="text-primary mr-2 shrink-0" size={20} />
        <input
          className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full p-0"
          placeholder="Search patient or medication..."
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search prescription history"
        />
        {isFetching && <Loader2 className="animate-spin text-primary shrink-0" size={16} />}
      </div>
      <PortalDropdown
        value={filterMode}
        options={HISTORY_FILTER_OPTIONS}
        onChange={onFilterChange}
        menuWidth={220}
        ariaLabel="Filter prescription history"
      />
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
        onClick={onExport}
        disabled={isExporting || !canExport}
      >
        {isExporting ? (
          <Loader2 className="animate-spin text-primary" size={18} />
        ) : (
          <Download size={18} className="text-primary" />
        )}
        <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-lg text-body-sm font-bold hover:bg-error/90 transition-colors disabled:opacity-50"
        onClick={onDeleteRequest}
        disabled={selectedCount === 0 || isDeleting}
      >
        {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
        <span>{isDeleting ? "Deleting..." : `Delete Selected (${selectedCount})`}</span>
      </button>
    </div>
  );
}
