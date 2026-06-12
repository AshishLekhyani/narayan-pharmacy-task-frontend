import type { PortalDropdownOption } from "../components/PortalDropdown";

export const FREQUENCY_PRESETS = [
  "OD (Once Daily)",
  "BD (Twice Daily)",
  "TDS (Three times Daily)",
  "QID (Four times Daily)",
  "SOS (As Needed)",
  "Custom...",
] as const;

export type FrequencyPreset = (typeof FREQUENCY_PRESETS)[number];

export const FREQUENCY_DROPDOWN_OPTIONS: PortalDropdownOption<FrequencyPreset>[] =
  FREQUENCY_PRESETS.map((preset) => ({ value: preset, label: preset }));
