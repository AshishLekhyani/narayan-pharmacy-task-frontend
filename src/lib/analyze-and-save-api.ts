import { z } from "zod";
import { analysisResultSchema } from "./analysis-schemas";
import { fetchJson } from "./api-error";
import { prescriptionHistoryRecordSchema } from "./history-schemas";
import type { AnalysisResult } from "../types/prescription";

const analyzeAndSaveResponseSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    analysis: analysisResultSchema,
    record: prescriptionHistoryRecordSchema,
  }),
});

export async function requestAnalyzeAndSavePrescription(payload: {
  patientName: string;
  date: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
}): Promise<AnalysisResult> {
  const raw = await fetchJson<unknown>("/api/prescriptions/analyze-and-save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const parsed = analyzeAndSaveResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The server returned an unexpected analyze-and-save response.");
  }

  const { analysis } = parsed.data.data;
  return {
    severity: analysis.severity,
    severityLevel: analysis.severityLevel,
    primaryWarning: analysis.primaryWarning,
    recommendation: analysis.recommendation,
    clinicalImpact: analysis.clinicalImpact,
    processedBy: analysis.processedBy,
    cachedResult: analysis.cachedResult === true,
    localResult: analysis.localResult === true,
  };
}
