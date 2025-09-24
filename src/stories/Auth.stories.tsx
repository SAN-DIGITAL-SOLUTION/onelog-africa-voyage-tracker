import type { Meta, StoryObj } from '@storybook/react';
import Auth from '../pages/Auth';

const meta = {
  title: 'Pages/Auth',
  component: Auth,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Auth>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story (Login state)
export const Default: Story = {
  args: {
    // Default props for the login state
  },
  parameters: {
    // This will be the default story when navigating to the component
    docs: {
      description: {
        story: 'Default login state of the authentication form.',
      },
    },
  },
};

// Login state
export const Login: Story = {
  args: {
    // Default props for the login state
  },
  parameters: {
    // This will be an alternative story
    docs: {
      description: {
        story: 'Login state of the authentication form (same as default).',
      },
    },
  },
};

// Signup state
export const Signup: Story = {
  args: {
    // This will be handled by the component's internal state
  },
  parameters: {
    // Force the component to show signup state
    docs: {
      description: {
        story: 'Click the "Create an account" link to see the signup form.',
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  args: {
    // The loading state is handled by the component's internal state
  },
  parameters: {
    docs: {
      description: {
        story: 'This shows the loading state when submitting the form.',
      },
    },
  },
};
