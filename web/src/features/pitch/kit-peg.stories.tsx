import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KitPeg, PegWall } from "./kit-peg";
import { cantona, kane, liveWall } from "@/stories/fixtures";

const meta = {
  title: "Pitch/Peg wall",
  component: PegWall,
} satisfies Meta<typeof PegWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wall: Story = {
  args: { listings: liveWall },
};

export const Empty: Story = {
  args: { listings: [], empty: "No shirts on this peg." },
};

export const SinglePeg: Story = {
  render: () => (
    <div className="max-w-xs">
      <KitPeg listing={kane} />
    </div>
  ),
};

export const EndedPeg: Story = {
  render: () => (
    <div className="max-w-xs">
      <KitPeg listing={cantona} />
    </div>
  ),
};
