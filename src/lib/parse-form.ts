export function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

export function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  return raw || null;
}

export function combineHeight(
  feetValue: FormDataEntryValue | null,
  inchesValue: FormDataEntryValue | null,
): number | null {
  const feet = parseOptionalFloat(feetValue);
  const inches = parseOptionalFloat(inchesValue);
  if (feet === null && inches === null) return null;
  return (feet ?? 0) * 12 + (inches ?? 0);
}
