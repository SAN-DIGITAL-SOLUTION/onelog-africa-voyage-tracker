import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './Layout';

const meta: Meta<typeof Layout> = {
  title: 'UI/Layout',
  component: Layout,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    children: 'Contenu de la page',
  },
};
