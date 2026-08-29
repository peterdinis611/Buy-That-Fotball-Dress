"use client";

import { useEffect, useState } from "react";
import { remainingParts } from "@/lib/format";

export function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() => remainingParts(endsAt));

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(remainingParts(endsAt)), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return remaining;
}
