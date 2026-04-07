/**
 * MF Infra Setup
 * ==============
 * Hàm setup tất cả infra module trong 1 lời gọi duy nhất.
 *
 * Dùng trong index.ts (entry point):
 *
 *   import { setupMFInfra } from "./infra/mf/setup";
 *
 *   setupMFInfra({
 *     remotes: [
 *       { name: "dashboard", entry: "http://localhost:3001", enabled: true },
 *       { name: "settings", entry: "http://localhost:3002", enabled: true },
 *     ],
 *     timeout: { defaultTimeoutMs: 8000 },
 *     errorSuppressor: {
 *       onSuppressed: (_, msg) => Sentry.captureMessage(msg, "warning"),
 *     },
 *   });
 *
 *   void import("./bootstrap");
 */

import { remoteRegistry  } from "./mf-remote-registry";
import type {RemoteConfig} from "./mf-remote-registry";
import { installFetchInterceptor } from "./mf-fetch-interceptor";
import { installSharedScopeGuard } from "./mf-shared-scope-guard";
import { installLifecycleTimeout } from "./mf-lifecycle-timeout";
import { installErrorSuppressor  } from "./mf-error-suppressor";
import type {ErrorSuppressorOptions} from "./mf-error-suppressor";

export interface MFInfraOptions {
  /** Remote configs — đăng ký vào registry */
  remotes?: RemoteConfig[];

  /** Lifecycle timeout options */
  timeout?: {
    defaultTimeoutMs?: number;
    onTimeout?: (remoteName: string, timeoutMs: number) => void;
  };

  /** Error suppressor options */
  errorSuppressor?: ErrorSuppressorOptions;

  /** Tắt module cụ thể nếu không cần */
  disable?: {
    fetchInterceptor?: boolean;
    sharedScopeGuard?: boolean;
    lifecycleTimeout?: boolean;
    errorSuppressor?: boolean;
  };
}

export function setupMFInfra(options: MFInfraOptions = {}): void {
  const disable = options.disable ?? {};

  // 1. Đăng ký remote
  if (options.remotes) {
    remoteRegistry.registerAll(options.remotes);
  }

  // 2. Fetch interceptor — PHẢI chạy trước MF init()
  if (!disable.fetchInterceptor) {
    installFetchInterceptor();
  }

  // 3. Shared scope guard — chạy sau MF init (dùng queueMicrotask nội bộ)
  if (!disable.sharedScopeGuard) {
    installSharedScopeGuard();
  }

  // 4. Lifecycle timeout defaults
  if (!disable.lifecycleTimeout) {
    installLifecycleTimeout(options.timeout);
  }

  // 5. Error suppressor
  if (!disable.errorSuppressor) {
    installErrorSuppressor(options.errorSuppressor);
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[MF Infra] Initialized.", {
      remotes: remoteRegistry.getAll().map((r) => `${r.name} (${r.enabled ? "ON" : "OFF"})`),
      modules: {
        fetchInterceptor: !disable.fetchInterceptor,
        sharedScopeGuard: !disable.sharedScopeGuard,
        lifecycleTimeout: !disable.lifecycleTimeout,
        errorSuppressor: !disable.errorSuppressor,
      },
    });
  }
}
