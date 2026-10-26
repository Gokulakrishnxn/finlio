// Demo mode, for screen recordings: open any page with ?demo=1 (and ?demo=0 to
// leave). It hides set-up notices and sample labels, turns company logos off
// (they are other companies' trademarks), and shows nothing that says "demo".
// It also skips Google sign-in, so a recording starts in the app.
// Only the sample stocks get demo prices (lib/demo-data.ts).
export const DEMO_KEY = "finlio:demo";

// Runs before the page paints, so hidden notices never flash on screen.
export const demoScript = `(() => {
  try {
    const q = new URLSearchParams(location.search).get("demo");
    const s = localStorage;
    if (q === "1" && s.getItem("${DEMO_KEY}") !== "on") {
      s.setItem("${DEMO_KEY}:logos", s.getItem("finlio:logos") || "on");
      s.setItem("finlio:logos", "off");
      s.setItem("${DEMO_KEY}", "on");
    } else if (q === "0" && s.getItem("${DEMO_KEY}") === "on") {
      s.setItem("finlio:logos", s.getItem("${DEMO_KEY}:logos") || "on");
      s.removeItem("${DEMO_KEY}");
      s.removeItem("${DEMO_KEY}:logos");
    }
    const on = s.getItem("${DEMO_KEY}") === "on";
    // A cookie lets the server-side redirect (proxy.ts) skip sign-in too.
    document.cookie = on ? "finlio_demo=1; path=/; max-age=2592000; samesite=lax" : "finlio_demo=; path=/; max-age=0";
    if (on && (location.pathname === "/sign-in" || location.pathname === "/sign-up")) {
      const next = new URLSearchParams(location.search).get("next");
      location.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      return;
    }
    if (q !== null) history.replaceState(null, "", location.pathname + location.hash);
    if (on) document.documentElement.dataset.demo = "";
  } catch {}
})();`;
