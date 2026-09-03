import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "coach_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 90; // 90 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

/**
 * Whether the required auth env vars are present. The login page checks
 * these up front so a missing setting shows a plain on-page message
 * instead of an opaque server error.
 */
export function isCoachPasswordConfigured(): boolean {
  return !!process.env.COACH_PASSWORD;
}

export function isAuthSecretConfigured(): boolean {
  return !!process.env.AUTH_SECRET;
}

function sign(payload: string): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Creates a signed, expiring session token to store in a cookie. */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_DURATION_MS;
  const signature = sign(`coach.${expires}`);
  if (!signature) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return `${expires}.${signature}`;
}

/**
 * Verifies a session token's signature and expiry. Runs on every request
 * (via proxy.ts), so it must never throw — a missing AUTH_SECRET is
 * treated the same as "not logged in" rather than crashing every page.
 */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = sign(`coach.${expires}`);
  if (!expected) return false;
  return timingSafeStringsEqual(signature, expected);
}

/** Compares a submitted password against COACH_PASSWORD in constant time. */
export function isCorrectPassword(candidate: string): boolean {
  const expected = process.env.COACH_PASSWORD;
  if (!expected) return false;
  return timingSafeStringsEqual(candidate, expected);
}
