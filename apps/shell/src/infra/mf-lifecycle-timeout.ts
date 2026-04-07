/**
 * MF Lifecycle Timeout
 * ====================
 * Timeout cho remote component load quá chậm.
 *
 * Vấn đề giải quyết:
 *  - Remote server phản hồi chậm (throttled, overloaded)
 *  - JS chunk load pending vĩnh viễn → UI treo, không có fallback
 *  - User thấy loading spinner mãi mãi
 *
 * Cách hoạt động:
 *  1. Wrap dynamic import() của remote component trong Promise.race
 *  2. Nếu quá timeout → reject → lazy().catch() xử lý
 *  3. Cung cấp utility withTimeout() cho app.tsx dùng với React.lazy
 *
 * Usage trong app.tsx:
 *
 *   const Dashboard = lazy(() =>
 *     withTimeout(() => import("dashboard/App"), {
 *       remoteName: "dashboard",
 *       timeoutMs: 10000,
 *     }).catch(() => import("./fallbacks/RemoteUnavailable"))
 *   );
 */

export interface TimeoutOptions {
  /** Tên remote — dùng cho logging */
  remoteName: string;
  /** Timeout tính bằng ms — default 10000 */
  timeoutMs?: number;
  /** Callback khi timeout — dùng cho monitoring */
  onTimeout?: (remoteName: string, timeoutMs: number) => void;
}

export class RemoteTimeoutError extends Error {
  public readonly remoteName: string;
  public readonly timeoutMs: number;

  constructor(remoteName: string, timeoutMs: number) {
    super(`Remote "${remoteName}" did not load within ${timeoutMs}ms`);
    this.name = "RemoteTimeoutError";
    this.remoteName = remoteName;
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Wrap một dynamic import với timeout.
 *
 * @example
 * const Comp = lazy(() =>
 *   withTimeout(() => import("remote/Comp"), { remoteName: "remote" })
 *     .catch(() => import("./fallback"))
 * );
 */
export function withTimeout<T>(
  importFn: () => Promise<T>,
  options: TimeoutOptions,
): Promise<T> {
  const { remoteName, timeoutMs = 10_000, onTimeout } = options;

  return Promise.race([
    importFn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error = new RemoteTimeoutError(remoteName, timeoutMs);
        console.warn(`[MF Infra] ${error.message}`);
        onTimeout?.(remoteName, timeoutMs);

        window.dispatchEvent(
          new CustomEvent("mf:remote-timeout", {
            detail: { remoteName, timeoutMs },
          }),
        );

        reject(error);
      }, timeoutMs);
    }),
  ]);
}

/**
 * Retry wrapper — thử load lại remote khi fail.
 *
 * @example
 * const Comp = lazy(() =>
 *   withRetry(() => import("remote/Comp"), { remoteName: "remote", maxRetries: 2 })
 *     .catch(() => import("./fallback"))
 * );
 */
export function withRetry<T>(
  importFn: () => Promise<T>,
  options: TimeoutOptions & { maxRetries?: number; retryDelayMs?: number },
): Promise<T> {
  const { maxRetries = 2, retryDelayMs = 1000, ...timeoutOpts } = options;

  return new Promise<T>((resolve, reject) => {
    let attempt = 0;

    function tryLoad(): void {
      attempt++;
      withTimeout(importFn, timeoutOpts)
        .then(resolve)
        .catch((err) => {
          if (attempt >= maxRetries + 1) {
            console.warn(
              `[MF Infra] Remote "${timeoutOpts.remoteName}" failed after ${attempt} attempts.`,
            );
            reject(err);
            return;
          }
          console.info(
            `[MF Infra] Retrying "${timeoutOpts.remoteName}" (attempt ${attempt + 1}/${maxRetries + 1})...`,
          );
          setTimeout(tryLoad, retryDelayMs * attempt); // exponential-ish backoff
        });
    }

    tryLoad();
  });
}

/**
 * Convenience: install global default cho tất cả lazy import.
 * Không bắt buộc — chỉ khi muốn set default timeout toàn cục.
 */
let _defaultTimeoutMs = 10_000;
let _defaultOnTimeout: TimeoutOptions["onTimeout"];

export function installLifecycleTimeout(opts?: {
  defaultTimeoutMs?: number;
  onTimeout?: TimeoutOptions["onTimeout"];
}): void {
  if (opts?.defaultTimeoutMs) _defaultTimeoutMs = opts.defaultTimeoutMs;
  if (opts?.onTimeout) _defaultOnTimeout = opts.onTimeout;
}

/** Lấy default timeout cho withTimeout khi không truyền option */
export function getDefaultTimeout(): number {
  return _defaultTimeoutMs;
}

export function getDefaultOnTimeout(): TimeoutOptions["onTimeout"] {
  return _defaultOnTimeout;
}
