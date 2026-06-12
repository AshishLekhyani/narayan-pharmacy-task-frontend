import type { AnalysisResult } from "../types/prescription";
import { fetchJson, getApiErrorMessage } from "./api-error";

type MedicationInput = {
  name: string;
  dosage: string;
  frequency: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates and normalizes the analyze API payload — never pass raw JSON to UI components. */
export function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  if (!isRecord(raw)) {
    throw new Error("Unexpected response from the analysis service.");
  }

  if (raw.status === "error") {
    throw new Error(getApiErrorMessage(raw, "Drug interaction analysis failed."));
  }

  const clinicalImpact = Array.isArray(raw.clinicalImpact)
    ? raw.clinicalImpact.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  const severityLevel = raw.severityLevel === "high" ? "high" : "low";
  const severity = typeof raw.severity === "string" ? raw.severity.trim() : "";
  const primaryWarning = typeof raw.primaryWarning === "string" ? raw.primaryWarning.trim() : "";
  const recommendation = typeof raw.recommendation === "string" ? raw.recommendation.trim() : "";
  const processedBy =
    typeof raw.processedBy === "string" ? raw.processedBy.trim() : "Claude API — Narayan Pharmacy DDI Engine";

  if (!severity || !primaryWarning || !recommendation) {
    throw new Error("The analysis service returned an incomplete clinical report. Please try again.");
  }

  return {
    severity,
    severityLevel,
    primaryWarning,
    recommendation,
    clinicalImpact:
      clinicalImpact.length > 0 ? clinicalImpact : ["No additional clinical impact details were provided."],
    processedBy,
    cachedResult: raw.cachedResult === true,
    localResult: false,
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
