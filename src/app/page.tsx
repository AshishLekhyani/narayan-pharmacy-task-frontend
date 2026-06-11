"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, Trash2, FlaskConical, Loader2, 
  ClipboardList, AlertTriangle, ArrowRight, Sparkles, Pencil, X, ChevronDown 
} from "lucide-react";
import { todayIsoDate } from "../lib/format-date";

const FREQUENCY_PRESETS = [
  "OD (Once Daily)",
  "BD (Twice Daily)",
  "TDS (Three times Daily)",
  "QID (Four times Daily)",
  "SOS (As Needed)",
  "Custom..."
];

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
};

type AnalysisResult = {
  severity: string;
  severityLevel: string;
  primaryWarning: string;
  recommendation: string;
  clinicalImpact: string[];
  processedBy: string;
};

function FrequencyDropdown({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportPadding = 16;
    const menuGap = 4;
    const preferredHeight = Math.min(280, FREQUENCY_PRESETS.length * 48 + 8);
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap;
    const spaceAbove = rect.top - viewportPadding - menuGap;
    const shouldOpenAbove = spaceBelow < preferredHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(140, shouldOpenAbove ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(preferredHeight, availableHeight);

    setDropdownStyle({
      top: shouldOpenAbove ? rect.top - menuGap - maxHeight : rect.bottom + menuGap,
      left: Math.min(Math.max(rect.left, viewportPadding), window.innerWidth - rect.width - viewportPadding),
      width: rect.width,
      maxHeight,
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        if (dropdownRef.current && dropdownRef.current.contains(target)) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateDropdownPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) updateDropdownPosition();
    setIsOpen(!isOpen);
  };

  const dropdownPortal = typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          data-lenis-prevent
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{ 
            position: 'fixed', 
            top: `${dropdownStyle.top}px`, 
            left: `${dropdownStyle.left}px`, 
            width: `${dropdownStyle.width}px`, 
            maxHeight: `${dropdownStyle.maxHeight}px`,
            zIndex: 99999 
          }}
          className="frequency-dropdown-menu bg-surface border border-outline-variant rounded-xl shadow-xl overflow-y-auto py-1"
        >
          {FREQUENCY_PRESETS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-surface-container text-body-md transition-colors ${
                value === option ? "bg-primary-container/30 text-primary font-bold" : "text-on-surface"
              }`}
            >
              {option}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full bg-surface-container-lowest border border-outline text-left text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary flex justify-between items-center"
      >
        <span>{value}</span>
        <ChevronDown size={18} className={`text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {dropdownPortal}
    </div>
  );
}

export default function PrescriptionEntryPage() {
  const queryClient = useQueryClient();

  // --- Persistent state backed by sessionStorage (survives tab switches, clears on close) ---
  const [patientName, setPatientName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("rx_patientName") ?? "";
  });

  const [date, setDate] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("rx_date") ?? todayIsoDate();
  });

  const [drugs, setDrugs] = useState<Medication[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem("rx_drugs");
      return stored ? (JSON.parse(stored) as Medication[]) : [];
    } catch {
      return [];
    }
  });

  // Modal State
  type DraftDrug = { 
    id: string | number; 
    name: string; 
    dosage: string; 
    frequencyType: string; 
    customFrequency: string; 
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [draftDrugs, setDraftDrugs] = useState<DraftDrug[]>([]);

  const replaceDrugs = (nextDrugs: Medication[]) => {
    setDrugs(nextDrugs);
    sessionStorage.setItem("rx_drugs", JSON.stringify(nextDrugs));
    if (analyzeMutation.isSuccess) {
      analyzeMutation.reset();
    }
  };

  // Sync patientName & date to sessionStorage whenever they change
  useEffect(() => { sessionStorage.setItem("rx_patientName", patientName); }, [patientName]);
  useEffect(() => { sessionStorage.setItem("rx_date", date); }, [date]);

  // Ensure date is always initialised to today on first mount if storage was empty
  useEffect(() => {
    if (!date) setDate(todayIsoDate());
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }
    return () => { 
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const openAddModal = () => {
    setModalMode("add");
    setDraftDrugs([{ id: Date.now(), name: "", dosage: "", frequencyType: "OD (Once Daily)", customFrequency: "" }]);
    setIsModalOpen(true);
  };

  const openEditModal = (drug: Medication) => {
    setModalMode("edit");
    const isPreset = FREQUENCY_PRESETS.includes(drug.frequency);
    setDraftDrugs([{ 
      id: drug.id, 
      name: drug.name, 
      dosage: drug.dosage, 
      frequencyType: isPreset ? drug.frequency : "Custom...", 
      customFrequency: isPreset ? "" : drug.frequency 
    }]);
    setIsModalOpen(true);
  };

  const updateDraftDrug = (id: string | number, field: keyof DraftDrug, value: string) => {
    setDraftDrugs(draftDrugs.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addDraftRow = () => {
    setDraftDrugs([...draftDrugs, { id: Date.now() + Math.random(), name: "", dosage: "", frequencyType: "OD (Once Daily)", customFrequency: "" }]);
  };

  const removeDraftRow = (id: string | number) => {
    if (draftDrugs.length > 1) {
      setDraftDrugs(draftDrugs.filter(d => d.id !== id));
    }
  };

  const saveMedication = () => {
    const validDrafts = draftDrugs.filter(
      (d) =>
        d.name.trim() !== "" &&
        d.dosage.trim() !== "" &&
        (d.frequencyType === "Custom..." ? d.customFrequency.trim() !== "" : true)
    );
    if (validDrafts.length === 0) return;
    
    if (modalMode === "add") {
      replaceDrugs([
        ...drugs,
        ...validDrafts.map((d, i) => ({
          id: Date.now() + i,
          name: d.name.trim(),
          dosage: d.dosage.trim(),
          frequency: d.frequencyType === "Custom..." ? d.customFrequency.trim() : d.frequencyType,
        })),
      ]);
    } else if (modalMode === "edit") {
      const draft = validDrafts[0];
      replaceDrugs(drugs.map(d => d.id === draft.id ? {
        ...d,
        name: draft.name.trim(),
        dosage: draft.dosage.trim(),
        frequency: draft.frequencyType === "Custom..." ? draft.customFrequency.trim() : draft.frequencyType,
      } : d));
    }
    setIsModalOpen(false);
  };

  const removeRow = (id: number) => {
    replaceDrugs(drugs.filter((d) => d.id !== id));
  };

  const analyzeMutation = useMutation<AnalysisResult, Error, Medication[]>({
    mutationFn: async (currentDrugs: typeof drugs) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications: currentDrugs }),
      });
      if (!response.ok) {
        // Surface the server's own error message instead of a generic string
        let msg = "Failed to analyze";
        try {
          const errBody = await response.json();
          if (errBody?.message) msg = errBody.message;
        } catch {}
        throw new Error(msg);
      }
      return response.json();
    },
    onError: (error: Error) => {
      // Displayed inline — no alert needed, mutation.error drives the UI
      console.error("[Analyze Error]:", error.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!patientName.trim()) throw new Error("Patient Name is required.");
      if (drugs.length === 0) throw new Error("At least one medication is required.");

      const payload = {
        patientName,
        date,
        medications: drugs.map(({ name, dosage, frequency }) => ({ name, dosage, frequency })),
        aiAnalysis: analyzeMutation.data || null
      };

      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save prescription.");
      }
      return response.json();
    },
    onSuccess: () => {
      alert("Prescription saved successfully!");
      // Clear the persistent draft
      sessionStorage.removeItem("rx_patientName");
      sessionStorage.removeItem("rx_date");
      sessionStorage.removeItem("rx_drugs");
      setPatientName("");
      setDate(todayIsoDate());
      replaceDrugs([]);
      analyzeMutation.reset();
      // Trigger history page to refetch immediately
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

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

      <div className="space-y-gutter">
        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h2 className="font-headline-md text-headline-md text-on-surface">Patient & Prescription Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-on-surface-variant font-label-caps text-label-caps block">Patient Name</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. Johnathan Doe"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-on-surface-variant font-label-caps text-label-caps block">Date</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Drug List Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md text-on-surface">Drug List</h2>
            <button
              className="flex items-center gap-2 text-primary font-bold hover:bg-primary-fixed p-2 rounded transition-colors"
              onClick={openAddModal}
            >
              <PlusCircle size={20} />
              <span className="text-body-sm font-body-sm">Add Medications</span>
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Drug Name
                  </th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider w-24 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {drugs.map((drug) => (
                    <motion.tr 
                      key={drug.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-on-surface font-semibold">{drug.name || "Unnamed Medication"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-on-surface">{drug.dosage || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-on-surface">{drug.frequency || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(drug)}
                            className="text-on-surface-variant hover:text-primary transition-colors p-1"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => removeRow(drug.id)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {drugs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">
                      Add medications to begin the interaction analysis workflow.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center py-6"
        >
          <button
            className="group relative bg-primary text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
            disabled={analyzeMutation.isPending || drugs.length < 2}
            onClick={() => analyzeMutation.mutate(drugs)}
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Analyzing with Claude...</span>
              </>
            ) : (
              <>
                <FlaskConical size={24} />
                <span>Check for Interactions (Claude AI)</span>
              </>
            )}
          </button>
          {drugs.length < 2 && !analyzeMutation.isPending && (
            <p className="mt-3 text-body-sm text-on-surface-variant">
              Add at least 2 medications to run an interaction analysis.
            </p>
          )}
        </motion.div>

        {/* Analysis Result Area */}
        <AnimatePresence mode="wait">
          {!analyzeMutation.isSuccess && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-surface-container-high border-2 border-dashed border-outline-variant rounded-xl p-12 text-center text-on-surface-variant ${
                analyzeMutation.isPending ? "interaction-loading" : ""
              }`}
            >
              {analyzeMutation.isError ? (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="text-error mb-4" size={48} />
                  <p className="font-headline-sm text-error mb-1">Analysis Failed</p>
                  <p className="text-body-sm text-on-surface-variant max-w-md">{analyzeMutation.error?.message}</p>
                </div>
              ) : analyzeMutation.isPending ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-primary mb-4" size={48} />
                  <p className="font-display-lg text-headline-md text-primary">Scanning clinical databases...</p>
                  <p className="text-on-surface-variant font-data-mono mt-2">
                    Checking pharmacokinetic interactions for {drugs.length} medications...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ClipboardList size={48} className="mb-4 text-on-surface-variant opacity-50" />
                  <p className="font-body-lg">Click the button above to run a clinical interaction analysis using Claude AI.</p>
                </div>
              )}
            </motion.div>
          )}

          {analyzeMutation.isSuccess && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      analyzeMutation.data.severityLevel === "high" 
                        ? "bg-error-container text-on-error-container" 
                        : "bg-primary-container text-on-primary-container"
                    }`}>
                      {analyzeMutation.data.severityLevel === "high" ? <AlertTriangle size={20} /> : <Sparkles size={20} />}
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Interaction Analysis Results</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-label-caps font-label-caps ${
                    analyzeMutation.data.severityLevel === "high"
                      ? "bg-error-container text-on-error-container"
                      : "bg-primary-container text-on-primary-container"
                  }`}>
                    {analyzeMutation.data.severity}
                  </span>
                </div>
                <div className="p-8 space-y-8">
                  {/* Severity Section */}
                  <section>
                    <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest border-b border-outline-variant pb-1">
                      Primary Finding
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className={`font-semibold mb-2 ${
                          analyzeMutation.data.severityLevel === "high" ? "text-error" : "text-on-surface"
                        }`}>
                          {analyzeMutation.data.primaryWarning}
                        </p>
                        <p className="text-on-surface-variant font-body-sm leading-relaxed">
                          {analyzeMutation.data.recommendation}
                        </p>
                      </div>
                    </div>
                  </section>
                  {/* Specific Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest border-b border-outline-variant pb-1">
                        Clinical Impact
                      </h4>
                      <ul className="space-y-3">
                        {analyzeMutation.data.clinicalImpact.map((impact: string, i: number) => (
                          <motion.li 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            key={i} 
                            className="flex items-start gap-2"
                          >
                            <ArrowRight className={`mt-1 shrink-0 ${
                              analyzeMutation.data.severityLevel === "high" ? "text-error" : "text-primary"
                            }`} size={16} />
                            <span className="text-body-sm">{impact}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest border-b border-outline-variant pb-1">
                        AI Recommendation
                        </h4>
                        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                          <p className="text-body-sm text-on-surface italic font-medium">
                          &quot;{analyzeMutation.data.recommendation}&quot;
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
                <div className="px-6 py-4 bg-surface-container-highest flex justify-between items-center">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Sparkles size={16} />
                    <span className="font-data-mono text-data-mono text-xs">Processed by {analyzeMutation.data.processedBy}</span>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-primary font-bold text-body-sm hover:underline">Print Report</button>
                    <button 
                      className="bg-primary text-on-primary px-4 py-2 rounded font-bold text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? "Saving..." : analyzeMutation.data.severityLevel === "high" ? "Flag & Save for Pharmacist Review" : "Approve & Save Prescription"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add / Edit Medication Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-outline-variant shadow-2xl rounded-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Sticky Header */}
              <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0 z-10">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {modalMode === "add" ? "Add Medications" : "Edit Medication"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Scrollable Body */}
              <div data-lenis-prevent className="modal-scroll-area p-6 space-y-6 overflow-y-auto">
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
                        {index === 0 && <label className="text-on-surface-variant font-label-caps text-label-caps block">Drug Name</label>}
                        <input
                          className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="e.g. Lisinopril"
                          type="text"
                          value={draft.name}
                          onChange={(e) => updateDraftDrug(draft.id, "name", e.target.value)}
                          autoFocus={index === 0}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        {index === 0 && <label className="text-on-surface-variant font-label-caps text-label-caps block">Dosage</label>}
                        <input
                          className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="e.g. 10mg"
                          type="text"
                          value={draft.dosage}
                          onChange={(e) => updateDraftDrug(draft.id, "dosage", e.target.value)}
                        />
                      </div>
                      <div className="flex-[1.5] space-y-1">
                        {index === 0 && <label className="text-on-surface-variant font-label-caps text-label-caps block">Frequency</label>}
                        
                        <FrequencyDropdown 
                          value={draft.frequencyType} 
                          onChange={(val) => updateDraftDrug(draft.id, "frequencyType", val)} 
                        />
                        
                        {draft.frequencyType === "Custom..." && (
                          <motion.input
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="w-full mt-2 bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary relative z-0"
                            placeholder="e.g. 2 times every 3 days"
                            type="text"
                            value={draft.customFrequency}
                            onChange={(e) => updateDraftDrug(draft.id, "customFrequency", e.target.value)}
                          />
                        )}
                      </div>
                      {modalMode === "add" && draftDrugs.length > 1 && (
                        <div className={`flex items-center justify-center shrink-0 ${index === 0 ? "pt-7" : ""}`}>
                          <button
                            onClick={() => removeDraftRow(draft.id)}
                            className="text-on-surface-variant hover:text-error transition-colors p-2 rounded hover:bg-surface-container"
                            title="Remove"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {modalMode === "add" && (
                  <button
                    onClick={addDraftRow}
                    className="flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary-container p-3 rounded-lg transition-colors w-full border border-dashed border-primary mt-2"
                  >
                    <PlusCircle size={20} />
                    <span className="text-body-sm font-body-sm">Add Another Medication</span>
                  </button>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="p-4 bg-surface-container-highest border-t border-outline-variant flex justify-end gap-3 shrink-0 z-10">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-high rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveMedication}
                  disabled={!draftDrugs.some(d => d.name.trim() !== "" && d.dosage.trim() !== "" && (d.frequencyType !== "Custom..." || d.customFrequency.trim() !== ""))}
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {modalMode === "add" ? "Add to List" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
