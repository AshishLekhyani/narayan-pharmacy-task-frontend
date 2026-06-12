import { persistedAnalysisSessionSchema } from "./session-schemas";
import type { AnalysisResult, Medication } from "../types/prescription";

const STORAGE_KEY = "rx_lastAnalysis";

export type PersistedAnalysisSession = {
  analysis: AnalysisResult;
  patientName: string;
  date: string;
  drugs: Medication[];
  savedAt: string;
};

export function readPersistedAnalysis(): PersistedAnalysisSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = persistedAnalysisSessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writePersistedAnalysis(session: PersistedAnalysisSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearPersistedAnalysis() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildPrescriptionFingerprint(
  patientName: string,
  date: string,
  drugs: Medication[]
): string {
  return JSON.stringify({
    patientName: patientName.trim().toLowerCase(),
    date,
    drugs: drugs.map((d) => ({
      name: d.name.trim().toLowerCase(),
      dosage: d.dosage.trim().toLowerCase(),
      frequency: d.frequency.trim().toLowerCase(),
    })),
  });
}
