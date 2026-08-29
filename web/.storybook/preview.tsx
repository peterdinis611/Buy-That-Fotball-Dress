import type { Preview } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import "../src/app/globals.css";

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    lights: {
      description: "Day or night pitch",
      toolbar: {
        title: "Lights",
        items: [
          { value: "day", title: "Day" },
          { value: "night", title: "Night" },
        ],
      },
    },
  },
  initialGlobals: {
    lights: "day",
  },
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    a11y: { test: "todo" },
  },
  decorators: [
    (Story, context) => {
      const night = context.globals.lights === "night";

      useEffect(() => {
        document.documentElement.classList.toggle("dark", night);
        document.documentElement.style.colorScheme = night ? "dark" : "light";
      }, [night]);

      return (
        <div className="min-h-screen bg-[var(--ground)] font-[family-name:var(--font-body)] text-[var(--ink)]">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
