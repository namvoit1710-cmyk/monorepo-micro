"use client";

import { cn } from "@ldc/ui";
import { LoaderIcon } from "lucide-react";
import { type FC, type ReactNode } from "react";

// ─── Step types ───────────────────────────────────────────────────────────────
// Add new values to ThinkingStepKind and handle them in StepRow to extend.

export type ThinkingStepKind = "text" | "reasoning" | "query" | "result";

export interface ThinkingStep {
    kind: ThinkingStepKind;
    label: string;
    /** Optional markdown/rich content rendered inline below the label */
    detail?: ReactNode;
}

// ─── Single step row ──────────────────────────────────────────────────────────

interface StepRowProps {
    step: ThinkingStep;
    /** green dot = done, amber dot + spinner = in-progress */
    isDone: boolean;
    /** render vertical connector line below this dot */
    showLine: boolean;
}

const StepRow: FC<StepRowProps> = ({ step, isDone, showLine }) => {
    const hasDetail = !!step.detail;

    return (
        <div className="flex gap-3">
            {/* left rail */}
            <div className="flex flex-col items-center">
                <span
                    className={cn(
                        "mt-0.5 size-2.5 shrink-0 rounded-full border-2 transition-colors duration-300",
                        isDone
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-amber-400 bg-amber-400",
                    )}
                />
                {showLine && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>

            {/* right content */}
            <div className="min-w-0 flex-1 pb-3">
                <span
                    className={cn(
                        "text-xs leading-5",
                        isDone ? "text-muted-foreground" : "font-medium text-foreground/80",
                    )}
                >
                    {step.label}
                    {!isDone && (
                        <LoaderIcon className="ml-1.5 inline size-3 animate-spin align-middle text-amber-400" />
                    )}
                </span>
                {hasDetail && (
                    <div className="mt-1.5 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground [&_code]:font-mono [&_pre]:overflow-x-auto">
                        {step.detail}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface ThinkingProgressTimelineProps {
    steps: ThinkingStep[];
    isRunning: boolean;
}

export const ThinkingProgressTimeline: FC<ThinkingProgressTimelineProps> = ({ steps, isRunning }) => {
    if (steps.length === 0 && !isRunning) return null;

    const displaySteps: ThinkingStep[] =
        steps.length === 0
            ? [{ kind: "text", label: "Analyzing…" }]
            : steps;

    return (
        <div data-slot="thinking-progress" className="mb-4 flex flex-col">
            {displaySteps.map((step, i) => {
                const isLast = i === displaySteps.length - 1;
                const isDone = !isRunning || !isLast;
                const showLine = !isLast || isRunning;
                return (
                    <StepRow key={i} step={step} isDone={isDone} showLine={showLine} />
                );
            })}
        </div>
    );
};
