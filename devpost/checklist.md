---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [ ] **1. You can add a stock you own and see it in Finlio**
  Becomes usable: A running Finlio with the Link-style shell, the welcome screen, and an Add stock dialog that searches real NSE stocks; saved holdings appear on Today and Holdings and survive a reload.
  Why now: Bootstraps the project and gives the brief something to read. Stock search uses Upstox's public NSE list (no key), so it also proves the first external dependency early.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Adding holdings`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > App shell`, `spec.md > Welcome`, `spec.md > Holdings store (browser)`, `spec.md > Add / edit stock dialog`, `spec.md > Stock search (helper)`, `spec.md > Data Model`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Scaffold Next.js + TypeScript + Tailwind v4 + shadcn/ui with pnpm; add Finlio tokens and Geist fonts; sidebar shell with Today, Holdings, Privacy; localStorage store and context; `/api/instruments` search over the Upstox NSE equity list; Add stock dialog with validation; welcome screen; holdings list with initial badges; `.env.example`.
  Verify (mechanical): `pnpm build` passes; `curl "localhost:3000/api/instruments?q=tcs"` returns Tata Consultancy Services with an `NSE_EQ|` key; in the browser pane, add TCS, reload, and confirm it is still listed.
  Learner check: Run `pnpm dev`, open http://localhost:3000, add a stock you own, reload, and see it still there.
  Commit: `Add app shell, NSE stock search, and saved holdings`

- [ ] **2. Today's brief explains your holdings in plain words, with sources**
  Becomes usable: Pressing Get today's brief on Today produces the three-section brief from today's real news, each line linked to its headline, saved for the day and shown again on reload.
  Why now: This is the unique kernel and the riskiest dependency (Gemini model name, Google Search grounding, citation format). It must work before polish.
  PRD ref: `prd.md > Today's brief`, `prd.md > The Core Journey` (steps 4–5), `prd.md > Privacy`
  Spec ref: `spec.md > Brief generator (helper)`, `spec.md > Brief view`, `spec.md > Gemini`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: `lib/gemini.ts` with the prompt and Google Search tool; zod schema; `/api/brief` taking only names and symbols; brief card with What changed, Coming up, Deserves your attention, source chips, no-news list, explain-not-advise footer, Google search suggestions, generating and error states, Refresh; save the brief with today's IST date.
  Verify (mechanical): `pnpm build` passes; `curl -X POST /api/brief` with two real symbols returns valid JSON whose items each have at least one source URL; the request body logged by the route contains no quantities or prices; the brief renders in the browser pane.
  Learner check: Add two or three stocks you own, press Get today's brief, read it, and open a source link.
  Commit: `Add today's brief with Gemini and Google Search sources`

- [ ] **3. Live prices show what your portfolio is worth now**
  Becomes usable: Each holding shows live price, today's change, value and gain/loss; Today shows the portfolio total, "Updated hh:mm" or "Market closed", and a retry if prices fail.
  Why now: Completes the "where do I stand" half of the journey; depends on the Upstox token, which may need setup time, so it comes after the kernel.
  PRD ref: `prd.md > Portfolio`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Prices (helper + browser)`, `spec.md > Upstox`, `spec.md > Important Failure Modes`
  Build: `lib/upstox.ts`; `/api/quotes`; 60-second polling hook; `lib/portfolio.ts` maths in the browser; `lib/market-hours.ts`; number formatting in ₹ with Geist Mono; count-up animation.
  Verify (mechanical): `pnpm build` passes; `curl -X POST /api/quotes` with TCS's key returns a price and previous close; with the token removed, the route returns an error and the UI shows "Couldn't update prices".
  Learner check: Look at a stock you own and compare its price with your broker app.
  Commit: `Add live NSE prices and portfolio values`

- [ ] **4. You can manage holdings and look closer at one**
  Becomes usable: Edit and delete holdings (with confirmation), merge a duplicate add, and open a holding to see its position, its lines from today's brief and its headlines.
  Why now: Rounds out the core journey (step 6) once prices and the brief exist to show in the detail panel.
  PRD ref: `prd.md > Adding holdings`, `prd.md > Holding detail`
  Spec ref: `spec.md > Holdings store (browser)`, `spec.md > Holding detail sheet`
  Build: Edit and delete actions, duplicate-add prompt, Holdings page table, detail sheet with GSAP slide-in.
  Verify (mechanical): `pnpm build` passes; in the browser pane, edit a quantity and see the value change, delete with confirmation, add a duplicate and choose merge, open the detail sheet and see brief lines and links.
  Learner check: Change the quantity of one holding, then open it and read why it moved.
  Commit: `Add holding edit, delete, and detail panel`

- [ ] **5. Ready for the demo: sample portfolio, privacy, and polish**
  Becomes usable: Try a sample portfolio from the welcome; the Privacy screen explains what's stored and sent and can clear everything; empty, loading and error states are calm; motion and greeting are finished; the README explains how to run Finlio.
  Why now: Makes the demo reliable and the privacy promise visible, after the real behaviour is in place.
  PRD ref: `prd.md > Sample portfolio`, `prd.md > Privacy`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Welcome`, `spec.md > Privacy screen`, `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: `lib/sample.ts` with labelled sample holdings and remove-sample; Privacy page with Clear all my data; greeting by time of day in IST; reduced-motion support; README getting-started section.
  Verify (mechanical): `pnpm build` and `pnpm lint` pass; in the browser pane, clear data → welcome shows → Try a sample portfolio → prices and brief work → Clear all my data empties storage.
  Learner check: Clear your data, start from the welcome, and run the whole demo once as you would on camera.
  Commit: `Add sample portfolio, privacy screen, and demo polish`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2 (the brief, the kernel)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

