import { z } from "zod";

export const ANALYSIS_SEVERITY_LABELS = [
  "Critical Conflict",
  "Potential Interaction",
  "Low Risk",
  "Verified Safe",
  "Drug Identification Required",
  "Single Medication Review",
] as const;

export const analysisResultSchema = z.object({
  severityLevel: z.enum(["high", "low"]),
  severity: z.enum(ANALYSIS_SEVERITY_LABELS),
  primaryWarning: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
  clinicalImpact: z.array(z.string().trim().min(1)).min(2).max(4),
  processedBy: z.string().trim().min(1),
  cachedResult: z.boolean().optional(),
  localResult: z.boolean().optional(),
});
