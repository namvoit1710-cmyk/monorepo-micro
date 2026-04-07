/**
 * MF Error Suppressor
 * ===================
 * Chặn unhandled promise rejection từ MF runtime.
 *
 * Vấn đề giải quyết:
 *  - Khi remote fail, MF runtime throw rejection nội bộ
 *  - Browser log đầy error đỏ dù app vẫn handle gracefully
 *  - Monitoring tool (Sentry, Datadog) bắn alert giả
 *
 * Cách hoạt động:
 *  1. Listen unhandledrejection event
 *  2. Check nếu error từ MF runtime (message pattern match)
 *  3. preventDefault() để suppress — vẫn log warn cho debug
 *  4. Forward error tới custom handler nếu cần (monitoring filter)
 */

export interface ErrorSuppressorOptions {
  /** Pattern để match MF runtime error — default ["Federation Runtime"] */
  patterns?: (string | RegExp)[];
  /** Custom handler — gọi khi suppress, dùng cho filtered monitoring */
  onSuppressed?: (reason: unknown, message: string) => void;
  /** Có log warning khi suppress không — default true in dev */
  logWarning?: boolean;
}

const DEFAULT_PATTERNS: (string | RegExp)[] = [
  "Federation Runtime",
  "Loading script failed",
  "Loading chunk",
  /ScriptExternalLoadError/,
  /ChunkLoadError/,
  "Shared module is not available",
  "Module not found in container",
  /Cannot find module/,
];

function matchesPattern(msg: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === "string" ? msg.includes(p) : p.test(msg),
  );
}

export function installErrorSuppressor(options?: ErrorSuppressorOptions): () => void {
  const patterns = options?.patterns ?? DEFAULT_PATTERNS;
  const logWarning = options?.logWarning ?? (process.env.NODE_ENV === "development");
  const onSuppressed = options?.onSuppressed;

  function handler(event: PromiseRejectionEvent): void {
    const reason: unknown = event.reason;
    const msg = reason instanceof Error ? reason.message : String(reason ?? "");

    if (!matchesPattern(msg, patterns)) return;

    // Suppress — browser sẽ không log uncaught rejection
    event.preventDefault();

    if (logWarning) {
      console.warn("[MF Infra] Suppressed MF runtime error:", msg);
    }

    onSuppressed?.(reason, msg);
  }

  window.addEventListener("unhandledrejection", handler);

  // Cũng chặn synchronous error từ MF runtime script evaluation
  function errorHandler(event: ErrorEvent): void {
    const msg = event.message ?? "";
    if (!matchesPattern(msg, patterns)) return;

    event.preventDefault();
    if (logWarning) {
      console.warn("[MF Infra] Suppressed MF runtime script error:", msg);
    }
    onSuppressed?.(event.error, msg);
  }

  window.addEventListener("error", errorHandler);

  // Trả về uninstall function
  return () => {
    window.removeEventListener("unhandledrejection", handler);
    window.removeEventListener("error", errorHandler);
  };
}
