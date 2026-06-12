import { z } from "zod";

const medicationRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

const historyAnalysisSchema = z.object({
  statusLabel: z.string().nullable(),
  severityLevel: z.string().nullable(),
  recommendation: z.string().nullable(),
  primaryWarning: z.string().nullable(),
  clinicalImpact: z.array(z.string()),
  processedBy: z.string().nullable(),
});

export const prescriptionHistoryRecordSchema = z.object({
  id: z.number(),
  patientName: z.string(),
  prescribedAt: z.union([z.string(), z.coerce.date()]).transform(String),
  medications: z.array(medicationRecordSchema),
  analysis: historyAnalysisSchema,
  createdAt: z.union([z.string(), z.coerce.date()]).transform(String),
  updatedAt: z.union([z.string(), z.coerce.date()]).transform(String),
});

export const historyStatsSchema = z.object({
  totalRecords: z.number(),
  severeAlerts: z.number(),
  aiFlagged: z.number(),
  validationRate: z.number(),
});

const historyFilterSchema = z.enum(["all", "high", "flagged", "safe"]);

export const historyListResponseSchema = z.object({
  status: z.literal("success"),
  data: z.array(prescriptionHistoryRecordSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
    filter: historyFilterSchema,
    search: z.string(),
  }),
});

export const historyStatsResponseSchema = z.object({
  status: z.literal("success"),
  data: historyStatsSchema,
});

export const batchDeleteResponseSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    deletedCount: z.number(),
    requestedIds: z.array(z.number()).optional(),
  }),
});

export type PrescriptionHistoryRecord = z.infer<typeof prescriptionHistoryRecordSchema>;
export type HistoryStats = z.infer<typeof historyStatsSchema>;
export type HistoryFilterMode = z.infer<typeof historyFilterSchema>;

function formatZodIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Unexpected API response shape.";
}

export function parseHistoryListResponse(raw: unknown) {
  const parsed = historyListResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(formatZodIssue(parsed.error));
  }
  return parsed.data;
}

export function parseHistoryStatsResponse(raw: unknown) {
  const parsed = historyStatsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(formatZodIssue(parsed.error));
  }
  return parsed.data;
}

export function parseBatchDeleteResponse(raw: unknown) {
  const parsed = batchDeleteResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(formatZodIssue(parsed.error));
  }
  return parsed.data;
}
