import type { Meta, StoryObj } from "@storybook/nextjs";

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
    onClick: () => alert("Button clicked!"),
    children: "Default Button",
  },
};

export const destructive: Story = {
  args: {
    labelKey: "label",
    variant: "destructive",
    size: "sm",
    onClick: () => alert("Button clicked!"),
    children: "Destructive Button",
    className: "border-2 border-black",
  },
};

export const outline: Story = {
  args: {
    variant: "outline",
    size: "sm",
    children: "Outline Button",
  },
};

export const secondary: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    asChild: false,
    children: "Secondary Button",
  },
};

export const ghost: Story = {
  args: {
    variant: "ghost",
    size: "sm",
    children: "Ghost Button",
  },
};

export const link: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: "Link",
  },
};
