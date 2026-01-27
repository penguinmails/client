import type { Meta, StoryObj } from "@storybook/react";
import ConversationsList from "./ConversationsList";

const meta = {
  title: "Inbox/ConversationsList",
  component: ConversationsList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConversationsList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockConversations = [
  {
    id: "1",
    name: "John Doe",
    avatar: "JD",
    subject: "Re: Project Proposal",
    preview: "Thanks for your email. I've reviewed the proposal and have some feedback...",
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    status: "unread" as const,
    isStarred: true,
    tag: "interested",
    campaign: "Q1 Campaign",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "JS",
    subject: "Meeting Follow-up",
    preview: "It was great meeting you yesterday. As discussed, here are the next steps...",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "read" as const,
    isStarred: false,
    tag: "follow-up",
    campaign: "Outreach 2024",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "MJ",
    subject: "Question about Services",
    preview: "I have a few questions regarding your services. Could we schedule a call?",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "read" as const,
    isStarred: false,
    tag: "not-interested",
    campaign: "Cold Outreach",
  },
];

export const Default: Story = {
  args: {
    conversations: mockConversations,
  },
};

export const Empty: Story = {
  args: {
    conversations: [],
  },
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="dark h-screen">
      <ConversationsList {...args} />
    </div>
  ),
  args: {
    conversations: mockConversations,
  },
};
