import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service if needed
    // console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Une erreur est survenue</h1>
          <p className="mb-4 text-red-600">Désolé, une erreur inattendue a été détectée dans l’application.</p>
          <pre className="bg-red-100 text-red-900 p-4 rounded-lg max-w-xl overflow-x-auto text-xs">
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700">Recharger la page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
