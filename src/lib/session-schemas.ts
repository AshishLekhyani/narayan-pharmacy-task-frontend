import { z } from "zod";

const medicationSchema = z.object({
  id: z.number(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

const analysisResultSchema = z.object({
  severity: z.string(),
  severityLevel: z.enum(["high", "low"]),
  primaryWarning: z.string(),
  recommendation: z.string(),
  clinicalImpact: z.array(z.string()),
  processedBy: z.string(),
  cachedResult: z.boolean().optional(),
  localResult: z.boolean().optional(),
});

export const persistedAnalysisSessionSchema = z.object({
  analysis: analysisResultSchema,
  patientName: z.string(),
  date: z.string(),
  drugs: z.array(medicationSchema),
  savedAt: z.string(),
});

export const draftDrugsSchema = z.array(medicationSchema);
