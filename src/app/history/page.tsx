"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import HistoryStatsCards from "../../components/history/HistoryStatsCards";
import HistoryTable from "../../components/history/HistoryTable";
import HistoryToolbar from "../../components/history/HistoryToolbar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import InlineNotice from "../../components/ui/InlineNotice";
import { AnimatePresence } from "framer-motion";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { downloadHistoryCsv } from "../../lib/history-csv";
import { MAX_BATCH_DELETE_IDS } from "../../lib/clinical-constants";
import {
  deleteHistoryRecords,
  fetchHistoryForExport,
  fetchHistoryPage,
  fetchHistoryStats,
  wasExportTruncated,
  type HistoryFilterMode,
} from "../../lib/history-api";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<HistoryFilterMode>("all");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const clearSelection = () => setSelectedIds([]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["history", page, debouncedSearch, filterMode],
    queryFn: () =>
      fetchHistoryPage({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        filter: filterMode,
      }),
    placeholderData: (previous) => previous,
  });

  const { data: stats } = useQuery({
    queryKey: ["history-stats"],
    queryFn: fetchHistoryStats,
    staleTime: 60_000,
  });

  const records = useMemo(() => data?.data ?? [], [data?.data]);
  const recordIdsOnPage = useMemo(() => records.map((record) => record.id), [records]);
  const allOnPageSelected =
    recordIdsOnPage.length > 0 && recordIdsOnPage.every((id) => selectedIds.includes(id));
  const meta = data?.meta;
  const displayStats = stats ?? {
    totalRecords: 0,
    severeAlerts: 0,
    aiFlagged: 0,
    validationRate: 0,
  };

  const totalPages = meta?.totalPages ?? 1;
  const totalFiltered = meta?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => deleteHistoryRecords(ids),
    onSuccess: (result) => {
      setSelectedIds([]);
      setExpandedRows([]);
      setDeleteError(null);
      setConfirmDeleteOpen(false);
      setDeleteNotice(`Deleted ${result.deletedCount} record(s) from history.`);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["history-stats"] });
    },
    onError: (err: Error) => {
      setDeleteNotice(null);
      setDeleteError(err.message);
      setConfirmDeleteOpen(false);
    },
  });

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !recordIdsOnPage.includes(id)));
      return;
    }
    setSelectedIds((prev) => [...new Set([...prev, ...recordIdsOnPage])]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const exportRows = await fetchHistoryForExport(debouncedSearch, filterMode);
      downloadHistoryCsv(exportRows);
      if (wasExportTruncated(exportRows.length, totalFiltered)) {
        setExportNotice(
          `Export includes the first ${exportRows.length} matching records. Refine filters to export a smaller set.`
        );
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <AnimatePresence>
        {exportError && (
          <InlineNotice type="error" message={exportError} onDismiss={() => setExportError(null)} />
        )}
        {deleteError && (
          <InlineNotice type="error" message={deleteError} onDismiss={() => setDeleteError(null)} />
        )}
        {deleteNotice && (
          <InlineNotice type="success" message={deleteNotice} onDismiss={() => setDeleteNotice(null)} />
        )}
        {exportNotice && (
          <InlineNotice type="success" message={exportNotice} onDismiss={() => setExportNotice(null)} />
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Prescription History</h1>
          <p className="text-body-lg text-on-surface-variant">
            Validated clinical records and interaction analysis audit log.
          </p>
        </div>
        <HistoryToolbar
          searchQuery={searchQuery}
          filterMode={filterMode}
          isFetching={isFetching && !isLoading}
          isExporting={isExporting}
          selectedCount={selectedIds.length}
          isDeleting={deleteMutation.isPending}
          canExport={totalFiltered > 0}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setPage(1);
            clearSelection();
          }}
          onFilterChange={(value) => {
            setFilterMode(value);
            setPage(1);
            clearSelection();
          }}
          onExport={handleExport}
          onDeleteRequest={() => {
            const ids = selectedIds.slice(0, MAX_BATCH_DELETE_IDS);
            setPendingDeleteIds(ids);
            setConfirmDeleteOpen(true);
          }}
        />
      </header>

      <HistoryStatsCards stats={displayStats} />

      <HistoryTable
        records={records}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        expandedRows={expandedRows}
        selectedIds={selectedIds}
        allOnPageSelected={allOnPageSelected}
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={PAGE_SIZE}
        filterMode={filterMode}
        debouncedSearch={debouncedSearch}
        onToggleRow={toggleRow}
        onToggleSelected={toggleSelected}
        onToggleSelectAllOnPage={toggleSelectAllOnPage}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          clearSelection();
        }}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete prescription records?"
        message={`Delete ${pendingDeleteIds.length} selected prescription record(s)? This cannot be undone.${
          selectedIds.length > MAX_BATCH_DELETE_IDS
            ? ` Only the first ${MAX_BATCH_DELETE_IDS} selections can be deleted per request.`
            : ""
        }`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(pendingDeleteIds)}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </motion.div>
  );
}
