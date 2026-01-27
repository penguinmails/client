import type { Meta, StoryObj } from "@storybook/react";
import ConversationHeader from "./conversation-header";
import ConversationMessages from "./conversation-messages";
import ConversationReplay from "./conversation-replay";

// Mock wrapper component since the detail view is composed of multiple parts
// in the real app, this is likely orchestrated by a parent page or container
const ConversationDetailView = () => {
  return (
    <div className="flex flex-col h-full bg-background">
      <ConversationHeader
        conversation={{
          id: "1",
          subject: "Re: Project Proposal",
          name: "Sarah Johnson",
          avatar: "SJ",
          isStarred: true,
          status: "read",
          tag: "interested",
          campaign: "Q1 Outreach",
          time: new Date().toISOString(),
          preview: "Preview text...",
        }}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <ConversationMessages messages={[]} />
        </div>
      </div>
      <ConversationReplay />
    </div>
  );
};

const meta = {
  title: "Inbox/ConversationDetail",
  component: ConversationDetailView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConversationDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  render: () => (
    <div className="dark h-screen w-full bg-background text-foreground">
      <ConversationDetailView />
    </div>
  ),
};
