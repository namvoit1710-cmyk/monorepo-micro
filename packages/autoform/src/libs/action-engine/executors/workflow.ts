// ============================================================================
// Workflow Executor — trigger_workflow
// ============================================================================
// Call API → extract run_id → subscribe Socket.IO → suspend pipeline
// until completion event or timeout.
// ============================================================================

import type { ISocket } from "@ldc/api-sdk/socket";
import type { EngineContext } from "../types";
import { getByPath, interpolate, resolveBody, syncFormValues } from "../utils";
import { serviceRequest } from "../utils/service-request";

// ----------------------------------------------------------------------------
// Socket Suspend Helper
// ----------------------------------------------------------------------------

interface WaitForSocketOptions {
    socket: ISocket;
    channel: string;
    eventKeyField: string;
    successKey: string;
    errorKey?: string;
    runId?: string;
    timeout: number;
}

function waitForSocketEvent(options: WaitForSocketOptions): Promise<unknown> {
    const { socket, channel, eventKeyField, successKey, errorKey, runId, timeout } = options;

    return new Promise((resolve, reject) => {
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout>;

        const cleanup = () => {
            socket.off(channel, handler);
            clearTimeout(timeoutId);
        };

        const handler = (...args: unknown[]) => {
            const payload = args[0] as Record<string, unknown>;
            if (!payload || typeof payload !== "object") return;

            // Filter by run_id to avoid receiving events from other workflow instances
            if (runId && payload["run_id"] !== undefined && payload["run_id"] !== runId) {
                return;
            }

            const eventKey = payload[eventKeyField];

            if (eventKey === successKey) {
                if (settled) return;
                settled = true;
                cleanup();
                resolve(payload);
                return;
            }

            if (errorKey && eventKey === errorKey) {
                if (settled) return;
                settled = true;
                cleanup();
                const errorMessage =
                    (payload["message"] as string) ??
                    (payload["error"] as string) ??
                    `Workflow failed with event: ${String(eventKey)}`;
                reject(new Error(errorMessage));
                return;
            }

            // Other events (progress, chunk...) → ignore
        };

        socket.on(channel, handler);

        timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(
                new Error(
                    `[ActionEngine] trigger_workflow timeout after ${timeout}ms waiting for "${successKey}"`
                )
            );
        }, timeout);
    });
}

// ----------------------------------------------------------------------------
// Executor
// ----------------------------------------------------------------------------

export async function executeTriggerWorkflow(
    step: {
        type: "trigger_workflow";
        service?: string;
        endpoint: string;
        body?: "formValues" | "rowData" | Record<string, unknown>;
        runIdPath?: string;
        socketNamespace?: string;
        socketChannel?: string;
        socketEventKeyField?: string;
        socketEventKey: string;
        socketErrorKey?: string;
        timeout?: number;
        resultMapping?: Record<string, string>;
    },
    ctx: EngineContext
): Promise<boolean> {
    const { actionSocket } = ctx;

    if (!actionSocket) {
        throw new Error(
            "[ActionEngine] trigger_workflow requires actionSocket injected into useActionEngine"
        );
    }

    // 1. Connect socket namespace (reuses existing connection)
    const namespace = step.socketNamespace ?? "/";
    const socket = actionSocket.connect(namespace);

    // 2. Call API to trigger workflow
    const url = interpolate(step.endpoint, ctx);
    const body = resolveBody(step.body, ctx);

    let apiResponse: unknown;

    const svc = step.service ? ctx.services?.[step.service] : undefined;
    if (svc) {
        apiResponse = await serviceRequest(
            svc,
            "POST",
            url,
            body,
            undefined
        );
    } else {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(
                (error as any)?.message ??
                `trigger_workflow API failed: ${res.status}`
            );
        }

        apiResponse = await res.json().catch(() => null);
    }

    // 3. Extract run_id for socket event filtering
    const runId: string | undefined = step.runIdPath
        ? (getByPath(apiResponse, step.runIdPath) as string)
        : undefined;

    // 4. Subscribe socket — pipeline suspends here
    const socketResult = await waitForSocketEvent({
        socket,
        channel: step.socketChannel ?? "data_chunk",
        eventKeyField: step.socketEventKeyField ?? "_event",
        successKey: step.socketEventKey,
        errorKey: step.socketErrorKey,
        runId,
        timeout: step.timeout ?? 30_000,
    });

    // 5. Set lastResult for downstream steps
    ctx.lastResult = {
        apiResponse,
        socketPayload: socketResult,
        run_id: runId,
    };

    // 6. Map socket payload into form fields
    if (step.resultMapping) {
        for (const [payloadPath, formField] of Object.entries(step.resultMapping)) {
            const value = getByPath(socketResult, payloadPath);
            if (value !== undefined) {
                ctx.methods.setValue(formField, value, { shouldValidate: true });
            }
        }
        syncFormValues(ctx);
    }

    return true;
}