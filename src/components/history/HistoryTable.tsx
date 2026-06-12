"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type { PrescriptionHistoryRecord } from "../../lib/history-schemas";
import HistoryRecordRow from "./HistoryRecordRow";
import HistoryPagination from "./HistoryPagination";
import type { HistoryFilterMode } from "../../lib/history-schemas";

type HistoryTableProps = {
  records: PrescriptionHistoryRecord[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  expandedRows: number[];
  selectedIds: number[];
  allOnPageSelected: boolean;
  page: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  filterMode: HistoryFilterMode;
  debouncedSearch: string;
  onToggleRow: (id: number) => void;
  onToggleSelected: (id: number) => void;
  onToggleSelectAllOnPage: () => void;
  onPageChange: (page: number) => void;
};

export default function HistoryTable({
  records,
  isLoading,
  isError,
  errorMessage,
  expandedRows,
  selectedIds,
  allOnPageSelected,
  page,
  totalPages,
  totalFiltered,
  pageSize,
  filterMode,
  debouncedSearch,
  onToggleRow,
  onToggleSelected,
  onToggleSelectAllOnPage,
  onPageChange,
}: HistoryTableProps) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary cursor-pointer"
                  checked={allOnPageSelected}
                  onChange={onToggleSelectAllOnPage}
                  disabled={records.length === 0 || isLoading}
                  aria-label="Select all records on this page"
                />
              </th>
              <th className="w-12 px-4 py-3" />
              <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                Patient Name
              </th>
              <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                Prescription Date
              </th>
              <th className="text-center px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                Drug Count
              </th>
              <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                AI Safety Status
              </th>
              <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                Severity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                  <Loader2 className="animate-spin inline-block mr-2" size={24} /> Loading history...
                </td>
              </tr>
            )}

            {!isLoading && isError && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-error">
                    <AlertTriangle size={28} />
                    <p className="font-semibold">Unable to load prescription history</p>
                    <p className="text-body-sm text-on-surface-variant max-w-md">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                  No matching records found for the current search and filters.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              records.map((record) => (
                <HistoryRecordRow
                  key={record.id}
                  record={record}
                  isExpanded={expandedRows.includes(record.id)}
                  isSelected={selectedIds.includes(record.id)}
                  onToggleExpand={() => onToggleRow(record.id)}
                  onToggleSelect={() => onToggleSelected(record.id)}
                />
              ))}
          </tbody>
        </table>
      </div>

      <HistoryPagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={pageSize}
        filterMode={filterMode}
        debouncedSearch={debouncedSearch}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
