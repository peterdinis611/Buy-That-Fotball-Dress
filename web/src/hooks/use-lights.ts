"use client";

import { useEffect, useState } from "react";
import { applyLights, LIGHTS_KEY, lightsFromDocument, type Lights } from "@/lib/theme";

export function useLights() {
  const [lights, setLights] = useState<Lights>("day");

  useEffect(() => {
    setLights(lightsFromDocument());

    function onStorage(event: StorageEvent) {
      if (event.key !== LIGHTS_KEY) return;
      const next: Lights = event.newValue === "night" ? "night" : "day";
      document.documentElement.classList.toggle("dark", next === "night");
      document.documentElement.style.colorScheme = next === "night" ? "dark" : "light";
      setLights(next);
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function set(next: Lights) {
    applyLights(next);
    setLights(next);
  }

  return { lights, set, night: lights === "night" };
}

