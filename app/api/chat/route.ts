import { moneyStyle } from "@/lib/ai-locale";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

// The browser sends a summary of the person's money: totals, percentages and
// today's brief, never transactions, merchants or share quantities.
const ChatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
  country: z.enum(["IN", "US"]).default("IN"),
  context: z.object({
    today: z.string(),
    netWorth: z.number(),
    assets: z.number(),
    loans: z.number(),
    month: z.object({ income: z.number(), spent: z.number(), saved: z.number() }),
    spendingByCategory: z.array(z.object({ category: z.string(), amount: z.number() })).max(20),
    allocation: z.array(z.object({ label: z.string(), percent: z.number() })).max(10),
    stocks: z
      .array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          dayChangePct: z.number().optional(),
          gainPct: z.number().optional(),
        }),
      )
      .max(50),
    brief: z.array(z.string()).max(30),
    profile: z
      .object({ name: z.string().max(80).optional(), goal: z.string().max(200).optional() })
      .optional(),
  }),
});

const system = (country: "IN" | "US") => `You are Finlio, a calm, friendly assistant inside a personal-finance app for people in India and the United States.
You explain the person's own money in plain English, in short paragraphs or a few "- " bullets. This person lives in ${moneyStyle(country)}

Use their first name occasionally if given. If they shared a money goal, you may relate numbers to it, but never tell them what to do to reach it.

You have a JSON summary of their money (net worth, this month, spending by category, allocation, their stocks with today's and overall % change, and today's news brief). Answer from it. If the answer isn't in the summary, say so plainly and suggest which Finlio screen would help (Dashboard, Holdings, Expenses, Assets & loans, Analytics).

Rules:
- Explain; never advise. Never say buy, sell, hold, or which product, stock or fund to choose. If asked, say Finlio explains rather than advises and offer to explain the factors instead.
- Don't invent news or numbers. Only use the brief for reasons a stock moved.
- Keep answers under 150 words unless asked for more.`;

export async function POST(request: Request) {
  const parsed = ChatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Send a question." }, { status: 400 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "Chat isn't set up yet (no Gemini key)." }, { status: 503 });

  const { messages, context, country } = parsed.data;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `${system(country)}\n\nTheir money right now:\n${JSON.stringify(context)}`,
      },
    });

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
            }
          } catch (err) {
            console.error("[chat] stream failed:", err);
            controller.enqueue(encoder.encode("\n\n(Sorry, the answer was cut short. Please ask again.)"));
          } finally {
            controller.close();
          }
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[chat]", err);
    const quota = (err as { status?: number }).status === 429;
    return Response.json(
      { error: quota ? "Gemini is out of quota for this key right now." : "Finlio couldn't answer right now." },
      { status: quota ? 429 : 502 },
    );
  }
}
