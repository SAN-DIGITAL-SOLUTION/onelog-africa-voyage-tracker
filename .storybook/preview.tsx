import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from '../src/hooks/useRole';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import '../src/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrap all stories with required providers
const withProviders = (Story) => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <MemoryRouter>
        <Story />
        <Toaster />
      </MemoryRouter>
    </RoleProvider>
  </QueryClientProvider>
);

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast', 
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;
