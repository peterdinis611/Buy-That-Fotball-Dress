import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConcoursePulse } from "./concourse-pulse";

const meta = {
  title: "Pitch/Concourse pulse",
  component: ConcoursePulse,
  args: {
    live: 7,
    listed: 7,
  },
} satisfies Meta<typeof ConcoursePulse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Busy: Story = {};

export const OneShirt: Story = {
  args: { live: 1, listed: 1 },
};
