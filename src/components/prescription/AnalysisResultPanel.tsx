"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import {
  getSeverityTierStyles,
  resolveClinicalSeverityTier,
} from "../../lib/clinical-severity";
import type { AnalysisResult } from "../../types/prescription";
import type { PersistedAnalysisSession } from "../../lib/session-analysis";

type AnalysisResultPanelProps = {
  result: AnalysisResult;
  persistedSession: PersistedAnalysisSession | null;
  onStartNew: () => void;
};

export default function AnalysisResultPanel({
  result,
  persistedSession,
  onStartNew,
}: AnalysisResultPanelProps) {
  const tier = resolveClinicalSeverityTier({
    statusLabel: result.severity,
    severityLevel: result.severityLevel,
    primaryWarning: result.primaryWarning,
    recommendation: result.recommendation,
  });
  const styles = getSeverityTierStyles(tier);
  const isHighSeverity = result.severityLevel === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isHighSeverity
                  ? "bg-error-container text-on-error-container"
                  : "bg-primary-container text-on-primary-container"
              }`}
            >
              {isHighSeverity ? <AlertTriangle size={20} /> : <Sparkles size={20} />}
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Interaction Analysis Results
            </h3>
            {result.localResult && (
              <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                Rules engine — no AI call
              </span>
            )}
            {result.cachedResult && !result.localResult && (
              <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                Retrieved from cache — no API call
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-label-caps font-label-caps border ${styles.badge}`}>
            {result.severity}
          </span>
        </div>

        {persistedSession && (
          <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant text-body-sm text-on-surface-variant">
            Saved for{" "}
            <span className="font-semibold text-on-surface">{persistedSession.patientName}</span>
            {" · "}
            {persistedSession.drugs.length} medication(s)
            {" · "}
            Results persist while you review history in this tab.
          </div>
        )}

        <div className="p-8 space-y-8">
          <section>
            <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest border-b border-outline-variant pb-1">
              Primary Finding
            </h4>
            <p className={`font-semibold mb-2 ${styles.title}`}>{result.primaryWarning}</p>
            <p className="text-on-surface-variant font-body-sm leading-relaxed">
              {result.recommendation}
            </p>
          </section>

          <section>
            <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest border-b border-outline-variant pb-1">
              Clinical Impact
            </h4>
            <ul className="space-y-3">
              {result.clinicalImpact.map((impact, i) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  key={i}
                  className="flex items-start gap-2"
                >
                  <ArrowRight className={`mt-1 shrink-0 ${styles.icon}`} size={16} />
                  <span className="text-body-sm">{impact}</span>
                </motion.li>
              ))}
            </ul>
          </section>
        </div>

        <div className="px-6 py-4 bg-surface-container-highest flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Sparkles size={16} />
            <span className="font-data-mono text-data-mono text-xs">
              Processed by {result.processedBy}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-body-sm text-primary font-semibold">Saved to Prescription History</span>
            <button
              type="button"
              className="text-primary font-bold text-body-sm hover:underline"
              onClick={() => window.print()}
            >
              Print Report
            </button>
            <button
              type="button"
              className="bg-surface border border-outline-variant text-on-surface px-4 py-2 rounded font-bold text-body-sm hover:bg-surface-container transition-colors"
              onClick={onStartNew}
            >
              Start New Prescription
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
