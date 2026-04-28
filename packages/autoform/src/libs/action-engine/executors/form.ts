import type { EngineContext } from "../types";
import { evalExpr, interpolate, syncFormValues } from "../utils";

export async function executeSetValue(
  step: { type: "set_value"; field: string; value?: unknown; from?: string; expr?: string },
  ctx: EngineContext
): Promise<boolean> {
  let value: unknown;

  if (step.expr) {
    value = evalExpr(step.expr, ctx);
  } else if (step.from) {
    value = ctx.methods.getValues(step.from);
  } else {
    value = step.value;
  }

  ctx.methods.setValue(step.field, value, { shouldValidate: true });
  syncFormValues(ctx);
  return true;
}

export async function executeClearField(
  step: { type: "clear_field"; field?: string; fields?: string[] },
  ctx: EngineContext
): Promise<boolean> {
  const fields = step.fields ?? (step.field ? [step.field] : []);
  for (const f of fields) {
    ctx.methods.setValue(f, undefined);
  }
  syncFormValues(ctx);
  return true;
}

export async function executeValidate(
  step: { type: "validate"; fields?: string[] },
  ctx: EngineContext
): Promise<boolean> {
  if (step.fields?.length) {
    const results = await Promise.all(step.fields.map((f) => ctx.methods.trigger(f)));
    return results.every(Boolean);
  }
  return ctx.methods.trigger();
}

export async function executeResetForm(
  step: { type: "reset_form"; keepFields?: string[] },
  ctx: EngineContext
): Promise<boolean> {
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

  syncFormValues(ctx);
  return true;
}

export async function executeSetFieldError(
  step: { type: "set_field_error"; field: string; message: string },
  ctx: EngineContext
): Promise<boolean> {
  const message = interpolate(step.message, ctx);
  const field = interpolate(step.field, ctx);
  ctx.methods.setError(field, { message });
  return true;
}

export async function executeClearFieldError(
  step: { type: "clear_field_error"; field?: string; fields?: string[] },
  ctx: EngineContext
): Promise<boolean> {
  const fields = step.fields ?? (step.field ? [step.field] : []);
  if (fields.length) {
    ctx.methods.clearErrors(fields);
  } else {
    ctx.methods.clearErrors();
  }
  return true;
}