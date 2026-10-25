"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setSoundOn, sound, soundOn } from "@/lib/sound";

// On/off switch for interface sounds (started by SoundRoot).
export function SoundToggle({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(soundOn());
  }, []);

  return (
    <button
      onClick={() => {
        setSoundOn(!on);
        setOn(!on);
        if (!on) sound("toggle");
      }}
      aria-pressed={on}
      aria-label={`Sounds ${on ? "on" : "off"}`}
      title={`Sounds ${on ? "on" : "off"}`}
      className="flex items-center gap-2 rounded-lg px-1 py-1 text-[12px] text-muted-foreground hover:text-ink"
    >
      {on ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
      {!compact && `Sounds ${on ? "on" : "off"}`}
    </button>
  );
}
