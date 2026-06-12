import type { AnalysisResult } from "../types/prescription";

type ApiErrorBody = {
  status?: string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates and normalizes the analyze API payload — never pass raw JSON to UI components. */
export function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  if (!isRecord(raw)) {
    throw new Error("Unexpected response from the analysis service.");
  }

  if (raw.status === "error" && typeof raw.message === "string") {
    throw new Error(raw.message);
  }

  const clinicalImpact = Array.isArray(raw.clinicalImpact)
    ? raw.clinicalImpact.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  const severityLevel = raw.severityLevel === "high" ? "high" : "low";
  const severity = typeof raw.severity === "string" ? raw.severity.trim() : "";
  const primaryWarning = typeof raw.primaryWarning === "string" ? raw.primaryWarning.trim() : "";
  const recommendation = typeof raw.recommendation === "string" ? raw.recommendation.trim() : "";
  const processedBy = typeof raw.processedBy === "string" ? raw.processedBy.trim() : "Claude API — Narayan Pharmacy DDI Engine";

  if (!severity || !primaryWarning || !recommendation) {
    throw new Error("The analysis service returned an incomplete clinical report. Please try again.");
  }

  return {
    severity,
    severityLevel,
    primaryWarning,
    recommendation,
    clinicalImpact: clinicalImpact.length > 0 ? clinicalImpact : ["No additional clinical impact details were provided."],
    processedBy,
    cachedResult: raw.cachedResult === true,
  };
}

export async function requestDrugInteractionAnalysis(
  medications: Array<{ name: string; dosage: string; frequency: string }>
): Promise<AnalysisResult> {
  if (medications.length < 2) {
    throw new Error("Add at least 2 medications before running an interaction analysis.");
  }

  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medications }),
    });
  } catch {
    throw new Error("Unable to reach the analysis service. Check that the backend is running and try again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The analysis service returned an unreadable response. Please try again.");
  }

  if (!response.ok) {
    const err = body as ApiErrorBody;
    throw new Error(err.message ?? "Drug interaction analysis failed. Please try again.");
  }

  return normalizeAnalysisResult(body);
}
