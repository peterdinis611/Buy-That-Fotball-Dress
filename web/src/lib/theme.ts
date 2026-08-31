export const LIGHTS_KEY = "kit-vault-lights";

export type Lights = "day" | "night";

export function lightsFromDocument(): Lights {
  if (typeof document === "undefined") return "day";
  return document.documentElement.classList.contains("dark") ? "night" : "day";
}

export function applyLights(lights: Lights) {
  document.documentElement.classList.toggle("dark", lights === "night");
  document.documentElement.style.colorScheme = lights === "night" ? "dark" : "light";
  localStorage.setItem(LIGHTS_KEY, lights);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", lights === "night" ? "#10140f" : "#cfd3ce");
}

export const lightsBootScript = `(function(){try{var k=${JSON.stringify(LIGHTS_KEY)};var s=localStorage.getItem(k);var n=s==="night"||(s!=="day"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(n){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.style.colorScheme="light"}}catch(e){}})();`;
