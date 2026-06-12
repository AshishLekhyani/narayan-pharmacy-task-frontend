"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  buildPrescriptionFingerprint,
  clearPersistedAnalysis,
  readPersistedAnalysis,
  writePersistedAnalysis,
  type PersistedAnalysisSession,
} from "../lib/session-analysis";
import type { AnalysisResult, Medication } from "../types/prescription";

let sessionSnapshot: PersistedAnalysisSession | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot() {
  return sessionSnapshot;
}

function getServerSnapshot() {
  return null;
}

if (typeof window !== "undefined") {
  sessionSnapshot = readPersistedAnalysis();
}

export function usePersistedAnalysis() {
  const session = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const persist = useCallback(
    (payload: {
      analysis: AnalysisResult;
      patientName: string;
      date: string;
      drugs: Medication[];
    }) => {
      const next: PersistedAnalysisSession = {
        ...payload,
        savedAt: new Date().toISOString(),
      };
      writePersistedAnalysis(next);
      sessionSnapshot = next;
      emitChange();
    },
    []
  );

  const clear = useCallback(() => {
    clearPersistedAnalysis();
    sessionSnapshot = null;
    emitChange();
  }, []);

  const invalidateIfPrescriptionChanged = useCallback(
    (patientName: string, date: string, drugs: Medication[]): boolean => {
      const current = buildPrescriptionFingerprint(patientName, date, drugs);
      const storedFingerprint = sessionSnapshot
        ? buildPrescriptionFingerprint(
            sessionSnapshot.patientName,
            sessionSnapshot.date,
            sessionSnapshot.drugs
          )
        : null;

      if (storedFingerprint !== null && current !== storedFingerprint) {
        clearPersistedAnalysis();
        sessionSnapshot = null;
        emitChange();
        return true;
      }

      return false;
    },
    []
  );

  return { session, persist, clear, invalidateIfPrescriptionChanged };
}
