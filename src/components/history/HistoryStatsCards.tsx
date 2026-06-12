"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Box, CheckCircle2, Sparkles } from "lucide-react";
import type { HistoryStats } from "../../lib/history-schemas";

type HistoryStatsCardsProps = {
  stats: HistoryStats;
};

export default function HistoryStatsCards({ stats }: HistoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Total Records</span>
          <Box size={20} className="text-primary" />
        </div>
        <span className="text-display-lg font-display-lg font-data-mono">{stats.totalRecords}</span>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Severe Alerts</span>
          <AlertTriangle size={20} className="text-error" />
        </div>
        <span className="text-display-lg font-display-lg font-data-mono text-error">{stats.severeAlerts}</span>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">AI Flagged</span>
          <Sparkles size={20} className="text-primary" />
        </div>
        <span className="text-display-lg font-display-lg font-data-mono text-primary">{stats.aiFlagged}</span>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Safe / Low Risk</span>
          <CheckCircle2 size={20} className="text-green-600" />
        </div>
        <span className="text-display-lg font-display-lg font-data-mono">{stats.validationRate}%</span>
      </motion.div>
    </div>
  );
}
