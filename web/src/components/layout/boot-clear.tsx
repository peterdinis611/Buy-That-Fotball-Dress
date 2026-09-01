"use client";

import { useEffect } from "react";

export function BootClear() {
  useEffect(() => {
    const boot = document.getElementById("kit-boot");
    if (!boot) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 80 : 780;
    const hide = window.setTimeout(() => {
      boot.setAttribute("data-ready", "true");
      boot.setAttribute("aria-hidden", "true");
      boot.setAttribute("inert", "");
    }, hold);

    return () => window.clearTimeout(hide);
  }, []);

  return null;
}
