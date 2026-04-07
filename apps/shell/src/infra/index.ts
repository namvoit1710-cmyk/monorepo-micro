/**
 * Micro Frontend Infrastructure Layer
 * ====================================
 *
 * Các module trong folder này giải quyết những vấn đề phổ biến
 * gây crash app trong kiến trúc micro frontend (Module Federation v2).
 *
 * Import file này trong entry point (index.ts) TRƯỚC khi import bootstrap:
 *
 *   import "./infra/mf";
 *   void import("./bootstrap");
 *
 * Modules:
 *  1. mf-fetch-interceptor  — Chặn manifest fetch fail → trả stub
 *  2. mf-shared-scope-guard — Bảo vệ shared scope version conflict
 *  3. mf-lifecycle-timeout  — Timeout cho remote bootstrap quá chậm
 *  4. mf-error-suppressor   — Chặn unhandled rejection từ MF runtime
 *  5. mf-css-isolation      — Ngăn CSS leak giữa các remote
 *  6. mf-event-bus          — Giao tiếp an toàn giữa shell ↔ remote
 *  7. mf-auth-propagation   — Đồng bộ auth state xuống remote
 *  8. mf-remote-registry    — Quản lý remote config tập trung
 */

export { installFetchInterceptor } from "./mf-fetch-interceptor";
export { installSharedScopeGuard } from "./mf-shared-scope-guard";
export { installLifecycleTimeout } from "./mf-lifecycle-timeout";
export { installErrorSuppressor } from "./mf-error-suppressor";
export { MFStyleIsolation } from "./mf-css-isolation";
export { mfEventBus } from "./mf-event-bus";
export { MFAuthProvider, useMFAuth } from "./mf-auth-propagation";
export { remoteRegistry } from "./mf-remote-registry";
