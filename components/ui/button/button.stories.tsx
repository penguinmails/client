import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "components/ui/button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A customizable button component with various variants and sizes.",
      },
    },
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: false,
    onClick: fn(),
    children: "Default Button",
  },
};

export const Destructive: Story = {
  args: {
    labelKey: "label",
    variant: "destructive",
    size: "sm",
    onClick: fn(),
    children: "Destructive Button",
    className: "border-2 border-black",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    size: "sm",
    children: "Outline Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    asChild: false,
    children: "Secondary Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "sm",
    children: "Ghost Button",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: "Link",
  },
};

export const Loading: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: true,
    children: (
      <>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>Loading...</span>
      </>
    ),
  },
};

export const LoadingOutline: Story = {
  args: {
    variant: "outline",
    size: "sm",
    disabled: true,
    children: (
      <>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>Processing...</span>
      </>
    ),
  },
};

export const Error: Story = {
  args: {
    variant: "destructive",
    size: "sm",
    onClick: fn(),
    children: "Error Action",
  },
};

export const Success: Story = {
  args: {
    variant: "default",
    size: "sm",
    onClick: fn(),
    children: "Success Action",
    className: "bg-green-600 hover:bg-green-700",
  },
};