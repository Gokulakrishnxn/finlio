---
doc: scope
status: approved
---

# Finlio Daily

A plain-English daily briefing on the stocks you own: what changed, what's coming up, and what deserves your attention.

## The Unique Kernel
Finlio watches **only what you own** and explains **why** it moved, in plain words. Everyone else gives you the market and the jargon ("TCS Q3 net profit up 8.3% YoY, beats street estimates on robust BFSI demand"). Finlio gives you your money, explained ("TCS earned more than expected last quarter. That's why your TCS shares moved.").

The learner's belief: *"Your money should be easier to understand."*

## Who It's For
A salaried retail investor in India (the August PRD's "Arjun": 26–38, Bengaluru/Mumbai/Chennai) who holds a handful of NSE stocks in Zerodha or Groww. Today, when their money moves, they open the news, ask a friend, and are still confused. In the learner's words: "Your stocks sit in one app. Your mutual funds sit in another. And the news is somewhere else."

## The Core Loop
1. Open Finlio in the morning.
2. See today's briefing for their holdings: what changed, what's coming up, what deserves attention.
3. Tap a holding to read why it moved and the headlines behind it.

They come back because it's *their* money, and it takes a minute instead of an hour of connecting the dots.

Setup happens once: add each stock owned, with buy date, buy price and quantity.

## Inspiration & Identity
- Calm, minimal dashboard like Link: https://app.link.com/home (sidebar, greeting, rounded "Recent" / "Upcoming" cards). Inspiration only; Finlio keeps its own identity.
- Finlio's own brand from finlio.app: cream background, Finlio green, the plain-words "brief card" (prior work, disclosed).
- Component and motion references: https://ui.shadcn.com, https://www.rareui.com, https://transitions.dev, https://www.beautifului.dev, https://before.click (landing showcase), https://cuelume.dev (sound), https://www.obsidianui.dev/components, https://uiarc.dev (charts), https://beui.dev, https://gsap.com (motion), lucide-react (icons).
- Tone: like a friend who reads the market for you and explains it simply. Calm, honest, no hype.
- Privacy as part of the identity: no account, your portfolio stays on your device.

## Why This Matters to the Learner
Finlio is the learner's own product (waitlist live at finlio.app). They want to win this hackathon and present it like Steve Jobs: one problem, one moment of magic, then the vision.

## What "Working" Looks Like
The demo, in five beats:
1. **Ordinary moment:** money in three places; nobody tells you why it moved.
2. **One action:** add a stock you own (name, buy date, buy price, quantity). Finlio finds the company and shows its live price and your gain or loss.
3. **The magic:** press for today's brief. Finlio reads today's real news about your holdings and writes, in plain words, why each one moved, plus what's coming up and what deserves attention.
4. **"And it's mine":** the brief only mentions what you hold.
5. **Proof** (proposed): the stock is added live on camera, the price shows a live timestamp, and every explanation links to the real headline it came from, with source and time.

The "oh, that's cool" beat: jargon headline in, one plain sentence about *your* shares out.

## The POC Boundary
- Web app (desktop browser).
- Manual entry of NSE stocks: name, buy date, buy price, quantity. Holdings saved on the user's device.
- Portfolio view: live price, value, and gain/loss per holding and in total.
- Daily brief generated on demand with Gemini from real, current news about the user's holdings: what changed, what's coming up, what deserves attention, with a link to the source for every claim.
- Explains only; never says buy or sell.
- A sample portfolio so the demo never depends on typing under pressure (proposed).

## Later
- Email delivery of the brief, and alerts when a holding moves sharply (proposed: on-screen brief first).
- Mutual funds (NAV) alongside stocks (proposed: stocks first).
- Weekly / monthly / yearly goals that Finlio helps you reach.
- The whole picture: bank, SIPs, EPF, FDs, gold, one net-worth number.
- Mobile apps.

## Explicitly Cut
- **Gmail expense tracking:** Google requires a security review for reading mail, which can't happen before the deadline; it also isn't needed to prove the kernel.
- **Yahoo Finance's unofficial API:** not authorized for use, which the rules require; the spec picks a source we're allowed to use.
- **Third-party broker and stock logos in the demo video:** trademarks need permission under the rules; the spec decides how holdings are identified on screen.
- **"We never share your data" / end-to-end encryption claims:** not true when Gemini reads the news and holdings; replaced by an honest promise: no account, data on your device, only the minimum sent to Gemini over an encrypted connection.
- **Buy/sell recommendations:** Finlio explains, never advises.
- **Accounts, payments, tiers:** not needed for the proof of concept.
