import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  name?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RemoteErrorBoundary] Remote "${this.props.name}" failed to load:`, error, info);
  }

  override render() {
    if (this.state.hasError) {
      return <RemoteErrorPage name={this.props.name} error={this.state.error} />;
    }
    return this.props.children;
  }
}

function RemoteErrorPage({ name, error }: { name?: string; error: Error | null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {name ? `"${name}" is unavailable` : "Remote module unavailable"}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This section couldn't be loaded because the remote service is not running or unreachable.
          Please start the service and refresh the page.
        </p>
      </div>

      {error && (
        <details className="w-full max-w-md text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Error details
          </summary>
          <pre className="mt-2 p-3 rounded-md bg-muted text-xs text-muted-foreground overflow-auto whitespace-pre-wrap break-all">
            {error.message}
          </pre>
        </details>
      )}

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
    </div>
  );
}
