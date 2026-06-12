"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  getSeverityTierStyles,
  hasStoredAnalysis,
  resolveClinicalSeverityTier,
} from "../../lib/clinical-severity";
import type { PrescriptionHistoryRecord } from "../../lib/history-schemas";

type HistoryExpandedDetailProps = {
  record: PrescriptionHistoryRecord;
};

export default function HistoryExpandedDetail({ record }: HistoryExpandedDetailProps) {
  const severityTier = resolveClinicalSeverityTier(record.analysis);
  const tierStyles = getSeverityTierStyles(severityTier);
  const hasAnalysis = hasStoredAnalysis(record.analysis);

  return (
    <div className={`border-l-4 ${tierStyles.border} px-12 py-8 bg-surface-container-lowest shadow-inner`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              AI Interaction Result
            </h4>
            {severityTier !== "None" && (
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tierStyles.badge} text-xs font-bold uppercase border`}
              >
                <div className={`w-2 h-2 rounded-full ${tierStyles.dot}`} />
                {severityTier}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {hasAnalysis ? (
              <>
                {record.analysis.statusLabel && (
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                      Interaction Status
                    </p>
                    <p className={`font-semibold text-body-sm ${tierStyles.title}`}>
                      {record.analysis.statusLabel}
                    </p>
                  </div>
                )}

                {record.analysis.primaryWarning && (
                  <div className={`flex items-start gap-3 p-4 border rounded-lg ${tierStyles.panel}`}>
                    <AlertTriangle className={`${tierStyles.icon} shrink-0`} size={20} />
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                        Primary Warning
                      </p>
                      <p className={`font-bold text-body-sm mb-2 ${tierStyles.title}`}>
                        {record.analysis.primaryWarning}
                      </p>
                      {record.analysis.recommendation && (
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">
                          {record.analysis.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!record.analysis.primaryWarning && record.analysis.recommendation && (
                  <div className={`p-4 border rounded-lg ${tierStyles.panel}`}>
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">
                      Pharmacist Recommendation
                    </p>
                    <p className="text-body-sm text-on-surface leading-relaxed">
                      {record.analysis.recommendation}
                    </p>
                  </div>
                )}

                {record.analysis.clinicalImpact.length > 0 && (
                  <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">
                      Clinical Impact
                    </p>
                    <ul className="space-y-2 text-body-sm text-on-surface">
                      {record.analysis.clinicalImpact.map((impact) => (
                        <li key={impact} className="flex items-start gap-2">
                          <ArrowRight className={`mt-0.5 shrink-0 ${tierStyles.icon}`} size={14} />
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container p-4 rounded-lg border border-outline-variant">
                No AI interaction analysis was stored for this record.
              </p>
            )}

            {record.analysis.processedBy && (
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">
                  Processed By
                </p>
                <p className="text-body-sm font-medium">{record.analysis.processedBy}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
            Prescription Details
          </h4>
          <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                    Drug
                  </th>
                  <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {record.medications.map((medication) => (
                  <tr key={medication.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-semibold text-body-sm text-on-surface">{medication.name}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">{medication.dosage}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">{medication.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
