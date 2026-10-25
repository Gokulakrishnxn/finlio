export const THEME_KEY = "finlio:theme";
export const THEME_EVENT = "finlio:theme-change";
export type Theme = "light" | "dark" | "system";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

// Runs in the document head before paint. Only static, app-owned strings are
// interpolated; localStorage is read at runtime, never inserted into the script.
export const themeScript = `(() => {
  let preference = "system";
  try {
    const saved = localStorage.getItem("${THEME_KEY}");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {}
  const dark = preference === "dark" ||
    (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.themePreference = preference;
})();`;
