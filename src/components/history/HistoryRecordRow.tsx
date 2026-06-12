"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ChevronDown, Sparkles } from "lucide-react";
import { formatPrescribedAt } from "../../lib/format-date";
import {
  getSeverityTierStyles,
  resolveClinicalSeverityTier,
} from "../../lib/clinical-severity";
import type { PrescriptionHistoryRecord } from "../../lib/history-schemas";
import HistoryExpandedDetail from "./HistoryExpandedDetail";

type HistoryRecordRowProps = {
  record: PrescriptionHistoryRecord;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
};

export default function HistoryRecordRow({
  record,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: HistoryRecordRowProps) {
  const isHigh = record.analysis.severityLevel === "high";
  const isFlagged = Boolean(record.analysis.statusLabel);
  const severityTier = resolveClinicalSeverityTier(record.analysis);
  const tierStyles = getSeverityTierStyles(severityTier);
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
    <Fragment>
      <tr
        className={`interaction-row transition-colors cursor-pointer ${isExpanded ? "bg-surface-container-lowest" : ""}`}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary cursor-pointer"
            checked={isSelected}
            onChange={onToggleSelect}
            aria-label={`Select ${record.patientName}`}
          />
        </td>
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
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBg} ${statusColor} text-body-sm font-medium`}
          >
            <StatusIcon size={16} /> {statusText}
          </span>
        </td>
        <td className="px-6 py-4">
          {severityTier !== "None" ? (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tierStyles.badge} text-xs font-bold uppercase border`}
            >
              <div className={`w-2 h-2 rounded-full ${tierStyles.dot}`} />
              {severityTier}
            </span>
          ) : (
            <span className="text-body-sm text-on-surface-variant">—</span>
          )}
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
              <HistoryExpandedDetail record={record} />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
