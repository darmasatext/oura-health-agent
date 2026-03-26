'use client';

import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Algo salió mal
            </h2>
            <p className="text-muted-foreground mb-4">
              Ocurrió un error al cargar esta sección. Por favor, intenta recargar la página.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Recargar página
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
