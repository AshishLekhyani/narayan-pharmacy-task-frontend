export type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
};

export type AnalysisResult = {
  severity: string;
  severityLevel: string;
  primaryWarning: string;
  recommendation: string;
  clinicalImpact: string[];
  processedBy: string;
  cachedResult?: boolean;
  localResult?: boolean;
};
