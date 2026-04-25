// ============================================================================
// Action Pipeline Engine - Type Definitions
// ============================================================================
// Mỗi action là một JSON config mô tả chuỗi steps chạy tuần tự.
// Thêm action mới = thêm JSON, không cần deploy code.
// ============================================================================

// ----------------------------------------------------------------------------
// Step Types
// ----------------------------------------------------------------------------

export interface RefetchParams {
  endpoint?: string;
  filter?: string;
  orderBy?: string;
  pageSize?: number;
}

/** Set value vào form field */
interface SetValueStep {
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
interface ClearFieldStep {
  type: "clear_field";
  field?: string;
  fields?: string[];
}

/** Validate form hoặc specific fields */
interface ValidateStep {
  type: "validate";
  fields?: string[];
}

/** Reset form, optionally giữ lại 1 số fields */
interface ResetFormStep {
  type: "reset_form";
  keepFields?: string[];
}

/** Gọi REST API */
interface ApiCallStep {
  type: "api_call";
  service?: string; // Tên service đã register trong context.services
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Hỗ trợ template: "/api/orders/${rowData.id}" */
  endpoint: string;
  /** "formValues" = gửi toàn bộ form, hoặc object cụ thể */
  body?: "formValues" | "rowData" | Record<string, unknown>;
  headers?: Record<string, string>;
  /** Map response vào form fields: { "data.total": "totalField" } */
  resultMapping?: Record<string, string>;
  /** Map error vào field errors: { "errors.name": "nameField" } */
  errorMapping?: Record<string, string>;
}

/** Update 1 row cụ thể trong table (cần row context) */
interface UpdateRowStep {
  type: "update_row";
  /** Static data merge vào row */
  data?: Record<string, unknown>;
  /** Map từ lastResult: { "data.assignee": "assignee" } */
  fromResult?: Record<string, string>;
}

/** Refetch OData data cho table */
interface RefetchODataStep {
  type: "refetch_odata";
}

/** Polling endpoint cho async service */
interface PollStep {
  type: "poll";
  /** Template endpoint: "/api/jobs/${lastResult.data.jobId}/status" */
  endpoint: string;
  /** Polling interval in ms (default: 2000) */
  interval?: number;
  /** Max attempts before timeout (default: 30) */
  maxAttempts?: number;
  /** Condition expression: "data.status === 'completed'" */
  until: string;
}

interface RefetchDataStep {
  type: "refetch_data";
  service?: string; // Tên service đã register trong context.services
  /** Override endpoint */
  endpoint?: string;
  /** Override filter */
  filter?: string;
  /** Override orderBy */
  orderBy?: string;
  /** Override pageSize */
  pageSize?: number;
}

/** Hiện toast notification */
interface ToastStep {
  type: "toast";
  /** Hỗ trợ template: "Created: ${lastResult.data.name}" */
  message: string;
  variant?: "success" | "error" | "info" | "warning";
}

/** Hiện confirm dialog, dừng pipeline nếu cancel */
interface ConfirmStep {
  type: "confirm";
  message: string;
  title?: string;
}

/** Redirect trang */
interface RedirectStep {
  type: "redirect";
  /** Template URL: "/orders/${lastResult.data.id}" */
  url: string;
}

/** Đóng dialog */
interface CloseDialogStep {
  type: "close_dialog";
}

/** Refresh form (re-mount) */
interface RefreshStep {
  type: "refresh";
}

/** Emit custom event cho parent component */
interface EmitEventStep {
  type: "emit_event";
  event: string;
  payload?: Record<string, unknown>;
}

/** Branching: if expr then [...] else [...] */
interface ConditionStep {
  type: "condition";
  /** Expression: "formValues.status === 'active'" */
  expr: string;
  then: ActionStep[];
  else?: ActionStep[];
}

/** Escape hatch: gọi handler đã register bằng code */
interface CustomStep {
  type: "custom";
  /** Tên handler đã đăng ký trong customHandlers */
  handler: string;
}

// ----------------------------------------------------------------------------
// Union type cho tất cả steps
// ----------------------------------------------------------------------------

export type ActionStep =
  | SetValueStep
  | ClearFieldStep
  | ValidateStep
  | ResetFormStep
  | ApiCallStep
  | UpdateRowStep
  | RefetchODataStep
  | PollStep
  | ToastStep
  | RefetchDataStep
  | ConfirmStep
  | RedirectStep
  | CloseDialogStep
  | RefreshStep
  | EmitEventStep
  | ConditionStep
  | CustomStep;

// ----------------------------------------------------------------------------
// Action Config — một action = tên + pipeline steps
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Engine Context — runtime data truyền vào engine khi execute
// ----------------------------------------------------------------------------

export interface EngineContext {
  /** Current form values */
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
  /** Kết quả API/step gần nhất — step sau có thể dùng */
  lastResult?: unknown;
  /** Row context — cho row-level actions trong table */
  rowId?: string;
  rowIndex?: number;
  rowData?: Record<string, unknown>;
  /** Callback update row trong table */
  updateRow?: (partial: Record<string, unknown>) => void;
  /** Custom handlers đã register bằng code (cho type: "custom") */
  customHandlers?: Record<string, (ctx: EngineContext) => Promise<void>>;
  /** Refetch callback — cho OData wrapper inject */
  refetchData?: (params?: RefetchParams) => Promise<void>;
  /** UI callbacks — injected từ app level */
  ui: {
    toast: (message: string, variant?: string) => void;
    confirm: (message: string, title?: string) => Promise<boolean>;
    redirect: (url: string) => void;
    closeDialog?: () => void;
    refresh?: () => void;
    emitEvent?: (event: string, payload?: unknown) => void;
  };

  services?: Record<string, { fetch: (endpoint: string, params?: Record<string, any>) => Promise<any> }>;
}

// ----------------------------------------------------------------------------
// Engine Result
// ----------------------------------------------------------------------------

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}