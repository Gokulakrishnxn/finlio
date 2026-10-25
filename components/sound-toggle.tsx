"use client";

import { useEffect, useState } from "react";
import { bind } from "cuelume";
import { Volume2, VolumeX } from "lucide-react";
import { initSound, setSoundOn, sound, soundOn } from "@/lib/sound";

// Turns on cuelume for the whole app and offers an on/off switch.
export function SoundToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    initSound();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(soundOn());
    return bind();
  }, []);

  return (
    <button
      onClick={() => {
        setSoundOn(!on);
        setOn(!on);
        if (!on) sound("toggle");
      }}
      aria-pressed={on}
      className="flex items-center gap-2 rounded-lg px-1 py-1 text-[12px] text-muted-foreground hover:text-ink"
    >
      {on ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
      Sounds {on ? "on" : "off"}
    </button>
  );
}
