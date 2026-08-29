import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusPill } from "./status-pill";

const meta = {
  title: "Auctions/Status pill",
  component: StatusPill,
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: { status: "Live" },
};

export const Ended: Story = {
  args: { status: "Finished" },
};

export const Unsold: Story = {
  args: { status: "ReserveNotMet" },
};
