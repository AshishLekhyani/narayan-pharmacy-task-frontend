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
} from "lucide-react";
import { formatPrescribedAt } from "../../lib/format-date";

type MedicationRecord = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
};

type PrescriptionHistoryRecord = {
  id: number;
  patientName: string;
  prescribedAt: string;
  medications: MedicationRecord[];
  analysis: {
    statusLabel: string | null;
    severityLevel: string | null;
    recommendation: string | null;
    primaryWarning: string | null;
    clinicalImpact: string[];
    processedBy: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

type HistoryResponse = {
  status: string;
  data: PrescriptionHistoryRecord[];
};

type FilterMode = "all" | "high" | "flagged" | "safe";

function downloadCsv(records: PrescriptionHistoryRecord[]) {
  const rows = [
    [
      "Record ID",
      "Patient Name",
      "Prescription Date",
      "Medication Count",
      "Medication Summary",
      "AI Status",
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
      record.medications.map((medication) => `${medication.name} (${medication.dosage}, ${medication.frequency})`).join(" | "),
      record.analysis.statusLabel ?? "",
      record.analysis.severityLevel ?? "",
      record.analysis.primaryWarning ?? "",
      record.analysis.recommendation ?? "",
      record.analysis.processedBy ?? "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`)
        .join(",")
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
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const { data: dbHistory, isLoading, isError } = useQuery<HistoryResponse>({
    queryKey: ["history"],
    queryFn: async () => {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
  });

  const records = useMemo(() => dbHistory?.data ?? [], [dbHistory]);

  const stats = useMemo(() => {
    const severeAlerts = records.filter((record) => record.analysis.severityLevel === "high").length;
    const aiFlagged = records.filter((record) => Boolean(record.analysis.statusLabel)).length;
    const safeCount = records.filter((record) => (record.analysis.severityLevel ?? "low") !== "high").length;
    const validationRate = records.length === 0 ? 0 : Math.round((safeCount / records.length) * 1000) / 10;

    return {
      totalRecords: records.length,
      severeAlerts,
      aiFlagged,
      validationRate,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        record.patientName.toLowerCase().includes(normalizedQuery) ||
        record.medications.some((medication) => medication.name.toLowerCase().includes(normalizedQuery));

      if (!matchesSearch) {
        return false;
      }

      if (filterMode === "high") {
        return record.analysis.severityLevel === "high";
      }

      if (filterMode === "flagged") {
        return Boolean(record.analysis.statusLabel);
      }

      if (filterMode === "safe") {
        return !record.analysis.statusLabel || record.analysis.severityLevel !== "high";
      }

      return true;
    });
  }, [filterMode, records, searchQuery]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-12"
    >
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Prescription History</h1>
          <p className="text-body-lg text-on-surface-variant">Validated clinical records and interaction analysis audit log.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center bg-surface px-4 py-2 rounded-lg border border-outline-variant focus-within:border-primary transition-colors flex-1 lg:w-96">
            <Search className="text-primary mr-2 shrink-0" size={20} />
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full p-0"
              placeholder="Search patient or medication..."
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm"
            value={filterMode}
            onChange={(event) => setFilterMode(event.target.value as FilterMode)}
          >
            <option value="all">All Records</option>
            <option value="high">Critical Conflicts</option>
            <option value="flagged">AI Flagged</option>
            <option value="safe">Safe / Low Risk</option>
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors"
            onClick={() => downloadCsv(filteredRecords)}
            disabled={filteredRecords.length === 0}
          >
            <Download size={18} className="text-primary" />
            <span>Export CSV</span>
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
                <th className="w-12 px-4 py-3"></th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Patient Name</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Prescription Date</th>
                <th className="text-center px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Drug Count</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">AI Safety Status</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Severity Badge</th>
                <th className="w-12 px-4 py-3"></th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-error">
                    Unable to load prescription history right now.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                    No matching records found for the current filters.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && filteredRecords.map((record) => {
                const isExpanded = expandedRows.includes(record.id);
                const isHigh = record.analysis.severityLevel === "high";
                const isFlagged = Boolean(record.analysis.statusLabel);
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
                const severityColor = isHigh
                  ? "text-red-700 bg-red-100 border-red-200"
                  : isFlagged
                    ? "text-yellow-700 bg-yellow-100 border-yellow-200"
                    : "text-on-surface-variant bg-surface-container-highest border-outline-variant";
                const severityDot = isHigh ? "bg-red-600" : isFlagged ? "bg-yellow-500" : "bg-on-surface-variant";
                const borderLeft = isHigh ? "border-error" : "border-primary";

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
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${severityColor} text-xs font-bold uppercase border`}>
                          <div className={`w-2 h-2 rounded-full ${severityDot}`}></div>
                          {record.analysis.statusLabel ?? "None"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-1 hover:bg-surface-container rounded-full transition-colors text-outline">
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
                            <div className={`border-l-4 ${borderLeft} px-12 py-8 bg-surface-container-lowest shadow-inner`}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
                                    AI Review Summary
                                  </h4>
                                  <div className="space-y-3">
                                    {record.analysis.primaryWarning ? (
                                      <div className="flex items-start gap-3 p-4 bg-error-container/20 border border-error/20 rounded-lg">
                                        <AlertTriangle className="text-error shrink-0" size={20} />
                                        <div>
                                          <p className="font-bold text-body-sm mb-1">{record.analysis.primaryWarning}</p>
                                          <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                            {record.analysis.recommendation}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container p-4 rounded-lg">
                                        No AI escalation was stored for this record.
                                      </p>
                                    )}

                                    {record.analysis.clinicalImpact.length > 0 && (
                                      <div className="p-4 bg-surface-container-low rounded-lg">
                                        <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">Clinical Impact</p>
                                        <ul className="space-y-2 text-body-sm text-on-surface">
                                          {record.analysis.clinicalImpact.map((impact) => (
                                            <li key={impact}>{impact}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {record.analysis.processedBy && (
                                      <div className="p-4 bg-surface-container-low rounded-lg">
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
            Showing {filteredRecords.length} of {records.length} records
          </span>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary rounded font-data-mono text-data-mono">1</button>
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
