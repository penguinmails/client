import type { Meta, StoryObj } from "@storybook/react";
import { ProfileSettingsForm } from "./ProfileSettingsForm";

const meta: Meta<typeof ProfileSettingsForm> = {
  title: "Settings/ProfileSettingsForm",
  component: ProfileSettingsForm,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileSettingsForm>;

/**
 * Default state with filled user profile data
 */
export const Default: Story = {
  args: {
    userProfile: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 555-123-4567",
      bio: "Software engineer passionate about building great products.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      role: "ADMIN",
      timezone: "America/New_York",
    },
  },
};

/**
 * Empty profile state (new user)
 */
export const EmptyProfile: Story = {
  args: {
    userProfile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      avatarUrl: "",
    },
  },
};

/**
 * Profile with no avatar image
 */
export const WithoutAvatar: Story = {
  args: {
    userProfile: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+1 555-987-6543",
      avatarUrl: "",
      role: "MEMBER",
      timezone: "America/Los_Angeles",
    },
  },
};

/**
 * Profile with long content to test text overflow
 */
export const LongContent: Story = {
  args: {
    userProfile: {
      firstName: "Alexander",
      lastName: "Montgomery-Richardson",
      email: "alexander.montgomery.richardson@verylongdomainname.com",
      phone: "+1 555-000-0000",
      bio: "Senior software architect with over 20 years of experience in building enterprise applications. Specialized in distributed systems, microservices, and cloud-native development.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander",
      role: "ADMIN",
      timezone: "Europe/London",
    },
  },
};
