export type ClinicalSeverityTier = "Severe" | "Moderate" | "Mild" | "None";

type AnalysisLike = {
  statusLabel: string | null;
  severityLevel: string | null;
  primaryWarning?: string | null;
  recommendation?: string | null;
};

/** Maps stored AI labels to pharmacist-facing Mild / Moderate / Severe tiers. */
export function resolveClinicalSeverityTier(analysis: AnalysisLike): ClinicalSeverityTier {
  const label = analysis.statusLabel?.trim() ?? "";
  const level = analysis.severityLevel?.trim().toLowerCase() ?? "";

  if (!label && !level) {
    return "None";
  }

  if (
    level === "high" ||
    label.toLowerCase().includes("critical") ||
    label.toLowerCase().includes("contraindicated")
  ) {
    return "Severe";
  }

  if (
    label === "Potential Interaction" ||
    label === "Single Medication Review" ||
    label.toLowerCase().includes("interaction")
  ) {
    return "Moderate";
  }

  if (label === "Low Risk" || label === "Verified Safe") {
    return "Mild";
  }

  if (label) {
    return level === "high" ? "Severe" : "Moderate";
  }

  return "None";
}

export function getSeverityTierStyles(tier: ClinicalSeverityTier) {
  switch (tier) {
    case "Severe":
      return {
        badge: "text-red-800 bg-red-100 border-red-200",
        dot: "bg-red-600",
        panel: "bg-error-container/20 border-error/30",
        icon: "text-error",
        border: "border-error",
        title: "text-error",
      };
    case "Moderate":
      return {
        badge: "text-amber-800 bg-amber-100 border-amber-200",
        dot: "bg-amber-500",
        panel: "bg-amber-50 border-amber-200",
        icon: "text-amber-700",
        border: "border-amber-500",
        title: "text-amber-800",
      };
    case "Mild":
      return {
        badge: "text-green-800 bg-green-100 border-green-200",
        dot: "bg-green-600",
        panel: "bg-primary-container/20 border-primary/20",
        icon: "text-primary",
        border: "border-primary",
        title: "text-primary",
      };
    default:
      return {
        badge: "text-on-surface-variant bg-surface-container-highest border-outline-variant",
        dot: "bg-on-surface-variant",
        panel: "bg-surface-container border-outline-variant",
        icon: "text-on-surface-variant",
        border: "border-outline-variant",
        title: "text-on-surface",
      };
  }
}

export function hasStoredAnalysis(analysis: AnalysisLike): boolean {
  return Boolean(
    analysis.statusLabel ||
      analysis.primaryWarning ||
      analysis.recommendation ||
      analysis.severityLevel
  );
}
