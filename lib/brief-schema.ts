import { z } from "zod";

// What the browser may send: names and symbols only, never amounts.
export const BriefRequestSchema = z.object({
  stocks: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        symbol: z.string().min(1).max(40),
      }),
    )
    .min(1)
    .max(25),
});

export type BriefRequest = z.infer<typeof BriefRequestSchema>;

const SourceSchema = z.object({ title: z.string(), url: z.url() });

const ItemSchema = z.object({
  symbol: z.string().optional(),
  text: z.string().min(1),
  sources: z.array(SourceSchema).min(1),
});

export const BriefSchema = z.object({
  date: z.string(),
  createdAt: z.string(),
  changed: z.array(ItemSchema),
  comingUp: z.array(ItemSchema),
  attention: z.array(ItemSchema).max(2),
  noNews: z.array(z.string()),
  searchSuggestionsHtml: z.string().optional(),
});
