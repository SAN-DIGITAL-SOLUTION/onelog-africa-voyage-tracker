import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Configuration Sentry pour OneLog Africa
 */
export const initSentry = () => {
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new BrowserTracing({
        // Tracer les navigations automatiquement
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session replay pour debug
    replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filtres d'erreurs
    beforeSend(event, hint) {
      // Ignorer les erreurs de développement
      if (environment === 'development') {
        console.error('Sentry captured error:', hint.originalException);
      }
      
      // Filtrer les erreurs non critiques
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignorer les erreurs réseau temporaires
        if (error.message.includes('NetworkError') || 
            error.message.includes('fetch')) {
          return null;
        }
        
        // Ignorer les erreurs d'extension de navigateur
        if (error.stack?.includes('extension://')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Tags par défaut
    initialScope: {
      tags: {
        component: 'onelog-africa',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    },
  });
};

/**
 * Wrapper pour capturer les erreurs métier
 */
export const captureBusinessError = (
  error: Error,
  context: {
    user?: string;
    action?: string;
    module?: string;
    data?: Record<string, any>;
  }
) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'business');
    scope.setContext('business_context', context);
    
    if (context.user) {
      scope.setUser({ id: context.user });
    }
    
    if (context.module) {
      scope.setTag('module', context.module);
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Tracer les performances des opérations critiques
 */
export const traceOperation = async <T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> => {
  return await Sentry.startSpan(
    {
      name,
      op: 'function',
      tags,
    },
    async () => {
      try {
        return await operation();
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    }
  );
};

/**
 * Métriques personnalisées pour OneLog Africa
 */
export const trackMetrics = {
  missionCreated: (duration: number, success: boolean) => {
    Sentry.addBreadcrumb({
      category: 'mission',
      message: 'Mission created',
      level: success ? 'info' : 'error',
      data: { duration, success },
    });
  },
  
  trackingUpdate: (missionId: string, accuracy: number) => {
    Sentry.addBreadcrumb({
      category: 'tracking',
      message: 'GPS position updated',
      level: 'info',
      data: { missionId, accuracy },
    });
  },
  
  notificationSent: (type: string, success: boolean, retries?: number) => {
    Sentry.addBreadcrumb({
      category: 'notification',
      message: `${type} notification sent`,
      level: success ? 'info' : 'warning',
      data: { type, success, retries },
    });
  },
  
  performanceIssue: (operation: string, duration: number, threshold: number) => {
    if (duration > threshold) {
      Sentry.captureMessage(
        `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        'warning'
      );
    }
  },
};

export default Sentry;
