/**
 * MF Remote Registry
 * ==================
 * Quản lý config của tất cả remote tập trung.
 * Thay vì hardcode URL trong webpack/rspack config,
 * registry cho phép runtime override, health check, và fallback.
 *
 * Vấn đề giải quyết:
 *  - Remote URL thay đổi giữa các environment
 *  - Cần disable remote nhanh mà không redeploy
 *  - Cần biết remote nào đang healthy
 */

export interface RemoteConfig {
  /** Unique name — phải match với MF remote name */
  name: string;
  /** URL tới mf-manifest.json (không bao gồm filename) */
  entry: string;
  /** Tắt remote mà không cần remove khỏi config */
  enabled: boolean;
  /** Fallback URL nếu primary fail */
  fallbackEntry?: string;
  /** Timeout (ms) cho manifest fetch — default 5000 */
  timeout?: number;
  /** Remote có bắt buộc không? Nếu true, app sẽ show error thay vì degrade */
  critical?: boolean;
}

export interface RemoteHealthStatus {
  name: string;
  healthy: boolean;
  lastCheck: number;
  latency: number;
  error?: string;
}

class RemoteRegistry {
  private remotes = new Map<string, RemoteConfig>();
  private healthCache = new Map<string, RemoteHealthStatus>();
  private listeners = new Set<(statuses: RemoteHealthStatus[]) => void>();

  register(config: RemoteConfig): void {
    this.remotes.set(config.name, config);
  }

  registerAll(configs: RemoteConfig[]): void {
    configs.forEach((c) => this.register(c));
  }

  get(name: string): RemoteConfig | undefined {
    return this.remotes.get(name);
  }

  getAll(): RemoteConfig[] {
    return Array.from(this.remotes.values());
  }

  getEnabled(): RemoteConfig[] {
    return this.getAll().filter((r) => r.enabled);
  }

  /** Runtime toggle — disable remote mà không cần redeploy */
  setEnabled(name: string, enabled: boolean): void {
    const remote = this.remotes.get(name);
    if (remote) {
      remote.enabled = enabled;
    }
  }

  /** Health check một remote */
  async checkHealth(name: string): Promise<RemoteHealthStatus> {
    const remote = this.remotes.get(name);
    if (!remote) {
      return { name, healthy: false, lastCheck: Date.now(), latency: 0, error: "Not registered" };
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), remote.timeout ?? 5000);

      const res = await fetch(`${remote.entry}/mf-manifest.json`, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const status: RemoteHealthStatus = {
        name,
        healthy: res.ok,
        lastCheck: Date.now(),
        latency: Math.round(performance.now() - start),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
      this.healthCache.set(name, status);
      return status;
    } catch (err) {
      const status: RemoteHealthStatus = {
        name,
        healthy: false,
        lastCheck: Date.now(),
        latency: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : String(err),
      };
      this.healthCache.set(name, status);
      return status;
    }
  }

  /** Health check tất cả remote, chạy parallel */
  async checkAllHealth(): Promise<RemoteHealthStatus[]> {
    const results = await Promise.all(
      this.getEnabled().map((r) => this.checkHealth(r.name)),
    );
    this.notifyListeners(results);
    return results;
  }

  /** Subscribe để nhận health update (cho dashboard, devtools) */
  onHealthChange(fn: (statuses: RemoteHealthStatus[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getHealthStatus(name: string): RemoteHealthStatus | undefined {
    return this.healthCache.get(name);
  }

  private notifyListeners(statuses: RemoteHealthStatus[]): void {
    this.listeners.forEach((fn) => fn(statuses));
  }
}

export const remoteRegistry = new RemoteRegistry();
