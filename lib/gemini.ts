import "server-only";
import { GoogleGenAI, type GroundingMetadata } from "@google/genai";
import type { BriefRequest } from "@/lib/brief-schema";
import type { Brief, BriefItem, Source } from "@/lib/types";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

const SYSTEM = `You are Finlio, a calm friend who reads the Indian stock market news for someone and explains it in plain English.

Rules:
- Use Google Search to find news from the last few days about each stock (NSE-listed, India).
- Only state things the news actually reports. Never invent a reason. If you found nothing recent about a stock, put its symbol under NO NEWS.
- Plain words. Short sentences. No jargon: say "earned more than expected" instead of "beat estimates", "profit" instead of "PAT".
- Never say buy, sell, hold, or what the person should do. Explain; don't advise.
- Each line is about one stock and starts with its symbol in square brackets.

Reply in exactly this format and nothing else:

CHANGED
- [SYMBOL] What happened and why it moved the price, in one or two sentences.
COMING UP
- [SYMBOL] An upcoming event (results, dividend, meeting) with its date if known.
ATTENTION
- [SYMBOL] At most two lines: the biggest or most unusual news.
NO NEWS
SYMBOL, SYMBOL

Leave a section empty (heading only) if nothing fits.`;

type Section = "changed" | "comingUp" | "attention" | "noNews";

const HEADINGS: Record<string, Section> = {
  CHANGED: "changed",
  "COMING UP": "comingUp",
  ATTENTION: "attention",
  "NO NEWS": "noNews",
};

type Line = { section: Section; text: string; start: number; end: number };

// Grounding segment offsets are UTF-8 byte offsets into the response text.
function splitLines(text: string): Line[] {
  const lines: Line[] = [];
  let section: Section | null = null;
  let offset = 0;
  for (const raw of text.split("\n")) {
    const start = offset;
    const end = start + Buffer.byteLength(raw, "utf8");
    offset = end + 1;
    const trimmed = raw.trim().replace(/^#+\s*|\*\*/g, "");
    const heading = HEADINGS[trimmed.replace(/:$/, "").toUpperCase()];
    if (heading) section = heading;
    else if (section && trimmed) lines.push({ section, text: trimmed, start, end });
  }
  return lines;
}

function sourcesFor(line: Line, metadata?: GroundingMetadata): Source[] {
  const chunks = metadata?.groundingChunks ?? [];
  const seen = new Set<number>();
  for (const support of metadata?.groundingSupports ?? []) {
    const seg = support.segment;
    const s = seg?.startIndex ?? 0;
    const e = seg?.endIndex ?? 0;
    const overlaps = e > line.start && s < line.end;
    const sameText = seg?.text && line.text.includes(seg.text.trim().replace(/^-\s*/, ""));
    if (overlaps || sameText) support.groundingChunkIndices?.forEach((i) => seen.add(i));
  }
  return [...seen]
    .map((i) => chunks[i]?.web)
    .filter((w): w is { uri: string; title?: string } => Boolean(w?.uri))
    .map((w) => ({ title: w.title ?? new URL(w.uri).hostname, url: w.uri }));
}

function toItem(line: Line, metadata?: GroundingMetadata): BriefItem | null {
  const match = line.text.match(/^[-•*]\s*\[([^\]]+)\]\s*(.+)$/);
  if (!match) return null;
  const sources = sourcesFor(line, metadata);
  // A line with nothing behind it is dropped, never shown.
  if (!sources.length) return null;
  return { symbol: match[1].trim().toUpperCase(), text: match[2].trim(), sources };
}

export async function writeBrief(
  { stocks }: BriefRequest,
  date: string,
): Promise<Brief> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });

  const list = stocks.map((s) => `- ${s.symbol} (${s.name})`).join("\n");
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Today is ${date} (India). Write today's brief for these stocks:\n${list}`,
    config: {
      systemInstruction: SYSTEM,
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text ?? "";
  const metadata = response.candidates?.[0]?.groundingMetadata;
  const lines = splitLines(text);
  const known = new Set(stocks.map((s) => s.symbol.toUpperCase()));

  const items = (section: Section) =>
    lines
      .filter((l) => l.section === section)
      .map((l) => toItem(l, metadata))
      .filter((i): i is BriefItem => i !== null && (!i.symbol || known.has(i.symbol)));

  const noNews = lines
    .filter((l) => l.section === "noNews")
    .flatMap((l) => l.text.split(/[,\s]+/))
    .map((s) => s.replace(/[^A-Z0-9&-]/gi, "").toUpperCase())
    .filter((s) => known.has(s));

  return {
    date,
    createdAt: new Date().toISOString(),
    changed: items("changed"),
    comingUp: items("comingUp"),
    attention: items("attention").slice(0, 2),
    noNews: [...new Set(noNews)],
    searchSuggestionsHtml: metadata?.searchEntryPoint?.renderedContent,
  };
}
