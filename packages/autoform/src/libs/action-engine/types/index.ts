// ============================================================================
// Action Engine — Type Definitions
// ============================================================================
// Mỗi action là một JSON config mô tả chuỗi steps chạy tuần tự.
// Thêm action mới = thêm JSON, không cần deploy code.
// ============================================================================

import type { SocketClient } from "@ldc/api-sdk/socket";

// ============================================================================
// Shared
// ============================================================================

export interface RefetchParams {
    endpoint?: string;
    filter?: string;
    orderBy?: string;
    pageSize?: number;
}

// ============================================================================
// Step Types — Form Manipulation
// ============================================================================

/** Set value vào form field */
export interface SetValueStep {
    type: "set_value";
    field: string;
    /** Static value */
    value?: unknown;
    /** Copy từ field khác */
    from?: string;
    /** Expression: "items.reduce((s,i) => s + i.qty * i.price, 0)" */
    expr?: string;
}

/** Clear 1 hoặc nhiều fields */
export interface ClearFieldStep {
    type: "clear_field";
    field?: string;
    fields?: string[];
}

/** Validate form hoặc specific fields — return false stops pipeline */
export interface ValidateStep {
    type: "validate";
    fields?: string[];
}

/** Reset form, optionally giữ lại 1 số fields */
export interface ResetFormStep {
    type: "reset_form";
    keepFields?: string[];
}

/**
 * [NEW] Set error trên form field — dùng cho business logic errors
 * (khác với api_call.errorMapping chỉ trigger khi HTTP error).
 */
export interface SetFieldErrorStep {
    type: "set_field_error";
    /** Field name để set error */
    field: string;
    /** Error message — hỗ trợ template */
    message: string;
}

/**
 * [NEW] Clear errors trên form fields
 */
export interface ClearFieldErrorStep {
    type: "clear_field_error";
    field?: string;
    fields?: string[];
}

// ============================================================================
// Step Types — API & Data
// ============================================================================

/** Gọi REST API */
export interface ApiCallStep {
    type: "api_call";
    /** Tên service đã register trong context.services */
    service?: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** Hỗ trợ template: "/api/orders/${rowData.id}" */
    endpoint: string;
    /** "formValues" | "rowData" | object cụ thể (deep interpolated) */
    body?: "formValues" | "rowData" | Record<string, unknown>;
    headers?: Record<string, string>;
    /** Map response vào form fields: { "data.total": "totalField" } */
    resultMapping?: Record<string, string>;
    /** Map error vào field errors (chỉ khi HTTP error): { "errors.name": "nameField" } */
    errorMapping?: Record<string, string>;
}

/** Update 1 row trong table (cần row context) */
export interface UpdateRowStep {
    type: "update_row";
    /** Static data merge vào row — string values được interpolated */
    data?: Record<string, unknown>;
    /** Map từ lastResult: { "data.assignee": "assignee" } */
    fromResult?: Record<string, string>;
}

/** Refetch OData data cho table */
export interface RefetchODataStep {
    type: "refetch_odata";
}

/** Refetch data với params tùy chỉnh */
export interface RefetchDataStep {
    type: "refetch_data";
    service?: string;
    endpoint?: string;
    filter?: string;
    orderBy?: string;
    pageSize?: number;
}

/** Polling endpoint cho async service */
export interface PollStep {
    type: "poll";
    service?: string;
    /** Template endpoint: "/api/jobs/${lastResult.data.jobId}/status" */
    endpoint: string;
    /** Polling interval in ms @default 2000 */
    interval?: number;
    /** Max attempts before timeout @default 30 */
    maxAttempts?: number;
    /** Condition expression: "lastResult.status === 'completed'" */
    until: string;
}

// ============================================================================
// Step Types — UI Feedback
// ============================================================================

/** Hiện toast notification */
export interface ToastStep {
    type: "toast";
    /** Hỗ trợ template: "Created: ${lastResult.data.name}" */
    message: string;
    variant?: "success" | "error" | "info" | "warning";
}

/** Hiện confirm dialog — return false stops pipeline */
export interface ConfirmStep {
    type: "confirm";
    /** Hỗ trợ template */
    message: string;
    title?: string;
}

/** Redirect trang */
export interface RedirectStep {
    type: "redirect";
    /** Template URL: "/orders/${lastResult.data.id}" */
    url: string;
}

/** Đóng dialog */
export interface CloseDialogStep {
    type: "close_dialog";
}

/** Refresh form (re-mount) */
export interface RefreshStep {
    type: "refresh";
}

/** Emit custom event cho parent component */
export interface EmitEventStep {
    type: "emit_event";
    event: string;
    /** Payload — string values được interpolated */
    payload?: Record<string, unknown>;
}

// ============================================================================
// Step Types — Flow Control
// ============================================================================

/** Branching: if expr then [...] else [...] */
export interface ConditionStep {
    type: "condition";
    /** Expression: "formValues.status === 'active'" */
    expr: string;
    then: ActionStep[];
    else?: ActionStep[];
}

/** Escape hatch: gọi handler đã register bằng code */
export interface CustomStep {
    type: "custom";
    /** Tên handler đã đăng ký trong customHandlers */
    handler: string;
}

// ============================================================================
// Step Types — Workflow Integration
// ============================================================================

/**
 * Trigger workflow qua REST API + subscribe Socket.IO chờ completion.
 * Pipeline suspend tại đây cho đến khi socket trả event hoặc timeout.
 */
export interface TriggerWorkflowStep {
    type: "trigger_workflow";
    service?: string;
    /** Template endpoint */
    endpoint: string;
    body?: "formValues" | "rowData" | Record<string, unknown>;
    /** Path extract run_id từ API response @example "data.run_id" */
    runIdPath?: string;
    /** @default "/" */
    socketNamespace?: string;
    /** @default "data_chunk" */
    socketChannel?: string;
    /** @default "_event" */
    socketEventKeyField?: string;
    /** Event key detect completion @example "workflow_completed" */
    socketEventKey: string;
    /** Event key detect error @example "workflow_error" */
    socketErrorKey?: string;
    /** Timeout ms @default 30000 */
    timeout?: number;
    /** Map socket payload vào form fields */
    resultMapping?: Record<string, string>;
}

// ============================================================================
// Union & Config
// ============================================================================

export type ActionStep =
    | SetValueStep
    | ClearFieldStep
    | ValidateStep
    | ResetFormStep
    | SetFieldErrorStep
    | ClearFieldErrorStep
    | ApiCallStep
    | UpdateRowStep
    | RefetchODataStep
    | RefetchDataStep
    | PollStep
    | ToastStep
    | ConfirmStep
    | RedirectStep
    | CloseDialogStep
    | RefreshStep
    | EmitEventStep
    | ConditionStep
    | CustomStep
    | TriggerWorkflowStep;

export interface ActionConfig {
    /** Action name — match với button's controlProps.action */
    action: string;
    /** Label cho debug/logging */
    label?: string;
    /** Pipeline steps chạy tuần tự */
    steps: ActionStep[];
    /** Pipeline chạy khi có step fail */
    onError?: ActionStep[];
}

// ============================================================================
// Engine Context
// ============================================================================

export interface EngineContext {
    /** Current form values — synced after mutations */
    formValues: Record<string, unknown>;

    /** react-hook-form methods */
    methods: {
        setValue: (name: string, value: unknown, options?: Record<string, boolean>) => void;
        getValues: (name?: string) => unknown;
        trigger: (name?: string | string[]) => Promise<boolean>;
        setError: (name: string, error: { message: string }) => void;
        reset: (values?: Record<string, unknown>) => void;
        clearErrors: (name?: string | string[]) => void;
    };

    /** Kết quả step gần nhất — step sau dùng được */
    lastResult?: unknown;

    /** Row context — cho row-level actions trong table */
    rowId?: string;
    rowIndex?: number;
    rowData?: Record<string, unknown>;
    updateRow?: (partial: Record<string, unknown>) => void;

    /** Custom handlers cho type: "custom" */
    customHandlers?: Record<string, (ctx: EngineContext) => Promise<void>>;

    /** Refetch callback — OData wrapper inject */
    refetchData?: (params?: RefetchParams) => Promise<void>;

    /** Socket client cho trigger_workflow */
    actionSocket?: SocketClient;

    /** Registered API services */
    services?: Record<
        string,
        { fetch: (endpoint: string, params?: Record<string, any>) => Promise<any> }
    >;

    /** UI callbacks */
    ui: {
        toast: (message: string, variant?: string) => void;
        confirm: (message: string, title?: string) => Promise<boolean>;
        redirect: (url: string) => void;
        closeDialog?: () => void;
        refresh?: () => void;
        emitEvent?: (event: string, payload?: unknown) => void;
    };
}

// ============================================================================
// Engine Result
// ============================================================================

export interface ActionResult {
    success: boolean;
    message?: string;
    data?: unknown;
}