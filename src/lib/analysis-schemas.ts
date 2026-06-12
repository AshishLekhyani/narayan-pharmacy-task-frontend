import { z } from "zod";

export const analysisResultSchema = z.object({
  severityLevel: z.enum(["high", "low"]),
  severity: z.string().trim().min(1),
  primaryWarning: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
  clinicalImpact: z.array(z.string().trim()).min(1),
  processedBy: z.string().trim().min(1),
  cachedResult: z.boolean().optional(),
  localResult: z.boolean().optional(),
});

export const analyzeApiResponseSchema = z.union([
  z.object({ status: z.literal("error"), message: z.string() }),
  analysisResultSchema.extend({ cachedResult: z.boolean().optional() }),
]);
