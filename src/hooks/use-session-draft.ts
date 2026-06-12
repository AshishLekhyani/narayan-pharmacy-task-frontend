"use client";

import { useCallback, useSyncExternalStore } from "react";
import { todayIsoDate } from "../lib/format-date";
import { readDraftFromSession, writeDraftToSession, clearDraftSession } from "../lib/session-draft";
import type { Medication } from "../types/prescription";

type DraftState = {
  patientName: string;
  date: string;
  drugs: Medication[];
};

const EMPTY_DRAFT: DraftState = { patientName: "", date: "", drugs: [] };

let draftSnapshot: DraftState = EMPTY_DRAFT;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot(): DraftState {
  return draftSnapshot;
}

function getServerSnapshot(): DraftState {
  return EMPTY_DRAFT;
}

function hydrateDraftFromSession() {
  const stored = readDraftFromSession();
  draftSnapshot = {
    patientName: stored.patientName,
    date: stored.date || todayIsoDate(),
    drugs: stored.drugs,
  };
}

/** Call once on client module load to seed the external store from sessionStorage. */
if (typeof window !== "undefined") {
  hydrateDraftFromSession();
}

export function useSessionDraft() {
  const draft = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const setPatientName = useCallback((patientName: string) => {
    draftSnapshot = { ...draftSnapshot, patientName };
    writeDraftToSession(draftSnapshot);
    emitChange();
  }, []);

  const setDate = useCallback((date: string) => {
    draftSnapshot = { ...draftSnapshot, date };
    writeDraftToSession(draftSnapshot);
    emitChange();
  }, []);

  const setDrugs = useCallback((drugs: Medication[]) => {
    draftSnapshot = { ...draftSnapshot, drugs };
    writeDraftToSession(draftSnapshot);
    emitChange();
  }, []);

  const resetDraft = useCallback(() => {
    clearDraftSession();
    draftSnapshot = { patientName: "", date: todayIsoDate(), drugs: [] };
    emitChange();
  }, []);

  return {
    patientName: draft.patientName,
    date: draft.date,
    drugs: draft.drugs,
    setPatientName,
    setDate,
    setDrugs,
    resetDraft,
  };
}
