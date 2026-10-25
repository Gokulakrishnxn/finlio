import "server-only";

// Bank, card and payment alerts only (UPI in India; card, Zelle and Venmo in the US); promotions are skipped.
const ALERT_QUERY =
  'newer_than:60d (debited OR spent OR "paid to" OR UPI OR "debit card" OR txn OR "transaction alert" OR "you made a" OR purchase OR Zelle OR Venmo) -category:promotions -category:social';
const MAX_MESSAGES = 60;
const CONCURRENCY = 8;

export type AlertEmail = { id: string; from: string; subject: string; date: string; snippet: string };

type GmailMessage = {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: { name: string; value: string }[] };
};

async function gmail<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gmail ${path.split("?")[0]}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function readAlertEmails(accessToken: string): Promise<AlertEmail[]> {
  const list = await gmail<{ messages?: { id: string }[] }>(
    `messages?q=${encodeURIComponent(ALERT_QUERY)}&maxResults=${MAX_MESSAGES}`,
    accessToken,
  );
  const ids = (list.messages ?? []).map((m) => m.id);

  const emails: AlertEmail[] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = await Promise.all(
      ids.slice(i, i + CONCURRENCY).map((id) =>
        gmail<GmailMessage>(
          `messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          accessToken,
        ),
      ),
    );
    for (const m of batch) {
      const header = (name: string) =>
        m.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
      emails.push({
        id: m.id,
        from: header("From"),
        subject: header("Subject"),
        date: new Date(Number(m.internalDate ?? Date.now())).toISOString().slice(0, 10),
        snippet: m.snippet ?? "",
      });
    }
  }
  return emails;
}
