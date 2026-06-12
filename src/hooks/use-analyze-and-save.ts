import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAnalyzeAndSavePrescription } from "../lib/analyze-and-save-api";
import {
  validateMedicationEntry,
  validatePatientName,
  validatePrescriptionDate,
} from "../lib/prescription-validation";
import { buildPrescriptionFingerprint } from "../lib/session-analysis";
import type { AnalysisResult, Medication } from "../types/prescription";

type PersistAnalysisPayload = {
  analysis: AnalysisResult;
  patientName: string;
  date: string;
  drugs: Medication[];
};

export type AnalyzeAndSaveVariables = {
  patientName: string;
  date: string;
  drugs: Medication[];
};

type UseAnalyzeAndSaveArgs = {
  patientName: string;
  date: string;
  drugs: Medication[];
  persist: (session: PersistAnalysisPayload) => void;
  onNotice: (notice: { type: "success" | "error"; message: string }) => void;
};

export function useAnalyzeAndSave({
  patientName,
  date,
  drugs,
  persist,
  onNotice,
}: UseAnalyzeAndSaveArgs) {
  const queryClient = useQueryClient();

  return useMutation<AnalysisResult, Error, AnalyzeAndSaveVariables>({
    mutationFn: async ({ patientName: name, date: prescriptionDate, drugs: currentDrugs }) => {
      const trimmedName = name.trim();
      const nameError = validatePatientName(trimmedName);
      if (nameError) throw new Error(nameError);

      const dateError = validatePrescriptionDate(prescriptionDate);
      if (dateError) throw new Error(dateError);

      if (currentDrugs.length === 0) {
        throw new Error("Add at least one medication before running analysis.");
      }

      const medications = currentDrugs.map(({ name: drugName, dosage, frequency }) => {
        const entry = {
          name: drugName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
        };
        const medicationError = validateMedicationEntry(entry);
        if (medicationError) throw new Error(medicationError);
        return entry;
      });

      return requestAnalyzeAndSavePrescription({
        patientName: trimmedName,
        date: prescriptionDate,
        medications,
      });
    },
    onSuccess: (analysis, variables) => {
      const requestFingerprint = buildPrescriptionFingerprint(
        variables.patientName,
        variables.date,
        variables.drugs
      );
      const currentFingerprint = buildPrescriptionFingerprint(patientName, date, drugs);

      if (requestFingerprint !== currentFingerprint) {
        return;
      }

      persist({
        analysis,
        patientName: variables.patientName.trim(),
        date: variables.date,
        drugs: variables.drugs.map((drug) => ({ ...drug })),
      });

      const cacheNote = analysis.cachedResult ? " Analysis served from cache — no new AI charge." : "";
      onNotice({
        type: "success",
        message: `Prescription analyzed and saved to history.${cacheNote} Results stay visible until you start a new prescription.`,
      });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["history-stats"] });
    },
    onError: (error: Error) => {
      onNotice({ type: "error", message: error.message });
    },
  });
}
