// ============================================================================
// Data Executors — api_call, update_row, refetch_odata, refetch_data, poll
// ============================================================================

import type { EngineContext } from "../types";
import {
    evalExpr,
    getByPath,
    interpolate,
    interpolateDeep,
    resolveBody,
    syncFormValues,
} from "../utils";
import { serviceRequest } from "../utils/service-request";

// --- api_call ---

export async function executeApiCall(
    step: {
        type: "api_call";
        service?: string;
        method: string;
        endpoint: string;
        body?: "formValues" | "rowData" | Record<string, unknown>;
        headers?: Record<string, string>;
        resultMapping?: Record<string, string>;
        errorMapping?: Record<string, string>;
    },
    ctx: EngineContext
): Promise<boolean> {
    const url = interpolate(step.endpoint, ctx);
    const body = resolveBody(step.body, ctx);

    let data: unknown;

    const svc = step.service ? ctx.services?.[step.service] : undefined;
    if (svc) {
        data = await serviceRequest(
            svc,
            step.method,
            url,
            body,
            step.headers
        );
    } else {
        const res = await fetch(url, {
            method: step.method,
            headers: { "Content-Type": "application/json", ...step.headers },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));

            // Map API errors to form field errors
            if (step.errorMapping) {
                for (const [responsePath, fieldName] of Object.entries(step.errorMapping)) {
                    const msg = getByPath(error, responsePath);
                    if (msg) ctx.methods.setError(fieldName, { message: String(msg) });
                }
            }

            throw new Error(
                (error as any)?.message ?? `API call failed: ${res.status}`
            );
        }

        data = await res.json().catch(() => null);
    }

    ctx.lastResult = data;

    // Map response fields into form
    if (step.resultMapping) {
        for (const [responsePath, formField] of Object.entries(step.resultMapping)) {
            const value = getByPath(data, responsePath);
            if (value !== undefined) {
                ctx.methods.setValue(formField, value, { shouldValidate: true });
            }
        }
        syncFormValues(ctx);
    }

    return true;
}

// --- update_row ---

export async function executeUpdateRow(
    step: {
        type: "update_row";
        data?: Record<string, unknown>;
        fromResult?: Record<string, string>;
    },
    ctx: EngineContext
): Promise<boolean> {
    if (!ctx.updateRow) {
        throw new Error(
            "[ActionEngine] update_row step requires row context (updateRow callback)"
        );
    }

    const partial: Record<string, unknown> = {};

    // Static data — deep interpolate string values [FIX]
    if (step.data) {
        const interpolated = interpolateDeep(step.data, ctx) as Record<string, unknown>;
        Object.assign(partial, interpolated);
    }

    // Map from lastResult
    if (step.fromResult && ctx.lastResult) {
        for (const [responsePath, fieldKey] of Object.entries(step.fromResult)) {
            const value = getByPath(ctx.lastResult, responsePath);
            if (value !== undefined) {
                partial[fieldKey] = value;
            }
        }
    }

    ctx.updateRow(partial);
    return true;
}

// --- refetch_odata ---

export async function executeRefetchOData(
    _step: { type: "refetch_odata" },
    ctx: EngineContext
): Promise<boolean> {
    if (!ctx.refetchData) {
        console.warn("[ActionEngine] refetch_odata: no refetchData callback");
        return true;
    }
    await ctx.refetchData();
    return true;
}

// --- refetch_data ---

export async function executeRefetchData(
    step: {
        type: "refetch_data";
        service?: string;
        endpoint?: string;
        filter?: string;
        orderBy?: string;
        pageSize?: number;
    },
    ctx: EngineContext
): Promise<boolean> {
    // Priority 1: refetchData callback from wrapper
    if (ctx.refetchData) {
        const params = {
            endpoint: step.endpoint ? interpolate(step.endpoint, ctx) : undefined,
            filter: step.filter ? interpolate(step.filter, ctx) : undefined,
            orderBy: step.orderBy,
            pageSize: step.pageSize,
        };
        await ctx.refetchData(params);
        return true;
    }

    // Priority 2: service + endpoint → self fetch
    if (step.endpoint) {
        const endpoint = interpolate(step.endpoint, ctx);
        const params: Record<string, string> = {};
        if (step.filter) params["$filter"] = interpolate(step.filter, ctx);
        if (step.orderBy) params["$orderby"] = step.orderBy;
        if (step.pageSize) params["$top"] = String(step.pageSize);
        params["$count"] = "true";

        const serviceName = step.service ?? "odata";
        const service = ctx.services?.[serviceName];

        if (service) {
            ctx.lastResult = await service.fetch(endpoint, params);
        } else {
            const queryString = new URLSearchParams(params).toString();
            const separator = endpoint.includes("?") ? "&" : "?";
            const res = await fetch(`${endpoint}${separator}${queryString}`);
            if (!res.ok) throw new Error(`Refetch failed: ${res.status}`);
            ctx.lastResult = await res.json();
        }

        return true;
    }

    console.warn("[ActionEngine] refetch_data: no callback and no endpoint");
    return true;
}

// --- poll ---

export async function executePoll(
    step: {
        type: "poll";
        service?: string;
        endpoint: string;
        interval?: number;
        maxAttempts?: number;
        until: string;
    },
    ctx: EngineContext
): Promise<boolean> {
    const maxAttempts = step.maxAttempts ?? 30;
    const interval = step.interval ?? 2000;

    for (let i = 0; i < maxAttempts; i++) {
        const url = interpolate(step.endpoint, ctx);

        let data: unknown;

        const svc = step.service ? ctx.services?.[step.service] : undefined;
        if (svc) {
            data = await svc.fetch(url);
        } else {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`[ActionEngine] Poll request failed: ${res.status}`);
            data = await res.json();
        }

        ctx.lastResult = data;

        const done = evalExpr(step.until, { ...ctx, lastResult: data });
        if (done) return true;

        await new Promise((r) => setTimeout(r, interval));
    }

    throw new Error(
        `[ActionEngine] Polling timeout after ${maxAttempts} attempts`
    );
}