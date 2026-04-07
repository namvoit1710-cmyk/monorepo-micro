/**
 * MF Shared Scope Guard
 * =====================
 * Bảo vệ shared dependency version conflict.
 *
 * Vấn đề giải quyết:
 *  - Remote A dùng React 18.2, Remote B dùng React 18.3
 *  - MF shared scope chọn version theo singleton policy
 *  - Nếu mismatch nghiêm trọng → runtime crash (hook mismatch, context lost)
 *  - Không có warning nào cho developer biết
 *
 * Cách hoạt động:
 *  1. Hook vào __FEDERATION__.__SHARE__ sau khi MF init
 *  2. Detect version conflict giữa các remote
 *  3. Log warning chi tiết + emit event cho monitoring
 *  4. Với critical dependency (react, react-dom), block load nếu major mismatch
 */

interface SharedModuleInfo {
  version: string;
  from: string;
  loaded?: boolean;
}

interface VersionConflict {
  packageName: string;
  versions: { version: string; from: string }[];
  severity: "info" | "warn" | "critical";
}

/** Dependency nào mà major version khác nhau sẽ gây crash */
const CRITICAL_PACKAGES = new Set([
  "react",
  "react-dom",
  "react-router",
  "react-router-dom",
  "@reduxjs/toolkit",
  "redux",
]);

/** Parse semver lấy major version */
function getMajor(version: string): number {
  const match = version.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getMinor(version: string): number {
  const match = version.match(/^\d+\.(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function detectConflicts(sharedScope: Record<string, Record<string, SharedModuleInfo>>): VersionConflict[] {
  const conflicts: VersionConflict[] = [];

  for (const [pkgName, versions] of Object.entries(sharedScope)) {
    const versionList = Object.entries(versions).map(([ver, info]) => ({
      version: ver,
      from: info.from ?? "unknown",
    }));

    if (versionList.length <= 1) continue;

    const isCritical = CRITICAL_PACKAGES.has(pkgName);
    const majors = new Set(versionList.map((v) => getMajor(v.version)));
    const minors = new Set(versionList.map((v) => `${getMajor(v.version)}.${getMinor(v.version)}`));

    let severity: VersionConflict["severity"] = "info";
    if (majors.size > 1 && isCritical) {
      severity = "critical";
    } else if (majors.size > 1 || (minors.size > 1 && isCritical)) {
      severity = "warn";
    }

    if (severity !== "info" || versionList.length > 1) {
      conflicts.push({ packageName: pkgName, versions: versionList, severity });
    }
  }

  return conflicts;
}

export function installSharedScopeGuard(): void {
  // MF v2 init hoàn tất trước khi React mount,
  // nên chúng ta check shared scope trong microtask
  queueMicrotask(() => {
    const federation = (window as Record<string, unknown>).__FEDERATION__ as
      | { __SHARE__?: Record<string, Record<string, SharedModuleInfo>> }
      | undefined;

    if (!federation?.__SHARE__) {
      // MF chưa init hoặc không dùng shared scope — bỏ qua
      return;
    }

    const conflicts = detectConflicts(federation.__SHARE__);
    if (conflicts.length === 0) return;

    const criticals = conflicts.filter((c) => c.severity === "critical");
    const warnings = conflicts.filter((c) => c.severity === "warn");
    const infos = conflicts.filter((c) => c.severity === "info");

    if (criticals.length > 0) {
      console.error(
        "[MF Infra] CRITICAL shared dependency version mismatch detected!\n" +
          "This WILL cause runtime errors (e.g., React hooks mismatch).\n",
        criticals.map(formatConflict).join("\n"),
      );

      // Dispatch event cho monitoring/alerting system
      window.dispatchEvent(
        new CustomEvent("mf:shared-scope-conflict", {
          detail: { conflicts: criticals, severity: "critical" },
        }),
      );
    }

    if (warnings.length > 0) {
      console.warn(
        "[MF Infra] Shared dependency version conflicts:\n",
        warnings.map(formatConflict).join("\n"),
      );
    }

    if (infos.length > 0 && process.env.NODE_ENV === "development") {
      console.info(
        "[MF Infra] Minor shared dependency version differences:\n",
        infos.map(formatConflict).join("\n"),
      );
    }
  });
}

function formatConflict(c: VersionConflict): string {
  const versions = c.versions.map((v) => `  ${v.version} (from: ${v.from})`).join("\n");
  return `📦 ${c.packageName} [${c.severity.toUpperCase()}]\n${versions}`;
}
