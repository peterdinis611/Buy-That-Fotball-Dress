import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TunnelCta } from "./tunnel-cta";

const meta = {
  title: "Pitch/Tunnel CTA",
  component: TunnelCta,
} satisfies Meta<typeof TunnelCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
