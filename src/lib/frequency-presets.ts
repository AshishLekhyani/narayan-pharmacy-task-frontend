import type { PortalDropdownOption } from "../components/PortalDropdown";

export const FREQUENCY_PRESETS = [
  "Once daily (QD)",
  "Twice daily (BID)",
  "Three times daily (TID)",
  "Four times daily (QID)",
  "As needed (PRN)",
  "At bedtime (QHS)",
  "Custom...",
] as const;

export type FrequencyPreset = (typeof FREQUENCY_PRESETS)[number];

/** Maps legacy India-style SIG labels stored in older drafts/history to US presets. */
export const LEGACY_FREQUENCY_ALIASES: Record<string, FrequencyPreset> = {
  "OD (Once Daily)": "Once daily (QD)",
  "BD (Twice Daily)": "Twice daily (BID)",
  "TDS (Three times Daily)": "Three times daily (TID)",
  "QID (Four times Daily)": "Four times daily (QID)",
  "SOS (As Needed)": "As needed (PRN)",
};

export function resolveFrequencyPreset(value: string): FrequencyPreset {
  if ((FREQUENCY_PRESETS as readonly string[]).includes(value)) {
    return value as FrequencyPreset;
  }
  return LEGACY_FREQUENCY_ALIASES[value] ?? "Custom...";
}

export const FREQUENCY_DROPDOWN_OPTIONS: PortalDropdownOption<FrequencyPreset>[] =
  FREQUENCY_PRESETS.map((preset) => ({ value: preset, label: preset }));
