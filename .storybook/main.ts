import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { dirname, join } from 'path';

const config: StorybookConfig = {
  stories: [
    // Only include src/stories directory to avoid duplicates
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    // Essentials includes docs, controls, actions, viewport, background
    {
      name: '@storybook/addon-essentials',
      options: {
        // Disable addons that might cause conflicts
        backgrounds: false,
        measure: false,
        outline: false,
      },
    },
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: true,
    },
  },
  core: {
    disableTelemetry: true,
    // Disable the telemetry banner
    enableCrashReports: false,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': join(process.cwd(), './src'),
        },
      },
      define: {
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
        },
      },
    });
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  staticDirs: ['../public'],
};

export default config;