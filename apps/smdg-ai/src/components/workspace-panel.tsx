import { Builder, type BuilderRef, type ISchema } from "@ldc/autoform";
import { cn } from "@ldc/ui";
import { X, FileText, GitBranch } from "lucide-react";
import { useRef } from "react";
import { useWorkspaceStore } from "../stores/workspace-store";
import { FlowchartViewer } from "./flowchart-viewer";

export function WorkspacePanel() {
  const { isOpen, mode, data, steps, close, toggle } = useWorkspaceStore();

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col border-l border-border bg-background transition-[width,opacity] duration-300",
        isOpen ? "w-80 opacity-100" : "w-0 overflow-hidden opacity-0 pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Header — always mounted so close animation plays */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => toggle("flowchart")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "flowchart"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GitBranch aria-hidden="true" className="size-3.5" />
            Flowchart
          </button>
          <button
            type="button"
            onClick={() => toggle("form")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "form"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileText aria-hidden="true" className="size-3.5" />
            Form
          </button>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Đóng workspace"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
        {mode === "flowchart" && <FlowchartViewer steps={steps} />}
        {mode === "form" && <FormContent data={data} />}
      </div>
    </div>
  );
}

function FormContent({ data }: { data: unknown }) {
  const schema = (data as { schema?: ISchema } | null)?.schema;
  const builderRef = useRef<BuilderRef>(null);

  if (!schema?.fields?.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Không có form để hiển thị
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Builder
        ref={builderRef}
        schema={schema}
        onSubmit={(values) => {
          // TODO(Phase 5): wire to real API
          console.info("[WorkspacePanel] form submitted:", values);
        }}
      />
      <button
        type="button"
        onClick={() => builderRef.current?.onSubmit()}
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Xác nhận
      </button>
    </div>
  );
}
