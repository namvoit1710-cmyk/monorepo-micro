// ============================================================================
// Action Engine — Utilities
// ============================================================================
// Pure functions: expression evaluation, template interpolation, path access,
// body resolution, deep interpolation for objects.
// ============================================================================

import type { EngineContext } from "../types";

// ----------------------------------------------------------------------------
// Expression Evaluator
// ----------------------------------------------------------------------------

/**
 * Evaluate JS expression against engine context.
 * Variables available: formValues, lastResult, rowData, Math.
 *
 * @example evalExpr("formValues.status === 'active'", ctx)
 * @example evalExpr("lastResult.data.count > 0", ctx)
 */
export function evalExpr(expr: string, ctx: EngineContext): unknown {
    const { formValues, lastResult, rowData } = ctx;
    try {
        const fn = new Function(
            "formValues",
            "lastResult",
            "rowData",
            "Math",
            `"use strict"; return (${expr});`
        );
        return fn(formValues, lastResult, rowData, Math);
    } catch (error) {
        console.warn(`[ActionEngine] Expression eval failed: "${expr}"`, error);
        return undefined;
    }
}

// ----------------------------------------------------------------------------
// Template String Interpolation
// ----------------------------------------------------------------------------

/**
 * Replace ${...} placeholders in a string with runtime values.
 *
 * @example interpolate("/api/orders/${rowData.id}", ctx) → "/api/orders/123"
 */
export function interpolate(template: string, ctx: EngineContext): string {
    return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
        const value = evalExpr(expr, ctx);
        return value !== undefined && value !== null ? String(value) : "";
    });
}

// ----------------------------------------------------------------------------
// Deep Interpolation
// ----------------------------------------------------------------------------

/**
 * Recursively interpolate all string values in an object/array.
 * Non-string values pass through unchanged.
 *
 * @example interpolateDeep({ msg: "Hi ${rowData.name}", count: 5 }, ctx)
 *          → { msg: "Hi Alice", count: 5 }
 */
export function interpolateDeep(value: unknown, ctx: EngineContext): unknown {
    if (typeof value === "string") {
        return interpolate(value, ctx);
    }
    if (Array.isArray(value)) {
        return value.map((item) => interpolateDeep(item, ctx));
    }
    if (value !== null && typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            result[k] = interpolateDeep(v, ctx);
        }
        return result;
    }
    return value;
}

// ----------------------------------------------------------------------------
// Path Utilities
// ----------------------------------------------------------------------------

/**
 * Access nested property by dot-separated path.
 *
 * @example getByPath({ data: { user: { name: "A" } } }, "data.user.name") → "A"
 */
export function getByPath(obj: unknown, path: string): unknown {
    return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

// ----------------------------------------------------------------------------
// Body Resolution
// ----------------------------------------------------------------------------

/**
 * Resolve body for API calls from step config.
 * - "formValues" → ctx.formValues
 * - "rowData"    → ctx.rowData
 * - object       → deep interpolate all string values
 * - undefined    → undefined (no body)
 */
export function resolveBody(
    body: "formValues" | "rowData" | Record<string, unknown> | undefined,
    ctx: EngineContext
): unknown {
    if (body === undefined) return undefined;
    if (body === "formValues") return ctx.formValues;
    if (body === "rowData") return ctx.rowData;
    return interpolateDeep(body, ctx);
}

// ----------------------------------------------------------------------------
// Form Sync Helper
// ----------------------------------------------------------------------------

/**
 * Re-read form values into ctx after mutations.
 * Call after any setValue/reset to keep ctx.formValues in sync.
 */
export function syncFormValues(ctx: EngineContext): void {
    ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
}