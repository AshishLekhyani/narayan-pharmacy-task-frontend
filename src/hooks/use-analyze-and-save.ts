import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAnalyzeAndSavePrescription } from "../lib/analyze-and-save-api";
import {
  validateMedicationEntry,
  validatePatientName,
  validatePrescriptionDate,
} from "../lib/prescription-validation";
import type { AnalysisResult, Medication } from "../types/prescription";

type PersistAnalysisPayload = {
  analysis: AnalysisResult;
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

  return useMutation<AnalysisResult, Error, Medication[]>({
    mutationFn: async (currentDrugs) => {
      const trimmedName = patientName.trim();
      const nameError = validatePatientName(trimmedName);
      if (nameError) throw new Error(nameError);

      const dateError = validatePrescriptionDate(date);
      if (dateError) throw new Error(dateError);

      if (currentDrugs.length === 0) {
        throw new Error("Add at least one medication before running analysis.");
      }

      const medications = currentDrugs.map(({ name, dosage, frequency }) => {
        const entry = { name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim() };
        const medicationError = validateMedicationEntry(entry);
        if (medicationError) throw new Error(medicationError);
        return entry;
      });

      return requestAnalyzeAndSavePrescription({
        patientName: trimmedName,
        date,
        medications,
      });
    },
    onSuccess: (analysis) => {
      persist({
        analysis,
        patientName: patientName.trim(),
        date,
        drugs: [...drugs],
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
