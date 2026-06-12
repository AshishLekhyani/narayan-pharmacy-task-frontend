import type { AnalysisResult } from "../types/prescription";
import { analyzeApiResponseSchema } from "./analysis-schemas";
import { fetchJson, getApiErrorMessage } from "./api-error";

type MedicationInput = {
  name: string;
  dosage: string;
  frequency: string;
};

/** Validates and normalizes the analyze API payload — never pass raw JSON to UI components. */
export function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  const parsed = analyzeApiResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Unexpected response from the analysis service.");
  }

  const data = parsed.data;
  if ("status" in data) {
    throw new Error(getApiErrorMessage(data, "Drug interaction analysis failed."));
  }

  const result = data;
  return {
    severity: result.severity,
    severityLevel: result.severityLevel,
    primaryWarning: result.primaryWarning,
    recommendation: result.recommendation,
    clinicalImpact: result.clinicalImpact,
    processedBy: result.processedBy,
    cachedResult: result.cachedResult === true,
    localResult: result.localResult === true,
  };
}

/** Local rules-engine result when only one medication is present — no Claude API call. */
export function buildSingleDrugAnalysis(medication: MedicationInput): AnalysisResult {
  return {
    severity: "Single Medication Review",
    severityLevel: "low",
    primaryWarning: `Only one medication (${medication.name}) is on this prescription — drug-drug interaction screening does not apply.`,
    recommendation:
      "Verify dose, frequency, contraindications, allergies, and patient counselling for this single agent before dispensing. Re-run interaction analysis if additional medications are added.",
    clinicalImpact: [
      "No concurrent agents were submitted for interaction screening.",
      "Standard monotherapy dispensing checks still apply (renal/hepatic adjustment, pregnancy/lactation, duplicate therapy).",
    ],
    processedBy: "Narayan Pharmacy Rules Engine — No AI Call",
    localResult: true,
    cachedResult: false,
  };
}

async function requestDrugInteractionAnalysis(medications: MedicationInput[]): Promise<AnalysisResult> {
  const body = await fetchJson<unknown>("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medications }),
  });

  return normalizeAnalysisResult(body);
}

/** Runs local review for 1 drug, or Claude (+ DB cache) for 2+ drugs. */
export async function requestPrescriptionAnalysis(medications: MedicationInput[]): Promise<AnalysisResult> {
  if (medications.length === 0) {
    throw new Error("Add at least one medication before running analysis.");
  }

  if (medications.length === 1) {
    return buildSingleDrugAnalysis(medications[0]);
  }

  return requestDrugInteractionAnalysis(medications);
}
