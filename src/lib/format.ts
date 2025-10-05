export function fmtNumber(value?: number | null, digits = 2): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
