// Simple analytics event tracker (stub)
import posthog from '../lib/posthog';

export function trackEvent(event: string, properties: Record<string, any> = {}) {
  posthog.capture(event, properties);
}
