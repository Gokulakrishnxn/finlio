"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Landmark,
  MessageCircle,
  Newspaper,
  PieChart,
  PiggyBank,
  Scale,
  SquarePen,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { MessageScroller } from "@/components/agents/message";
import { PromptInput } from "@/components/agents/prompt-input";
import { ThinkingShimmer } from "@/components/agents/loading-states/thinking-shimmer";
import { useChatUI } from "@/components/chat/chat-context";
import { answer, QUESTIONS, useDemoMode, useTodaysBrief } from "@/lib/demo-data";
import { todayLocal } from "@/lib/format";
import { activeLocale } from "@/lib/locale";
import { allocation } from "@/lib/networth";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";
import { cn } from "@/lib/utils";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; error?: boolean };

const ICONS: LucideIcon[] = [Newspaper, PieChart, PiggyBank, Landmark, Scale, TrendingUp];
const STARTERS = QUESTIONS.map((text, i) => ({ icon: ICONS[i], text }));

// **bold** inside a line of model text (no HTML from the model is ever rendered).
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

// Paragraphs, "- " bullets, "1. " numbered lists and "#" headings.
function Formatted({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i} className="flex flex-col gap-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-gain" />
                  <span>
                    <Inline text={l.replace(/^\s*[-•*]\s+/, "")} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={i} className="flex flex-col gap-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="nums mt-px w-4 shrink-0 text-[12px] text-muted-foreground">{j + 1}.</span>
                  <span>
                    <Inline text={l.replace(/^\s*\d+[.)]\s+/, "")} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (/^#{1,4}\s+/.test(lines[0] ?? "")) {
          return (
            <div key={i}>
              <p className="font-semibold text-ink">{lines[0].replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "")}</p>
              {lines.slice(1).map((l, j) => (
                <p key={j}>
                  <Inline text={l} />
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={i}>
            <Inline text={lines.join(" ")} />
          </p>
        );
      })}
    </div>
  );
}

function FinlioMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-xl bg-sand ring-1 ring-line", className)}>
      <Image
        src="/finlio-mark.png"
        alt=""
        width={1024}
        height={1024}
        className="size-[62%] mix-blend-multiply dark:mix-blend-screen dark:invert"
      />
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: nothing to do.
        }
      }}
      aria-label={copied ? "Copied" : "Copy answer"}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-muted-foreground hover:bg-sand hover:text-ink"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function FinlioChat() {
  const { open, setOpen } = useChatUI();
  const { ready, profile, assets = [] } = useStore();
  const { worth, items, thisMonth, month, positions } = useMoney();
  const demo = useDemoMode();
  const { brief } = useTodaysBrief(positions, activeLocale().country);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const todays = ready && brief?.date === todayLocal() ? brief : undefined;

  // What Finlio knows about this person's money: totals and percentages only.
  const context = useMemo(() => {
    if (!ready) return null;
    const alloc = allocation(worth.stocks, assets);
    const allocTotal = alloc.reduce((s, a) => s + a.amount, 0);
    const spending = new Map<string, number>();
    for (const i of items) {
      if (i.type === "expense" && i.date.startsWith(month)) spending.set(i.category, (spending.get(i.category) ?? 0) + i.amount);
    }
    return {
      today: todayLocal(),
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
  }, [ready, worth, assets, items, month, thisMonth, positions, todays, profile]);

  // Shown in the header so people can see exactly what the chat is working from.
  const knows = [
    "your totals",
    positions.length ? `${positions.length} ${positions.length === 1 ? "stock" : "stocks"}` : null,
    todays ? "today's brief" : null,
  ].filter(Boolean);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy || !context) return;
    const history: ChatMessage[] = [
      ...messages.filter((m) => !m.error),
      { id: crypto.randomUUID(), role: "user", content: question },
    ];
    const replyId = crypto.randomUUID();
    setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
    setDraft("");
    setBusy(true);
    sound("tap");
    abort.current = new AbortController();

    const write = (content: string, error = false) =>
      setMessages((all) => all.map((m) => (m.id === replyId ? { ...m, content, error } : m)));

    // Demo mode answers the suggested questions straight from this data,
    // revealed a few words at a time like a streamed reply.
    const canned = demo ? answer(question, { positions, assets, items, month, thisMonth, worth, brief: todays }) : undefined;
    if (canned) {
      const words = canned.split(/(\s+)/);
      await new Promise((r) => setTimeout(r, 650));
      for (let i = 0; i <= words.length; i += 3) {
        if (abort.current.signal.aborted) break;
        write(words.slice(0, i).join(""));
        await new Promise((r) => setTimeout(r, 28));
      }
      write(canned);
      sound("ready");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          context,
          country: activeLocale().country,
        }),
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
      if (abort.current?.signal.aborted) write("Stopped.", true);
      else write(err instanceof Error ? err.message : "Finlio couldn't answer right now.", true);
    } finally {
      setBusy(false);
    }
  }

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const followUps = QUESTIONS.filter((f) => !asked.has(f)).slice(0, 3);
  const last = messages[messages.length - 1];
  const firstName = profile?.name?.trim().split(" ")[0];

  return (
    <aside
      aria-label="Finlio chat"
      className={cn(
        "flex flex-col overflow-hidden border-line bg-card",
        // Docked card on wide screens, full-height sheet over the page otherwise.
        "fixed inset-y-0 right-0 z-40 w-full max-w-[420px] border-l shadow-2xl",
        "xl:sticky xl:top-2 xl:z-auto xl:h-[calc(100vh-1rem)] xl:w-[400px] xl:shrink-0 xl:rounded-3xl xl:border xl:shadow-none",
        // Removed from the page when closed: an off-screen panel would make phones zoom out.
        open ? "animate-in slide-in-from-right duration-300 xl:animate-none" : "hidden",
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <FinlioMark className="size-9" />
          <div className="min-w-0">
            <p className="text-[15px] leading-tight font-semibold text-ink">Finlio</p>
            <p className="truncate text-[12px] text-muted-foreground" title="What Finlio chat can see">
              Knows {knows.join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <button
            onClick={() => {
              abort.current?.abort();
              setMessages([]);
            }}
            disabled={!messages.length}
            aria-label="New chat"
            title="New chat"
            className="rounded-lg p-2 text-muted-foreground hover:bg-sand hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <SquarePen className="size-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            title="Close (Esc)"
            className="rounded-lg p-2 text-muted-foreground hover:bg-sand hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col justify-end overflow-y-auto px-5 pb-5">
          <FinlioMark className="mb-4 size-12 rounded-2xl" />
          <p className="text-[22px] leading-snug font-semibold tracking-tight text-ink">
            {firstName ? `Hi ${firstName}.` : "Hi there."}
            <br />
            <span className="text-muted-foreground">What would you like to understand?</span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {STARTERS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                onClick={() => send(text)}
                className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-card p-3 text-left text-[13px] leading-snug text-body transition-colors hover:border-gain/50 hover:bg-sand hover:text-ink"
              >
                <Icon className="size-4 text-success" strokeWidth={1.75} />
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageScroller
          className="min-h-0 flex-1"
          contentClassName="flex flex-col gap-6 px-5 py-5"
          busy={busy}
          label="Finlio chat"
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-1">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[14px] leading-relaxed text-ink">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-1">
                <FinlioMark className="mt-0.5 size-7 rounded-lg" />
                <div className="min-w-0 flex-1 text-[14px] leading-relaxed text-body">
                  {m.content ? (
                    m.error ? (
                      <p className="rounded-xl bg-danger-soft px-3 py-2 text-[13px] text-loss">{m.content}</p>
                    ) : (
                      <>
                        <Formatted text={m.content} />
                        {!(busy && m.id === last?.id) && (
                          <div className="mt-2 -ml-1.5">
                            <CopyButton text={m.content} />
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <ThinkingShimmer>Reading your numbers…</ThinkingShimmer>
                  )}
                </div>
              </div>
            ),
          )}
          {!busy && last?.role === "assistant" && !last.error && followUps.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-10">
              {followUps.map((f) => (
                <button
                  key={f}
                  onClick={() => send(f)}
                  className="rounded-full border border-line px-3 py-1.5 text-[12px] text-body transition-colors hover:border-gain/50 hover:bg-sand hover:text-ink"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
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
          placeholder="Ask about your money…"
          aria-label="Ask Finlio"
          className="rounded-2xl"
        />
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
          <span className="hidden sm:inline">Enter to send</span>
          <span>Finlio explains; it doesn&apos;t advise.</span>
        </div>
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
      data-tour="chat"
      className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
    >
      <MessageCircle className="size-4" />
      Ask Finlio
      <kbd className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[11px] font-normal">⌘L</kbd>
    </button>
  );
}
