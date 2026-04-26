// ============================================================================
// Action Engine — Public API
// ============================================================================

// Core
export { runAction } from "./core/runner";

// Hook
export { useActionEngine } from "./hooks/use-action-engine";
export type { UseActionEngineOptions, UseActionEngineReturn } from "./hooks/use-action-engine";

// Types
export type {
    ActionConfig,
    ActionResult,
    ActionStep, ApiCallStep, ClearFieldErrorStep, ClearFieldStep, CloseDialogStep, ConditionStep, ConfirmStep, CustomStep, EmitEventStep, EngineContext, PollStep, RedirectStep, RefetchDataStep, RefetchODataStep, RefetchParams, RefreshStep, ResetFormStep,
    SetFieldErrorStep,
    // Individual step types (for custom executor development)
    SetValueStep, ToastStep, TriggerWorkflowStep, UpdateRowStep, ValidateStep
} from "./types";

// Utils (for custom handlers that need engine utilities)
export { evalExpr, getByPath, interpolate, interpolateDeep, resolveBody } from "./utils";

