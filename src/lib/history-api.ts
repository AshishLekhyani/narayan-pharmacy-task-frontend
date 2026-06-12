import { HISTORY_EXPORT_LIMIT } from "./clinical-constants";
import { fetchJson } from "./api-error";
import {
  parseBatchDeleteResponse,
  parseHistoryListResponse,
  parseHistoryStatsResponse,
  type HistoryFilterMode,
  type HistoryStats,
  type PrescriptionHistoryRecord,
} from "./history-schemas";

export type { HistoryFilterMode, HistoryStats, PrescriptionHistoryRecord };

export type HistoryListResponse = {
  status: "success";
  data: PrescriptionHistoryRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    filter: HistoryFilterMode;
    search: string;
  };
};

export type HistoryQueryParams = {
  page: number;
  limit?: number;
  search?: string;
  filter?: HistoryFilterMode;
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
  const raw = await fetchJson<unknown>(buildHistoryUrl(params));
  return parseHistoryListResponse(raw);
}

export async function fetchHistoryStats(): Promise<HistoryStats> {
  const raw = await fetchJson<unknown>("/api/history/stats");
  return parseHistoryStatsResponse(raw).data;
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
  } while (page <= totalPages && all.length < HISTORY_EXPORT_LIMIT);

  return all;
}

export function wasExportTruncated(rowCount: number, totalMatching: number): boolean {
  return rowCount >= HISTORY_EXPORT_LIMIT && totalMatching > HISTORY_EXPORT_LIMIT;
}

export async function deleteHistoryRecords(ids: number[]): Promise<{ deletedCount: number }> {
  const raw = await fetchJson<unknown>("/api/history/batch", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return parseBatchDeleteResponse(raw).data;
}
