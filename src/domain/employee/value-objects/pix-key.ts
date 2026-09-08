export function sanitizePixKey(value: string): string {
  return value.trim();
}

export function normalizePixKey(value: string | null | undefined): string | null {
  const sanitized = sanitizePixKey(value ?? "");
  return sanitized === "" ? null : sanitized;
}
