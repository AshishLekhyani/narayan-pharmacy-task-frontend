import { fetchJson } from "./api-error";
import type { AnalysisResult } from "../types/prescription";

export type HistoryFilterMode = "all" | "high" | "flagged" | "safe";

export type MedicationRecord = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
};

export type PrescriptionHistoryRecord = {
  id: number;
  patientName: string;
  prescribedAt: string;
  medications: MedicationRecord[];
  analysis: {
    statusLabel: string | null;
    severityLevel: string | null;
    recommendation: string | null;
    primaryWarning: string | null;
    clinicalImpact: string[];
    processedBy: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type HistoryStats = {
  totalRecords: number;
  severeAlerts: number;
  aiFlagged: number;
  validationRate: number;
};

export type HistoryListResponse = {
  status: string;
  data: PrescriptionHistoryRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    filter: HistoryFilterMode;
    search: string;
  };
  stats: HistoryStats;
};

export type HistoryQueryParams = {
  page: number;
  limit?: number;
  search?: string;
  filter?: HistoryFilterMode;
};

export type SavePrescriptionPayload = {
  patientName: string;
  date: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  aiAnalysis: Pick<
    AnalysisResult,
    "severity" | "severityLevel" | "recommendation" | "primaryWarning" | "clinicalImpact" | "processedBy"
  > | null;
};

function buildHistoryUrl(params: HistoryQueryParams) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 10));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.filter && params.filter !== "all") query.set("filter", params.filter);
  return `/api/history?${query.toString()}`;
}

export async function fetchHistoryPage(params: HistoryQueryParams): Promise<HistoryListResponse> {
  return fetchJson<HistoryListResponse>(buildHistoryUrl(params));
}

export async function fetchHistoryForExport(
  search: string,
  filter: HistoryFilterMode
): Promise<PrescriptionHistoryRecord[]> {
  const all: PrescriptionHistoryRecord[] = [];
  let page = 1;
  let totalPages = 1;
  const chunkSize = 50;

  do {
    const result = await fetchHistoryPage({ page, limit: chunkSize, search, filter });
    all.push(...result.data);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages && all.length < 500);

  return all;
}

export async function savePrescription(payload: SavePrescriptionPayload): Promise<unknown> {
  return fetchJson("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
