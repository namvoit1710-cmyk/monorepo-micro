# SMDG-AI Chat Page — Upgrade Plan v1

## Status: PLANNING | Author: AI Architect | Date: 2026-05-21

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Upgrade Priorities](#3-upgrade-priorities)
4. [Phase 1 — Markdown & Code Highlighting](#4-phase-1--markdown--code-highlighting)
5. [Phase 2 — Tool Call & Autoform Integration](#5-phase-2--tool-call--autoform-integration)
6. [Phase 3 — MockTransport Enhancement](#6-phase-3--mocktransport-enhancement)
7. [Phase 4 — Chat UX Hardening](#7-phase-4--chat-ux-hardening)
8. [Phase 5 — Real Transport & API](#8-phase-5--real-transport--api)
9. [File Change Map](#9-file-change-map)
10. [Test Matrix](#10-test-matrix)

---

## 1. Executive Summary

The `smdg-ai` app is a chat-based AI assistant for SMDG logistics operations. It is currently in **prototype stage** — all backend interactions are mocked via `MockTransport` with hardcoded streaming scripts.

The app has a solid foundation: `chat-sdk` runtime wiring (`useDefaultChatStore` → `useChatActions` → `useChatRuntime`), sidebar with thread list, workspace panel (flowchart + form), and welcome screen.

**Goal:** Transform the prototype into a production-ready chat UI that handles all possible server responses (markdown, code, tool calls, autoform schemas, reasoning, errors) while keeping MockTransport as the primary development tool until the real backend is ready.

**Approach:** Upgrade in 5 phases. Each phase is independently shippable and testable. Mock data evolves alongside real component upgrades so developers can visually verify every feature.

---

## 2. Current State Analysis

### Architecture

```
ChatLayout (wire runtime, sidebar, workspace)
├── ChatSidebar (thread list via chat-sdk ThreadList)
├── ChatPage
│   ├── WelcomeScreen (3 hardcoded suggestions)
│   └── Thread (from @ldc/chat-sdk)
│       ├── MarkdownText (remarkGfm, CodeHeader, copy)
│       ├── ThinkingProgressTimeline (reasoning steps)
│       ├── ToolFallback (generic tool-call renderer)
│       └── Composer (text input + attachments)
└── WorkspacePanel
    ├── FlowchartViewer (linear step list)
    └── FormContent (raw HTML inputs — NOT autoform)
```

### What works well

| Area | Status | Notes |
|---|---|---|
| Runtime wiring | ✅ Good | `useChatActions` + `useChatRuntime` + `useDefaultChatStore` properly composed |
| Thread list | ✅ Good | `ChatThreadListAdapter` wired with mock data |
| Conversation routing | ✅ Good | `/chat/:conversationId` with history loading |
| Reasoning/thinking | ✅ Good | `ThinkingProgressTimeline` renders reasoning steps with markdown content |
| Text streaming | ✅ Good | `text-delta` chunks render correctly via `MarkdownText` |
| Workspace sidebar | ✅ Good | Zustand store, flowchart viewer, open/close/toggle |
| File attachments | ✅ Good | `onUpload` wired with mock implementation |
| Code blocks | ⚠️ Partial | `CodeHeader` renders (language label + copy button) but **no syntax highlighting** |
| Tool calls | ⚠️ Partial | `ToolFallback` is generic — no domain-specific renderers |
| Form in workspace | ❌ Missing | `FormContent` uses raw HTML `<input>/<textarea>` instead of `@ldc/autoform` |
| Error handling | ❌ Missing | No `ErrorBoundary`, no error state UI |
| Edit/Resend | ❌ Missing | `onEdit`/`onReload` not wired |
| Syntax highlighting | ❌ Missing | `SyntaxHighlighter` component exists in chat-sdk but not integrated |

### Key files

| File | Purpose | Lines |
|---|---|---|
| `layouts/chat-layout.tsx` | Runtime wiring, navigation, store | ~100 |
| `pages/chat-page.tsx` | Route handler, renders Thread or WelcomeScreen | ~25 |
| `mocks/mock-transport.ts` | Timer-based mock streaming | ~45 |
| `mocks/mock-data.ts` | Threads, history, streaming script, form schema | ~600+ |
| `components/workspace-panel.tsx` | Sidebar with flowchart + form tabs | ~100 |
| `components/flowchart-viewer.tsx` | Linear step list | ~50 |
| `components/welcome-screen.tsx` | 3 suggestion buttons | ~35 |
| `components/chat-sidebar.tsx` | Thread list + new chat button | ~65 |
| `stores/workspace-store.ts` | Zustand store for panel state | ~40 |

---

## 3. Upgrade Priorities

| Priority | Phase | What | Impact | Effort |
|---|---|---|---|---|
| **P0** | 1 | Syntax highlighting in code blocks | All code in chat unreadable without it | Small |
| **P0** | 2 | Tool-call → Autoform integration | Core feature: server sends form schema → UI renders real form | Medium |
| **P1** | 3 | MockTransport comprehensive test scenarios | Developers need to see all markdown/tool-call variants | Medium |
| **P1** | 4 | Error boundaries, edit/resend, loading states | Production UX requirements | Medium |
| **P2** | 5 | Real transport (Socket/SSE) + API | Backend dependency — blocked until API ready | Large |

---

## 4. Phase 1 — Markdown & Code Highlighting

### 4.1 Problem

`chat-sdk/components/markdown.tsx` defines `defaultComponents` with `CodeHeader` (language label + copy button) but does NOT pass `SyntaxHighlighter` into the component map. The `SyntaxHighlighter` component exists at `chat-sdk/components/syntax-highlighting.tsx` using `react-shiki` with `kanagawa-wave`/`kanagawa-lotus` themes, but it's disconnected.

**Result:** All fenced code blocks render as plain monospace text with no color highlighting.

### 4.2 Solution

Wire `SyntaxHighlighter` into `markdown.tsx` `defaultComponents`. This is a chat-sdk level change, not smdg-ai level.

### 4.3 Implementation

**File:** `packages/chat-sdk/src/components/markdown.tsx`

```typescript
// ADD import
import { SyntaxHighlighter } from "./syntax-highlighting";

// ADD to defaultComponents:
const defaultComponents = memoizeMarkdownComponents({
  SyntaxHighlighter,  // ← ADD THIS LINE
  h1: ...,
  // ... rest unchanged
});
```

### 4.4 Image tag handling

Add `img` component to `defaultComponents`:

```typescript
img: ({ className, alt, ...props }) => (
  <img
    className={cn(
      "aui-md-img my-3 max-w-full rounded-lg border border-border/20",
      className,
    )}
    alt={alt}
    loading="lazy"
    {...props}
  />
),
```

### 4.5 Verification

After this change, all mock history messages (conv_002 has Docker Compose YAML, Python code, Bash scripts; conv_003 has JSON, TypeScript) should render with syntax-highlighted code blocks.

### 4.6 Files changed

| File | Action |
|---|---|
| `packages/chat-sdk/src/components/markdown.tsx` | ADD `SyntaxHighlighter` import + wire into `defaultComponents`, ADD `img` component |

---

## 5. Phase 2 — Tool Call & Autoform Integration

### 5.1 Problem

The server can send `tool-call` events with a JSON payload containing an `@ldc/autoform` `ISchema`. Currently:

1. `Thread` component in `chat-sdk` routes tool calls to `ToolFallback` which renders a generic "tool call" card with raw JSON args.
2. `WorkspacePanel` uses hand-coded `FormContent` with raw `<input>/<textarea>` — completely ignoring the autoform system.
3. There is no bridge between tool-call results and the workspace panel.

### 5.2 Architecture Decision

Two rendering strategies for autoform schemas from tool calls:

**Option A — Inline in chat (tool-call renderer)**
The form renders inside the message bubble where the tool call occurred. Good for small forms (2-3 fields). User fills and submits without leaving the chat.

**Option B — Workspace panel (side panel renderer)**
The form renders in the workspace panel. Good for complex forms (OData tables, multi-tab, many fields). Chat shows a card saying "Form opened in workspace →".

**Decision: Support BOTH.** The tool call payload specifies the rendering target:

```typescript
// Tool call args from server:
{
  toolName: "show_form",
  args: {
    target: "inline" | "workspace",  // where to render
    schema: ISchema,                  // autoform schema
    actions?: ActionConfig[],         // action pipeline
    title?: string,                   // form title
  }
}
```

### 5.3 Implementation Plan

#### Step 1: Create `AutoformToolRenderer` component

**File:** `apps/smdg-ai/src/components/autoform-tool-renderer.tsx`

A custom tool-call renderer that detects `toolName === "show_form"` and:
- If `target === "inline"`: renders `@ldc/autoform` Builder directly in the chat bubble.
- If `target === "workspace"`: calls `useWorkspaceStore.open("form", { schema, actions })` and renders a card with a button to open workspace.

```tsx
import { Builder } from "@ldc/autoform";
import { useWorkspaceStore } from "../stores/workspace-store";

interface AutoformToolProps {
  toolName: string;
  args: {
    target: "inline" | "workspace";
    schema: ISchema;
    actions?: ActionConfig[];
    title?: string;
  };
  result?: unknown;
}

export function AutoformToolRenderer({ args, result }: AutoformToolProps) {
  const { open } = useWorkspaceStore();

  if (args.target === "workspace") {
    // Auto-open workspace panel when tool call completes
    useEffect(() => {
      open("form", { schema: args.schema, actions: args.actions });
    }, []);

    return (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
        <p className="text-sm text-muted-foreground">
          📋 Form "{args.title ?? 'Input required'}" opened in workspace panel →
        </p>
      </div>
    );
  }

  // Inline rendering
  return (
    <div className="my-2 rounded-lg border border-border/50 p-4">
      {args.title && (
        <h4 className="mb-3 text-sm font-medium">{args.title}</h4>
      )}
      <Builder
        schema={args.schema}
        onFormActions={handleFormActions}
        // ... wire action engine if actions provided
      />
    </div>
  );
}
```

#### Step 2: Register custom tool renderer in Thread

The `Thread` component in `chat-sdk` uses `ToolFallback` as the default. In `smdg-ai`, we need to override this.

**Option A (Recommended):** Create a custom `SmdgThread` component that wraps `chat-sdk`'s Thread primitives and registers `AutoformToolRenderer` for `show_form` tool calls.

**Option B:** Pass a `tools` config to `Thread` if chat-sdk supports it (via `MessagePrimitive.Parts` `components.tools`).

Looking at the current Thread implementation:
```tsx
// chat-sdk Thread already supports custom tool renderers:
<MessagePrimitive.Unstable_PartsGrouped
  components={{
    tools: { Fallback: (part) => <ToolFallback {...part} /> },
  }}
/>
```

The `tools` map supports named tool renderers: `tools: { show_form: AutoformToolRenderer, Fallback: ToolFallback }`.

**Action:** Verify `@assistant-ui/react` 0.12.25 supports named tool renderers in `components.tools`. If yes, we can pass tools config. If not, we create a wrapper component.

#### Step 3: Upgrade WorkspacePanel form tab

**File:** `apps/smdg-ai/src/components/workspace-panel.tsx`

Replace `FormContent` (raw HTML) with `AutoformWorkspaceForm`:

```tsx
function FormContent({ data }: { data: unknown }) {
  const { schema, actions } = data as { schema?: ISchema; actions?: ActionConfig[] };
  
  if (!schema?.fields?.length) {
    return <EmptyState message="No form to display" />;
  }

  return (
    <Builder
      schema={schema}
      onFormActions={handleFormActions}
      services={services}
    />
  );
}
```

This requires:
- `@ldc/autoform` Builder component
- `useActionEngine` hook from `@ldc/autoform/action-engine`
- Service configuration for API calls

#### Step 4: Update MockTransport to send tool-call events

**File:** `apps/smdg-ai/src/mocks/mock-data.ts`

Add tool-call entries to `MOCK_STREAMING_SCRIPT`:

```typescript
// Replace "show_workspace" with proper tool-call events:
{
  delay: 5000,
  type: "tool-call-start" as const,
  toolCallId: "tc_001",
  toolName: "show_form",
},
{
  delay: 5200,
  type: "tool-call-end" as const,
  toolCallId: "tc_001",
  result: {
    target: "workspace",
    title: "Container Inspection Form",
    schema: MOCK_AUTOFORM_SCHEMA,  // proper ISchema
    actions: MOCK_FORM_ACTIONS,    // ActionConfig[]
  },
},
```

**File:** `apps/smdg-ai/src/mocks/mock-data.ts`

Create proper autoform `ISchema` (replacing `MOCK_FORM_SCHEMA`):

```typescript
export const MOCK_AUTOFORM_SCHEMA: ISchema = {
  fields: [
    {
      key: "container_ids",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        wrapperProps: { label: "Container IDs to inspect", description: "Enter one ID per line" },
        fieldControl: "TextareaControl",
        controlProps: { rows: 4, placeholder: "MSCU1234567\nTCLU7654321" },
        rules: [{ method: "required", message: "At least one container ID is required" }],
      },
    },
    {
      key: "inspection_date",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        wrapperProps: { label: "Inspection Date" },
        fieldControl: "InputControl",
        controlProps: { type: "date" },
        rules: [{ method: "required", message: "Inspection date is required" }],
      },
    },
    {
      key: "priority",
      outputType: "string",
      default: "normal",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        wrapperProps: { label: "Priority Level" },
        fieldControl: "SelectControl",
        controlProps: {
          options: [
            { label: "Low", value: "low" },
            { label: "Normal", value: "normal" },
            { label: "High", value: "high" },
            { label: "Critical", value: "critical" },
          ],
        },
      },
    },
    {
      key: "inspector_note",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        wrapperProps: { label: "Inspector Notes", description: "Optional" },
        fieldControl: "TextareaControl",
        controlProps: { rows: 2 },
      },
    },
    {
      key: "btnSubmit",
      outputType: "string",
      fieldConfig: {
        fieldControl: "ButtonControl",
        controlProps: {
          label: "Schedule Inspection",
          variant: "default",
          action: "submit_inspection",
          loadingOnAction: true,
        },
      },
    },
  ],
};

export const MOCK_FORM_ACTIONS: ActionConfig[] = [
  {
    action: "submit_inspection",
    steps: [
      { type: "validate" },
      { type: "toast", message: "Inspection scheduled successfully!", variant: "success" },
    ],
  },
];
```

### 5.4 MockTransport updates required

The current `MockTransport.send()` only handles `text`, `reasoning`, `agent_step`, and `show_workspace` event types. After Phase 2:

```typescript
// mock-transport.ts — add tool-call event handling:
if (entry.type === "tool-call-start") {
  events.onChunk({
    type: "tool-call-start",
    toolCallId: entry.toolCallId,
    toolName: entry.toolName,
  });
} else if (entry.type === "tool-call-end") {
  events.onChunk({
    type: "tool-call-end",
    toolCallId: entry.toolCallId,
    result: entry.result,
  });
}
```

### 5.5 Files changed

| File | Action |
|---|---|
| `apps/smdg-ai/src/components/autoform-tool-renderer.tsx` | CREATE — tool-call → autoform bridge |
| `apps/smdg-ai/src/components/workspace-panel.tsx` | MODIFY — replace `FormContent` with autoform `Builder` |
| `apps/smdg-ai/src/mocks/mock-data.ts` | MODIFY — add `MOCK_AUTOFORM_SCHEMA`, `MOCK_FORM_ACTIONS`, update streaming script |
| `apps/smdg-ai/src/mocks/mock-transport.ts` | MODIFY — handle `tool-call-start`/`tool-call-end` events |
| `apps/smdg-ai/src/pages/chat-page.tsx` | MODIFY — wire custom tool renderers (if needed at page level) |
| `apps/smdg-ai/src/stores/workspace-store.ts` | MODIFY — store `schema: ISchema` and `actions: ActionConfig[]` instead of generic `data: unknown` |

### 5.6 Open Questions

| # | Question | Decision needed by |
|---|---|---|
| Q1 | Does `@assistant-ui/react` 0.12.25 support named tool renderers in `components.tools`? | Verify before implementation |
| Q2 | Should inline autoform have access to action engine (API calls), or only workspace forms? | Product decision |
| Q3 | How should tool-call results (form submission results) flow back to the assistant? | Backend contract |

---

## 6. Phase 3 — MockTransport Enhancement

### 6.1 Problem

The current `MOCK_STREAMING_SCRIPT` only tests one scenario: reasoning → agent steps → text summary → form. To verify all markdown rendering, we need comprehensive mock scenarios.

### 6.2 Solution: Scenario-based MockTransport

Replace the single hardcoded script with a scenario selector. `MockTransport` picks a scenario based on the user's message content (keyword matching).

**File:** `apps/smdg-ai/src/mocks/mock-transport.ts`

```typescript
export class MockTransport implements ChatTransport {
  send(messages: ChatMessage[], events: ChatTransportEvents): void {
    const lastMessage = messages[messages.length - 1];
    const text = typeof lastMessage?.content === "string"
      ? lastMessage.content
      : "";

    const scenario = selectScenario(text);
    this.runScenario(scenario, events);
  }
}

function selectScenario(input: string): MockScenario {
  if (input.includes("table")) return SCENARIOS.richTable;
  if (input.includes("code")) return SCENARIOS.multiCodeBlock;
  if (input.includes("form")) return SCENARIOS.toolCallForm;
  if (input.includes("error")) return SCENARIOS.errorMidStream;
  if (input.includes("long")) return SCENARIOS.longResponse;
  return SCENARIOS.default;
}
```

### 6.3 Mock Scenarios to implement

| Scenario key | Trigger keyword | What it tests |
|---|---|---|
| `default` | (any) | Reasoning → text with basic markdown |
| `richTable` | "table" | GFM table with alignment, many columns |
| `multiCodeBlock` | "code" | JSON + Python + SQL + Bash code blocks |
| `toolCallForm` | "form" / "inspect" | tool-call-start → tool-call-end with autoform ISchema |
| `toolCallInline` | "quick form" | Inline autoform tool call (small form) |
| `errorMidStream` | "error" | Text chunks → error event mid-stream |
| `longResponse` | "long" / "report" | >2000 words, test scroll behavior |
| `mixedContent` | "analysis" | Heading + table + code + blockquote + list in one response |
| `emptyResponse` | "empty" | Immediate onComplete with no chunks |
| `imageMarkdown` | "image" | Markdown with `![alt](url)` images |
| `toolCallMultiple` | "multi tool" | 2 tool calls in one response |

### 6.4 Files changed

| File | Action |
|---|---|
| `apps/smdg-ai/src/mocks/mock-transport.ts` | REWRITE — scenario-based routing |
| `apps/smdg-ai/src/mocks/mock-scenarios.ts` | CREATE — individual scenario scripts |
| `apps/smdg-ai/src/mocks/mock-data.ts` | MODIFY — extract autoform schemas, keep history data |

---

## 7. Phase 4 — Chat UX Hardening

### 7.1 Error Boundary

**File:** `apps/smdg-ai/src/pages/chat-page.tsx`

```tsx
import { ErrorBoundary } from "react-error-boundary";

export function ChatPage() {
  // ...
  return (
    <ErrorBoundary
      fallback={<ChatErrorFallback onReset={() => location.reload()} />}
    >
      <Thread />
    </ErrorBoundary>
  );
}
```

### 7.2 Wire onEdit / onReload

In `chat-layout.tsx`, the `useChatActions` hook from the upgraded chat-sdk now returns `onEdit` and `onReload`. The `Thread` component from chat-sdk already has edit/reload action buttons in the UI. No extra wiring needed — **verify that the action bar buttons work after the chat-sdk upgrade.**

If `Thread` doesn't auto-wire:
- `ActionBarPrimitive.Reload` → calls `runtime.onReload`
- `ActionBarPrimitive.Edit` → calls `runtime.onEdit`

### 7.3 Loading state for conversation switching

```tsx
// chat-layout.tsx — add transition state
const [isTransitioning, setIsTransitioning] = useState(false);

useEffect(() => {
  setIsTransitioning(true);
  if (conversationId && conversationId in MOCK_HISTORY_MESSAGES) {
    store.setMessages(MOCK_HISTORY_MESSAGES[conversationId]);
  } else if (!conversationId) {
    store.setMessages([]);
  }
  // Small delay to let Thread re-render before removing skeleton
  requestAnimationFrame(() => setIsTransitioning(false));
}, [conversationId]);
```

### 7.4 Files changed

| File | Action |
|---|---|
| `apps/smdg-ai/src/pages/chat-page.tsx` | MODIFY — add ErrorBoundary |
| `apps/smdg-ai/src/components/chat-error-fallback.tsx` | CREATE — error UI component |
| `apps/smdg-ai/src/layouts/chat-layout.tsx` | MODIFY — loading state, verify edit/reload |

---

## 8. Phase 5 — Real Transport & API

> **Status: BLOCKED** — requires backend API contract.

### 8.1 Transport swap

Replace `MockTransport` with `SocketTransport` or `SSETransport` from the upgraded `@ldc/chat-sdk`.

```typescript
// chat-layout.tsx
import { SocketTransport } from "@ldc/chat-sdk";

const transport = useMemo(() => new SocketTransport({
  baseUrl: env.PUBLIC_URL_PUSH_GATEWAY + "/v1/pushgateway",
  room: (ctx) => `run:${ctx.runId}`,
  channel: "data_chunk",
  middleware: {
    onChunk: (event) => {
      // Route agent_step / show_workspace custom events to workspace store
      if (event.type === "custom" && event.event === "agent_step") {
        useWorkspaceStore.getState().updateStep(event.payload as AgentStep);
      }
    },
  },
}), []);
```

### 8.2 API contract needed

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /ai/chat` | POST | Start a chat run, returns `{ run_id, conversation_id }` |
| `GET /conversations` | GET | List conversations for thread sidebar |
| `GET /conversations/:id/messages` | GET | Load history messages |
| `DELETE /conversations/:id` | DELETE | Delete conversation |
| `POST /files/upload` | POST | Upload file attachment |

### 8.3 `beforeSend` update

```typescript
const beforeSend = useCallback(async (messages: ChatMessage[]) => {
  resetSteps();
  const { data } = await api.post("/ai/chat", {
    messages,
    conversation_id: conversationIdRef.current,
  });
  if (!conversationIdRef.current) {
    navigateToConversation(data.conversation_id);
  }
  return {
    runId: data.run_id,
    conversationId: data.conversation_id,
  };
}, [navigateToConversation, resetSteps]);
```

### 8.4 Files changed

| File | Action |
|---|---|
| `apps/smdg-ai/src/layouts/chat-layout.tsx` | MODIFY — swap transport, real beforeSend |
| `apps/smdg-ai/src/hooks/use-conversations.ts` | CREATE — TanStack Query hooks for conversation API |
| `apps/smdg-ai/src/lib/api.ts` | CREATE — APISdk instance for SMDG-AI backend |

---

## 9. File Change Map

Complete list of all files that will be created or modified across all phases:

### Packages (shared)

| Phase | File | Action |
|---|---|---|
| 1 | `packages/chat-sdk/src/components/markdown.tsx` | MODIFY |

### App: smdg-ai

| Phase | File | Action |
|---|---|---|
| 2 | `src/components/autoform-tool-renderer.tsx` | CREATE |
| 2 | `src/components/workspace-panel.tsx` | MODIFY |
| 2 | `src/stores/workspace-store.ts` | MODIFY |
| 2 | `src/mocks/mock-data.ts` | MODIFY |
| 2 | `src/mocks/mock-transport.ts` | MODIFY |
| 3 | `src/mocks/mock-transport.ts` | REWRITE |
| 3 | `src/mocks/mock-scenarios.ts` | CREATE |
| 4 | `src/pages/chat-page.tsx` | MODIFY |
| 4 | `src/components/chat-error-fallback.tsx` | CREATE |
| 4 | `src/layouts/chat-layout.tsx` | MODIFY |
| 5 | `src/layouts/chat-layout.tsx` | MODIFY |
| 5 | `src/hooks/use-conversations.ts` | CREATE |
| 5 | `src/lib/api.ts` | CREATE |

---

## 10. Test Matrix

### Visual verification per phase

| Phase | What to verify | How |
|---|---|---|
| 1 | Code blocks have syntax colors | Open any conv with code (conv_002, conv_003), check Python/YAML/JSON/Bash |
| 1 | Images render with max-width + border | Send message containing `![](url)` |
| 2 | Tool call shows autoform in workspace | Type "inspect" → form with validation appears in panel |
| 2 | Inline form renders in chat bubble | Type "quick form" → small form inside message |
| 2 | Form validation works | Submit empty required fields → error messages |
| 2 | Form action engine works | Submit valid form → toast notification |
| 3 | Each scenario renders correctly | Type each trigger keyword, verify rendering |
| 3 | Error scenario shows error state | Type "error" → see error message in chat |
| 4 | ErrorBoundary catches crashes | Intentionally break markdown → fallback UI |
| 4 | Edit button works | Click edit on user message → re-send |
| 4 | Reload button works | Click reload on errored assistant message |
| 5 | Real backend streams correctly | End-to-end with actual API |

### Automated test suggestions (future)

| Test type | Coverage |
|---|---|
| Unit: `message-helpers.ts` | All event types → correct ChatMessage mutations |
| Unit: `mock-transport.ts` | Each scenario produces expected events |
| Component: `AutoformToolRenderer` | Renders inline vs workspace correctly |
| E2E: Full chat flow | Send message → see reasoning → see text → see form |
