"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { Medication } from "../../types/prescription";

type DrugListTableProps = {
  drugs: Medication[];
  onAdd: () => void;
  onEdit: (drug: Medication) => void;
  onRemove: (id: number) => void;
};

export default function DrugListTable({ drugs, onAdd, onEdit, onRemove }: DrugListTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="no-print bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Drug List</h2>
        <button
          type="button"
          className="flex items-center gap-2 text-primary font-bold hover:bg-primary-fixed p-2 rounded transition-colors"
          onClick={onAdd}
        >
          <PlusCircle size={20} aria-hidden />
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
                        type="button"
                        onClick={() => onEdit(drug)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1"
                        aria-label={`Edit ${drug.name || "medication"}`}
                      >
                        <Pencil size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(drug.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label={`Remove ${drug.name || "medication"}`}
                      >
                        <Trash2 size={18} aria-hidden />
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
  );
}
