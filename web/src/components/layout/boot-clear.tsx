"use client";

import { useEffect } from "react";

const FADE_MS = 480;

export function BootClear() {
  useEffect(() => {
    const boot = document.getElementById("kit-boot");
    if (!boot) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 80 : 780;
    let gone = false;

    const hide = window.setTimeout(() => {
      boot.setAttribute("data-ready", "true");
      window.setTimeout(() => {
        if (!gone) boot.remove();
      }, FADE_MS);
    }, hold);

    return () => {
      gone = true;
      window.clearTimeout(hide);
    };
  }, []);

  return null;
}
