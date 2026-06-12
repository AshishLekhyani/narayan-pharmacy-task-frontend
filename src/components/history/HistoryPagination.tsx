"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { HISTORY_FILTER_OPTIONS } from "../../lib/history-filters";
import type { HistoryFilterMode } from "../../lib/history-schemas";

type HistoryPaginationProps = {
  page: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  filterMode: HistoryFilterMode;
  debouncedSearch: string;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export default function HistoryPagination({
  page,
  totalPages,
  totalFiltered,
  pageSize,
  filterMode,
  debouncedSearch,
  isLoading,
  onPageChange,
}: HistoryPaginationProps) {
  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i += 1) pageNumbers.push(i);

  return (
    <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
      <span className="text-body-sm text-on-surface-variant">
        {totalFiltered === 0
          ? "No records to display"
          : `Showing ${rangeStart}–${rangeEnd} of ${totalFiltered} matching records`}
        {filterMode !== "all" || debouncedSearch
          ? ` · filter: ${HISTORY_FILTER_OPTIONS.find((o) => o.value === filterMode)?.label ?? filterMode}`
          : ""}
      </span>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`px-3 py-1 rounded font-data-mono text-data-mono transition-colors ${
              pageNumber === page
                ? "bg-primary text-on-primary"
                : "border border-outline-variant hover:bg-surface-container text-on-surface-variant"
            }`}
            onClick={() => onPageChange(pageNumber)}
            disabled={isLoading}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
