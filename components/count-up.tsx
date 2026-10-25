"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Counts up from the previous value to the new one; respects reduced motion.
export function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = { n: shown.current };
      gsap.to(state, {
        n: value,
        duration: reduce ? 0 : 0.9,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = format(state.n);
          shown.current = state.n;
        },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
