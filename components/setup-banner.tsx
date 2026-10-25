"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleDashed, X } from "lucide-react";

type Status = { gemini: boolean; upstox: boolean; google: boolean };

const ITEMS: { key: keyof Status; label: string; env: string }[] = [
  { key: "upstox", label: "Live prices", env: "UPSTOX_ANALYTICS_TOKEN" },
  { key: "gemini", label: "Today's brief", env: "GEMINI_API_KEY" },
  { key: "google", label: "Expenses", env: "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET" },
];

// Shown only when some keys are missing, so a fresh copy of Finlio explains itself.
export function SetupBanner() {
  const [status, setStatus] = useState<Status | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  if (!status || hidden || ITEMS.every((i) => status[i.key])) return null;

  return (
    <div className="mb-6 rounded-2xl bg-white p-5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-medium text-ink">Finish setting up</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Add these keys to <code className="nums">.env.local</code> and restart. See the README.
          </p>
        </div>
        <button
          onClick={() => setHidden(true)}
          aria-label="Hide setup steps"
          className="rounded-lg p-1 text-muted-foreground hover:bg-sand hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ITEMS.map(({ key, label, env }) => (
          <li key={key} className="flex min-w-0 items-start gap-2.5 rounded-xl bg-sand/70 px-3 py-2.5">
            {status[key] ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-gain" />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink">{label}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {status[key] ? "Ready" : env}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
