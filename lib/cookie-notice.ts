// This is an acknowledgement of a storage notice, not consent to tracking.
export const COOKIE_NOTICE_KEY = "finlio:cookie-notice";
export const COOKIE_NOTICE_VERSION = 1;
export const COOKIE_NOTICE_OPEN = "finlio:cookie-notice-open";
const COOKIE_NOTICE_CHANGED = "finlio:cookie-notice-change";

let acknowledgedInMemory = false;

export function hasAcknowledgedCookieNotice(): boolean {
  if (acknowledgedInMemory) return true;
  try {
    const raw = window.localStorage.getItem(COOKIE_NOTICE_KEY);
    if (!raw) return false;
    const saved: unknown = JSON.parse(raw);
    return typeof saved === "object" && saved !== null &&
      "version" in saved && saved.version === COOKIE_NOTICE_VERSION &&
      "acknowledgedAt" in saved && typeof saved.acknowledgedAt === "string";
  } catch {
    return false;
  }
}

export function acknowledgeCookieNotice() {
  const value = JSON.stringify({
    version: COOKIE_NOTICE_VERSION,
    acknowledgedAt: new Date().toISOString(),
  });
  try {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, value);
  } catch {
    // Keep the notice dismissed for this page session if storage is blocked.
    acknowledgedInMemory = true;
  }
  window.dispatchEvent(new Event(COOKIE_NOTICE_CHANGED));
}

export function subscribeCookieNotice(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== COOKIE_NOTICE_KEY && event.key !== null) return;
    acknowledgedInMemory = false;
    onChange();
  };
  window.addEventListener(COOKIE_NOTICE_CHANGED, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(COOKIE_NOTICE_CHANGED, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Leave the notice out of server HTML; read this browser's choice on hydration.
export function serverCookieNoticeSnapshot() {
  return true;
}
