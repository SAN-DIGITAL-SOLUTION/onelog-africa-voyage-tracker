import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'accent'],
    },
    children: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Accent: Story = {
  args: {
    children: 'Accent Button',
    variant: 'accent',
  },
};
