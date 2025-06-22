import React from 'react';
// Désactivé temporairement pour le débogage
// import { initPostHog } from './lib/posthog';
// initPostHog();
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth';
import { RoleProvider } from './hooks/useRole';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <RoleProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RoleProvider>
  </ErrorBoundary>
);
