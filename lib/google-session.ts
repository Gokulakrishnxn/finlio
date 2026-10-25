import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

// Google sign-in for Expenses. Tokens live in an encrypted httpOnly cookie in the
// user's browser; Finlio keeps no database.

const SESSION_COOKIE = "finlio_google";
const STATE_COOKIE = "finlio_oauth_state";
const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export type GoogleSession = {
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

export async function authorizationUrl(origin: string) {
  const { clientId } = config();
  const state = randomBytes(16).toString("base64url");
  (await cookies()).set(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  return url;
}

export async function completeSignIn(origin: string, code: string, state: string) {
  const { clientId, clientSecret, key } = config();
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);
  if (!expected || expected !== state) throw new Error("Sign-in state didn't match.");

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
  if (!String(tokens.scope ?? "").includes("gmail.readonly")) {
    throw new Error("Gmail access wasn't granted.");
  }

  const profile = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json());

  const session: GoogleSession = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in - 60) * 1000,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  };
  store.set(SESSION_COOKIE, encrypt(session, key), { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
}

export async function readSession(): Promise<GoogleSession | null> {
  if (!isGoogleConfigured()) return null;
  const { key } = config();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? decrypt<GoogleSession>(token, key) : null;
}

// A session with a usable access token, refreshing it if it has expired.
export async function activeSession(): Promise<GoogleSession> {
  const { clientId, clientSecret, key } = config();
  const session = await readSession();
  if (!session) throw new NotSignedInError("Not signed in with Google.");
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

export async function signOut() {
  const session = await readSession();
  const token = session?.refreshToken ?? session?.accessToken;
  if (token) {
    // Revoking the refresh token removes Finlio's access in the Google account too.
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    }).catch(() => undefined);
  }
  (await cookies()).delete(SESSION_COOKIE);
}
