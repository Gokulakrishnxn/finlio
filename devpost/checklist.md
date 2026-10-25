---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can add a stock you own and see it in Finlio**
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

- [x] **4. You can manage holdings and look closer at one**
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

- [ ] **6. Sign in with Google and see where your money went**
  Becomes usable: Expenses screen with Continue with Google; after sign-in, Sync reads bank and UPI alerts from Gmail and shows spent this month, categories and recent transactions, saved in the browser; Disconnect revokes access.
  Why now: Added by the learner after scope approval; built after the core screens so it can't break them.
  PRD ref: `prd.md > Expenses`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Google sign-in (helper)`, `spec.md > Expense sync (helper)`, `spec.md > Expenses view`, `spec.md > Google`, `spec.md > Data Model`
  Build: Hand-written Google OAuth routes with an encrypted httpOnly session cookie; Gmail search + metadata fetch; Gemini JSON extraction validated by zod; Expenses page; store field for expenses; Clear all also clears expenses.
  Verify (mechanical): `pnpm build` and `pnpm lint` pass; `/api/auth/session` reports signed out; without Google keys, Continue with Google shows a clear "not set up" message; with keys, sign in as a test user, Sync, and confirm amounts match a few real alert emails.
  Learner check: Sign in with your Gmail, press Sync, and check three transactions against your bank alerts.
  Commit: `Add Expenses with Google sign-in and Gmail alerts`

- [ ] **7. Your whole money picture on one dashboard**
  Becomes usable: Sidebar shell; dashboard with net worth and history, this month in/out/saved, quick add, recent activity and the brief; Assets page; manual income and expenses; Zerodha CSV import; Insights with allocation and a Gemini summary.
  Why now: Added by the learner after approval; built on the finished core so the brief stays intact.
  PRD ref: `prd.md > Dashboard`, `prd.md > Assets and loans`, `prd.md > Manual income and expenses`, `prd.md > Zerodha CSV import`, `prd.md > Analytics`
  Spec ref: `spec.md > Dashboard, assets, entries, import, analytics`, `spec.md > Data Model`
  Build: Store fields and net-worth maths; sidebar redesign; dashboard; assets page; entry dialog; CSV import; analytics route and page.
  Verify (mechanical): `pnpm build` and `pnpm lint` pass; in the browser add an asset, a loan, income and an expense and check net worth and this month; import a sample Zerodha CSV; Analytics shows allocation and a Gemini summary.
  Learner check: Add your real bank balance and one loan, and see whether the net worth looks right.
  Commit: several commits, one per feature

- [x] **8. Finlio for India and the United States, with a welcome setup**
  Becomes usable: First-visit setup (name, country, Terms, sample or fresh, tour); every amount, quarter, account type, stock market and AI prompt follows the country; US stocks via Finnhub or a built-in list; plain-English Terms page; six-step tour; all screens fit phones, tablets and desktops.
  Why now: Learner's request after approval (US and India are the target markets).
  PRD ref: `prd.md > Welcome and setup`, `prd.md > Country`, `prd.md > Screen tour`, `prd.md > Terms & Conditions`, `prd.md > Responsive`
  Spec ref: `spec.md > Country, setup, tour and terms`
  Build: Locale module and helpers; US data; onboarding, tour and terms components; responsive fixes.
  Verify (mechanical): `pnpm lint`, `npx tsc --noEmit`, `pnpm build` pass; quarter and money formats checked for both countries; in the browser, setup completed as a US user (Terms checkbox required, US sample loaded, tour started); every screen measured with no horizontal overflow at 375, 768 and 1280px.
  Learner check: Clear all data, go through setup as India and as the United States, and take the tour on your phone.
  Commit: several commits, one per feature

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

- Completed neutral charcoal/black dark appearance throughout the app (no green surface tint, per the learner’s preference): added persistent Light / Dark / System selection in Settings, shared semantic colours for surfaces, charts, status text and overlays, visible keyboard focus, and a two-row mobile header so navigation and Settings fit at 375px. No financial data flow changed.
- Slice 2's brief arrives as one response and is revealed section by section with GSAP, instead of streaming from the server — same experience, simpler helper.
- Slice 2 real-news verification is blocked: the learner's Gemini key works for plain generation (`gemini-3.5-flash`), but Google Search grounding returns 429 "exceeded your current quota" on every model, which points to a project without billing. Code is committed unticked; the learner chose to continue designing the remaining screens (slices 3–5) while they enable billing. Re-verify slice 2 as soon as Search grounding works.
- Default model changed from `gemini-3.8-flash` to `gemini-3.5-flash` (overridable with `GEMINI_MODEL`) — 3.8 timed out on a plain call in testing while 3.5 answered.
- Slices 3 and 5 built and verified except live prices: no `UPSTOX_ANALYTICS_TOKEN` yet, so only the "Prices aren't set up yet" + Retry path was observed. Sample portfolio, Privacy screen, Clear all, edit, merge (45 ITC at ₹497.78 average, earlier date kept) and delete were verified in the browser. Tick 3 and 5 once real Upstox prices show.
- Layout tightened for narrower windows (220px sidebar below xl, smaller value columns) after the browser check showed horizontal overflow at ~780px.
- Slice 6 (Expenses with Google sign-in and Gmail reading) added at the learner's request after scope approval; scope, PRD and spec updated to match, accepting Google test mode and deadline risk.
- Slice 7 (whole-money dashboard inspired by FinBoom's features, in Finlio's own design) added at the learner's request after approval.
- Slice 7 built and verified in the browser with test data: dashboard (net worth with history line, this month in/out/saved, quick add, recent activity, wealth bar), Assets & loans, manual income/expenses beside Gmail, Zerodha CSV import, Insights (allocation and spending donuts, money-flow Sankey, live Gemini "Explain my money"), redesigned Privacy, and a Cursor-style Finlio chat panel (⌘L) streaming live Gemini answers from totals only. Live prices still unverified (no Upstox token).
- UI libraries: beUI (MIT) used for charts, animated numbers, tabs and the chat kit; cuelume (MIT) for interface sounds with an on/off switch. Rare UI skipped (MIT + Commons Clause is not open source); ObsidianUI skipped (licence not stated); Arc UI charts are paid. Vendored beUI files are excluded from lint and credited in THIRD_PARTY_NOTICES.md.
- Layout changed to rounded cards on a sand background with a collapsible sidebar, at the learner's request; the "Finish setting up" card was removed at the learner's request.
- Dates are read only after browser data loads, because Next.js 16 refuses `new Date()` during prerendering.
- Company logos added at the learner's request (reverses the earlier no-logos decision for the app): Finlio's helper fetches them from icon.horse (free plan, 1,000 icons a month) or Google's favicon service, keeps the sharper one, refuses anything under 32px and all SVGs, and serves only allow-listed brand domains. A Settings switch turns logos off; it must be off when recording the demo video, because the rules forbid third-party trademarks in it. Category and asset icons replace the generic arrows.
- Slice 8 (India + United States, welcome setup, tour, Terms, responsive) added at the learner's request after approval. Found and fixed during the build: Settings crashed when opened because the Settings window sat outside the tour provider; profile saves now merge instead of replacing (they would have erased country and setup status); the closed chat panel, parked off-screen, made phones zoom out; grid columns didn't shrink on phones (fixed with Tailwind's `*:min-w-0`, since a global CSS rule was dropped by the Tailwind build).
- The pending dark-mode redesign left uncommitted by another agent was verified (lint, types, build) and committed in two commits before this work.
- "Insights" renamed to "Analytics" at the learner's request: the page moved to `/analytics` (and its API to `/api/analytics`); `/insights` permanently redirects there.
- At the learner's request: today's brief moved to a new News page in the sidebar; the Privacy page became Settings → Privacy (`/privacy` redirects to the Terms list); a Sign out action (confirm, optional backup, disconnect Google, erase this browser's data) replaced Clear all; Analytics donuts and money flow group categories under 5% into Other, sit above their legends, and fit their cards (the money-flow chart was wider than its card).
