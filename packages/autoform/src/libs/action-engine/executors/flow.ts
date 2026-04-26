// ============================================================================
// Flow Executors — condition, custom
// ============================================================================

import type { ActionStep, EngineContext } from "../types";
import { evalExpr } from "../utils";

// Forward declaration — injected at init to avoid circular deps
let executePipelineFn: (steps: ActionStep[], ctx: EngineContext) => Promise<boolean>;

/**
 * Must be called once by core/runner.ts during init.
 * Breaks the circular dependency: condition → executePipeline → executeStep → condition
 */
export function injectPipelineRunner(
    fn: (steps: ActionStep[], ctx: EngineContext) => Promise<boolean>
): void {
    executePipelineFn = fn;
}

// --- condition ---

export async function executeCondition(
    step: { type: "condition"; expr: string; then: ActionStep[]; else?: ActionStep[] },
    ctx: EngineContext
): Promise<boolean> {
    const result = evalExpr(step.expr, ctx);
    const branch = result ? step.then : (step.else ?? []);
    return executePipelineFn(branch, ctx);
}

// --- custom ---

export async function executeCustom(
    step: { type: "custom"; handler: string },
    ctx: EngineContext
): Promise<boolean> {
    const handler = ctx.customHandlers?.[step.handler];
    if (!handler) {
        throw new Error(
            `[ActionEngine] Custom handler "${step.handler}" not registered`
        );
    }
    await handler(ctx);
    return true;
}