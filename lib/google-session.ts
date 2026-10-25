import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

// Sign in with Google. Signing in asks only for name, email and photo; Expenses
// asks separately for read-only Gmail. Tokens live in an encrypted httpOnly
// cookie in the user's browser; Finlio keeps no database.

export const SESSION_COOKIE = "finlio_google";
// Lets a copy without Google keys (e.g. a judge's clone) still open the app.
export const LOCAL_COOKIE = "finlio_local";
const STATE_COOKIE = "finlio_oauth_state";
const BASIC_SCOPES = ["openid", "email", "profile"];
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export type GoogleSession = {
  gmail?: boolean; // read-only Gmail granted; missing on older sessions, which always had it
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // ms since epoch
  email: string;
  name?: string;
  picture?: string;
};

export class GoogleNotConfiguredError extends Error {}
export class NotSignedInError extends Error {}

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const secret = process.env.AUTH_SECRET;
  if (!clientId || !clientSecret || !secret) {
    throw new GoogleNotConfiguredError("Google sign-in isn't set up yet.");
  }
  return { clientId, clientSecret, key: createHash("sha256").update(secret).digest() };
}

export function isGoogleConfigured() {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}

function encrypt(value: object, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

function decrypt<T>(token: string, key: Buffer): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const data = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    return JSON.parse(data.toString("utf8")) as T;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function redirectUri(origin: string) {
  return `${origin}/api/auth/callback/google`;
}

// Only same-site paths, so the sign-in can't be bounced to another website.
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

type Pending = { state: string; gmail: boolean; next: string };

export async function authorizationUrl(origin: string, { gmail = false, next = "/dashboard" } = {}) {
  const { clientId } = config();
  const pending: Pending = { state: randomBytes(16).toString("base64url"), gmail, next: safeNext(next) };
  (await cookies()).set(STATE_COOKIE, JSON.stringify(pending), { ...cookieOptions, maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: [...BASIC_SCOPES, ...(gmail ? [GMAIL_SCOPE] : [])].join(" "),
    // Gmail needs a refresh token to keep syncing; plain sign-in doesn't.
    ...(gmail ? { access_type: "offline", prompt: "consent" } : { prompt: "select_account" }),
    include_granted_scopes: "true",
    state: pending.state,
  }).toString();
  return url;
}

// The pending sign-in's details, read before Google's answer is checked so a
// failure can still be sent back to the right page.
export async function pendingSignIn(): Promise<Omit<Pending, "state"> | null> {
  try {
    const { gmail, next } = JSON.parse((await cookies()).get(STATE_COOKIE)?.value ?? "") as Pending;
    return { gmail, next: safeNext(next) };
  } catch {
    return null;
  }
}

export async function completeSignIn(origin: string, code: string, state: string) {
  const { clientId, clientSecret, key } = config();
  const store = await cookies();
  let pending: Pending | null = null;
  try {
    pending = JSON.parse(store.get(STATE_COOKIE)?.value ?? "") as Pending;
  } catch {
    pending = null;
  }
  store.delete(STATE_COOKIE);
  if (!pending || pending.state !== state) throw new Error("Sign-in state didn't match.");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const tokens = await res.json();
  if (!res.ok) throw new Error(`Google token exchange failed: ${tokens.error}`);
  const gmail = String(tokens.scope ?? "").includes("gmail.readonly");
  if (pending.gmail && !gmail) throw new Error("Gmail access wasn't granted.");

  const profile = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json());

  // Keep an earlier refresh token when Google doesn't send a new one.
  const previous = decrypt<GoogleSession>(store.get(SESSION_COOKIE)?.value ?? "", key);
  const session: GoogleSession = {
    gmail,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? (previous?.email === profile.email ? previous?.refreshToken : undefined),
    expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  };
  store.set(SESSION_COOKIE, encrypt(session, key), { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
  store.delete(LOCAL_COOKIE);
  return { next: pending.next, gmail: pending.gmail };
}

export async function readSession(): Promise<GoogleSession | null> {
  if (!isGoogleConfigured()) return null;
  const { key } = config();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? decrypt<GoogleSession>(token, key) : null;
}

export const hasGmail = (session: GoogleSession | null) => Boolean(session && session.gmail !== false);

// A session with Gmail access and a usable token, refreshing it if it has expired.
export async function activeSession(): Promise<GoogleSession> {
  const { clientId, clientSecret, key } = config();
  const session = await readSession();
  if (!session) throw new NotSignedInError("Not signed in with Google.");
  if (!hasGmail(session)) throw new NotSignedInError("Gmail isn't connected.");
  if (Date.now() < session.expiresAt) return session;
  if (!session.refreshToken) throw new NotSignedInError("Google session expired.");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: session.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const tokens = await res.json();
  if (!res.ok) throw new NotSignedInError("Google access was revoked.");
  const next = {
    ...session,
    accessToken: tokens.access_token,
    expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
  };
  (await cookies()).set(SESSION_COOKIE, encrypt(next, key), {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
  return next;
}

async function revoke(session: GoogleSession) {
  const token = session.refreshToken ?? session.accessToken;
  if (!token) return;
  // Revoking removes Finlio's access in the Google account too.
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => undefined);
}

// Stops Gmail reading but keeps the person signed in.
export async function disconnectGmail() {
  const { key } = config();
  const session = await readSession();
  if (!session) return;
  await revoke(session);
  const next: GoogleSession = { ...session, gmail: false, accessToken: "", refreshToken: undefined, expiresAt: 0 };
  (await cookies()).set(SESSION_COOKIE, encrypt(next, key), { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
}

// Local mode, only when this copy has no Google keys.
export async function startLocalSession() {
  if (isGoogleConfigured()) return false;
  (await cookies()).set(LOCAL_COOKIE, "1", { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
  return true;
}

export async function hasLocalSession() {
  return !isGoogleConfigured() && (await cookies()).get(LOCAL_COOKIE)?.value === "1";
}

export async function signOut() {
  const session = await readSession();
  if (session) await revoke(session);
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(LOCAL_COOKIE);
}
