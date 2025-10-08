import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth';
import { RoleProvider } from './hooks/useRole';
import ErrorBoundary from './components/ErrorBoundary';

// Désactiver Sentry temporairement pour debug
// import { initSentry } from './lib/monitoring/sentry'
// initSentry()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </AuthProvider>
  </ErrorBoundary>
);
