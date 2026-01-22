"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  UnifiedFormField,
  TextFormField,
  SelectFormField,
  CheckboxFormField,
} from "./unified-form-field";

const meta: Meta = {
  title: "Design System/Components/UnifiedFormField",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A unified form field component with support for text inputs, selects, and checkboxes. Integrates with react-hook-form for validation and error handling.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Toggle between light and dark mode",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.args.theme || "light";

      React.useEffect(() => {
        const htmlElement = document.documentElement;
        if (theme === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }

        return () => {
          htmlElement.classList.remove("dark");
        };
      }, [theme]);

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic text input field with placeholder.
 */
const TextInputForm = () => {
  const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form className="w-80 space-y-4">
        <UnifiedFormField
          control={form.control}
          name="username"
          type="text"
          label="Username"
          placeholder="Enter your username"
          required
        />
      </form>
    </Form>
  );
};

export const TextInput: Story = {
  render: () => <TextInputForm />,
};

/**
 * Email input field with email validation.
 */
const EmailInputForm = () => {
  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (_data: z.infer<typeof formSchema>) => {
    // Storybook action captured in actions panel
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-80 space-y-4">
        <TextFormField
          control={form.control}
          name="email"
          inputType="email"
          label="Email Address"
          placeholder="you@example.com"
          description="Enter a valid email address"
          required
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export const EmailInput: Story = {
  render: () => <EmailInputForm />,
};

/**
 * Password input field with minimum length validation.
 */
export const PasswordInput: Story = {
  render: () => {
    const formSchema = z.object({
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        password: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="password"
            inputType="password"
            label="Password"
            placeholder="Enter password"
            description="Must be at least 8 characters"
            required
          />
          <Button
            type="submit"
            onClick={fn()}
          >
            Submit
          </Button>
        </form>
      </Form>
    );
  },
};

/**
 * Number input field with min/max validation.
 */
export const NumberInput: Story = {
  render: () => {
    const formSchema = z.object({
      age: z.coerce
        .number()
        .min(18, "Must be at least 18")
        .max(100, "Must be under 100")
        .optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema) as any,
      defaultValues: {
        age: undefined,
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="age"
            inputType="number"
            label="Age"
            placeholder="Enter your age"
            description="Must be between 18 and 100"
            required
          />
          <Button
            type="submit"
            onClick={fn()}
          >
            Submit
          </Button>
        </form>
      </Form>
    );
  },
};

/**
 * Telephone input field.
 */
export const TelInput: Story = {
  render: () => {
    const formSchema = z.object({
      phone: z.string().regex(/^[0-9-+()\s]+$/, "Invalid phone number"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        phone: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="phone"
            inputType="tel"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            description="Enter your phone number"
          />
        </form>
      </Form>
    );
  },
};

/**
 * URL input field with URL validation.
 */
export const UrlInput: Story = {
  render: () => {
    const formSchema = z.object({
      website: z.string().url("Must be a valid URL"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        website: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="website"
            inputType="url"
            label="Website"
            placeholder="https://example.com"
            description="Enter your website URL"
          />
          <Button
            type="submit"
            onClick={fn()}
          >
            Submit
          </Button>
        </form>
      </Form>
    );
  },
};

/**
 * Select dropdown with options.
 */
export const SelectDropdown: Story = {
  render: () => {
    const formSchema = z.object({
      country: z.string().min(1, "Please select a country"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        country: "",
      },
    });

    const countries = [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "mx", label: "Mexico" },
      { value: "uk", label: "United Kingdom" },
      { value: "de", label: "Germany" },
      { value: "fr", label: "France" },
    ];

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <SelectFormField
            control={form.control}
            name="country"
            label="Country"
            placeholder="Select a country"
            options={countries}
            description="Choose your country"
            required
          />
          <Button
            type="submit"
            onClick={fn()}
          >
            Submit
          </Button>
        </form>
      </Form>
    );
  },
};

/**
 * Checkbox field with boolean value.
 */
export const CheckboxField: Story = {
  render: () => {
    const formSchema = z.object({
      terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        terms: false,
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <CheckboxFormField
            control={form.control}
            name="terms"
            label="I accept the terms and conditions"
            required
          />
          <Button
            type="submit"
            onClick={fn()}
          >
            Submit
          </Button>
        </form>
      </Form>
    );
  },
};

/**
 * Checkbox with description helper text.
 */
export const CheckboxWithDescription: Story = {
  render: () => {
    const formSchema = z.object({
      newsletter: z.boolean(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        newsletter: false,
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <CheckboxFormField
            control={form.control}
            name="newsletter"
            label="Subscribe to newsletter"
            description="Receive updates about new features and promotions"
          />
        </form>
      </Form>
    );
  },
};

/**
 * Field showing validation error state.
 */
export const WithError: Story = {
  render: () => {
    const formSchema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "invalid-email",
      },
    });

    // Trigger validation to show error
    React.useEffect(() => {
      form.trigger("email");
    }, [form]);

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="email"
            inputType="email"
            label="Email Address"
            placeholder="you@example.com"
            required
          />
        </form>
      </Form>
    );
  },
};

/**
 * Disabled field state.
 */
export const Disabled: Story = {
  render: () => {
    const formSchema = z.object({
      username: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "john_doe",
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="username"
            label="Username"
            placeholder="Enter username"
            disabled
            description="This field is disabled"
          />
        </form>
      </Form>
    );
  },
};

/**
 * Field with description/helper text.
 */
export const WithDescription: Story = {
  render: () => {
    const formSchema = z.object({
      bio: z.string().max(200, "Bio must be 200 characters or less"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        bio: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          <TextFormField
            control={form.control}
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself"
            description="Write a brief description. Maximum 200 characters."
          />
        </form>
      </Form>
    );
  },
};

/**
 * Complete form example with multiple field types.
 */
export const CompleteFormExample: Story = {
  render: () => {
    const formSchema = z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      age: z.coerce
        .number()
        .min(18, "Must be at least 18 years old")
        .max(150, "Must be under 150 years old"),
      country: z.string().min(1, "Please select a country"),
      newsletter: z.boolean(),
      terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema) as any,
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        age: undefined,
        country: "",
        newsletter: false,
        terms: false,
      },
    });

    const onSubmit = (___data: z.infer<typeof formSchema>) => {
      // Storybook action captured in actions panel
    };

    const countries = [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "mx", label: "Mexico" },
      { value: "uk", label: "United Kingdom" },
    ];

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-96 space-y-6 p-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-muted-foreground">
              Fill out the form below to create your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextFormField
              control={form.control}
              name="firstName"
              label="First Name"
              placeholder="John"
              required
            />
            <TextFormField
              control={form.control}
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              required
            />
          </div>

          <TextFormField
            control={form.control}
            name="email"
            inputType="email"
            label="Email Address"
            placeholder="you@example.com"
            description="We'll never share your email with anyone else."
            required
          />

          <TextFormField
            control={form.control}
            name="password"
            inputType="password"
            label="Password"
            placeholder="••••••••"
            description="Must be at least 8 characters"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <TextFormField
              control={form.control}
              name="age"
              inputType="number"
              label="Age"
              placeholder="18"
              required
            />
            <SelectFormField
              control={form.control}
              name="country"
              label="Country"
              placeholder="Select country"
              options={countries}
              required
            />
          </div>

          <div className="space-y-4 pt-2">
            <CheckboxFormField
              control={form.control}
              name="newsletter"
              label="Subscribe to newsletter"
              description="Receive updates about new features and promotions"
            />
            <CheckboxFormField
              control={form.control}
              name="terms"
              label="I accept the terms and conditions"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </Form>
    );
  },
};
/**
 * Layout example - Inline label layout
 */
export const InlineLabelLayout: Story = {
  render: () => {
    const formSchema = z.object({
      username: z.string(),
      email: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        email: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-96 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <TextFormField
                control={form.control as any}
                name="username"
                label="Username"
                placeholder="johndoe"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <TextFormField
                control={form.control as any}
                name="email"
                inputType="email"
                label="Email"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </form>
      </Form>
    );
  },
};

/**
 * Layout example - Responsive grid layout
 */
export const ResponsiveGridLayout: Story = {
  render: () => {
    const _FormData = {
      field1: "",
      field2: "",
      field3: "",
      field4: "",
    };

    const formSchema = z.object({
      field1: z.string(),
      field2: z.string(),
      field3: z.string(),
      field4: z.string(),
    });

    const form = useForm<{
      field1: string;
      field2: string;
      field3: string;
      field4: string;
    }>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        field1: "",
        field2: "",
        field3: "",
        field4: "",
      },
    });

    return (
      <Form {...form}>
        <form className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextFormField
              control={form.control as any}
              name="field1"
              label="Field 1"
              placeholder="Enter text"
            />
            <TextFormField
              control={form.control as any}
              name="field2"
              label="Field 2"
              placeholder="Enter text"
            />
            <TextFormField
              control={form.control as any}
              name="field3"
              label="Field 3"
              placeholder="Enter text"
            />
            <TextFormField
              control={form.control as any}
              name="field4"
              label="Field 4"
              placeholder="Enter text"
            />
          </div>
        </form>
      </Form>
    );
  },
};

/**
 * Loading state - simulating data fetch with skeleton
 */
export const LoadingState: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(true);

    const formSchema = z.object({
      username: z.string(),
      email: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        email: "",
      },
    });

    React.useEffect(() => {
      // Simulate loading
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <Form {...form}>
        <form className="w-80 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading form data...</span>
              </div>
            </div>
          ) : (
            <>
              <TextFormField
                control={form.control as any}
                name="username"
                label="Username"
                placeholder="Enter username"
              />
              <TextFormField
                control={form.control as any}
                name="email"
                inputType="email"
                label="Email"
                placeholder="Enter email"
              />
            </>
          )}
        </form>
      </Form>
    );
  },
};
