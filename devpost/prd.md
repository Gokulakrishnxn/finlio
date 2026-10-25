---
doc: prd
status: approved
---

# Finlio Daily — Product Requirements

A plain-English daily briefing on the NSE stocks an Indian retail investor owns: what changed, what's coming up, and what deserves their attention.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

Items marked **(assumption)** were filled in by Claude to keep pace and need the learner's confirmation at review.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The user opens Finlio for the first time and sees a short welcome: what Finlio does, and that their portfolio stays in this browser.
2. They add a stock they own: search by company name or NSE symbol, pick it, then enter buy date, buy price and quantity. Or they choose **Try a sample portfolio**.
3. Home shows a greeting and their holdings with the live price, today's change, value and gain or loss.
4. They press **Get today's brief**. Finlio reads today's news about their holdings and writes the brief in plain words, in three sections: **What changed**, **Coming up**, **Deserves your attention**.
5. Every explanation links to the headline it came from (source and time).
6. They open a holding to see their position, why it moved, and the headlines behind it.
7. Next morning they come back, and a fresh brief is one press away. Success: in about a minute they understand why their money moved, without opening another app.

## Screens and Layout
Layout inspired by Link (`scope.md > Inspiration & Identity`): a left sidebar, a large greeting, rounded cards on a calm background.

- **Sidebar:** Finlio logo; **Dashboard** (home); **Holdings**; **Expenses**; **Assets**; **Insights**; **Privacy**. A small footer note: "Your data stays in this browser."
- **Today (home):** greeting ("Good morning" plus date), the brief card with its three sections, and a compact holdings card with the portfolio total and today's change.
- **Holdings:** a list of all holdings, an **Add stock** button, edit and delete per row.
- **Holding detail** (panel that slides over the current screen): price, position, gain or loss, "Why it moved", and the list of headlines with links.
- **Add / edit stock** (dialog): search, buy date, buy price, quantity.
- **Expenses:** Continue with Google (first time), then spent this month, spending by category, and recent transactions, with Sync and Disconnect.
- **Privacy:** what Finlio stores, what it sends to the AI, and **Clear all my data**.
- **Welcome** (first use only): one sentence about Finlio, **Add your first stock**, **Try a sample portfolio**.

## Look and Feel
Established by the learner (`scope.md > Inspiration & Identity`):

- **Structure:** Link's dashboard (https://app.link.com/home): sidebar, greeting header, generous whitespace, rounded cards with soft borders.
- **Brand (finlio.app, prior work, disclosed):** cream background (#fbfaf9), sand (#f6f4ef), soft line borders (#ecebe7), ink text (#343433), Finlio green (#34c759) for gains and the brand, red (#ef4444) for losses. Typeface: Geist, with Geist Mono for numbers.
- **Appearance:** Settings → General offers Light, Dark and System (the default). The choice is saved in this browser. Dark mode uses neutral charcoal and black surfaces with light text and readable green/red amounts across every screen, chart, dialog and chat; System follows device appearance changes. The mobile header keeps navigation and Settings accessible without crowding.
- **The signature element:** the before/after brief card from finlio.app, with jargon headline in and one plain sentence out.
- **Motion:** calm and purposeful (GSAP). The brief writes itself in section by section; numbers count up; panels slide. Nothing bouncy.
- **Components and references:** shadcn/ui, rareui, transitions.dev, beautifului, obsidianui (dashboard), uiarc (charts), beui; lucide-react icons.
- **Tone:** a friend who reads the market for you. Short sentences, no jargon, no hype, no exclamation marks.
- **Avoid:** generic AI-app styling (purple gradients, glowing chat bubbles), third-party logos in the demo video (trademarks).

## Features and Behavior

### Adding holdings
- As an investor, I want to add a stock I own so that Finlio knows what to watch.
  - [ ] Typing a company name or NSE symbol shows matching NSE stocks (name and symbol).
  - [ ] After picking a stock, the user enters buy date, buy price per share (₹) and quantity, then saves.
  - [ ] Quantity and price must be above zero, and the buy date can't be in the future; otherwise a clear message appears next to the field.
  - [ ] Adding the same stock again asks whether to add to the existing holding or cancel. **(assumption)**
  - [ ] Each holding can be edited or deleted; deleting asks for confirmation.
  - [ ] Each holding shows its company logo when one is available and logos are on; otherwise a coloured initial badge.

### Portfolio
- As an investor, I want to see what my holdings are worth now so that I know where I stand.
  - [ ] Each holding shows live price, today's change (₹ and %), current value, and total gain or loss versus buy price.
  - [ ] The portfolio total shows value, today's change and overall gain or loss.
  - [ ] An "Updated hh:mm" label shows when prices were last fetched; prices refresh automatically every minute or so while the page is open. **(assumption)**
  - [ ] Outside market hours, a "Market closed" label appears and the last closing price is shown.

### Today's brief
Source: `scope.md > The Unique Kernel`.
- As an investor, I want one short briefing on my holdings so that I understand why my money moved without reading the news myself.
  - [ ] **Get today's brief** creates a brief from today's real news about the user's holdings.
  - [ ] **What changed:** for each holding that has news, one or two plain sentences on why it moved (or may move), naming the stock.
  - [ ] **Coming up:** upcoming events mentioned in the news for these holdings (results, dividends, meetings), with dates when known.
  - [ ] **Deserves your attention:** at most two items, such as the biggest mover or unusual news.
  - [ ] Every sentence that states a fact links to its source headline (publisher and time).
  - [ ] A holding with no news today says so plainly; Finlio never invents a reason.
  - [ ] The brief never says buy, sell or hold. Footer: "Finlio explains. It doesn't advise."
  - [ ] The brief appears section by section as it's written.
  - [ ] Today's brief is kept, so reopening the page shows it again; **Refresh** makes a new one.

### Holding detail
- As an investor, I want to look closer at one stock so that I can see the full story behind its move.
  - [ ] Opening a holding shows price, position, gain or loss, its "Why it moved" text from today's brief, and the list of today's headlines with links.

### Privacy
Source: `scope.md > Explicitly Cut`.
- As an investor, I want to know where my data goes so that I can trust Finlio.
  - [ ] There is no sign-up; holdings and briefs are saved only in this browser.
  - [ ] The AI receives only stock names and news headlines, never quantities, prices or values. **(assumption)**
  - [ ] The Privacy screen says this plainly and offers **Clear all my data**, which empties the app after confirmation.

### Sample portfolio
- As someone trying Finlio (or a judge), I want a ready-made portfolio so that I can see a brief in seconds.
  - [ ] **Try a sample portfolio** adds about five well-known NSE stocks with example buy details, clearly labelled "Sample".
  - [ ] Sample holdings can be removed in one step.

### Expenses
Source: `scope.md > The POC Boundary` (Expenses, added after approval).
- As an investor, I want Finlio to read my bank alerts so that I can see where my money went without typing anything.
  - [ ] Expenses shows **Continue with Google** with a plain note: read-only access, only bank and UPI alerts are read, results stay in this browser, test mode only.
  - [ ] After Google sign-in, **Sync** reads alert emails from the last 60 days and lists each spend with date, merchant, amount (₹) and category.
  - [ ] Spent this month and last month are shown, with spending by category as bars.
  - [ ] Emails that aren't spends (credits, OTPs, offers) are ignored.
  - [ ] Expenses are saved in this browser; **Sync** refreshes them; **Disconnect** signs out of Google and revokes Finlio's access.
  - [ ] If sign-in is refused or Google isn't set up, a plain message explains what happened.

### Dashboard
Source: `scope.md > The POC Boundary` (whole-money dashboard, added after approval).
- As an investor, I want one screen that shows my whole money picture so that I know where I stand at a glance.
  - [ ] **Net worth** = stocks (live value, or invested amount if prices are unavailable) + assets − loans, with a small line of past values from daily snapshots saved in the browser.
  - [ ] **This month:** money in (manual income), money out (Gmail and manual expenses), saved (in − out).
  - [ ] **Quick add** tiles: Expense, Income, Asset or loan, Stock, Import CSV.
  - [ ] **Recent activity:** the latest expenses and income, newest first.
  - [ ] Today's brief stays on the dashboard.

### Assets and loans
- As an investor, I want to add what I own and owe outside the stock market so that net worth is real.
  - [ ] Add, edit and delete assets (bank, fixed deposit, gold, EPF, PPF, property, other) and loans (home, car, personal, credit card, other) with a name and amount.
  - [ ] An assets-versus-loans bar shows the split.

### Manual income and expenses
- [ ] Add an expense or income with amount, date, category and an optional note; it appears in Expenses and Recent activity next to Gmail spends and can be deleted.

### Zerodha CSV import
- [ ] Holdings → Import CSV accepts Zerodha's holdings export, matches each row to its NSE stock, and adds quantity and average cost (buy date is the import date, labelled "Imported"). Unmatched rows are listed, not guessed.

### Insights
- [ ] Allocation across stocks, cash, deposits, gold, retirement, property and other, as a bar with percentages.
- [ ] **Explain my money** asks Gemini for a short plain-English summary from totals only (category totals, allocation percentages, month in and out). No buy/sell advice.

## States and Boundaries
- **First use:** the Welcome screen; nothing stored yet.
- **Empty portfolio:** Today and Holdings show the Welcome actions instead of empty cards.
- **Generating a brief:** sections show a calm "Reading today's news…" placeholder, then fill in.
- **No news for any holding:** the brief says nothing notable was reported today and shows prices only.
- **Price data unavailable:** the last known prices stay visible, marked "Couldn't update prices", with a retry.
- **Brief fails:** a plain message and a **Try again** button; the previous brief, if any, stays visible.
- **Persistence:** holdings and the latest brief survive closing the browser; nothing leaves the device except stock names and headlines sent to the AI.

## Product Decisions
- Web app, desktop first — learner's stated platform (`scope.md > The POC Boundary`).
- Manual entry with buy date, price and quantity — learner's stated flow.
- NSE stocks only for now; mutual funds later — approved in scope.
- Brief on screen, created when asked; email delivery later — approved in scope.
- No Finlio account or database; data stays in the browser — learner's privacy promise, stated honestly. Google sign-in is only for reading bank alerts.
- Expenses via Gmail, in Google test mode — learner's decision after scope approval, accepting the deadline risk.
- Explain, never advise — learner's principle ("Suggest, never execute" in the August PRD) and the hackathon's credibility.
- Company logos optional behind a Settings switch, off when recording — trademark rule for the demo video.
- The AI model is Gemini — learner's choice (detail belongs in `4-spec`).

## What We're Building
The welcome; adding, editing and deleting NSE holdings; live portfolio values; today's three-section brief with sources; holding detail; the privacy screen with clear-data; the sample portfolio; and the states above.

## Deferred From the POC
- **Email brief and price alerts:** needs a sending service and scheduling; the on-screen brief proves the kernel.
- **Mutual funds:** a second data source; stocks prove the idea.
- **Goals (weekly, monthly, yearly):** a separate feature area.
- **A landing page:** finlio.app already exists. **(assumption)**
- **Sound effects (cuelume):** polish after the core works. **(assumption)**

## Possible Later Enhancements
- A pre-market brief that arrives by itself at 8:30 am.
- Post-market recap: what actually moved and why.
- Net worth across bank, SIPs, EPF, FDs and gold.
- Mobile apps.

## Non-Goals
- Buy, sell or hold recommendations — not advice, and not licensed to give it.
- Placing trades or moving money.
- Finlio accounts, payments or plans.
- Sending emails, or reading anything other than bank and UPI alerts.
- Company logos in the demo video — third-party trademarks. (In the app they are optional, behind a Settings switch, added at the learner's request.)
- Claims of end-to-end encryption or "we never share data" — not accurate with a cloud AI.

## Open Questions
- Which news and price sources we're allowed to use — **answer in `4-spec`**.
- The assumptions marked above — **confirm at this review**.
