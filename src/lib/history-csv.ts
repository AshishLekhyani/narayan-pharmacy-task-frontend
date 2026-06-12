import { resolveClinicalSeverityTier } from "./clinical-severity";
import type { PrescriptionHistoryRecord } from "./history-schemas";

export function downloadHistoryCsv(records: PrescriptionHistoryRecord[]) {
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
