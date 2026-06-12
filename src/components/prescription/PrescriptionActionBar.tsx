"use client";

import { motion } from "framer-motion";
import { FlaskConical, Loader2 } from "lucide-react";

type PrescriptionActionBarProps = {
  isPending: boolean;
  drugCount: number;
  patientName: string;
  disabled: boolean;
  onAnalyze: () => void;
};

export default function PrescriptionActionBar({
  isPending,
  drugCount,
  patientName,
  disabled,
  onAnalyze,
}: PrescriptionActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="no-print flex flex-col items-center py-6"
    >
      <button
        type="button"
        className="group relative bg-primary text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
        disabled={disabled || isPending}
        onClick={onAnalyze}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={24} aria-hidden />
            <span>Analyzing & saving to history...</span>
          </>
        ) : (
          <>
            <FlaskConical size={24} aria-hidden />
            <span>
              {drugCount === 1
                ? "Review & Save Single Medication"
                : "Analyze Interactions & Save to History"}
            </span>
          </>
        )}
      </button>
      {patientName.trim().length < 2 && drugCount > 0 && !isPending && (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Enter the patient name above before analysis can be saved to history.
        </p>
      )}
      {drugCount === 0 && !isPending && (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Add at least one medication to begin the review workflow.
        </p>
      )}
      {drugCount === 1 && patientName.trim().length >= 2 && !isPending && (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Single-medication review runs locally (no AI charge). Results are saved automatically.
        </p>
      )}
      {drugCount >= 2 && patientName.trim().length >= 2 && !isPending && (
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Repeat drug combinations use the server cache — no extra AI charge when cached.
        </p>
      )}
    </motion.div>
  );
}
