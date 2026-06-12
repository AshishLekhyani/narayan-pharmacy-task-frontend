"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, AlertTriangle, Loader2 } from "lucide-react";
import AnalysisResultPanel from "../components/prescription/AnalysisResultPanel";
import DrugListTable from "../components/prescription/DrugListTable";
import MedicationFormModal from "../components/prescription/MedicationFormModal";
import PrescriptionActionBar from "../components/prescription/PrescriptionActionBar";
import InlineNotice from "../components/ui/InlineNotice";
import { useAnalyzeAndSave } from "../hooks/use-analyze-and-save";
import { usePersistedAnalysis } from "../hooks/use-persisted-analysis";
import { useSessionDraft } from "../hooks/use-session-draft";
import { MAX_MEDICATIONS_PER_PRESCRIPTION } from "../lib/clinical-constants";
import { createMedicationId } from "../lib/id";
import { validatePatientName, validatePrescriptionDate } from "../lib/prescription-validation";
import type { Medication } from "../types/prescription";

export default function PrescriptionEntryPage() {
  const { patientName, date, drugs, setPatientName, setDate, setDrugs, resetDraft } = useSessionDraft();
  const { session: persistedSession, persist, clear: clearPersistedAnalysis, invalidateIfPrescriptionChanged } =
    usePersistedAnalysis();
  const [saveNotice, setSaveNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [patientNameError, setPatientNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editDrug, setEditDrug] = useState<Medication | undefined>(undefined);

  const analyzeMutation = useAnalyzeAndSave({
    patientName,
    date,
    drugs,
    persist,
    onNotice: setSaveNotice,
  });

  const resetAnalysis = analyzeMutation.reset;

  useEffect(() => {
    if (invalidateIfPrescriptionChanged(patientName, date, drugs)) {
      resetAnalysis();
    }
  }, [patientName, date, drugs, invalidateIfPrescriptionChanged, resetAnalysis]);

  const openAddModal = () => {
    if (drugs.length >= MAX_MEDICATIONS_PER_PRESCRIPTION) {
      setSaveNotice({
        type: "error",
        message: `A prescription cannot include more than ${MAX_MEDICATIONS_PER_PRESCRIPTION} medications.`,
      });
      return;
    }
    setModalMode("add");
    setEditDrug(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (drug: Medication) => {
    setModalMode("edit");
    setEditDrug(drug);
    setIsModalOpen(true);
  };

  const replaceDrugs = (nextDrugs: Medication[]) => {
    setDrugs(nextDrugs);
    if (invalidateIfPrescriptionChanged(patientName, date, nextDrugs)) {
      analyzeMutation.reset();
    }
  };

  const startNewPrescription = () => {
    resetDraft();
    clearPersistedAnalysis();
    analyzeMutation.reset();
    setSaveNotice(null);
    setPatientNameError(null);
    setDateError(null);
  };

  const analysisResult = analyzeMutation.data ?? persistedSession?.analysis ?? null;
  const showAnalysisResults = Boolean(analysisResult) && !analyzeMutation.isPending;

  const handleMedicationSave = (
    entries: Array<{ name: string; dosage: string; frequency: string }>,
    mode: "add" | "edit",
    editId?: number
  ) => {
    if (mode === "add") {
      const remaining = MAX_MEDICATIONS_PER_PRESCRIPTION - drugs.length;
      if (remaining <= 0) {
        setSaveNotice({
          type: "error",
          message: `A prescription cannot include more than ${MAX_MEDICATIONS_PER_PRESCRIPTION} medications.`,
        });
        return;
      }
      const toAdd = entries.slice(0, remaining);
      replaceDrugs([
        ...drugs,
        ...toAdd.map((entry) => ({
          id: createMedicationId(),
          ...entry,
        })),
      ]);
      if (entries.length > remaining) {
        setSaveNotice({
          type: "error",
          message: `Only ${remaining} medication slot(s) remained; extra rows were not added.`,
        });
      }
    } else if (editId !== undefined) {
      const entry = entries[0];
      replaceDrugs(
        drugs.map((d) =>
          d.id === editId
            ? { ...d, name: entry.name, dosage: entry.dosage, frequency: entry.frequency }
            : d
        )
      );
    }
  };

  const handleAnalyze = () => {
    const nameError = validatePatientName(patientName);
    const prescriptionDateError = validatePrescriptionDate(date);
    if (nameError) {
      setPatientNameError(nameError);
      setSaveNotice({ type: "error", message: nameError });
      return;
    }
    if (prescriptionDateError) {
      setDateError(prescriptionDateError);
      setSaveNotice({ type: "error", message: prescriptionDateError });
      return;
    }
    analyzeMutation.mutate(drugs);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display-lg text-display-lg text-on-surface">New Prescription Entry</h1>
        <p className="text-on-surface-variant font-body-lg">Electronic submission and clinical safety validation.</p>
      </motion.div>

      <AnimatePresence>
        {saveNotice && (
          <InlineNotice
            type={saveNotice.type}
            message={saveNotice.message}
            onDismiss={() => setSaveNotice(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-gutter">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="no-print bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h2 className="font-headline-md text-headline-md text-on-surface">Patient & Prescription Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="patient-name" className="text-on-surface-variant font-label-caps text-label-caps block">
                Patient Name
              </label>
              <input
                id="patient-name"
                className={`w-full bg-surface-container-lowest border text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary ${
                  patientNameError ? "border-error" : "border-outline"
                }`}
                placeholder="e.g. Rajesh Kumar"
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  if (patientNameError) setPatientNameError(null);
                }}
                onBlur={() => setPatientNameError(validatePatientName(patientName))}
              />
              {patientNameError && (
                <p className="text-body-sm text-error mt-1">{patientNameError}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="prescription-date" className="text-on-surface-variant font-label-caps text-label-caps block">
                Date
              </label>
              <input
                id="prescription-date"
                className={`w-full bg-surface-container-lowest border text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary ${
                  dateError ? "border-error" : "border-outline"
                }`}
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (dateError) setDateError(null);
                }}
                onBlur={() => setDateError(validatePrescriptionDate(date))}
              />
              {dateError && <p className="text-body-sm text-error mt-1">{dateError}</p>}
            </div>
          </div>
        </motion.div>

        <DrugListTable
          drugs={drugs}
          onAdd={openAddModal}
          onEdit={openEditModal}
          onRemove={(id) => replaceDrugs(drugs.filter((d) => d.id !== id))}
        />

        <PrescriptionActionBar
          isPending={analyzeMutation.isPending}
          drugCount={drugs.length}
          patientName={patientName}
          disabled={
            drugs.length < 1 ||
            Boolean(validatePatientName(patientName)) ||
            Boolean(validatePrescriptionDate(date))
          }
          onAnalyze={handleAnalyze}
        />

        <AnimatePresence mode="wait">
          {!showAnalysisResults && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-surface-container-high border-2 border-dashed border-outline-variant rounded-xl p-12 text-center text-on-surface-variant ${
                analyzeMutation.isPending ? "interaction-loading" : ""
              }`}
              aria-live="polite"
            >
              {analyzeMutation.isError ? (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="text-error mb-4" size={48} aria-hidden />
                  <p className="font-headline-sm text-error mb-1">Analysis Failed</p>
                  <p className="text-body-sm text-on-surface-variant max-w-md mb-4">{analyzeMutation.error?.message}</p>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                    disabled={analyzeMutation.isPending || drugs.length < 1}
                    onClick={handleAnalyze}
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : analyzeMutation.isPending ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-primary mb-4" size={48} aria-hidden />
                  <p className="font-display-lg text-headline-md text-primary">Analyzing and saving prescription...</p>
                  <p className="text-on-surface-variant font-data-mono mt-2">
                    {drugs.length >= 2
                      ? `Checking interactions for ${drugs.length} medications, then writing to history...`
                      : `Running local review for ${patientName.trim()}, then saving to history...`}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ClipboardList size={48} className="mb-4 text-on-surface-variant opacity-50" aria-hidden />
                  <p className="font-body-lg">Click the button above to run a clinical interaction analysis using Claude AI.</p>
                </div>
              )}
            </motion.div>
          )}

          {showAnalysisResults && analysisResult && (
            <AnalysisResultPanel
              key="result"
              result={analysisResult}
              persistedSession={persistedSession}
              onStartNew={startNewPrescription}
            />
          )}
        </AnimatePresence>
      </div>

      <MedicationFormModal
        open={isModalOpen}
        mode={modalMode}
        editDrug={editDrug}
        existingDrugCount={drugs.length}
        onClose={() => setIsModalOpen(false)}
        onSave={handleMedicationSave}
      />
    </div>
  );
}
