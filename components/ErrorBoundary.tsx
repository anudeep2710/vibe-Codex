import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        <div className="glass-card p-8 text-center">
                            {/* Error Icon */}
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>

                            {/* Error Title */}
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-muted mb-6">
                                The application encountered an unexpected error.
                            </p>

                            {/* Error Details */}
                            {this.state.error && (
                                <div className="bg-[#0d1117] border border-red-500/20 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-sm font-bold text-red-400 mb-2">
                                        Error: {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-muted">
                                            <summary className="cursor-pointer hover:text-white mb-2">
                                                Stack trace
                                            </summary>
                                            <pre className="overflow-x-auto bg-[#000000]/30 p-2 rounded text-red-300">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={this.handleReset}
                                    className="px-6 py-3 bg-accent hover:bg-blue-400 text-white rounded-lg font-medium flex items-center space-x-2 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Try Again</span>
                                </button>
                                <button
                                    onClick={this.handleReload}
                                    className="px-6 py-3 bg-surface hover:bg-elevated border border-border text-white rounded-lg font-medium flex items-center space-x-2 transition-all"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Reload Page</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
