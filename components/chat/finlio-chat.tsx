"use client";

import { useMemo, useRef, useState } from "react";
import { Eraser, MessageCircle, X } from "lucide-react";
import { Message, MessageContent, MessageScroller } from "@/components/agents/message";
import { PromptInput } from "@/components/agents/prompt-input";
import { ThinkingShimmer } from "@/components/agents/loading-states/thinking-shimmer";
import { useChatUI } from "@/components/chat/chat-context";
import { todayIST } from "@/lib/format";
import { allocation } from "@/lib/networth";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";
import { cn } from "@/lib/utils";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why did my stocks move today?",
  "Where did most of my money go this month?",
  "How much did I save this month?",
  "Explain my net worth in simple words",
];

// Plain text with "- " bullets and blank-line paragraphs; no HTML from the model.
function Formatted({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i} className="flex flex-col gap-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[9px] size-1 shrink-0 rounded-full bg-current opacity-50" />
                  <span>{l.replace(/^\s*[-•*]\s+/, "").replace(/\*\*/g, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}

export function FinlioChat() {
  const { open, setOpen } = useChatUI();
  const { brief, ready, profile } = useStore();
  const { worth, items, thisMonth, month, positions } = useMoney();
  const { assets } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  // What Finlio knows about this person's money: totals and percentages only.
  const context = useMemo(() => {
    if (!ready) return null;
    const alloc = allocation(worth.stocks, assets);
    const allocTotal = alloc.reduce((s, a) => s + a.amount, 0);
    const spending = new Map<string, number>();
    for (const i of items) {
      if (i.type === "expense" && i.date.startsWith(month)) spending.set(i.category, (spending.get(i.category) ?? 0) + i.amount);
    }
    const todays = brief?.date === todayIST() ? brief : undefined;
    return {
      today: todayIST(),
      netWorth: Math.round(worth.netWorth),
      assets: Math.round(worth.assets),
      loans: Math.round(worth.loans),
      month: thisMonth,
      spendingByCategory: [...spending.entries()].map(([category, amount]) => ({ category, amount })),
      allocation: alloc.map((a) => ({ label: a.label, percent: allocTotal ? Math.round((a.amount / allocTotal) * 100) : 0 })),
      stocks: positions.map((p) => ({
        symbol: p.holding.symbol,
        name: p.holding.name,
        dayChangePct: p.dayChangePct,
        gainPct: p.gainPct,
      })),
      profile: profile ? { name: profile.name, goal: profile.goal } : undefined,
      brief: todays
        ? [...todays.changed, ...todays.comingUp, ...todays.attention].map((b) => `${b.symbol ?? ""} ${b.text}`.trim())
        : [],
    };
  }, [ready, worth, assets, items, month, thisMonth, positions, brief, profile]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy || !context) return;
    const history: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", content: question }];
    const replyId = crypto.randomUUID();
    setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
    setDraft("");
    setBusy(true);
    abort.current = new AbortController();

    const write = (content: string) =>
      setMessages((all) => all.map((m) => (m.id === replyId ? { ...m, content } : m)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), context }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Finlio couldn't answer right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        write(answer);
      }
      sound("ready");
    } catch (err) {
      if (!abort.current?.signal.aborted) {
        write(err instanceof Error ? err.message : "Finlio couldn't answer right now.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="Finlio chat"
      className={cn(
        "flex flex-col overflow-hidden border-line bg-card",
        // Docked card on wide screens, full-height sheet over the page otherwise.
        "fixed inset-y-0 right-0 z-40 w-full max-w-[420px] border-l shadow-2xl transition-transform duration-300",
        "xl:sticky xl:top-2 xl:z-auto xl:h-[calc(100vh-1rem)] xl:w-[380px] xl:shrink-0 xl:rounded-3xl xl:border xl:shadow-none",
        open ? "translate-x-0" : "translate-x-full xl:hidden",
      )}
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#7ee29a,#34c759_55%,#1f7a3a)] text-[#102b18]">
            <MessageCircle className="size-4" />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Finlio chat</p>
            <p className="text-[11px] text-muted-foreground">Ask about your money · ⌘L</p>
          </div>
        </div>
        <div className="flex gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              aria-label="Start a new chat"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-ink"
            >
              <Eraser className="size-4" />
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto px-5 pb-4">
          <p className="text-[20px] leading-snug font-semibold tracking-tight text-ink">
            Hi. Ask me anything about your money.
          </p>
          <p className="mb-3 text-[13px] text-muted-foreground">
            I see your totals and today&apos;s brief, never your transactions. I explain; I don&apos;t advise.
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-xl border border-line px-3.5 py-2.5 text-left text-[13px] text-body transition-colors hover:bg-sand hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <MessageScroller className="min-h-0 flex-1" contentClassName="flex flex-col gap-4 px-5 py-5" busy={busy} label="Finlio chat">
          {messages.map((m) => (
            <Message key={m.id} from={m.role} animateIn>
              <MessageContent
                className={cn(
                  "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-sand text-ink",
                )}
              >
                {m.content ? (
                  <Formatted text={m.content} />
                ) : (
                  <ThinkingShimmer>Reading your numbers…</ThinkingShimmer>
                )}
              </MessageContent>
            </Message>
          ))}
        </MessageScroller>
      )}

      <div className="border-t border-line p-3">
        <PromptInput
          value={draft}
          onValueChange={setDraft}
          onSubmit={(value) => send(value)}
          loading={busy}
          onStop={() => abort.current?.abort()}
          minRows={1}
          maxRows={6}
          placeholder="Ask Finlio about your money…"
          aria-label="Ask Finlio"
        />
      </div>
    </aside>
  );
}

// Floating button that opens the panel when it's closed.
export function ChatLauncher() {
  const { open, setOpen } = useChatUI();
  if (open) return null;
  return (
    <button
      onClick={() => {
        setOpen(true);
        sound("open");
      }}
      className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
    >
      <MessageCircle className="size-4" />
      Ask Finlio
      <kbd className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[11px] font-normal">⌘L</kbd>
    </button>
  );
}
