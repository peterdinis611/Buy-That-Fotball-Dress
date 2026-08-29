"use client";

import { useLights } from "@/hooks/use-lights";

export function LightsSwitch() {
  const { lights, set } = useLights();

  return (
    <div className="lights-switch" role="group" aria-label="Pitch lights">
      <button
        type="button"
        aria-pressed={lights === "day"}
        onClick={() => set("day")}
      >
        Day
      </button>
      <button
        type="button"
        aria-pressed={lights === "night"}
        onClick={() => set("night")}
      >
        Night
      </button>
    </div>
  );
}
