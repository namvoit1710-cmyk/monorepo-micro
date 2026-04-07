/**
 * MF Fetch Interceptor
 * ====================
 * Monkey-patch window.fetch để chặn manifest request fail.
 *
 * Vấn đề giải quyết:
 *  - MF v2 fetch ALL manifest trong init() TRƯỚC React mount
 *  - Bất kỳ manifest nào fail → crash toàn bộ app
 *  - Error boundary không bắt được vì chưa có React tree
 *
 * Cách hoạt động:
 *  1. Intercept fetch tới *mf-manifest.json
 *  2. Nếu fail → trả stub manifest hợp lệ
 *  3. MF init() pass → React mount → component lazy load fail
 *     → bắt bởi lazy().catch() + <RemoteErrorBoundary>
 */

import { remoteRegistry } from "./mf-remote-registry";

const _originalFetch = window.fetch.bind(window);

/** Stub manifest thỏa mãn MF v2 validation */
function createStubManifest(remoteName: string): string {
  return JSON.stringify({
    id: remoteName,
    name: remoteName,
    metaData: {
      name: remoteName,
      publicPath: "auto",
      type: "app",
      buildInfo: { buildVersion: "0.0.0-stub" },
      remoteEntry: { name: "remoteEntry.js", path: "", type: "global" },
      globalName: remoteName,
    },
    shared: [],
    remotes: [],
    exposes: [],
  });
}

/** Derive remote name từ URL — sử dụng registry nếu có */
function resolveRemoteName(url: string): string {
  // Ưu tiên tìm trong registry
  const allRemotes = remoteRegistry.getAll();
  for (const remote of allRemotes) {
    if (url.startsWith(remote.entry)) {
      return remote.name;
    }
  }

  // Fallback: đoán từ URL path
  try {
    return (
      new URL(url, location.href).pathname
        .replace("/mf-manifest.json", "")
        .split("/")
        .filter(Boolean)
        .at(-1) ?? "unknown-remote"
    );
  } catch {
    return "unknown-remote";
  }
}

/** Validate manifest có đủ field cho MF v2 */
function isValidManifest(json: Record<string, unknown>): boolean {
  const meta = (json.metaData ?? {}) as Record<string, unknown>;
  const buildInfo = (meta.buildInfo ?? {}) as Record<string, unknown>;
  return !!(
    json.metaData &&
    "exposes" in json &&
    "shared" in json &&
    meta.remoteEntry &&
    buildInfo.buildVersion !== undefined
  );
}

export function installFetchInterceptor(): void {
  window.fetch = async function mfSafeFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!url.includes("mf-manifest.json")) {
      return _originalFetch(input, init);
    }

    const remoteName = resolveRemoteName(url);

    // Check registry: nếu remote bị disable, trả stub ngay
    const config = remoteRegistry.get(remoteName);
    if (config && !config.enabled) {
      console.info(`[MF Infra] Remote "${remoteName}" is disabled — returning stub.`);
      return new Response(createStubManifest(remoteName), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch timeout
    const timeout = config?.timeout ?? 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge abort signal
    const mergedInit: RequestInit = {
      ...init,
      signal: controller.signal,
    };

    try {
      const res = await _originalFetch(input, mergedInit);
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.clone().text();
      const json = JSON.parse(text) as Record<string, unknown>;

      if (!isValidManifest(json)) {
        console.warn(
          `[MF Infra] Manifest "${url}" missing required fields — using stub for "${remoteName}".`,
        );
        return new Response(createStubManifest(remoteName), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return res;
    } catch (err) {
      clearTimeout(timeoutId);

      const reason = err instanceof Error ? err.message : String(err);
      console.warn(
        `[MF Infra] Manifest fetch failed for "${remoteName}" (${reason}) — using stub.`,
      );

      // Thử fallback URL nếu có
      if (config?.fallbackEntry) {
        try {
          const fallbackUrl = `${config.fallbackEntry}/mf-manifest.json`;
          console.info(`[MF Infra] Trying fallback for "${remoteName}": ${fallbackUrl}`);
          const fallbackRes = await _originalFetch(fallbackUrl);
          if (fallbackRes.ok) return fallbackRes;
        } catch {
          // Fallback cũng fail — trả stub
        }
      }

      return new Response(createStubManifest(remoteName), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
