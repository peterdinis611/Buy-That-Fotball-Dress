import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HowItWorks } from "./how-it-works";

const meta = {
  title: "Pitch/How it works",
  component: HowItWorks,
} satisfies Meta<typeof HowItWorks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
