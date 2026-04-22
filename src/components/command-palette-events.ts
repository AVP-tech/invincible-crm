"use client";

export const OPEN_COMMAND_PALETTE_EVENT = "invinciblecrm:open-command-palette";

export function openCommandPalette() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}
