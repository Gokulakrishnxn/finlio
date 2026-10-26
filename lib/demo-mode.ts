// Demo mode, for screen recordings: open any page with ?demo=1 (and ?demo=0 to
// leave). It hides set-up notices and sample labels, turns company logos off
// (they are other companies' trademarks), and shows nothing that says "demo".
// It never invents prices, news or numbers.
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
    if (q !== null) history.replaceState(null, "", location.pathname + location.hash);
    if (s.getItem("${DEMO_KEY}") === "on") document.documentElement.dataset.demo = "";
  } catch {}
})();`;
