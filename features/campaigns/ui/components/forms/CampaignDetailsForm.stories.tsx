import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { CampaignDetailsForm } from "./CampaignDetailsForm";
import { CampaignFormValues } from "@features/campaigns/types";

// ============================================================
// Mock Data
// ============================================================

const mockSendingAccounts = [
  { value: "sales@company.com", label: "sales@company.com" },
  { value: "marketing@company.com", label: "marketing@company.com" },
  { value: "support@company.com", label: "support@company.com" },
];

const defaultFormValues: Partial<CampaignFormValues> = {
  name: "Q1 Product Launch",
  fromName: "John Smith",
  fromEmail: "sales@company.com",
  status: "DRAFT",
};

// ============================================================
// Wrapper Component
// ============================================================

function FormWrapper({ 
  children, 
  defaultValues = defaultFormValues 
}: { 
  children: (form: ReturnType<typeof useForm<CampaignFormValues>>) => React.ReactNode;
  defaultValues?: Partial<CampaignFormValues>;
}) {
  const form = useForm<CampaignFormValues>({
    defaultValues: defaultValues as CampaignFormValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        {children(form)}
      </form>
    </Form>
  );
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof CampaignDetailsForm> = {
  title: "Features/Campaigns/Forms/CampaignDetailsForm Comparison",
  component: CampaignDetailsForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visual comparison between legacy CampaignDetailsForm and migrated version using Design System UnifiedFormField.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground min-h-screen p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CampaignDetailsForm>;

// ============================================================
// Stories
// ============================================================

export const Default: Story = {
  render: () => (
    <FormWrapper>
      {(form) => (
        <CampaignDetailsForm
          form={form}
          sendingAccounts={mockSendingAccounts}
        />
      )}
    </FormWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Migrated campaign details form with default values.",
      },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <FormWrapper defaultValues={{}}>
      {(form) => (
        <CampaignDetailsForm
          form={form}
          sendingAccounts={mockSendingAccounts}
        />
      )}
    </FormWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Migrated form with empty values showing placeholders.",
      },
    },
  },
};

export const ReadOnly: Story = {
  render: () => (
    <FormWrapper>
      {(form) => (
        <CampaignDetailsForm
          form={form}
          sendingAccounts={mockSendingAccounts}
          readOnly
        />
      )}
    </FormWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: "Migrated form in read-only mode (all fields disabled).",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <FormWrapper>
      {(form) => (
        <CampaignDetailsForm
          form={form}
          sendingAccounts={mockSendingAccounts}
        />
      )}
    </FormWrapper>
  ),
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-background text-foreground min-h-screen p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Migrated form in dark mode.",
      },
    },
  },
};
