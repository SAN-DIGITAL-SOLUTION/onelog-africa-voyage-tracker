import posthog from 'posthog-js';

export function initPostHog() {
  posthog.init('TON_API_KEY', {
    api_host: 'https://app.posthog.com',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug();
    },
  });
}

export default posthog;
