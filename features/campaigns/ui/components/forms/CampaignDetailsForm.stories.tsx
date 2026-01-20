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

export const SideBySideComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-muted-foreground">
          🔴 Legacy CampaignDetailsForm (Deprecated)
        </h2>
        <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
          <FormWrapper>
            {(form) => (
              <CampaignDetailsForm
                form={form}
                sendingAccounts={mockSendingAccounts}
              />
            )}
          </FormWrapper>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          ✅ Migrated Form (Using UnifiedFormField)
        </h2>
        <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
          <FormWrapper>
            {(form) => (
              <CampaignDetailsForm
                form={form}
                sendingAccounts={mockSendingAccounts}
              />
            )}
          </FormWrapper>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Side-by-side comparison of legacy form vs migrated form using DS UnifiedFormField.",
      },
    },
  },
};

export const MigratedFormDefault: Story = {
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

export const MigratedFormEmpty: Story = {
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

export const MigratedFormReadOnly: Story = {
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
