"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLights } from "@/hooks/use-lights";

const lightsClass =
  "h-auto min-w-[3.4rem] flex-1 rounded-none border-0 bg-transparent px-[0.45rem] py-[0.1rem] font-[family-name:var(--font-display)] text-[0.95rem] tracking-[0.14em] text-[var(--bib)] uppercase shadow-none hover:bg-transparent hover:text-[var(--bib)] focus-visible:ring-0 data-[state=on]:bg-[var(--bib)] data-[state=on]:text-[var(--stud)]";

export function LightsSwitch() {
  const { lights, set } = useLights();

  return (
    <ToggleGroup
      value={[lights]}
      onValueChange={(next) => {
        const pick = next[0];
        if (pick === "day" || pick === "night") set(pick);
      }}
      spacing={0}
      className="lights-switch !grid w-auto rounded-none"
      aria-label="Pitch lights"
    >
      <ToggleGroupItem value="day" className={lightsClass}>
        Day
      </ToggleGroupItem>
      <ToggleGroupItem value="night" className={lightsClass}>
        Night
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
