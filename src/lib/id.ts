/** Stable client-side IDs for draft medications before server persistence. */
export function createMedicationId(): number {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    const hex = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    return Number.parseInt(hex, 16);
  }
  return Date.now() + Math.floor(Math.random() * 1000);
}
