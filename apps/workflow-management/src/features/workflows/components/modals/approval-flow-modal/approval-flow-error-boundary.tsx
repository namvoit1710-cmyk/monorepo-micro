import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

interface ApprovalFlowErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

/**
 * Default fallback UI for approval flow errors
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-destructive mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
                Failed to Load Approval Flow
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
                An error occurred while rendering the approval workflow. This may be due to
                invalid data or a rendering issue.
            </p>
            <details className="text-left text-xs text-muted-foreground bg-muted p-4 rounded-md max-w-2xl">
                <summary className="cursor-pointer font-medium mb-2">
                    Error Details
                </summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                    {error?.toString()}
                </pre>
            </details>
        </div>
    );
}

/**
 * Error Boundary for Approval Flow Modal
 * Modern functional component using react-error-boundary library
 */
function ApprovalFlowErrorBoundary({
    children,
    fallback,
    onError,
}: ApprovalFlowErrorBoundaryProps) {
    const handleError = (error: Error, errorInfo: { componentStack: string }) => {
        console.error("[ApprovalFlowErrorBoundary] Error caught:", error, errorInfo);
        onError?.(error, errorInfo);
    };

    return (
        <ErrorBoundary
            FallbackComponent={fallback ? () => <>{fallback}</> : DefaultErrorFallback}
            onError={handleError}
        >
            {children}
        </ErrorBoundary>
    );
}

export default ApprovalFlowErrorBoundary;
