/** Stable UTC date formatting for SSR/client parity (prescription date has no time component). */
export function formatPrescribedAt(iso: string): string {
  return formatPrescriptionDateOnly(iso);
}

export function formatPrescriptionDateOnly(iso: string): string {
  const dateOnly = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** YYYY-MM-DD for CSV export — no time component. */
export function toPrescriptionDateIso(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(0, 10);
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}
