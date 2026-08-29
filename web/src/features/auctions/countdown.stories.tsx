import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Countdown } from "./countdown";
import { daysFromNow } from "@/stories/fixtures";

const meta = {
  title: "Auctions/Countdown",
  component: Countdown,
  args: {
    className: "led-num text-5xl",
  },
  decorators: [
    (Story) => (
      <div className="sub-board p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: { endsAt: daysFromNow(2) },
};

export const EndingSoon: Story = {
  args: { endsAt: daysFromNow(0.01) },
};

export const Ended: Story = {
  args: { endsAt: daysFromNow(-1) },
};
