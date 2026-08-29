import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LightsSwitch } from "./lights-switch";
import { MatchClock } from "./match-clock";

const meta = {
  title: "Layout/LED strip",
  component: LightsSwitch,
  decorators: [
    (Story) => (
      <div className="led-strip flex items-center justify-between gap-4 bg-[var(--stud)] px-5 py-1.5 font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-[var(--bib)]">
        <span className="flex items-center gap-2">
          <span className="live-dot size-2 rounded-full bg-[var(--led)]" />
          Live auctions
        </span>
        <span className="flex items-center gap-3">
          <MatchClock />
          <Story />
        </span>
      </div>
    ),
  ],
} satisfies Meta<typeof LightsSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strip: Story = {};
