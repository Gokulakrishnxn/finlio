import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

// Totals only: no transactions, merchants, account names or stock quantities.
const InsightsRequestSchema = z.object({
  netWorth: z.number(),
  assets: z.number(),
  loans: z.number(),
  month: z.object({ income: z.number(), spent: z.number(), saved: z.number() }),
  lastMonthSpent: z.number(),
  spendingByCategory: z.array(z.object({ category: z.string().max(40), amount: z.number() })).max(20),
  allocation: z.array(z.object({ label: z.string().max(40), percent: z.number() })).max(10),
});

const SYSTEM = `You are Finlio, a calm friend who explains someone's money to them in plain English (India, rupees).

Write 4 to 6 short bullet points, each one sentence, starting with "- ".
- Describe what the numbers show: where most money goes, how this month compares with last month, how much was saved, how the money is spread, how loans compare with assets.
- Use rupee amounts written like ₹12,400 or ₹3.2 lakh.
- Never tell them to buy, sell, invest in or move money into anything, and never recommend products. Explain; don't advise.
- If a number is zero or missing, don't comment on it.`;

export async function POST(request: Request) {
  const parsed = InsightsRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Send your money totals." }, { status: 400 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "Insights aren't set up yet (no Gemini key)." }, { status: 503 });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: JSON.stringify(parsed.data),
      config: { systemInstruction: SYSTEM },
    });
    const points = (response.text ?? "")
      .split("\n")
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 6);
    return Response.json({ points, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error("[insights]", err);
    return Response.json({ error: "Couldn't explain your money right now." }, { status: 502 });
  }
}
