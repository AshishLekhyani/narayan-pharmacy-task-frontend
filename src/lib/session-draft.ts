import type { Medication } from "../types/prescription";

const KEYS = {
  patientName: "rx_patientName",
  date: "rx_date",
  drugs: "rx_drugs",
} as const;

export function readDraftFromSession(): {
  patientName: string;
  date: string;
  drugs: Medication[];
} {
  if (typeof window === "undefined") {
    return { patientName: "", date: "", drugs: [] };
  }

  let drugs: Medication[] = [];
  try {
    const stored = sessionStorage.getItem(KEYS.drugs);
    drugs = stored ? (JSON.parse(stored) as Medication[]) : [];
  } catch {
    drugs = [];
  }

  return {
    patientName: sessionStorage.getItem(KEYS.patientName) ?? "",
    date: sessionStorage.getItem(KEYS.date) ?? "",
    drugs,
  };
}

export function writeDraftToSession(draft: {
  patientName: string;
  date: string;
  drugs: Medication[];
}) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEYS.patientName, draft.patientName);
  sessionStorage.setItem(KEYS.date, draft.date);
  sessionStorage.setItem(KEYS.drugs, JSON.stringify(draft.drugs));
}

export function clearDraftSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEYS.patientName);
  sessionStorage.removeItem(KEYS.date);
  sessionStorage.removeItem(KEYS.drugs);
}
