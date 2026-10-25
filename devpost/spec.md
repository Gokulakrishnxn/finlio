---
doc: spec
status: approved
---

# Finlio Daily — Technical Spec

Implements `prd.md` (approved). Items marked (agreed) were Claude's recommendations, accepted by the learner.

## How This Works, In Plain Language
Finlio Daily is a website that runs on your computer. It has two halves:

- **The screen** (in your browser) shows your holdings and your brief. You sign in with Google, but your holdings are saved in the browser itself, so there is no Finlio database.
- **A small helper** (the Next.js server, also on your computer) holds the secret keys and talks to two outside services for you:
  - **Upstox** for live NSE prices. Upstox is an Indian broker with an official API, so we're allowed to use its data.
  - **Gemini** for the brief. Gemini searches Google for today's news about your stocks, writes the plain-English brief, and returns the link to every headline it used.

The helper only ever sends **stock names and symbols** out. Your quantities, prices and values stay in the browser, and the maths for your gain or loss happens there too.

Why this shape: no database, no login, no cloud to secure. It's the smallest system that proves the kernel with real data and keeps the privacy promise true.

### Expenses, in plain language
Expenses adds Google sign-in. When you press **Continue with Google**, Google asks whether Finlio may *read* your email. If you agree, Google gives the helper a key, which the helper keeps in an encrypted cookie in your browser (still no Finlio database). On **Sync**, the helper searches your Gmail for bank and UPI alerts from the last 60 days, sends only those alerts' sender, subject, date and preview text to Gemini to pull out amount, merchant and category, and returns the list. The browser saves it. Nothing else in your inbox is read.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Open Finlio** → the browser checks its storage → nothing there → Welcome screen.
2. **Search "TCS"** → the helper searches Upstox's list of NSE stocks (downloaded once and kept in memory) → matching names and symbols appear.
3. **Save TCS** with buy date, price and quantity → saved in browser storage.
4. **Today screen loads** → the browser asks the helper for prices of the saved symbols → the helper asks Upstox → live price and previous close come back → the browser calculates value, today's change and gain/loss. This repeats every 60 seconds.
5. **Get today's brief** → the browser sends only the stock names and symbols to the helper → the helper asks Gemini (with Google Search switched on) for today's news and a three-section brief → Gemini returns the text and its source links → the helper streams it back section by section → the browser shows it and saves it with today's date.
6. **Open TCS** → the detail panel reads the saved brief and prices; no new request.
7. **Come back tomorrow** → the saved brief is from yesterday → the screen offers **Get today's brief**.

## Stack
- **Next.js 16 (App Router) + TypeScript** — learner's choice. One project for both the screen and the helper. https://nextjs.org/docs
- **Tailwind CSS v4** — learner's choice. https://tailwindcss.com/docs
- **shadcn/ui** (dialog, sheet, input, button, card, calendar) — learner's choice. https://ui.shadcn.com/docs
- **GSAP** (with `@gsap/react`) for motion — learner's choice. https://gsap.com/docs/v3/
- **lucide-react** for interface icons — learner's choice. https://lucide.dev/guide/packages/lucide-react
- **Geist + Geist Mono** via `next/font` — the finlio.app brand. https://vercel.com/font
- **@google/genai** (Gemini SDK) with Google Search grounding — learner chose Gemini; grounding is (agreed) as the news source. https://ai.google.dev/gemini-api/docs/google-search
- **Upstox API** for prices and the NSE stock list — (agreed). https://upstox.com/developer/api-documentation/
- **zod** to check the AI's structured output before showing it. https://zod.dev
- **pnpm** as package manager.
- Other UI references (rareui, transitions.dev, beautifului, obsidianui, uiarc, beui): borrow patterns only where the license allows copying into an MIT repo; check each before use. Charts are not in the PoC.

Unverified, check in the first build step: the exact Gemini model name (docs currently show `gemini-3.8-flash`), the citation format in the response, and Upstox analytics-token access to the quote endpoint.

- **Google OAuth 2.0 + Gmail API (REST)** for Expenses — learner's choice; hand-written OAuth (no auth library) to avoid version risk with Next.js 16. https://developers.google.com/identity/protocols/oauth2/web-server · https://developers.google.com/gmail/api/reference/rest

## Where It Runs and How Someone Tries It
- Runs locally: Node 20+ and pnpm.
- US prices and search need `FINNHUB_API_KEY` (free at finnhub.io); without it, US stocks are searchable from a built-in list and valued at cost.
- Needs two keys in `.env.local` (template in `.env.example`; never committed):
  - `GEMINI_API_KEY` — from Google AI Studio.
  - `UPSTOX_ANALYTICS_TOKEN` — from the Upstox developer console (needs an Upstox account).
- Start: `pnpm install`, then `pnpm dev`, then open http://localhost:3000.
- Demo recording: Chrome at desktop size, starting from a cleared Finlio (Privacy → Clear all my data) so the welcome shows.
- Deployment: optional, not planned. If wanted later: Vercel with the same two keys as environment variables.

## Look and Feel
From `prd.md > Look and Feel`:
- **Tokens** (in `app/globals.css` via Tailwind `@theme`): cream `#fbfaf9` page, sand `#f6f4ef` sidebar, line `#ecebe7` borders, ink `#343433` text, body `#474645` secondary text, green `#34c759` gains and brand, red `#ef4444` losses.
- **Themes:** semantic CSS variables supply light and `.dark` palettes, including chart, status, focus, input and overlay colours. Dark uses `#111111` canvas, `#181818` content and `#222222` cards. Text gains/losses use contrast-adjusted colours in both themes. Settings → General saves Light, Dark or System in `finlio:theme`; System is the default. A static inline head script resolves the preference before paint, with hydration suppression only on `<html>`. `ThemeRoot` listens for device appearance and cross-tab storage changes; storage failures keep the selection usable for the current page session. Native inputs use the corresponding CSS `color-scheme`.
- **Type:** Geist for text; Geist Mono with tabular figures for every number. Large greeting (about 40px, semibold); section labels small and muted.
- **Layout:** fixed 280px sidebar; content centred, max width about 1100px; cards with 24px corners, 1px line border, very soft shadow, 28px padding. Generous whitespace.
- **Signature:** the brief card from finlio.app (jargon headline → plain sentence), rebuilt as new code.
- **Motion (GSAP):** sections of the brief fade and rise in sequence (about 0.4s each); numbers count up on first load; the detail sheet slides in. Respect `prefers-reduced-motion`.
- **Copy tone:** short, plain, calm. No exclamation marks, no jargon.
- **Avoid:** gradients, glowing AI effects, company or broker logos. Holdings use a coloured initial badge (colour chosen from the symbol).
- Data credit in the footer: "Prices from Upstox. News via Google Search." Gemini's search suggestions are shown under the brief as Google's terms require.

## Components

### App shell
Sidebar (Today, Holdings, Privacy), footer note "Your data stays in this browser", content area.
PRD ref: `prd.md > Screens and Layout`.

### Welcome
Shown when there are no holdings: **Add your first stock**, **Try a sample portfolio**.
PRD ref: `prd.md > States and Boundaries`, `prd.md > Sample portfolio`.

### Holdings store (browser)
Reads and writes holdings and the latest brief in `localStorage`; one React context so every screen sees the same data. Handles add, edit, delete, merge-on-duplicate, clear-all, add/remove sample.
PRD ref: `prd.md > Adding holdings`, `prd.md > Privacy`, `prd.md > Sample portfolio`.

### Add / edit stock dialog
Search box (calls Stock search), then buy date, buy price, quantity with validation.
PRD ref: `prd.md > Adding holdings`.

### Stock search (helper)
`GET /api/instruments?q=` — downloads Upstox's public NSE instrument list once, keeps equity rows (name, trading symbol, instrument key) in memory, returns the top 8 matches.
PRD ref: `prd.md > Adding holdings`.

### Prices (helper + browser)
`POST /api/quotes` with instrument keys → Upstox market quote → last price, previous close, timestamp. The browser polls every 60 seconds, computes value, day change and gain/loss, and shows "Updated hh:mm" or "Market closed" (NSE hours 9:15–15:30 IST, weekdays).
PRD ref: `prd.md > Portfolio`.

### Brief generator (helper)
`POST /api/brief` with `[{ name, symbol }]` only. Calls Gemini with Google Search on, asking for JSON: `changed[]`, `comingUp[]`, `attention[]` (max 2), each item with `symbol`, `text`, `sourceIds`; plus `noNews[]`. Instructions: plain words, cite every fact, never invent a reason, never say buy/sell/hold. Validates with zod and attaches the citation URLs and titles from the response. Streams one section at a time.
PRD ref: `prd.md > Today's brief`.

### Brief view
Three sections, source chips (publisher and time) under each line, "Finlio explains. It doesn't advise." footer, Refresh, generating and error states, GSAP reveal.
PRD ref: `prd.md > Today's brief`, `prd.md > States and Boundaries`.

### Holding detail sheet
Price, position, gain/loss, this stock's lines from today's brief, its headlines.
PRD ref: `prd.md > Holding detail`.

### Privacy screen
Plain list of what's stored and what's sent; **Clear all my data** with confirmation.
PRD ref: `prd.md > Privacy`.

### Google sign-in (helper)
`GET /api/auth/google` redirects to Google with scopes `openid email profile https://www.googleapis.com/auth/gmail.readonly`, `access_type=offline`, and a random `state` cookie. `GET /api/auth/callback/google` checks `state`, exchanges the code, and stores `{ accessToken, refreshToken, expiresAt, email, name, picture }` AES-256-GCM-encrypted (key from `AUTH_SECRET`) in an httpOnly cookie. `GET /api/auth/session` returns who is signed in; `POST /api/auth/signout` revokes the token and clears the cookie. Access tokens are refreshed when expired.
PRD ref: `prd.md > Expenses`.

### Expense sync (helper)
`POST /api/expenses/sync`: Gmail search `newer_than:60d (debited OR spent OR "paid to" OR UPI OR "debit card" OR txn) -category:promotions`, up to 60 messages, fetched as metadata (From, Subject, Date) plus snippet. Gemini (`gemini-3.5-flash`, JSON output, no search tool) extracts `{ id, date, amount, merchant, category, kind: "spend" | "ignore" }`; zod validates; spends are returned.
PRD ref: `prd.md > Expenses`.

### Expenses view
Sign-in card, Sync, spent this month vs last month, category bars, recent transactions, Disconnect.
PRD ref: `prd.md > Expenses`.

### Dashboard, assets, entries, import, analytics
- **Store** gains `assets: Asset[]`, `entries: Entry[]` (manual income/expense) and `snapshots: { date, netWorth }[]` (one per IST day, last 365).
- **Net worth** is computed in the browser (`lib/networth.ts`); a snapshot is written when the dashboard loads.
- **Zerodha CSV** parsed in the browser (`lib/zerodha-csv.ts`); symbols matched through `/api/instruments` exact symbol match.
- **Analytics** `POST /api/analytics` with totals only → Gemini plain text (no search tool), explain-only rules.
PRD ref: `prd.md > Dashboard`, `prd.md > Assets and loans`, `prd.md > Manual income and expenses`, `prd.md > Zerodha CSV import`, `prd.md > Analytics`.

### Country, setup, tour and terms
- `lib/locale.ts` holds both countries (currency, number style, market, market hours, financial-year start, short-form units) and the active country, set by the store from `profile.country`. `lib/format.ts` (`formatMoney`, `compactMoney`, `formatDate`…), `lib/quarters.ts` and `lib/market-hours.ts` read it.
- US stocks: `lib/finnhub.ts` (`/api/v1/search`, `/api/v1/quote`, key `FINNHUB_API_KEY`, server only) and `lib/us-stocks.ts` (built-in list used without a key). Keys look like `US|AAPL`; `/api/quotes` splits NSE (Upstox) and US (Finnhub) keys.
- AI routes accept `country` and adapt wording (`lib/ai-locale.ts`).
- `components/onboarding/onboarding.tsx`: full-screen setup over the app until `profile.onboardedAt` is set; stores `name`, `country`, `termsVersion` (`lib/terms.ts`), `tourDone`.
- `components/tour/tour.tsx`: spotlight tour over elements marked `data-tour`.
- `app/(app)/terms/page.tsx`: static Terms page; lists `lib/privacy.ts` (`SHARING`).
- `app/(app)/news/page.tsx`: today's brief (moved off the Dashboard), last in the sidebar. `components/brief/news-feed.tsx` lays it out: counts per section, a filter by stock, stories grouped as Deserves your attention → What changed → Coming up with logos and source links, and a side column (when it was written + Refresh, your stocks with today's change and whether they're in the news, how the brief is made). An older brief stays readable with a prompt to get today's. `components/brief/use-brief.ts` sends names and symbols only. Settings gains a Privacy tab (`components/settings/privacy-panel.tsx`) and a shared Sign out confirmation in `SettingsProvider` (disconnect Google → `clearAll()` → welcome); `lib/backup.ts` downloads the backup.
- Routes: `/` is the landing page (`app/(marketing)/page.tsx`, no sidebar, chat or welcome screen), styled after the disclosed finlio.app waitlist page but written new for this repo: a hero with a rotating word (`components/landing/rotating-word.tsx`) and floating generic icons (`components/landing/hero-decor.tsx`), a story whose words sharpen on scroll (CSS scroll timelines, `land-*` utilities in `app/globals.css`), FAQs, a headline-vs-Finlio card and a card footer. The app moved into `app/(app)/` with its own layout (sidebar, page card, Finlio chat, welcome setup); its home is `/dashboard`. The root `app/layout.tsx` keeps only fonts, theme and providers. Sign out returns to `/`.
PRD ref: `prd.md > Welcome and setup`, `prd.md > Country`, `prd.md > Screen tour`, `prd.md > Terms & Conditions`, `prd.md > Responsive`.

## Data Model
All in browser `localStorage` under one key, `finlio:v1`:

```ts
type Holding = {
  id: string;            // random
  instrumentKey: string; // e.g. "NSE_EQ|INE467B01029"
  symbol: string;        // "TCS"
  name: string;          // "Tata Consultancy Services"
  buyDate: string;       // "2025-03-14"
  buyPrice: number;      // ₹ per share
  quantity: number;
  sample?: boolean;
};

type BriefItem = { symbol?: string; text: string; sources: { title: string; url: string }[] };

type Brief = {
  date: string;          // IST date, "2026-10-25"
  createdAt: string;
  changed: BriefItem[];
  comingUp: BriefItem[];
  attention: BriefItem[];
  noNews: string[];      // symbols
};

type Expense = { id: string; date: string; amount: number; merchant: string; category: string };
type ExpenseSnapshot = { account: string; syncedAt: string; expenses: Expense[] };

type Store = { holdings: Holding[]; brief?: Brief; expenses?: ExpenseSnapshot };
```

Prices are not stored; they're fetched again on every visit. Clearing data removes the key. The helper stores nothing.

## File Structure

```
finlio/
├── app/
│   ├── layout.tsx            # fonts, theme, providers
│   ├── globals.css           # Tailwind + Finlio tokens
│   ├── (marketing)/page.tsx  # landing page at /
│   ├── (app)/layout.tsx      # sidebar, page card, Finlio chat, welcome
│   ├── (app)/dashboard/      # the app's home
│   ├── (app)/holdings/ …     # holdings, news, expenses, assets, analytics, terms
│   └── api/
│       ├── instruments/route.ts  # stock search (Upstox list)
│       ├── quotes/route.ts       # live prices (Upstox)
│       └── brief/route.ts        # Gemini + Google Search
├── components/
│   ├── shell/                # sidebar, footer note
│   ├── welcome.tsx
│   ├── holding-dialog.tsx    # add / edit
│   ├── holdings-table.tsx
│   ├── holding-detail.tsx    # detail card (centred)
│   ├── brief/                # brief card, sections, source chip, states
│   ├── initial-badge.tsx
│   └── ui/                   # shadcn components
├── lib/
│   ├── store.tsx             # localStorage + React context
│   ├── portfolio.ts          # value, change, gain/loss maths
│   ├── market-hours.ts       # NSE open/closed in IST
│   ├── sample.ts             # sample portfolio (labelled)
│   ├── upstox.ts             # server-only Upstox client
│   ├── gemini.ts             # server-only Gemini client + prompt
│   └── brief-schema.ts       # zod schema
├── public/                   # Finlio logo (prior work, disclosed)
├── .env.example
├── devpost/                  # scope, prd, spec, checklist
├── LICENSE
└── README.md
```

## External Services and Dependencies

### Upstox
- **NSE stock list:** public gzip JSON, `https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz`; keep rows with segment `NSE_EQ` and type `EQ`. No key.
- **Quotes:** `GET https://api.upstox.com/v2/market-quote/quotes?instrument_key=KEY1,KEY2` (or the LTP endpoint), header `Authorization: Bearer <UPSTOX_ANALYTICS_TOKEN>`. Returns last price, previous close (`ohlc.close`) and timestamp per key.
- Docs: https://upstox.com/developer/api-documentation/
- Cost: verify in the first build step (account required; analytics token is generated once).

### Gemini
- SDK `@google/genai`, model `gemini-3.8-flash` (verify), tool `google_search`.
- Input: stock names and symbols plus instructions. Output: brief JSON plus URL citations (title, url).
- Free allowance: first 5,000 search queries a month; then $14 per 1,000. A brief for 5 stocks uses a handful of searches.
- Terms: show Google's search suggestions with grounded results.
- Docs: https://ai.google.dev/gemini-api/docs/google-search

### Google
- OAuth client (Web) in a Google Cloud project with the Gmail API enabled; consent screen in **Testing** with the learner's Gmail added as a test user. Redirect URI `http://localhost:3000/api/auth/callback/google`.
- Keys: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus a local random `AUTH_SECRET`.
- `gmail.readonly` is a restricted scope: public use needs Google verification and a security assessment, so the PoC stays in test mode (up to 100 invited users, "unverified app" warning).
- Docs: https://developers.google.com/gmail/api/auth/scopes

## Important Failure Modes
- **Upstox quote fails or the token is missing** → last known prices stay with "Couldn't update prices" and Retry; the brief still works.
- **Gemini returns malformed output or no citations** → retry once; then "Couldn't write today's brief" with Try again. Lines without a source are dropped, never shown.
- **No news for a stock** → listed under "No news today" instead of a made-up reason.
- **Google sign-in refused, not configured, or token revoked** → Expenses shows a plain message and Continue with Google again.

## What Was Simplified and Why
- **Browser storage** instead of a database and accounts — keeps data on the device and removes login. A multi-device version would need encrypted sync.
- **Brief made on demand** instead of a scheduled 8:30 am email — proves the kernel without a scheduler or mail service.
- **Initial badges** instead of company logos — trademark rule.
- **Polling every 60 seconds** instead of live streaming — simpler, enough for a brief.
- **Sample portfolio** uses real NSE stocks and live prices; only the buy details are examples, and they're labelled "Sample".

## Decisions and Open Issues
- **Learner choices:** web app, Next.js, Tailwind, shadcn/ui, GSAP, lucide-react, Gemini, no Finlio account, data in the browser; after approval, Expenses with Google sign-in and Gmail reading in test mode.
- **Claude's recommendations (agreed):**
  1. **Upstox for prices** — official and authorized for account holders, live NSE. Tradeoff: needs an Upstox account and token. Alternative: Alpha Vantage free tier (BSE prices, about 25 requests a day, not enough for live refresh).
  2. **Gemini with Google Search for news** — one call gives today's headlines, the brief and the source links, under Google's terms. Tradeoff: stock names go to Google; Google's search suggestions must be shown.
  3. **Run locally for the demo**, deployment optional.
- **The useful unknown:** what actually leaves the device when Finlio uses a cloud AI. Answer: only stock names and symbols go to the helper, Upstox and Gemini; quantities, prices and values never leave the browser. Check during build: inspect the `/api/brief` request in the browser's Network tab and confirm it contains no amounts.
- **To verify in build step 1:** Gemini model name and citation format; Upstox token access and cost.
- **Carried from `prd.md > Open Questions`:** the data source question is answered above, pending agreement.
- **Eligibility (not technical):** confirm whether Beny Dishon K is part of this entry before submitting.

## Sign-in (added at the learner's request)

- `/sign-in` and `/sign-up` (`components/auth/auth-form.tsx`, `auth-shell.tsx`) offer **Continue with Google** only. `/api/auth/google` asks for `openid email profile`; `/api/auth/google?gmail=1` (Expenses, Settings → Connected apps) adds `gmail.readonly` with offline access. A `next` path (same-site only) brings the person back.
- `lib/google-session.ts` keeps one encrypted httpOnly cookie (`finlio_google`) with a `gmail` flag. `DELETE /api/auth/gmail` revokes Gmail but keeps the person signed in; sign-out revokes everything and erases the browser data.
- `proxy.ts` sends visitors without a sign-in cookie from the app's pages to `/sign-in`, and signed-in people from the sign-in screens to `/dashboard`. `components/auth/auth-gate.tsx` checks the cookie is still valid (clearing a broken one) and sends new people to `/setup`, which pre-fills their first name from Google.
- A copy with no Google keys (e.g. a judge's fresh clone) shows **Open Finlio on this device**, which sets `finlio_local`; `/api/auth/local` refuses it when Google is configured.

