import type { Meta, StoryObj } from '@storybook/nextjs';
import { Input } from './input';
import React from 'react';

type InputProps = React.ComponentProps<'input'>;

const meta = {
    title: 'components/ui/input',
    component: Input,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'A customizable input component with different types.',
            },
        },
        layout: 'centered',
    }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
};

export const Disabled: Story = {
    args: {
        type: 'text',
        placeholder: 'Disabled input...',
        disabled: true,
    },
};

export const Loading: Story = {
  args: {
    type: 'text',
    placeholder: 'Loading input...',
    disabled: true,
  },
  render: (args) => (
    <div className="relative">
      <Input {...args} />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  ),
};

const InputWithError = (args: InputProps) => {
  const [value, setValue] = React.useState(args.defaultValue || '');
  const hasError = !value.toString().includes('@');
  
  return (
    <div className="space-y-2">
      <Input 
        {...args} 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={hasError ? 'border-destructive focus-visible:ring-destructive/20' : ''}
      />
      {hasError && (
        <p className="text-sm text-destructive">Please enter a valid email address</p>
      )}
    </div>
  );
};

export const WithError: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your email',
    defaultValue: 'invalid-email',
  },
  render: (args) => <InputWithError {...args} />,
};

const InputWithSuccess = (args: InputProps) => {
  const [value, setValue] = React.useState(args.defaultValue || '');
  const isValid = value.toString().includes('@') && value.toString().includes('.');
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input 
          {...args} 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={isValid ? 'border-green-500 focus-visible:ring-green-500/20' : ''}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {isValid && (
        <p className="text-sm text-green-600">Valid email address</p>
      )}
    </div>
  );
};

export const Success: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
    defaultValue: 'user@example.com',
  },
  render: (args) => <InputWithSuccess {...args} />,
};

export const WithIcon: Story = {
  args: {
    type: 'text',
    placeholder: 'Search...',
  },
  render: (args) => (
    <div className="relative">
      <Input {...args} className="pl-10" />
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  ),
};