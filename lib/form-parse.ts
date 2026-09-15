export function optionalText(value: FormDataEntryValue | null, max?: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return max ? trimmed.slice(0, max) : trimmed;
}

export function optionalNumber(value: FormDataEntryValue | null) {
  if (value == null || String(value).trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function optionalInt(value: FormDataEntryValue | null) {
  const parsed = optionalNumber(value);
  if (parsed === null) return null;
  return Number.isInteger(parsed) ? parsed : null;
}
