"use client";

import { useEffect, useState } from "react";
import { remainingParts } from "@/lib/format";

export function useCountdown(endsAt: string) {
  const [ready, setReady] = useState(false);
  const [remaining, setRemaining] = useState<ReturnType<typeof remainingParts>>(null);

  useEffect(() => {
    const tick = () => setRemaining(remainingParts(endsAt));
    tick();
    setReady(true);
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return { remaining, ready };
}
