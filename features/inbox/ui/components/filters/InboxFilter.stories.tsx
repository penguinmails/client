import type { Meta, StoryObj } from "@storybook/react";
import InboxFilter from "./InboxFilter";

const meta = {
  title: "Inbox/InboxFilter",
  component: InboxFilter,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InboxFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-screen w-80 bg-background">
      <InboxFilter />
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark h-screen w-80 bg-background">
      <InboxFilter />
    </div>
  ),
};
