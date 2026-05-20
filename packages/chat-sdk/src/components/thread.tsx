import {
    ActionBarMorePrimitive,
    ActionBarPrimitive,
    AuiIf,
    BranchPickerPrimitive,
    ComposerPrimitive,
    ErrorPrimitive,
    MessagePrimitive,
    SuggestionPrimitive,
    ThreadPrimitive,
    useAuiState,
} from "@assistant-ui/react";
import { cn } from "@ldc/ui";
import { Button } from "@ldc/ui/components/button";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    DownloadIcon,
    MoreHorizontalIcon,
    PencilIcon,
    RefreshCwIcon,
    SquareIcon,
} from "lucide-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
    ComposerAddAttachment,
    ComposerAttachments,
    UserMessageFileAttachments,
    UserMessageImageAttachments,
} from "./attachment";
import { MarkdownText, StandaloneMarkdown } from "./markdown";
import type { ThinkingStep } from "./thinking-progress";
import { ThinkingProgressTimeline } from "./thinking-progress";
import { ToolFallback } from "./tool-fallback";
import { TooltipIconButton } from "./tooltip-icon-button";

export const Thread: FC = () => {
    return (
        <ThreadPrimitive.Root
            className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
            style={{
                ["--thread-max-width" as string]: "44rem",
                ["--composer-radius" as string]: "16px",
                ["--composer-padding" as string]: "12px",
            }}
        >
            <ThreadPrimitive.Viewport
                turnAnchor="top"
                data-slot="aui_thread-viewport"
                className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
            >
                <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-8">
                    <AuiIf condition={(s) => s.thread.isEmpty}>
                        <ThreadWelcome />
                    </AuiIf>

                    <div
                        data-slot="aui_message-group"
                        className="mb-10 flex flex-col gap-y-6 empty:hidden"
                    >
                        <ThreadPrimitive.Messages>
                            {() => <ThreadMessage />}
                        </ThreadPrimitive.Messages>
                    </div>

                    <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mt-auto flex flex-col gap-3 overflow-visible bg-background pb-4 md:pb-6">
                        <ThreadScrollToBottom />
                        <Composer />
                    </ThreadPrimitive.ViewportFooter>
                </div>
            </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
    );
};

const ThreadMessage: FC = () => {
    const role = useAuiState((s) => s.message.role);
    const isEditing = useAuiState((s) => s.message.composer.isEditing);

    if (isEditing) return <EditComposer />;
    if (role === "user") return <UserMessage />;
    return <AssistantMessage />;
};

const ThreadScrollToBottom: FC = () => {
    return (
        <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
                tooltip="Scroll to bottom"
                variant="outline"
                className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-2.5 shadow-sm disabled:invisible bg-background border border-border hover:bg-muted"
            >
                <ArrowDownIcon />
            </TooltipIconButton>
        </ThreadPrimitive.ScrollToBottom>
    );
};

const ThreadWelcome: FC = () => {
    return (
        <div className="aui-thread-welcome-root my-auto flex grow flex-col">
            <div className="aui-thread-welcome-center flex w-full grow flex-col items-start justify-center">
                <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
                    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-semibold text-3xl tracking-tight duration-200">
                        Hello there!
                    </h1>
                    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground/80 text-lg delay-75 duration-200">
                        How can I help you today?
                    </p>
                </div>
            </div>
            <ThreadSuggestions />
        </div>
    );
};

const ThreadSuggestions: FC = () => {
    return (
        <div className="aui-thread-welcome-suggestions grid w-full @md:grid-cols-2 gap-3 pb-6 pt-2">
            <ThreadPrimitive.Suggestions>
                {() => <ThreadSuggestionItem />}
            </ThreadPrimitive.Suggestions>
        </div>
    );
};

const ThreadSuggestionItem: FC = () => {
    return (
        <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 @md:nth-[n+3]:block nth-[n+3]:hidden animate-in fill-mode-both duration-200">
            <SuggestionPrimitive.Trigger send asChild>
                <Button
                    variant="ghost"
                    className="aui-thread-welcome-suggestion h-auto w-full @md:flex-col flex-wrap items-start justify-start gap-1 rounded-2xl border border-border/60 bg-background px-4 py-3.5 text-start text-sm shadow-sm transition-[colors,box-shadow] hover:bg-muted hover:border-border hover:shadow-none"
                >
                    <SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1 font-medium" />
                    <SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 text-muted-foreground empty:hidden" />
                </Button>
            </SuggestionPrimitive.Trigger>
        </div>
    );
};

const Composer: FC = () => {
    return (
        <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
            <ComposerPrimitive.AttachmentDropzone asChild>
                <div
                    data-slot="aui_composer-shell"
                    className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm transition-all focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/15 focus-within:shadow-md data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50"
                >
                    <ComposerAttachments />
                    <ComposerPrimitive.Input
                        placeholder="Send a message..."
                        className="aui-composer-input max-h-40 min-h-11 w-full resize-none bg-transparent px-1 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
                        rows={1}
                        autoFocus
                        aria-label="Message input"
                    />
                    <ComposerAction />
                </div>
            </ComposerPrimitive.AttachmentDropzone>
        </ComposerPrimitive.Root>
    );
};

const ComposerAction: FC = () => {
    return (
        <div className="aui-composer-action-wrapper relative flex items-center justify-between pt-1">
            <ComposerAddAttachment />
            <AuiIf condition={(s) => !s.thread.isRunning}>
                <ComposerPrimitive.Send asChild>
                    <TooltipIconButton
                        tooltip="Send message"
                        side="bottom"
                        type="button"
                        variant="default"
                        size="icon"
                        className="aui-composer-send size-8 rounded-full shadow-sm disabled:opacity-40 disabled:shadow-none"
                        aria-label="Send message"
                    >
                        <ArrowUpIcon className="aui-composer-send-icon size-4" />
                    </TooltipIconButton>
                </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
                <ComposerPrimitive.Cancel asChild>
                    <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="aui-composer-cancel size-8 rounded-full"
                        aria-label="Stop generating"
                    >
                        <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
                    </Button>
                </ComposerPrimitive.Cancel>
            </AuiIf>
        </div>
    );
};

const MessageError: FC = () => {
    return (
        <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
                <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
            </ErrorPrimitive.Root>
        </MessagePrimitive.Error>
    );
};

// Module-level latch: survives component remounts (e.g. after concat-content join triggers reconciliation).
// Keys by message ID so each message has its own step history.
const _stepsLatch = new Map<string, ThinkingStep[]>();

const ThinkingProgress: FC = () => {
    const isRunning = useAuiState((s) => s.message.status?.type === "running");
    const messageId = useAuiState((s) => s.message.id);
    // reasoning field carries JSON-encoded ReasoningStep[] — Reasoning: () => null so this string is never rendered
    const stepsJson = useAuiState((s) => {
        const parts = s.message.parts.filter(
            (p) => p.type === "reasoning" && typeof (p as { text?: unknown }).text === "string",
        );
        if (parts.length === 0) return "[]";
        try {
            const all = parts.flatMap((p) => JSON.parse((p as unknown as { text: string }).text) as { label: string; content?: string }[]);
            return JSON.stringify(all);
        } catch {
            return "[]";
        }
    });

    const [steps, setSteps] = useState<ThinkingStep[]>(() => _stepsLatch.get(messageId) ?? []);

    useEffect(() => {
        const reasoningSteps: { label: string; content?: string }[] = JSON.parse(stepsJson);
        const parsed = reasoningSteps.map((s): ThinkingStep => ({
            kind: "text",
            label: s.label,
            detail: s.content ? <StandaloneMarkdown content={s.content} /> : undefined,
        }));
        const latched = _stepsLatch.get(messageId) ?? [];
        if (parsed.length > latched.length) {
            _stepsLatch.set(messageId, parsed);
            setSteps(parsed);
        }
    }, [stepsJson, messageId]);

    return <ThinkingProgressTimeline steps={steps} isRunning={isRunning} />;
};

const AssistantMessage: FC = () => {
    // reserves space for action bar and compensates with `-mb` for consistent msg spacing
    // keeps hovered action bar from shifting layout (autohide doesn't support absolute positioning well)
    // for pt-[n] use -mb-[n + 6] & min-h-[n + 6] to preserve compensation
    const ACTION_BAR_PT = "pt-1.5";
    const ACTION_BAR_HEIGHT = `-mb-7.5 min-h-7.5 ${ACTION_BAR_PT}`;

    return (
        <MessagePrimitive.Root
            data-slot="aui_assistant-message-root"
            data-role="assistant"
            className="fade-in slide-in-from-bottom-1 relative animate-in duration-150 [contain-intrinsic-size:auto_300px] [content-visibility:auto]"
        >
            <div
                data-slot="aui_assistant-message-content"
                className="wrap-break-word px-2 text-foreground text-sm leading-7"
            >
                <ThinkingProgress />
                <MessagePrimitive.Unstable_PartsGrouped
                    groupingFunction={(parts) => {
                        const groups: { groupKey: string | undefined; indices: number[] }[] = [];
                        for (let i = 0; i < parts.length; i++) {
                            const part = parts[i];
                            const isChainOfThought =
                                part.type === "reasoning" || part.type === "tool-call";
                            if (isChainOfThought) {
                                const last = groups[groups.length - 1];
                                if (last?.groupKey === "chainOfThought") {
                                    last.indices.push(i);
                                } else {
                                    groups.push({ groupKey: "chainOfThought", indices: [i] });
                                }
                            } else {
                                groups.push({ groupKey: undefined, indices: [i] });
                            }
                        }
                        return groups;
                    }}
                    components={{
                        Text: () => <MarkdownText />,
                        Reasoning: () => null,
                        tools: { Fallback: (part) => <ToolFallback {...part} /> },
                        Group: ({ groupKey, children }) => {
                            if (groupKey === "chainOfThought") {
                                return (
                                    <div data-slot="aui_chain-of-thought">
                                        {children}
                                    </div>
                                );
                            }
                            return <>{children}</>;
                        },
                    }}
                />
                <MessageError />
            </div>

            <div
                data-slot="aui_assistant-message-footer"
                className={cn("ms-2 flex items-center", ACTION_BAR_HEIGHT)}
            >
                <BranchPicker />
                <AssistantActionBar />
            </div>
        </MessagePrimitive.Root>
    );
};

const AssistantActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="aui-assistant-action-bar-root col-start-3 row-start-2 -ms-1 flex gap-0.5 text-muted-foreground/70"
        >
            <ActionBarPrimitive.Copy asChild>
                <TooltipIconButton tooltip="Copy">
                    <AuiIf condition={(s) => s.message.isCopied}>
                        <CheckIcon />
                    </AuiIf>
                    <AuiIf condition={(s) => !s.message.isCopied}>
                        <CopyIcon />
                    </AuiIf>
                </TooltipIconButton>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload asChild>
                <TooltipIconButton tooltip="Refresh">
                    <RefreshCwIcon />
                </TooltipIconButton>
            </ActionBarPrimitive.Reload>
            <ActionBarMorePrimitive.Root>
                <ActionBarMorePrimitive.Trigger asChild>
                    <TooltipIconButton
                        tooltip="More"
                        className="data-[state=open]:bg-accent"
                    >
                        <MoreHorizontalIcon />
                    </TooltipIconButton>
                </ActionBarMorePrimitive.Trigger>
                <ActionBarMorePrimitive.Content
                    side="bottom"
                    align="start"
                    className="aui-action-bar-more-content z-50 min-w-36 overflow-hidden rounded-xl border border-border/50 bg-popover p-1.5 text-popover-foreground shadow-lg"
                >
                    <ActionBarPrimitive.ExportMarkdown asChild>
                        <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <DownloadIcon className="size-4" />
                            Export as Markdown
                        </ActionBarMorePrimitive.Item>
                    </ActionBarPrimitive.ExportMarkdown>
                </ActionBarMorePrimitive.Content>
            </ActionBarMorePrimitive.Root>
        </ActionBarPrimitive.Root>
    );
};

const UserMessage: FC = () => {
    return (
        <MessagePrimitive.Root
            data-slot="aui_user-message-root"
            className="fade-in slide-in-from-bottom-1 grid animate-in auto-rows-auto grid-cols-[minmax(80px,1fr)_auto] content-start gap-y-2 p-2 duration-150 [contain-intrinsic-size:auto_60px] [content-visibility:auto] [&:where(>*)]:col-start-2"
            data-role="user"
        >
            <UserMessageImageAttachments />
            <UserMessageFileAttachments />

            <div className="aui-user-message-content-wrapper relative col-start-2 row-start-3 min-w-0">
                <div className="aui-user-message-content wrap-break-word peer rounded-3xl bg-muted px-5 py-3 text-sm text-foreground leading-relaxed empty:hidden">
                    <MessagePrimitive.Parts />
                </div>
                <div className="aui-user-action-bar-wrapper absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden rtl:translate-x-full">
                    <UserActionBar />
                </div>
            </div>

            <BranchPicker
                data-slot="aui_user-branch-picker"
                className="col-span-full col-start-1 row-start-3 -me-1 justify-end"
            />
        </MessagePrimitive.Root>
    );
};

const UserActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="aui-user-action-bar-root flex flex-col items-end"
        >
            <ActionBarPrimitive.Edit asChild>
                <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
                    <PencilIcon />
                </TooltipIconButton>
            </ActionBarPrimitive.Edit>
        </ActionBarPrimitive.Root>
    );
};

const EditComposer: FC = () => {
    return (
        <MessagePrimitive.Root
            data-slot="aui_edit-composer-wrapper"
            className="flex flex-col px-2"
        >
            <ComposerPrimitive.Root className="aui-edit-composer-root ms-auto flex w-full max-w-[85%] flex-col rounded-3xl bg-muted">
                <ComposerPrimitive.Input
                    className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
                    autoFocus
                />
                <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
                    <ComposerPrimitive.Cancel asChild>
                        <Button variant="ghost" size="sm">
                            Cancel
                        </Button>
                    </ComposerPrimitive.Cancel>
                    <ComposerPrimitive.Send asChild>
                        <Button size="sm">Update</Button>
                    </ComposerPrimitive.Send>
                </div>
            </ComposerPrimitive.Root>
        </MessagePrimitive.Root>
    );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
    className,
    ...rest
}) => {
    return (
        <BranchPickerPrimitive.Root
            hideWhenSingleBranch
            className={cn(
                "aui-branch-picker-root -ms-2 me-2 inline-flex items-center text-muted-foreground/60 text-xs",
                className,
            )}
            {...rest}
        >
            <BranchPickerPrimitive.Previous asChild>
                <TooltipIconButton tooltip="Previous">
                    <ChevronLeftIcon />
                </TooltipIconButton>
            </BranchPickerPrimitive.Previous>
            <span className="aui-branch-picker-state font-medium">
                <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
            </span>
            <BranchPickerPrimitive.Next asChild>
                <TooltipIconButton tooltip="Next">
                    <ChevronRightIcon />
                </TooltipIconButton>
            </BranchPickerPrimitive.Next>
        </BranchPickerPrimitive.Root>
    );
};
