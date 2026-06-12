/** Client-side clinical input checks — mirrors Backend `clinical-input.ts`. */

const JUNK_VALUES = new Set([
  "test",
  "asdf",
  "aaa",
  "xxx",
  "xyz",
  "abc",
  "qwerty",
  "dummy",
  "sample",
  "patient",
  "name",
  "drug",
  "medication",
  "na",
  "n/a",
  "none",
  "null",
  "undefined",
]);

const PATIENT_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u;
const DRUG_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}0-9\s./+-]*$/u;
const DOSAGE_PATTERN =
  /^(\d+(\.\d+)?)\s*(mg|g|ml|mcg|µg|iu|unit|units|%|tablet|tablets|tab|tabs|cap|caps|drop|drops|puff|puffs|mcg|ug)$/i;

function isJunkValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (JUNK_VALUES.has(normalized)) return true;
  if (/^(.)\1{3,}$/.test(normalized)) return true;
  if (/^\d+$/.test(normalized)) return true;
  return false;
}

function hasMinimumLetters(value: string, min = 2): boolean {
  const letters = value.match(/\p{L}/gu);
  return (letters?.length ?? 0) >= min;
}

export function validatePatientName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Patient name must be at least 2 characters.";
  if (trimmed.length > 200) return "Patient name is too long.";
  if (!PATIENT_NAME_PATTERN.test(trimmed)) {
    return "Patient name may only contain letters, spaces, hyphens, apostrophes, and periods.";
  }
  if (!hasMinimumLetters(trimmed, 2)) {
    return "Patient name must include at least 2 letters.";
  }
  if (isJunkValue(trimmed)) return "Please enter a valid patient name.";
  return null;
}

export function validateDrugName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Drug name must be at least 2 characters.";
  if (trimmed.length > 200) return "Drug name is too long.";
  if (!DRUG_NAME_PATTERN.test(trimmed)) {
    return "Drug name must start with a letter and contain only letters, numbers, spaces, or common symbols.";
  }
  if (!hasMinimumLetters(trimmed, 2)) {
    return "Drug name must include at least 2 letters.";
  }
  if (isJunkValue(trimmed)) return "Please enter a real medication name.";
  return null;
}

export function validateDosage(dosage: string): string | null {
  const trimmed = dosage.trim();
  if (trimmed.length < 2) return "Dosage is required.";
  if (trimmed.length > 100) return "Dosage is too long.";
  if (!DOSAGE_PATTERN.test(trimmed)) {
    return "Dosage must look like a clinical dose (e.g. 10mg, 5 ml, 500mg, 1 tablet).";
  }
  if (isJunkValue(trimmed)) return "Please enter a valid dosage.";
  return null;
}

export function validateFrequency(frequency: string): string | null {
  const trimmed = frequency.trim();
  if (trimmed.length < 2) return "Frequency is required.";
  if (trimmed.length > 100) return "Frequency is too long.";
  if (!/\p{L}/u.test(trimmed)) return "Frequency must include letters.";
  if (isJunkValue(trimmed)) return "Please enter a valid frequency.";
  return null;
}

export function validateMedicationEntry(entry: {
  name: string;
  dosage: string;
  frequency: string;
}): string | null {
  return (
    validateDrugName(entry.name) ??
    validateDosage(entry.dosage) ??
    validateFrequency(entry.frequency)
  );
}

export function validatePrescriptionDate(date: string): string | null {
  if (!date.trim()) return "Prescription date is required.";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Invalid prescription date.";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsed > today) return "Prescription date cannot be in the future.";
  if (parsed.getFullYear() < 1900) return "Prescription date is too far in the past.";
  return null;
}
