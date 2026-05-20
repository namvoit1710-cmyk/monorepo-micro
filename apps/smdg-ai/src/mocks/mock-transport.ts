import type { ChatTransport, ChatTransportEvents } from "@ldc/chat-sdk";
import { MOCK_STREAMING_SCRIPT } from "./mock-data";
import { useWorkspaceStore } from "../stores/workspace-store";

export class MockTransport implements ChatTransport {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private completionTimer: ReturnType<typeof setTimeout> | null = null;

  send(_messages: unknown[], events: ChatTransportEvents): void {
    this.cancel();

    const completionEntry = MOCK_STREAMING_SCRIPT.find((e) => e.type === "complete");
    const completionDelay = completionEntry?.delay ?? 4000;

    for (const entry of MOCK_STREAMING_SCRIPT) {
      if (entry.type === "complete") continue;

      const timer = setTimeout(() => {
        if (entry.type === "text") {
          events.onChunk({ type: "text-delta", textDelta: entry.text });
        } else if (entry.type === "reasoning") {
          events.onChunk({ type: "reasoning", step: entry.step });
        } else if (entry.type === "agent_step") {
          useWorkspaceStore.getState().updateStep(entry.step);
        } else if (entry.type === "show_workspace") {
          useWorkspaceStore.getState().open(entry.mode, { schema: entry.schema });
        }
      }, entry.delay);

      this.timers.push(timer);
    }

    this.completionTimer = setTimeout(() => {
      this.completionTimer = null;
      events.onComplete();
    }, completionDelay);
  }

  cancel(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    if (this.completionTimer !== null) {
      clearTimeout(this.completionTimer);
      this.completionTimer = null;
    }
  }

  dispose(): void {
    this.cancel();
  }
}
