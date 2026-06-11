/** Stable UTC formatting for SSR/client parity (avoids locale/timezone hydration mismatches). */
export function formatPrescribedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}
