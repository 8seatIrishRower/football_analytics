import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "coach_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 90; // 90 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
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
  const payload = `coach.${expires}`;
  return `${expires}.${sign(payload)}`;
}

/** Verifies a session token's signature and expiry. */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = sign(`coach.${expires}`);
  return timingSafeStringsEqual(signature, expected);
}

/** Compares a submitted password against COACH_PASSWORD in constant time. */
export function isCorrectPassword(candidate: string): boolean {
  const expected = process.env.COACH_PASSWORD;
  if (!expected) {
    throw new Error("COACH_PASSWORD environment variable is not set");
  }
  return timingSafeStringsEqual(candidate, expected);
}
