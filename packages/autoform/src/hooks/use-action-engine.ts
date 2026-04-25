// ============================================================================
// useActionEngine Hook
// ============================================================================
// Bridge giữa Action Engine và Builder.
// Đọc ActionConfig[] từ JSON → index by action name → handleFormActions callback.
// Inject vào Builder qua onFormActions prop.
// ============================================================================

import { useCallback, useMemo } from "react";
import { BuilderRef } from "../components/builder/builder";
import { ActionConfig, EngineContext } from "../types/action-config";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface UseActionEngineOptions {
  /** Action configs — từ JSON schema wrapperProps.actions hoặc fetch từ API */
  actions: ActionConfig[];

  /** Builder ref — để lấy react-hook-form methods */
  builderRef: React.RefObject<BuilderRef | null>;

  /**
   * Custom handlers cho step type: "custom"
   * Chỉ dùng cho logic THỰC SỰ không thể diễn đạt bằng JSON config.
   * Mỗi handler viết 1 lần, reuse ở nhiều action configs.
   */
  customHandlers?: Record<string, (ctx: EngineContext) => Promise<void>>;

  /**
   * Refetch callback — ODataWrapper inject vào đây
   * Được gọi khi step type: "refetch_odata" chạy
   */
  refetchData?: (params?: RefetchParams) => Promise<void>;

  // --- UI callbacks ---
  /** Toast notification */
  toast?: (message: string, variant?: string) => void;
  /** Confirm dialog — return true nếu user confirm */
  confirm?: (message: string, title?: string) => Promise<boolean>;
  /** Redirect/navigate */
  redirect?: (url: string) => void;
  /** Close dialog */
  closeDialog?: () => void;
  /** Refresh form */
  refresh?: () => void;
  /** Custom event emitter */
  onEvent?: (event: string, payload?: unknown) => void;
}

interface UseActionEngineReturn {
  /**
   * Callback truyền vào Builder's onFormActions.
   * Khi button dispatch action name → hook tìm config → chạy pipeline.
   *
   * @param actionName - tên action (match với ActionConfig.action)
   * @param payload - data từ button: formValues, rowData, rowId, updateRow, etc.
   */
  handleFormActions: (actionName: string, payload?: Record<string, unknown>) => Promise<void>;

  /** Kiểm tra action name có config hay không */
  hasAction: (actionName: string) => boolean;
}

interface RefetchParams {
  endpoint?: string;
  filter?: string;
  orderBy?: string;
  pageSize?: number;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

export function useActionEngine(options: UseActionEngineOptions): UseActionEngineReturn {
  const {
    actions,
    builderRef,
    customHandlers,
    refetchData,
    toast = defaultToast,
    confirm = defaultConfirm,
    redirect = defaultRedirect,
    closeDialog,
    refresh,
    onEvent,
  } = options;

  // Index actions by name → O(1) lookup
  const actionMap = useMemo(() => {
    const map = new Map<string, ActionConfig>();
    for (const action of actions) {
      map.set(action.action, action);
    }
    return map;
  }, [actions]);

  const hasAction = useCallback(
    (actionName: string) => actionMap.has(actionName),
    [actionMap],
  );

  const handleFormActions = useCallback(
    async (actionName: string, payload?: Record<string, unknown>) => {
      const config = actionMap.get(actionName);
      if (!config) {
        console.warn(`[useActionEngine] No action config for: "${actionName}"`);
        return;
      }

      const methods = builderRef.current?.getMethods();
      if (!methods) {
        console.warn("[useActionEngine] Builder ref not available");
        return;
      }

      // Build engine context từ payload + methods + UI callbacks
      const ctx: EngineContext = {
        formValues: (payload?.formValues as Record<string, unknown>) ?? methods.getValues(),
        methods: {
          setValue: methods.setValue,
          getValues: methods.getValues,
          trigger: methods.trigger,
          setError: methods.setError,
          reset: methods.reset,
          clearErrors: methods.clearErrors,
        },
        // Row context (nếu button từ table row)
        rowId: payload?.rowId as string | undefined,
        rowIndex: payload?.rowIndex as number | undefined,
        rowData: payload?.rowData as Record<string, unknown> | undefined,
        updateRow: payload?.updateRow as ((partial: Record<string, unknown>) => void) | undefined,
        // Engine dependencies
        customHandlers,
        
        refetchData: refetchData ?? undefined,

        // UI callbacks
        ui: {
          toast,
          confirm,
          redirect,
          closeDialog,
          refresh: refresh ?? (() => builderRef.current?.setRefresh()),
          emitEvent: onEvent,
        },
      };

      await runAction(config, ctx);
    },
    [actionMap, builderRef, customHandlers, refetchData, toast, confirm, redirect, closeDialog, refresh, onEvent],
  );

  return { handleFormActions, hasAction };
}

// ----------------------------------------------------------------------------
// Default UI implementations — có thể override từ app level
// ----------------------------------------------------------------------------

function defaultToast(message: string, variant?: string) {
    toast.info(`[${variant ?? "info"}] ${message}`);
    console.log(`[Toast][${variant ?? "info"}] ${message}`);
}

function defaultConfirm(message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(message));
}

function defaultRedirect(url: string) {
  window.location.href = url;
}