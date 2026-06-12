"use client";

import { useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Trash2, X } from "lucide-react";
import PortalDropdown from "../PortalDropdown";
import ModalShell from "../ui/ModalShell";
import {
  FREQUENCY_DROPDOWN_OPTIONS,
  resolveFrequencyPreset,
  type FrequencyPreset,
} from "../../lib/frequency-presets";
import { MAX_MEDICATIONS_PER_PRESCRIPTION } from "../../lib/clinical-constants";
import { validateMedicationEntry } from "../../lib/prescription-validation";
import type { Medication } from "../../types/prescription";

export type MedicationFormEntry = {
  name: string;
  dosage: string;
  frequency: string;
};

type DraftDrug = {
  id: string | number;
  name: string;
  dosage: string;
  frequencyType: FrequencyPreset;
  customFrequency: string;
};

type MedicationFormModalProps = {
  open: boolean;
  mode: "add" | "edit";
  editDrug?: Medication;
  existingDrugCount?: number;
  onClose: () => void;
  onSave: (entries: MedicationFormEntry[], mode: "add" | "edit", editId?: number) => void;
};

function createEmptyDraft(): DraftDrug {
  return {
    id: Date.now(),
    name: "",
    dosage: "",
    frequencyType: "Once daily (QD)",
    customFrequency: "",
  };
}

function draftToEntry(draft: DraftDrug): MedicationFormEntry {
  return {
    name: draft.name.trim(),
    dosage: draft.dosage.trim(),
    frequency:
      draft.frequencyType === "Custom..." ? draft.customFrequency.trim() : draft.frequencyType,
  };
}

function buildInitialDrafts(mode: "add" | "edit", editDrug?: Medication): DraftDrug[] {
  if (mode === "edit" && editDrug) {
    const resolved = resolveFrequencyPreset(editDrug.frequency);
    const isPreset = resolved !== "Custom...";
    return [
      {
        id: editDrug.id,
        name: editDrug.name,
        dosage: editDrug.dosage,
        frequencyType: isPreset ? resolved : "Custom...",
        customFrequency: isPreset ? "" : editDrug.frequency,
      },
    ];
  }
  return [createEmptyDraft()];
}

type MedicationFormModalBodyProps = Omit<MedicationFormModalProps, "open"> & {
  titleId: string;
  errorId: string;
  firstFieldRef: RefObject<HTMLInputElement | null>;
};

function MedicationFormModalBody({
  mode,
  editDrug,
  existingDrugCount = 0,
  onClose,
  onSave,
  titleId,
  errorId,
  firstFieldRef,
}: MedicationFormModalBodyProps) {
  const [draftDrugs, setDraftDrugs] = useState<DraftDrug[]>(() => buildInitialDrafts(mode, editDrug));
  const [modalError, setModalError] = useState<string | null>(null);
  const modalTitle = mode === "add" ? "Add Medications" : "Edit Medication";

  const updateDraftDrug = (id: string | number, field: keyof DraftDrug, value: string) => {
    setDraftDrugs((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const addDraftRow = () => {
    setDraftDrugs((prev) => [...prev, { ...createEmptyDraft(), id: Date.now() + Math.random() }]);
  };

  const removeDraftRow = (id: string | number) => {
    setDraftDrugs((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
  };

  const handleSave = () => {
    setModalError(null);
    const validDrafts = draftDrugs.filter(
      (d) =>
        d.name.trim() !== "" &&
        d.dosage.trim() !== "" &&
        (d.frequencyType === "Custom..." ? d.customFrequency.trim() !== "" : true)
    );

    if (validDrafts.length === 0) {
      setModalError("Complete drug name, dosage, and frequency for at least one row.");
      return;
    }

    for (const draft of validDrafts) {
      const entry = draftToEntry(draft);
      const validationError = validateMedicationEntry(entry);
      if (validationError) {
        setModalError(validationError);
        return;
      }
    }

    if (mode === "add") {
      const remaining = MAX_MEDICATIONS_PER_PRESCRIPTION - existingDrugCount;
      if (remaining <= 0) {
        setModalError(`A prescription cannot include more than ${MAX_MEDICATIONS_PER_PRESCRIPTION} medications.`);
        return;
      }
      if (validDrafts.length > remaining) {
        setModalError(`Only ${remaining} medication slot(s) remain on this prescription.`);
        return;
      }
    }

    const entries = validDrafts.map(draftToEntry);
    if (mode === "edit" && editDrug) {
      onSave(entries, "edit", editDrug.id);
    } else {
      onSave(entries, "add");
    }
    onClose();
  };

  const canSave = draftDrugs.some(
    (d) =>
      d.name.trim() !== "" &&
      d.dosage.trim() !== "" &&
      (d.frequencyType !== "Custom..." || d.customFrequency.trim() !== "")
  );

  return (
    <>
      <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0 z-10">
        <h2 id={titleId} className="font-headline-md text-headline-md text-on-surface font-bold">
          {modalTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full transition-colors"
          aria-label="Close medication form"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      <div data-lenis-prevent className="modal-scroll-area p-6 space-y-6 overflow-y-auto">
        {modalError && (
          <div
            id={errorId}
            role="alert"
            className="rounded-lg border border-error bg-error-container/20 px-4 py-3 text-body-sm text-error"
          >
            {modalError}
          </div>
        )}
              <AnimatePresence initial={false}>
                {draftDrugs.map((draft, index) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 items-start relative"
                    style={{ zIndex: 50 - index }}
                  >
                    <div className="flex-[2] space-y-1">
                      {index === 0 && (
                        <label
                          htmlFor={`drug-name-${draft.id}`}
                          className="text-on-surface-variant font-label-caps text-label-caps block"
                        >
                          Drug Name
                        </label>
                      )}
                      <input
                        ref={index === 0 ? firstFieldRef : undefined}
                        id={`drug-name-${draft.id}`}
                        className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="e.g. Lisinopril"
                        type="text"
                        value={draft.name}
                        onChange={(e) => updateDraftDrug(draft.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      {index === 0 && (
                        <label
                          htmlFor={`drug-dosage-${draft.id}`}
                          className="text-on-surface-variant font-label-caps text-label-caps block"
                        >
                          Dosage
                        </label>
                      )}
                      <input
                        id={`drug-dosage-${draft.id}`}
                        className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="e.g. 10mg"
                        type="text"
                        value={draft.dosage}
                        onChange={(e) => updateDraftDrug(draft.id, "dosage", e.target.value)}
                      />
                    </div>
                    <div className="flex-[1.5] space-y-1">
                      {index === 0 && (
                        <label className="text-on-surface-variant font-label-caps text-label-caps block">
                          Frequency
                        </label>
                      )}
                      <PortalDropdown
                        value={draft.frequencyType}
                        options={FREQUENCY_DROPDOWN_OPTIONS}
                        onChange={(val) => updateDraftDrug(draft.id, "frequencyType", val)}
                        className="w-full"
                        triggerClassName="w-full bg-surface-container-lowest border border-outline text-left text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary flex justify-between items-center gap-2"
                        menuClassName="frequency-dropdown-menu bg-surface border border-outline-variant rounded-xl shadow-xl overflow-y-auto py-1"
                        ariaLabel="Select frequency"
                      />
                      {draft.frequencyType === "Custom..." && (
                        <motion.input
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          aria-label="Custom frequency"
                          className="w-full mt-2 bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary relative z-0"
                          placeholder="e.g. 2 times every 3 days"
                          type="text"
                          value={draft.customFrequency}
                          onChange={(e) => updateDraftDrug(draft.id, "customFrequency", e.target.value)}
                        />
                      )}
                    </div>
                    {mode === "add" && draftDrugs.length > 1 && (
                      <div className={`flex items-center justify-center shrink-0 ${index === 0 ? "pt-7" : ""}`}>
                        <button
                          type="button"
                          onClick={() => removeDraftRow(draft.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-2 rounded hover:bg-surface-container"
                          aria-label="Remove medication row"
                        >
                          <Trash2 size={20} aria-hidden />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {mode === "add" && (
                <button
                  type="button"
                  onClick={addDraftRow}
                  className="flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary-container p-3 rounded-lg transition-colors w-full border border-dashed border-primary mt-2"
                >
                  <PlusCircle size={20} />
                  <span className="text-body-sm font-body-sm">Add Another Medication</span>
                </button>
              )}
      </div>

      <div className="p-4 bg-surface-container-highest border-t border-outline-variant flex justify-end gap-3 shrink-0 z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-high rounded transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 bg-primary text-on-primary font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {mode === "add" ? "Add to List" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default function MedicationFormModal({
  open,
  mode,
  editDrug,
  existingDrugCount = 0,
  onClose,
  onSave,
}: MedicationFormModalProps) {
  const titleId = useId();
  const errorId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      ariaLabelledBy={titleId}
      initialFocusRef={firstFieldRef}
      panelClassName="bg-surface border border-outline-variant shadow-2xl rounded-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
    >
      {open && (
        <MedicationFormModalBody
          key={mode === "edit" ? `edit-${editDrug?.id}` : "add"}
          mode={mode}
          editDrug={editDrug}
          existingDrugCount={existingDrugCount}
          onClose={onClose}
          onSave={onSave}
          titleId={titleId}
          errorId={errorId}
          firstFieldRef={firstFieldRef}
        />
      )}
    </ModalShell>
  );
}
