import Link from "next/link";
import { SHARING } from "@/lib/privacy";
import { TERMS_UPDATED } from "@/lib/terms";

export const metadata = { title: "Terms & Conditions · Finlio" };

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. What Finlio is",
    body: (
      <>
        <p>
          Finlio (&ldquo;Finlio&rdquo;, &ldquo;we&rdquo;) is a personal-finance app for people in India and the
          United States. It shows the stocks, accounts, income and spending you add, and uses AI to explain
          in plain words what changed and why.
        </p>
        <p>
          Finlio is a proof of concept built for the Devpost &ldquo;Build With AI: Basics&rdquo; hackathon. Features
          may change or stop working, and it is provided free of charge.
        </p>
      </>
    ),
  },
  {
    title: "2. Finlio explains; it does not advise",
    body: (
      <>
        <p>
          Finlio gives general information and explanations only. It is <strong>not</strong> investment,
          financial, tax or legal advice, and it never tells you to buy, sell or hold anything.
        </p>
        <p>
          Finlio is not registered as an investment adviser or research analyst with the Securities and Exchange
          Board of India (SEBI) or the U.S. Securities and Exchange Commission (SEC), and is not a broker. Make
          your own decisions and, where needed, talk to a qualified professional.
        </p>
      </>
    ),
  },
  {
    title: "3. Information can be wrong or late",
    body: (
      <p>
        Prices, news summaries, bank-alert readings and AI explanations come from third parties and from AI
        models. They can be delayed, incomplete or wrong. Always check important numbers with your broker, bank
        or the original source before relying on them. Stock prices may be delayed and market holidays are not
        shown.
      </p>
    ),
  },
  {
    title: "4. Your data stays with you",
    body: (
      <>
        <p>
          Finlio has no account system and no Finlio database. What you enter is stored in your own browser on
          your device. Clearing your browser data, or choosing <em>Sign out</em>, deletes it, and we cannot
          recover it. Use <em>Settings → Data controls → Export backup</em> to keep a copy.
        </p>
        <p id="your-data">
          To work, Finlio sends limited information to other services. Exactly what is sent (also shown in{" "}
          <em>Settings → Privacy</em>):
        </p>
        <ul className="space-y-1.5">
          {SHARING.map((s) => (
            <li key={`${s.who}-${s.why}`}>
              <strong className="font-medium text-ink">{s.who}</strong> ({s.why}): {s.what}.
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "5. Third-party services",
    body: (
      <>
        <p>Finlio relies on services run by other companies, each under its own terms:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Google Gemini and Google Search, for the daily brief, analytics, chat and reading bank alerts.</li>
          <li>Upstox (India) and Finnhub (United States), for stock prices and search.</li>
          <li>Gmail, read-only and only if you choose to connect it, for bank and card alerts.</li>
          <li>icon.horse and Google&apos;s favicon service, for company logos (can be turned off).</li>
        </ul>
        <p>
          Company names and logos shown in Finlio belong to their owners and are used only to identify your own
          holdings and spending. Finlio is not affiliated with or endorsed by them.
        </p>
      </>
    ),
  },
  {
    title: "6. Connecting Gmail",
    body: (
      <p>
        If you connect Google, you allow Finlio read-only access to your Gmail so it can find bank, card and
        payment alerts. Finlio never sends email or changes your mailbox. You can disconnect at any time in
        Finlio or in your Google Account, which revokes access.
      </p>
    ),
  },
  {
    title: "7. Using Finlio fairly",
    body: (
      <p>
        Use Finlio for your own personal finances and within the law. Do not try to break, overload or misuse
        the service or the services it connects to, or use it to process other people&apos;s data without
        their permission.
      </p>
    ),
  },
  {
    title: "8. No warranty and limits on liability",
    body: (
      <p>
        Finlio is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, to
        the extent the law allows. We are not liable for losses or decisions made from information shown in
        Finlio, or for data lost from your browser. Nothing in these Terms limits rights you have that cannot be
        limited under the law where you live, including consumer protection laws in India and in your US state.
      </p>
    ),
  },
  {
    title: "9. Open source",
    body: (
      <p>
        Finlio&apos;s source code is published under the MIT License at{" "}
        <a href="https://github.com/Gokulakrishnxn/finlio" className="underline" target="_blank" rel="noreferrer">
          github.com/Gokulakrishnxn/finlio
        </a>
        . Third-party code and its licences are listed in THIRD_PARTY_NOTICES.md.
      </p>
    ),
  },
  {
    title: "10. Changes and contact",
    body: (
      <p>
        We may update these Terms. When we do, Finlio will ask you to accept the new version before you continue.
        Questions: open an issue on the GitHub repository above.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight text-ink md:text-[36px]">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">Last updated {TERMS_UPDATED}</p>
        <p className="mt-4 rounded-2xl bg-warning-soft px-4 py-3 text-[13px] leading-relaxed text-warning">
          Draft for a hackathon proof of concept, written in plain English. It has not been reviewed by a lawyer
          and should be before Finlio is offered to the public.
        </p>
      </header>

      <div className="card-surface divide-y divide-line">
        {SECTIONS.map((s) => (
          <section key={s.title} className="space-y-3 p-6 text-[15px] leading-relaxed text-body md:p-8">
            <h2 className="text-[16px] font-semibold text-ink">{s.title}</h2>
            {s.body}
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        <Link href="/dashboard" className="underline">
          Back to Finlio
        </Link>
      </p>
    </article>
  );
}
