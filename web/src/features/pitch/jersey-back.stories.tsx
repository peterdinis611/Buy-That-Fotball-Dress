import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { JerseyBack } from "./jersey-back";

const meta = {
  title: "Pitch/Jersey back",
  component: JerseyBack,
  args: {
    number: "09",
    color: "red",
    className: "h-64 w-52",
  },
} satisfies Meta<typeof JerseyBack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Red: Story = {};

export const White: Story = {
  args: { color: "white", number: "07" },
};

export const Blue: Story = {
  args: { color: "blue", number: "10" },
};

export const Yellow: Story = {
  args: { color: "yellow", number: "01" },
};

export const Ghost: Story = {
  args: { ghost: true, number: "00" },
};
