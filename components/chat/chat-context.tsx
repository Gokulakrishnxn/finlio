"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ChatUI = { open: boolean; setOpen: (open: boolean) => void; toggle: () => void };

const ChatContext = createContext<ChatUI | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  // ⌘L / Ctrl+L opens and closes the panel, as in Cursor. Esc closes it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return <ChatContext.Provider value={{ open, setOpen, toggle }}>{children}</ChatContext.Provider>;
}

export function useChatUI() {
  const ui = useContext(ChatContext);
  if (!ui) throw new Error("useChatUI must be used inside ChatProvider");
  return ui;
}
