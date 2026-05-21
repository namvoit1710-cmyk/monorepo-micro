import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import type { ISchema } from "@ldc/autoform";
import { ToolFallback } from "@ldc/chat-sdk";
import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "../stores/workspace-store";

interface ShowFormArgs {
  schema: ISchema;
  title?: string;
}

export const ShowFormToolRenderer: ToolCallMessagePartComponent<ShowFormArgs> = (props) => {
  const { args } = props;
  const { open } = useWorkspaceStore();
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current && args?.schema) {
      open("form", { schema: args.schema });
      opened.current = true;
    }
  }, [args, open]);

  return <ToolFallback {...props} />;
};

ShowFormToolRenderer.displayName = "ShowFormToolRenderer";
