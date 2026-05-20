import { CheckCircle, Loader2, XCircle, Circle } from "lucide-react";
import { cn } from "@ldc/ui";
import type { AgentStep } from "../mocks/mock-data";

interface FlowchartViewerProps {
  steps: AgentStep[];
}

export function FlowchartViewer({ steps }: FlowchartViewerProps) {
  if (steps.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Đang chờ agent xử lý...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-start gap-3 px-1">
          <div className="relative flex flex-col items-center">
            <StepIcon status={step.status} />
            {i < steps.length - 1 && (
              <div className="mt-1 min-h-5 w-px flex-1 bg-border" />
            )}
          </div>
          <p
            className={cn(
              "pt-0.5 text-sm leading-5",
              step.status === "complete" && "text-foreground",
              step.status === "running" && "font-medium text-primary",
              step.status === "pending" && "text-muted-foreground",
              step.status === "error" && "text-destructive",
            )}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function StepIcon({ status }: { status: AgentStep["status"] }) {
  if (status === "running") {
    return <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin text-primary" />;
  }
  if (status === "complete") {
    return <CheckCircle aria-hidden="true" className="size-4 shrink-0 text-green-500" />;
  }
  if (status === "error") {
    return <XCircle aria-hidden="true" className="size-4 shrink-0 text-destructive" />;
  }
  return <Circle aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/40" />;
}
