import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HouseRules } from "./house-rules";

const meta = {
  title: "Pitch/House rules",
  component: HouseRules,
} satisfies Meta<typeof HouseRules>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
