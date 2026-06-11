"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, Trash2, FlaskConical, Loader2, 
  ClipboardList, AlertTriangle, ArrowRight, Sparkles 
} from "lucide-react";

export default function PrescriptionEntryPage() {
  const [drugs, setDrugs] = useState([
    { id: 1, name: "Warfarin", dosage: "5mg - Once Daily" },
    { id: 2, name: "Aspirin", dosage: "81mg - Once Daily" },
  ]);

  const addRow = () => {
    setDrugs([...drugs, { id: Date.now(), name: "", dosage: "" }]);
  };

  const removeRow = (id: number) => {
    setDrugs(drugs.filter((d) => d.id !== id));
  };

  const analyzeMutation = useMutation({
    mutationFn: async (currentDrugs: typeof drugs) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: currentDrugs }),
      });
      if (!response.ok) throw new Error("Failed to analyze");
      return response.json();
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
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
            <h2 className="font-headline-md text-headline-md text-on-surface">Patient & Provider Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-on-surface-variant font-label-caps text-label-caps block">Patient Name</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. Johnathan Doe"
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="text-on-surface-variant font-label-caps text-label-caps block">Doctor Name</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g. Dr. Sarah Chen"
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="text-on-surface-variant font-label-caps text-label-caps block">Date</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                type="date"
                defaultValue="2023-10-27"
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
              onClick={addRow}
            >
              <PlusCircle size={20} />
              <span className="text-body-sm font-body-sm">Add Medication</span>
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
                    Dosage / Frequency
                  </th>
                  <th className="px-6 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider w-16 text-center">
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
                        <input
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-semibold"
                          type="text"
                          defaultValue={drug.name}
                          onChange={(e) => {
                            const newDrugs = [...drugs];
                            const idx = newDrugs.findIndex(d => d.id === drug.id);
                            if(idx > -1) newDrugs[idx].name = e.target.value;
                            setDrugs(newDrugs);
                          }}
                          placeholder="Enter drug name..."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface"
                          type="text"
                          defaultValue={drug.dosage}
                          onChange={(e) => {
                            const newDrugs = [...drugs];
                            const idx = newDrugs.findIndex(d => d.id === drug.id);
                            if(idx > -1) newDrugs[idx].dosage = e.target.value;
                            setDrugs(newDrugs);
                          }}
                          placeholder="e.g. 10mg BD"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => removeRow(drug.id)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
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
            className="group relative bg-primary text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-80 disabled:hover:scale-100"
            disabled={analyzeMutation.isPending}
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
              {analyzeMutation.isPending ? (
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
                          "{analyzeMutation.data.recommendation}"
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
                    <button className="bg-primary text-on-primary px-4 py-2 rounded font-bold text-body-sm hover:bg-primary/90 transition-colors">
                      {analyzeMutation.data.severityLevel === "high" ? "Flag for Pharmacist Review" : "Approve Prescription"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
