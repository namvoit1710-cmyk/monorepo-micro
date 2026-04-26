// ============================================================================
// UI Executors — toast, confirm, redirect, close_dialog, refresh, emit_event
// ============================================================================

import type { EngineContext } from "../types";
import { interpolate, interpolateDeep } from "../utils";

// --- toast ---

export async function executeToast(
    step: { type: "toast"; message: string; variant?: string },
    ctx: EngineContext
): Promise<boolean> {
    const message = interpolate(step.message, ctx);
    ctx.ui.toast(message, step.variant);
    return true;
}

// --- confirm ---

export async function executeConfirm(
    step: { type: "confirm"; message: string; title?: string },
    ctx: EngineContext
): Promise<boolean> {
    const message = interpolate(step.message, ctx);
    const title = step.title ? interpolate(step.title, ctx) : undefined;
    const confirmed = await ctx.ui.confirm(message, title);
    return confirmed; // false → stops pipeline
}

// --- redirect ---

export async function executeRedirect(
    step: { type: "redirect"; url: string },
    ctx: EngineContext
): Promise<boolean> {
    const url = interpolate(step.url, ctx);
    ctx.ui.redirect(url);
    return true;
}

// --- close_dialog ---

export async function executeCloseDialog(
    _step: { type: "close_dialog" },
    ctx: EngineContext
): Promise<boolean> {
    ctx.ui.closeDialog?.();
    return true;
}

// --- refresh ---

export async function executeRefresh(
    _step: { type: "refresh" },
    ctx: EngineContext
): Promise<boolean> {
    ctx.ui.refresh?.();
    return true;
}

// --- emit_event [FIXED: deep interpolate payload] ---

export async function executeEmitEvent(
    step: { type: "emit_event"; event: string; payload?: Record<string, unknown> },
    ctx: EngineContext
): Promise<boolean> {
    const event = interpolate(step.event, ctx);
    const payload = step.payload
        ? (interpolateDeep(step.payload, ctx) as Record<string, unknown>)
        : undefined;
    ctx.ui.emitEvent?.(event, payload);
    return true;
}