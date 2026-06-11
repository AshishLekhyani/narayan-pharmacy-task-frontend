"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Download, Box, AlertTriangle, 
  Sparkles, CheckCircle2, ChevronDown, MoreVertical, 
  ChevronLeft, ChevronRight, CheckCircle, Info 
} from "lucide-react";

export default function HistoryPage() {
  const [expandedRows, setExpandedRows] = useState<number[]>([1]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const records = [
    {
      id: 1,
      name: "Robert J. Henderson",
      date: "2023-11-28 09:42",
      drugCount: "02",
      status: "Critical Conflict",
      statusIcon: AlertTriangle,
      statusColor: "text-on-error-container",
      statusBg: "bg-error-container",
      severity: "Severe",
      severityColor: "text-red-700 bg-red-100 border-red-200",
      severityDot: "bg-red-600",
      borderLeft: "border-error",
      drugs: [
        { name: "Warfarin", dosage: "5mg", frequency: "OD (Once Daily)" },
        { name: "Fluconazole", dosage: "200mg", frequency: "OD (Once Daily)" }
      ],
      detail: {
        title: "Medication Conflict Detail",
        subtitle: "Warfarin + Fluconazole",
        desc: "Inhibition of CYP2C9 metabolic pathway increasing bleeding risk by 2.4x. Immediate clinical intervention required.",
        action: "Switch antifungal to Terbinafine or monitor INR daily.",
      },
    },
    {
      id: 2,
      name: "Elena Markova",
      date: "2023-11-28 08:15",
      drugCount: "02",
      status: "Potential Interaction",
      statusIcon: Info,
      statusColor: "text-on-tertiary-fixed",
      statusBg: "bg-tertiary-fixed",
      severity: "Moderate",
      severityColor: "text-orange-700 bg-orange-100 border-orange-200",
      severityDot: "bg-orange-500",
      borderLeft: "border-tertiary-container",
      drugs: [
        { name: "Lisinopril", dosage: "10mg", frequency: "OD (Once Daily)" },
        { name: "Spironolactone", dosage: "25mg", frequency: "OD (Once Daily)" }
      ],
      detail: {
        title: "Observation",
        desc: "Patient prescribed Lisinopril alongside Spironolactone. Moderate risk of hyperkalemia. AI recommends checking potassium levels within 72 hours.",
      },
    },
    {
      id: 3,
      name: "Samir Al-Fayed",
      date: "2023-11-28 07:30",
      drugCount: "03",
      status: "Low Risk",
      statusIcon: CheckCircle,
      statusColor: "text-on-secondary-container",
      statusBg: "bg-secondary-container",
      severity: "Mild",
      severityColor: "text-yellow-700 bg-yellow-100 border-yellow-200",
      severityDot: "bg-yellow-500",
      borderLeft: "border-yellow-400",
      drugs: [
        { name: "Cetirizine", dosage: "10mg", frequency: "OD (Once Daily)" },
        { name: "Diphenhydramine", dosage: "25mg", frequency: "SOS (As Needed)" },
        { name: "Metformin", dosage: "500mg", frequency: "BD (Twice Daily)" }
      ],
      detail: {
        title: "Guidance",
        desc: "Slight risk of drowsiness when combining antihistamines. Advise patient to take at night.",
      },
    },
    {
      id: 4,
      name: "Grace Thompson",
      date: "2023-11-27 18:12",
      drugCount: "01",
      status: "Verified Safe",
      statusIcon: CheckCircle2,
      statusColor: "text-primary",
      statusBg: "bg-primary-container bg-opacity-10",
      severity: "None",
      severityColor: "text-on-surface-variant bg-surface-container-highest border-outline-variant",
      severityDot: "bg-on-surface-variant",
      borderLeft: "border-outline",
      drugs: [
        { name: "Atorvastatin", dosage: "20mg", frequency: "OD (Once Daily)" }
      ],
      detail: null,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-12"
    >
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Prescription History</h1>
          <p className="text-body-lg text-on-surface-variant">Validated clinical records and interaction analysis audit log.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center bg-surface px-4 py-2 rounded-lg border border-outline-variant focus-within:border-primary transition-colors flex-1 lg:w-96">
            <Search className="text-primary mr-2 shrink-0" size={20} />
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full p-0"
              placeholder="Search patient..."
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors">
            <Filter size={18} className="text-primary" />
            <span>All Time</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors">
            <Download size={18} className="text-primary" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Stats Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Total Records</span>
            <Box size={20} className="text-primary" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono">1,284</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Severe Alerts</span>
            <AlertTriangle size={20} className="text-error" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono text-error">12</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">AI Flagged</span>
            <Sparkles size={20} className="text-primary" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono text-primary">42</span>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Validation Rate</span>
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <span className="text-display-lg font-display-lg font-data-mono">99.8%</span>
        </motion.div>
      </div>

      {/* High-Density Data Table Container */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Patient Name</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Drug Count</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">AI Safety Status</th>
                <th className="text-left px-6 py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Severity Badge</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {records.map((record) => {
                const isExpanded = expandedRows.includes(record.id);
                const StatusIcon = record.statusIcon;
                
                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`interaction-row transition-colors cursor-pointer ${isExpanded ? "bg-surface-container-lowest" : ""}`}
                      onClick={() => toggleRow(record.id)}
                    >
                      <td className="px-4 py-4 text-center">
                        <motion.div 
                          animate={{ rotate: isExpanded ? 180 : 0 }} 
                          transition={{ duration: 0.2 }}
                          className="flex justify-center"
                        >
                          <ChevronDown size={20} className="text-outline" />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4 font-body-sm text-body-sm font-semibold">{record.name}</td>
                      <td className="px-6 py-4 font-data-mono text-data-mono">{record.date}</td>
                      <td className="px-6 py-4 text-center font-data-mono text-data-mono">{record.drugCount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${record.statusBg} ${record.statusColor} text-body-sm font-medium`}>
                          <StatusIcon size={16} /> {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${record.severityColor} text-xs font-bold uppercase border`}>
                          <div className={`w-2 h-2 rounded-full ${record.severityDot}`}></div> {record.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-1 hover:bg-surface-container rounded-full transition-colors text-outline">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>

                    {/* Details Row */}
                    <AnimatePresence>
                      {isExpanded && record.detail && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-surface-container-lowest"
                        >
                          <td className="p-0 border-none" colSpan={7}>
                            <div className={`border-l-4 ${record.borderLeft} px-12 py-8 bg-surface-container-lowest shadow-inner`}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
                                    {record.detail.title}
                                  </h4>
                                  <div className="space-y-3">
                                    {record.detail.subtitle && (
                                      <div className="flex items-start gap-3 p-4 bg-error-container/20 border border-error/20 rounded-lg">
                                        <AlertTriangle className="text-error shrink-0" size={20} />
                                        <div>
                                          <p className="font-bold text-body-sm mb-1">{record.detail.subtitle}</p>
                                          <p className="text-body-sm text-on-surface-variant leading-relaxed">{record.detail.desc}</p>
                                        </div>
                                      </div>
                                    )}
                                    {!record.detail.subtitle && (
                                      <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container p-4 rounded-lg">
                                        {record.detail.desc}
                                      </p>
                                    )}
                                    
                                    {record.detail.action && (
                                      <div className="p-4 bg-surface-container-low rounded-lg mt-4">
                                        <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">Suggested Action</p>
                                        <p className="text-body-sm font-medium">{record.detail.action}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {record.drugs && (
                                  <div>
                                    <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">
                                      Prescription Details
                                    </h4>
                                    <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                                      <table className="w-full text-left border-collapse">
                                        <thead className="bg-surface-container-low border-b border-outline-variant">
                                          <tr>
                                            <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Drug</th>
                                            <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Dosage</th>
                                            <th className="px-4 py-3 font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">Frequency</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant">
                                          {record.drugs.map((d, i) => (
                                            <tr key={i} className="hover:bg-surface-container-low transition-colors">
                                              <td className="px-4 py-3 font-semibold text-body-sm text-on-surface">{d.name}</td>
                                              <td className="px-4 py-3 text-body-sm text-on-surface-variant">{d.dosage}</td>
                                              <td className="px-4 py-3 text-body-sm text-on-surface-variant">{d.frequency}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <button className="w-full mt-6 lg:w-auto bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]">
                                      Review AI Audit Log
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-body-sm text-on-surface-variant">Showing 1 to 4 of 1,284 entries</span>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary rounded font-data-mono text-data-mono">1</button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors font-data-mono text-data-mono">2</button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors font-data-mono text-data-mono">3</button>
            <span className="px-3 py-1 text-outline">...</span>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors font-data-mono text-data-mono">321</button>
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-outline">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
