// /**
//  * MF manifest resilience layer.
//  *
//  * Module Federation v2 eagerly fetches and validates ALL remote manifests
//  * during `init()` — BEFORE React mounts. Any failure here crashes the app
//  * entirely, bypassing error boundaries and lazy .catch() handlers.
//  *
//  * Fix: intercept window.fetch so that manifest requests that fail (network
//  * error, 404, wrong content-type, invalid JSON) receive a minimal stub
//  * manifest that satisfies MF v2 validation. When the component is later
//  * rendered, MF will try to load the actual JS chunks and THAT failure
//  * propagates through the normal dynamic-import chain — where app.tsx's
//  * lazy .catch() and <RemoteErrorBoundary> handle it gracefully.
//  */
// const _originalFetch = window.fetch.bind(window);

import { setupMFInfra } from "./infra/setup";

// /** Returns a stub MF v2 manifest for the given remote name. */
// function stubManifest(remoteName: string): string {
//   return JSON.stringify({
//     id: remoteName,
//     name: remoteName,
//     metaData: {
//       name: remoteName,
//       publicPath: "auto",
//       type: "app",
//       // generateSnapshotFromManifest destructures: { buildInfo: { buildVersion }, remoteEntry: { path, name, type }, globalName }
//       buildInfo: { buildVersion: "0.0.0" },
//       remoteEntry: { name: "remoteEntry.js", path: "", type: "global" },
//       globalName: remoteName,
//     },
//     shared: [],
//     remotes: [],
//     exposes: [],
//   });
// }


// window.fetch = async function mfSafeFetch(input, init) {
//   const url =
//     typeof input === "string"
//       ? input
//       : input instanceof URL
//         ? input.href
//         : input.url;

//   if (!url.includes("mf-manifest.json")) {
//     return _originalFetch(input, init);
//   }

//   // Derive remote name from the manifest URL path, e.g.
//   // "http://localhost:3001/mf-manifest.json" → "dashboard" (best-effort)
//   const remoteName =
//     new URL(url, location.href).pathname
//       .replace("/mf-manifest.json", "")
//       .split("/")
//       .filter(Boolean)
//       .at(-1) ?? "remote";

//   try {
//     const res = await _originalFetch(input, init);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     // Clone to read body without consuming the stream the caller needs.
//     const text = await res.clone().text();
//     const json = JSON.parse(text) as Record<string, unknown>;

//     // Validate that the response has all fields required by generateSnapshotFromManifest:
//     //   manifest.metaData.buildInfo.buildVersion  (line 50 destructuring)
//     //   manifest.metaData.remoteEntry             (line 45 destructuring)
//     //   manifest.exposes / manifest.shared        (MF v2 validation)
//     const meta = (json.metaData ?? {}) as Record<string, unknown>;
//     const buildInfo = (meta.buildInfo ?? {}) as Record<string, unknown>;
//     const isValid =
//       json.metaData &&
//       "exposes" in json &&
//       "shared" in json &&
//       meta.remoteEntry &&
//       buildInfo.buildVersion !== undefined;

//     if (!isValid) {
//       console.warn(
//         `[MF] Manifest at "${url}" is missing required fields — using stub for "${remoteName}".`,
//       );
//       return new Response(stubManifest(remoteName), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return res;
//   } catch {
//     console.warn(
//       `[MF] Failed to fetch manifest at "${url}" — using stub for "${remoteName}". Start the remote to enable it.`,
//     );
//     return new Response(stubManifest(remoteName), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// };

// // Suppress any residual MF runtime rejected promises from reaching the
// // browser console — the actual error UI is shown by <RemoteErrorBoundary>.
// window.addEventListener("unhandledrejection", (event) => {
//   const reason: unknown = event.reason;
//   const msg = reason instanceof Error ? reason.message : String(reason);
//   if (msg.includes("Federation Runtime")) {
//     event.preventDefault();
//   }
// });

setupMFInfra({
  remotes: [
    { name: "dashboard", entry: "http://localhost:3001", enabled: true },
    { name: "settings", entry: "http://localhost:3002", enabled: true },
  ],
  timeout: { defaultTimeoutMs: 8000 },
  errorSuppressor: {
    onSuppressed: (_, msg) => console.log(msg, "warning"),
  },
});

void import("./bootstrap");
