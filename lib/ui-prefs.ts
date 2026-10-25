// Per-browser interface preferences shared by the sidebar and Settings.
export const COLLAPSE_KEY = "finlio:sidebar";
export const SIDEBAR_EVENT = "finlio:sidebar-change";

// Company logos are on by default; turn them off before recording a public demo
// (they are other companies' trademarks).
export const LOGOS_KEY = "finlio:logos";
export const LOGOS_EVENT = "finlio:logos-change";

export function logosOn() {
  try {
    return window.localStorage.getItem(LOGOS_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setLogosOn(on: boolean) {
  try {
    window.localStorage.setItem(LOGOS_KEY, on ? "on" : "off");
  } catch {
    // Blocked storage: the choice lasts until reload.
  }
  window.dispatchEvent(new Event(LOGOS_EVENT));
}
