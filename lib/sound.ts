"use client";

import { play, setEnabled, setVolume, type SoundName } from "cuelume";

const PREF_KEY = "finlio:sound";

// Interface sounds are a per-browser preference, on by default and quiet.
export function soundOn() {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // Blocked storage: the choice lasts until reload.
  }
  setEnabled(on);
}

export function initSound() {
  setVolume(0.35);
  setEnabled(soundOn());
}

export function sound(name: SoundName) {
  try {
    play(name);
  } catch {
    // Audio unavailable (no user gesture yet, or unsupported): stay silent.
  }
}
