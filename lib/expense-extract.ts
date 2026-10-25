import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import type { AlertEmail } from "@/lib/gmail";
import { EXPENSE_CATEGORIES, type Expense } from "@/lib/types";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const system = (country: "IN" | "US") => `You read ${country === "US" ? "US bank, card, Venmo, Zelle and PayPal" : "Indian bank, card and UPI"} alert emails and pull out money the person spent.

For each email, decide:
- kind "spend": money left the person's account (debit, card purchase, ${country === "US" ? "Zelle or Venmo payment" : "UPI payment"}, autopay).
- kind "ignore": anything else (credits, refunds, OTPs, offers, statements, failed transactions, balance updates).

For spends, give the amount in ${country === "US" ? "US dollars" : "rupees"} as a number, the merchant or payee in short readable form (e.g. ${country === "US" ? '"Starbucks", "Uber", "John Smith"' : '"Swiggy", "Uber", "Amit Kumar"'}), and one category from this list: ${EXPENSE_CATEGORIES.join(", ")}.
Only use what the email says. If the amount is unclear, use kind "ignore".`;

const ResultSchema = z.array(
  z.object({
    id: z.string(),
    kind: z.enum(["spend", "ignore"]),
    amount: z.number().positive().optional(),
    merchant: z.string().optional(),
    category: z.enum(EXPENSE_CATEGORIES).optional(),
  }),
);

export async function extractExpenses(emails: AlertEmail[], country: "IN" | "US" = "IN"): Promise<Expense[]> {
  if (!emails.length) return [];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: JSON.stringify(
      emails.map(({ id, from, subject, snippet }) => ({ id, from, subject, text: snippet })),
    ),
    config: {
      systemInstruction: system(country),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            kind: { type: Type.STRING, enum: ["spend", "ignore"] },
            amount: { type: Type.NUMBER },
            merchant: { type: Type.STRING },
            category: { type: Type.STRING, enum: [...EXPENSE_CATEGORIES] },
          },
          required: ["id", "kind"],
        },
      },
    },
  });

  const results = ResultSchema.parse(JSON.parse(response.text ?? "[]"));
  const byId = new Map(emails.map((e) => [e.id, e]));
  return results
    .filter((r) => r.kind === "spend" && r.amount && r.merchant && byId.has(r.id))
    .map((r) => ({
      id: r.id,
      date: byId.get(r.id)!.date,
      amount: r.amount!,
      merchant: r.merchant!,
      category: r.category ?? "Other",
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
