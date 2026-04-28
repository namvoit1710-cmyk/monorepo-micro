// ============================================================================
// Action Pipeline Engine
// ============================================================================
// Chạy action pipeline từ JSON config. Mỗi step được execute tuần tự.
// Pipeline dừng nếu step nào return false (ví dụ: confirm bị cancel).
// ============================================================================

import { ISocket } from "@ldc/api-sdk/socket";
import type { ActionConfig, ActionResult, ActionStep, EngineContext } from "../types/action-config";
import serviceRequest from "../utils/service-request";


// ----------------------------------------------------------------------------
// Expression Evaluator
// ----------------------------------------------------------------------------
// Safe expression evaluator — KHÔNG dùng eval() trực tiếp.
// Production có thể thay bằng expr-eval, jsonata, hoặc custom parser.
// ----------------------------------------------------------------------------

function evalExpr(expr: string, ctx: EngineContext): unknown {
  const { formValues, lastResult, rowData } = ctx;
  try {
    const fn = new Function(
      "formValues", "lastResult", "rowData", "Math",
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
// Thay thế ${...} trong string bằng giá trị runtime.
// Ví dụ: "/api/orders/${rowData.id}" → "/api/orders/123"
// ----------------------------------------------------------------------------

function interpolate(template: string, ctx: EngineContext): string {
  return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    const value = evalExpr(expr, ctx);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

// ----------------------------------------------------------------------------
// Path Utilities
// ----------------------------------------------------------------------------

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

// ----------------------------------------------------------------------------
// Step Executors
// ----------------------------------------------------------------------------

async function executeSetValue(step: ActionStep & { type: "set_value" }, ctx: EngineContext): Promise<boolean> {
  let value: unknown;

  if (step.expr) {
    value = evalExpr(step.expr, ctx);
  } else if (step.from) {
    value = ctx.methods.getValues(step.from);
  } else {
    value = step.value;
  }

  ctx.methods.setValue(step.field, value, { shouldValidate: true });
  // Sync lại formValues cho step tiếp theo
  ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
  return true;
}

async function executeClearField(step: ActionStep & { type: "clear_field" }, ctx: EngineContext): Promise<boolean> {
  const fields = step.fields ?? (step.field ? [step.field] : []);
  for (const f of fields) {
    ctx.methods.setValue(f, undefined);
  }
  ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
  return true;
}

async function executeValidate(step: ActionStep & { type: "validate" }, ctx: EngineContext): Promise<boolean> {
  if (step.fields?.length) {
    const results = await Promise.all(step.fields.map((f) => ctx.methods.trigger(f)));
    return results.every(Boolean);
  }
  return ctx.methods.trigger();
}

async function executeResetForm(step: ActionStep & { type: "reset_form" }, ctx: EngineContext): Promise<boolean> {
  const keep: Record<string, unknown> = {};
  if (step.keepFields) {
    for (const f of step.keepFields) {
      keep[f] = ctx.methods.getValues(f);
    }
  }
  ctx.methods.reset();
  if (step.keepFields) {
    for (const [k, v] of Object.entries(keep)) {
      ctx.methods.setValue(k, v);
    }
  }
  ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
  return true;
}

async function executeApiCall(
  step: ActionStep & { type: "api_call" },
  ctx: EngineContext
): Promise<boolean> {
  const url = interpolate(step.endpoint, ctx);

  // Resolve body
  let body: unknown;
  if (step.body === "formValues") {
    body = ctx.formValues;
  } else if (step.body === "rowData") {
    body = ctx.rowData;
  } else if (step.body && typeof step.body === "object") {
    body = JSON.parse(interpolate(JSON.stringify(step.body), ctx));
  }

  let data: unknown;

  // Nếu có service name → dùng registered service (APISdk)
  if (step.service && ctx.services?.[step.service]) {
    const service = ctx.services[step.service];

    switch (step.method) {
      case "GET":
        data = await service?.fetch(url);
        break;
      case "POST":
      case "PUT":
      case "PATCH":
      case "DELETE":
        // Service hiện tại chỉ có fetch (GET)
        // Cần mở rộng service interface hoặc fallback raw fetch
        data = await serviceRequest(service, step.method, url, body, step.headers);
        break;
    }
  } else {
    // Fallback: raw fetch (không qua APISdk)
    const res = await fetch(url, {
      method: step.method,
      headers: { "Content-Type": "application/json", ...step.headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      if (step.errorMapping) {
        for (const [responsePath, fieldName] of Object.entries(step.errorMapping)) {
          const msg = getByPath(error, responsePath);
          if (msg) ctx.methods.setError(fieldName, { message: String(msg) });
        }
      }
      throw new Error((error as any)?.message ?? `API call failed: ${res.status}`);
    }

    data = await res.json().catch(() => null);
  }

  ctx.lastResult = data;

  // Map response fields vào form
  if (step.resultMapping) {
    for (const [responsePath, formField] of Object.entries(step.resultMapping)) {
      const value = getByPath(data, responsePath);
      if (value !== undefined) {
        ctx.methods.setValue(formField, value, { shouldValidate: true });
      }
    }
    ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
  }

  return true;
}

async function executeUpdateRow(step: ActionStep & { type: "update_row" }, ctx: EngineContext): Promise<boolean> {
  if (!ctx.updateRow) {
    throw new Error("[ActionEngine] update_row step requires row context (updateRow callback)");
  }

  const partial: Record<string, unknown> = {};

  // Static data
  if (step.data) {
    for (const [k, v] of Object.entries(step.data)) {
      partial[k] = v;
    }
  }

  // Map từ API response (lastResult)
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

async function executeRefetchData(
  step: ActionStep & { type: "refetch_data" },
  ctx: EngineContext
): Promise<boolean> {
  // Ưu tiên 1: callback từ wrapper
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

  // Ưu tiên 2: service + endpoint → tự fetch
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
      const data = await service.fetch(endpoint, params);
      ctx.lastResult = data;
    } else {
      // Fallback raw fetch
      const queryString = new URLSearchParams(params).toString();
      const separator = endpoint.includes("?") ? "&" : "?";
      const res = await fetch(`${endpoint}${separator}${queryString}`);
      if (!res.ok) throw new Error(`Refetch failed: ${res.status}`);
      ctx.lastResult = await res.json();
    }

    return true;
  }

  console.warn("[ActionEngine] refetch_data: no callback, no endpoint");
  return true;
}

async function executePoll(step: ActionStep & { type: "poll" }, ctx: EngineContext): Promise<boolean> {
  const maxAttempts = step.maxAttempts ?? 30;
  const interval = step.interval ?? 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const url = interpolate(step.endpoint, ctx);
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`[ActionEngine] Poll request failed: ${res.status}`);
    }

    const data = await res.json();
    ctx.lastResult = data;

    // Evaluate "until" condition
    const done = evalExpr(step.until, { ...ctx, lastResult: data });
    if (done) return true;

    // Wait before next attempt
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error(`[ActionEngine] Polling timeout after ${maxAttempts} attempts`);
}

async function executeToast(step: ActionStep & { type: "toast" }, ctx: EngineContext): Promise<boolean> {
  const message = interpolate(step.message, ctx);
  ctx.ui.toast(message, step.variant);
  return true;
}

async function executeConfirm(step: ActionStep & { type: "confirm" }, ctx: EngineContext): Promise<boolean> {
  const message = interpolate(step.message, ctx);
  const confirmed = await ctx.ui.confirm(message, step.title);
  return confirmed; // false → dừng pipeline
}

async function executeRedirect(step: ActionStep & { type: "redirect" }, ctx: EngineContext): Promise<boolean> {
  const url = interpolate(step.url, ctx);
  ctx.ui.redirect(url);
  return true;
}

async function executeCondition(step: ActionStep & { type: "condition" }, ctx: EngineContext): Promise<boolean> {
  const result = evalExpr(step.expr, ctx);
  const branch = result ? step.then : (step.else ?? []);
  return executePipeline(branch, ctx);
}

async function executeCustom(step: ActionStep & { type: "custom" }, ctx: EngineContext): Promise<boolean> {
  const handler = ctx.customHandlers?.[step.handler];
  if (!handler) {
    throw new Error(`[ActionEngine] Custom handler "${step.handler}" not registered`);
  }
  await handler(ctx);
  return true;
}

// ----------------------------------------------------------------------------
// Trigger Workflow — Socket.IO suspend helper
// ----------------------------------------------------------------------------

interface WaitForSocketOptions {
  socket: ISocket;
  channel: string;
  eventKeyField: string;
  successKey: string;
  errorKey?: string;
  /** Filter đúng workflow instance — tránh nhận nhầm event */
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

      // Filter theo run_id nếu BE trả về trong payload
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
          `[ActionEngine] Workflow failed with event: ${String(eventKey)}`;
        reject(new Error(errorMessage));
        return;
      }
      // Các event khác (progress, chunk...) → ignore
    };

    socket.on(channel, handler);

    timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new Error(
          `[ActionEngine] trigger_workflow timeout after ${timeout}ms waiting for "${successKey}" event`
        )
      );
    }, timeout);
  });
}

async function executeTriggerWorkflow(
  step: ActionStep & { type: "trigger_workflow" },
  ctx: EngineContext
): Promise<boolean> {
  const { actionSocket } = ctx;

  if (!actionSocket) {
    throw new Error(
      "[ActionEngine] trigger_workflow step requires actionSocket (SocketClient) injected into useActionEngine"
    );
  }

  // Connect namespace từ step config — reuse nếu đã connected
  const namespace = step.socketNamespace ?? "/";
  const socket = actionSocket.connect(namespace);

  // 1. Call API trigger workflow
  const url = interpolate(step.endpoint, ctx);

  let body: unknown;
  if (step.body === "formValues") {
    body = ctx.formValues;
  } else if (step.body === "rowData") {
    body = ctx.rowData;
  } else if (step.body && typeof step.body === "object") {
    body = JSON.parse(interpolate(JSON.stringify(step.body), ctx));
  }

  let apiResponse: unknown;

  if (step.service && ctx.services?.[step.service]) {
    apiResponse = await serviceRequest(
      ctx.services[step.service],
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
        (error as any)?.message ?? `[ActionEngine] trigger_workflow API failed: ${res.status}`
      );
    }

    apiResponse = await res.json().catch(() => null);
  }

  // 2. Extract run_id để filter đúng socket event
  const runId: string | undefined = step.runIdPath
    ? (getByPath(apiResponse, step.runIdPath) as string)
    : undefined;

  // 3. Subscribe socket — suspend pipeline chờ completion
  const socketResult = await waitForSocketEvent({
    socket,
    channel: step.socketChannel ?? "data_chunk",
    eventKeyField: step.socketEventKeyField ?? "_event",
    successKey: step.socketEventKey,
    errorKey: step.socketErrorKey,
    runId,
    timeout: step.timeout ?? 30_000,
  });

  // 4. Set lastResult cho step tiếp theo
  ctx.lastResult = {
    apiResponse,
    socketPayload: socketResult,
    run_id: runId,
  };

  // 5. Map socket payload vào form fields
  if (step.resultMapping) {
    for (const [payloadPath, formField] of Object.entries(step.resultMapping)) {
      const value = getByPath(socketResult, payloadPath);
      if (value !== undefined) {
        ctx.methods.setValue(formField, value, { shouldValidate: true });
      }
    }
    ctx.formValues = ctx.methods.getValues() as Record<string, unknown>;
  }

  return true;
}

// ----------------------------------------------------------------------------
// Step Router
// ----------------------------------------------------------------------------

async function executeStep(step: ActionStep, ctx: EngineContext): Promise<boolean> {
  switch (step.type) {
    case "set_value":
      return executeSetValue(step, ctx);

    case "clear_field":
      return executeClearField(step, ctx);

    case "validate":
      return executeValidate(step, ctx);

    case "reset_form":
      return executeResetForm(step, ctx);

    case "api_call":
      return executeApiCall(step, ctx);

    case "update_row":
      return executeUpdateRow(step, ctx);

    case "refetch_data":
      return executeRefetchData(step, ctx);

    case "poll":
      return executePoll(step, ctx);

    case "toast":
      return executeToast(step, ctx);

    case "confirm":
      return executeConfirm(step, ctx);

    case "redirect":
      return executeRedirect(step, ctx);

    case "close_dialog":
      ctx.ui.closeDialog?.();
      return true;

    case "refresh":
      ctx.ui.refresh?.();
      return true;

    case "emit_event":
      ctx.ui.emitEvent?.(step.event, step.payload);
      return true;

    case "condition":
      return executeCondition(step, ctx);

    case "custom":
      return executeCustom(step, ctx);

    case "trigger_workflow":
      return executeTriggerWorkflow(step, ctx);

    default:
      console.warn(`[ActionEngine] Unknown step type: ${(step as any).type}`);
      return true;
  }
}

// ----------------------------------------------------------------------------
// Pipeline Runner — chạy steps tuần tự, dừng nếu step nào return false
// ----------------------------------------------------------------------------

async function executePipeline(steps: ActionStep[], ctx: EngineContext): Promise<boolean> {
  for (const step of steps) {
    const ok = await executeStep(step, ctx);
    if (!ok) return false;
  }
  return true;
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/**
 * Chạy một action config.
 *
 * @param config - ActionConfig chứa steps pipeline
 * @param ctx - EngineContext chứa runtime data (formValues, methods, ui callbacks, etc.)
 * @returns ActionResult { success, message? }
 *
 * @example
 * ```ts
 * const result = await runAction(
 *   {
 *     action: "pick_requirement",
 *     steps: [
 *       { type: "api_call", method: "POST", endpoint: "/api/requirements/${rowData.id}/pick" },
 *       { type: "update_row", fromResult: { "data.assignee": "assignee" } },
 *       { type: "toast", message: "Picked!", variant: "success" },
 *     ],
 *   },
 *   engineContext,
 * );
 * ```
 */
export async function runAction(config: ActionConfig, ctx: EngineContext): Promise<ActionResult> {
  try {
    const ok = await executePipeline(config.steps, ctx);
    return { success: ok };
  } catch (error) {
    // Chạy onError pipeline nếu có
    if (config.onError?.length) {
      const errorCtx: EngineContext = {
        ...ctx,
        lastResult: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
      try {
        await executePipeline(config.onError, errorCtx);
      } catch (onErrorError) {
        console.error("[ActionEngine] onError pipeline also failed:", onErrorError);
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}