export function parseDecimalInput(value: unknown): number {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (normalized === "") return 0;
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseIntegerInput(value: unknown): number {
  if (typeof value === "number") return isNaN(value) ? 0 : Math.trunc(value);
  const normalized = String(value ?? "").trim();
  if (normalized === "") return 0;
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function sumBy<T>(items: readonly T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + pick(item), 0);
}
