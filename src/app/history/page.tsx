"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Download,
  Box,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatPrescribedAt } from "../../lib/format-date";
import PortalDropdown from "../../components/PortalDropdown";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import {
  fetchHistoryForExport,
  fetchHistoryPage,
  type HistoryFilterMode,
  type PrescriptionHistoryRecord,
} from "../../lib/history-api";
import {
  getSeverityTierStyles,
  hasStoredAnalysis,
  resolveClinicalSeverityTier,
} from "../../lib/clinical-severity";

const FILTER_OPTIONS: { value: HistoryFilterMode; label: string }[] = [
  { value: "all", label: "All Records" },
  { value: "high", label: "Critical Conflicts" },
  { value: "flagged", label: "AI Flagged" },
  { value: "safe", label: "Safe / Low Risk" },
];

const PAGE_SIZE = 10;

function downloadCsv(records: PrescriptionHistoryRecord[]) {
  const rows = [
    [
      "Record ID",
      "Patient Name",
      "Prescription Date",
      "Medication Count",
      "Medication Summary",
      "AI Status",
      "Clinical Severity",
      "Severity Level",
      "Primary Warning",
      "Recommendation",
      "Processed By",
    ],
    ...records.map((record) => [
      record.id,
      record.patientName,
      new Date(record.prescribedAt).toISOString(),
      record.medications.length,
      record.medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join(" | "),
      record.analysis.statusLabel ?? "",
      resolveClinicalSeverityTier(record.analysis),
      record.analysis.severityLevel ?? "",
      record.analysis.primaryWarning ?? "",
      record.analysis.recommendation ?? "",
      record.analysis.processedBy ?? "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `narayan-pharmacy-history-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<HistoryFilterMode>("all");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

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

  const records = data?.data ?? [];
  const meta = data?.meta;
  const stats = data?.stats ?? {
    totalRecords: 0,
    severeAlerts: 0,
    aiFlagged: 0,
    validationRate: 0,
  };

  const totalPages = meta?.totalPages ?? 1;
  const totalFiltered = meta?.total ?? 0;
  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalFiltered);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const exportRows = await fetchHistoryForExport(debouncedSearch, filterMode);
      downloadCsv(exportRows);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      {exportError && (
        <div className="mb-4 rounded-lg border border-error bg-error-container/20 px-4 py-3 text-body-sm text-error flex justify-between gap-4">
          <span>{exportError}</span>
          <button type="button" onClick={() => setExportError(null)} className="text-on-surface-variant hover:text-on-surface">
            Dismiss
          </button>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Prescription History</h1>
          <p className="text-body-lg text-on-surface-variant">
            Validated clinical records and interaction analysis audit log.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center bg-surface px-4 py-2 rounded-lg border border-outline-variant focus-within:border-primary transition-colors flex-1 lg:w-96">
            <Search className="text-primary mr-2 shrink-0" size={20} />
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full p-0"
              placeholder="Search patient or medication..."
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              aria-label="Search prescription history"
            />
            {isFetching && !isLoading && (
              <Loader2 className="animate-spin text-primary shrink-0" size={16} />
            )}
          </div>
          <PortalDropdown
            value={filterMode}
            options={FILTER_OPTIONS}
            onChange={(value) => {
              setFilterMode(value);
              setPage(1);
            }}
            menuWidth={220}
          />
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
            onClick={handleExport}
            disabled={isExporting || totalFiltered === 0}
          >
            {isExporting ? <Loader2 className="animate-spin text-primary" size={18} /> : <Download size={18} className="text-primary" />}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Total Records</span>
            <Box size={20} className="text-primary" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono">{stats.totalRecords}</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Severe Alerts</span>
            <AlertTriangle size={20} className="text-error" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono text-error">{stats.severeAlerts}</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">AI Flagged</span>
            <Sparkles size={20} className="text-primary" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono text-primary">{stats.aiFlagged}</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Safe / Low Risk</span>
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono">{stats.validationRate}%</span>
        </motion.div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="w-12 px-4 py-3" />
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Patient Name</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Prescription Date</th>
                <th className="text-center px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Drug Count</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">AI Safety Status</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Severity</th>
                <th className="w-12 px-4 py-3" />
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
                      <p className="text-body-sm text-on-surface-variant max-w-md">{error?.message}</p>
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

              {!isLoading && !isError && records.map((record) => {
                const isExpanded = expandedRows.includes(record.id);
                const isHigh = record.analysis.severityLevel === "high";
                const isFlagged = Boolean(record.analysis.statusLabel);
                const severityTier = resolveClinicalSeverityTier(record.analysis);
                const tierStyles = getSeverityTierStyles(severityTier);
                const hasAnalysis = hasStoredAnalysis(record.analysis);
                const statusText = isHigh
                  ? "Critical Conflict"
                  : isFlagged
                    ? record.analysis.statusLabel ?? "Low Risk"
                    : "Verified Safe";
                const StatusIcon = isHigh ? AlertTriangle : isFlagged ? Sparkles : CheckCircle;
                const statusColor = isHigh
                  ? "text-on-error-container"
                  : isFlagged
                    ? "text-on-secondary-container"
                    : "text-primary";
                const statusBg = isHigh
                  ? "bg-error-container"
                  : isFlagged
                    ? "bg-secondary-container"
                    : "bg-primary-container bg-opacity-10";

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`interaction-row transition-colors cursor-pointer ${isExpanded ? "bg-surface-container-lowest" : ""}`}
                      onClick={() => toggleRow(record.id)}
                    >
                      <td className="px-4 py-4 text-center">
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-center"
                        >
                          <ChevronDown size={20} className="text-outline" />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4 font-body-sm text-body-sm font-semibold">{record.patientName}</td>
                      <td className="px-6 py-4 font-data-mono text-data-mono">
                        {formatPrescribedAt(record.prescribedAt)}
                      </td>
                      <td className="px-6 py-4 text-center font-data-mono text-data-mono">
                        {String(record.medications.length).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBg} ${statusColor} text-body-sm font-medium`}>
                          <StatusIcon size={16} /> {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {severityTier !== "None" ? (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tierStyles.badge} text-xs font-bold uppercase border`}>
                            <div className={`w-2 h-2 rounded-full ${tierStyles.dot}`} />
                            {severityTier}
                          </span>
                        ) : (
                          <span className="text-body-sm text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" className="p-1 hover:bg-surface-container rounded-full transition-colors text-outline" aria-label="More actions">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-surface-container-lowest"
                        >
                          <td className="p-0 border-none" colSpan={7}>
                            <div className={`border-l-4 ${tierStyles.border} px-12 py-8 bg-surface-container-lowest shadow-inner`}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                                      AI Interaction Result
                                    </h4>
                                    {severityTier !== "None" && (
                                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tierStyles.badge} text-xs font-bold uppercase border`}>
                                        <div className={`w-2 h-2 rounded-full ${tierStyles.dot}`} />
                                        {severityTier}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-3">
                                    {hasAnalysis ? (
                                      <>
                                        {record.analysis.statusLabel && (
                                          <div className="p-3 bg-surface-container rounded-lg border border-outline-variant">
                                            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                                              Interaction Status
                                            </p>
                                            <p className={`font-semibold text-body-sm ${tierStyles.title}`}>
                                              {record.analysis.statusLabel}
                                            </p>
                                          </div>
                                        )}

                                        {record.analysis.primaryWarning && (
                                          <div className={`flex items-start gap-3 p-4 border rounded-lg ${tierStyles.panel}`}>
                                            <AlertTriangle className={`${tierStyles.icon} shrink-0`} size={20} />
                                            <div>
                                              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                                                Primary Warning
                                              </p>
                                              <p className={`font-bold text-body-sm mb-2 ${tierStyles.title}`}>
                                                {record.analysis.primaryWarning}
                                              </p>
                                              {record.analysis.recommendation && (
                                                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                                  {record.analysis.recommendation}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {!record.analysis.primaryWarning && record.analysis.recommendation && (
                                          <div className={`p-4 border rounded-lg ${tierStyles.panel}`}>
                                            <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                                              Pharmacist Recommendation
                                            </p>
                                            <p className="text-body-sm text-on-surface leading-relaxed">
                                              {record.analysis.recommendation}
                                            </p>
                                          </div>
                                        )}

                                        {record.analysis.clinicalImpact.length > 0 && (
                                          <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                            <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">
                                              Clinical Impact
                                            </p>
                                            <ul className="space-y-2 text-body-sm text-on-surface">
                                              {record.analysis.clinicalImpact.map((impact) => (
                                                <li key={impact} className="flex items-start gap-2">
                                                  <ArrowRight className={`mt-0.5 shrink-0 ${tierStyles.icon}`} size={14} />
                                                  <span>{impact}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container p-4 rounded-lg border border-outline-variant">
                                        No AI interaction analysis was stored for this record.
                                      </p>
                                    )}

                                    {record.analysis.processedBy && (
                                      <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                        <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">Processed By</p>
                                        <p className="text-body-sm font-medium">{record.analysis.processedBy}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
                                    Prescription Details
                                  </h4>
                                  <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                      <thead className="bg-surface-container-low border-b border-outline-variant">
                                        <tr>
                                          <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Drug</th>
                                          <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Dosage</th>
                                          <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Frequency</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-outline-variant">
                                        {record.medications.map((medication) => (
                                          <tr key={medication.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-4 py-3 font-semibold text-body-sm text-on-surface">{medication.name}</td>
                                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{medication.dosage}</td>
                                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{medication.frequency}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-body-sm text-on-surface-variant">
            {totalFiltered === 0
              ? "No records to display"
              : `Showing ${rangeStart}–${rangeEnd} of ${totalFiltered} matching records`}
            {filterMode !== "all" || debouncedSearch
              ? ` · filter: ${FILTER_OPTIONS.find((o) => o.value === filterMode)?.label ?? filterMode}`
              : ""}
          </span>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage(pageNumber)}
                disabled={isLoading}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
