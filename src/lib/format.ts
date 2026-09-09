import type { TestValueType } from "@prisma/client";

/** Rounds a distance value (in inches) to the nearest quarter inch. */
export function roundToQuarterInch(inches: number): number {
  return Math.round(inches * 4) / 4;
}

/** Combines feet + inches into a single total-inches value, rounded to the
 * nearest quarter inch (matches how distance results are entered/stored). */
export function feetInchesToTotalInches(feet: number, inches: number): number {
  return roundToQuarterInch(feet * 12 + inches);
}

/** "MM:SS.SS" for a value in seconds, e.g. 3.85 -> "00:03.85". */
export function formatTime(seconds: number): string {
  // Round to the nearest hundredth first so e.g. 3.995 becomes 4.00 instead
  // of letting the hundredths digit overflow to 100.
  const rounded = Math.round(seconds * 100) / 100;
  const totalHundredths = Math.round(rounded * 100);
  const minutes = Math.floor(totalHundredths / 6000);
  const secs = Math.floor((totalHundredths % 6000) / 100);
  const hundredths = totalHundredths % 100;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

/** `X'YY"` for a height in total inches, e.g. 50 -> `4'2"`. */
export function formatHeight(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return `${feet}'${inches}"`;
}

/** `X'YY.ZZ"` for a value in total inches, e.g. 82.5 -> `6'10.50"`. */
export function formatDistance(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches - feet * 12;
  return `${feet}'${inches.toFixed(2)}"`;
}

/** Formats a stored test result value for display based on the test's type. */
export function formatTestValue(value: number, valueType: TestValueType): string {
  return valueType === "DISTANCE" ? formatDistance(value) : formatTime(value);
}

/** Age in years to two decimal places, using a 365.25-day year. */
export function calculateAge(dateOfBirth: Date, asOf: Date = new Date()): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const age = (asOf.getTime() - dateOfBirth.getTime()) / msPerYear;
  return Math.round(age * 100) / 100;
}

export const PAD_LEVEL_LABELS: Record<string, string> = {
  FULL_PADS_HELMET: "Full pads with helmet",
  FULL_PADS_NO_HELMET: "Full pads, no helmet",
  NO_PADS_NO_HELMET: "No helmet or pads",
};
