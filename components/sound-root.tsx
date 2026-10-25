"use client";

import { useEffect } from "react";
import { bind } from "cuelume";
import { initSound } from "@/lib/sound";

// Starts interface sounds once for the whole app (data-cuelume-* attributes and play()).
export function SoundRoot() {
  useEffect(() => {
    initSound();
    return bind();
  }, []);
  return null;
}
