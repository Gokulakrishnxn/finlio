"use client";

import { useEffect, useState } from "react";

const WORDS = [
  { text: "moved", color: "text-info" },
  { text: "grew", color: "text-success" },
  { text: "dipped", color: "text-warning" },
  { text: "changed", color: "text-purple" },
];

// "Know why your money ___." The word swaps every few seconds.
export function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2400);
    return () => clearInterval(timer);
  }, []);

  const word = WORDS[i];
  return (
    <span className="inline-block">
      <span className="sr-only">moved</span>
      <span
        key={word.text}
        aria-hidden
        className={`inline-block animate-in fade-in slide-in-from-bottom-3 duration-500 ${word.color}`}
      >
        {word.text}
      </span>
    </span>
  );
}
