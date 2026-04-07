/**
 * MF Event Bus
 * ============
 * Giao tiếp an toàn giữa shell ↔ remote ↔ remote.
 *
 * Vấn đề giải quyết:
 *  - Direct import giữa remote tạo tight coupling
 *  - window event quá loose — không type-safe, khó debug
 *  - Shared Redux store → version conflict, circular dependency
 *  - Remote unmount nhưng listener vẫn active → memory leak + stale call
 *
 * Cách hoạt động:
 *  1. Typed publish/subscribe pattern trên CustomEvent
 *  2. Namespace isolation — mỗi remote chỉ nhận event mình subscribe
 *  3. Auto-cleanup khi remote unmount (React hook)
 *  4. Event history replay cho late-mounting remote
 *
 * Usage:
 *
 *  // Shell publish:
 *  mfEventBus.emit("auth:token-refreshed", { token: "..." });
 *
 *  // Remote subscribe (trong React component):
 *  const { useMFEvent } = mfEventBus;
 *  useMFEvent("auth:token-refreshed", (data) => {
 *    setToken(data.token);
 *  });
 *
 *  // Remote subscribe (ngoài React):
 *  const unsub = mfEventBus.on("auth:token-refreshed", handler);
 *  // later: unsub();
 */

import { useEffect, useRef } from "react";

/** Định nghĩa event types — extend interface này ở consumer side */
export interface MFEventMap {
  // Auth events
  "auth:login": { userId: string; token: string };
  "auth:logout": { reason?: string };
  "auth:token-refreshed": { token: string; expiresAt: number };

  // Navigation events
  "nav:route-change": { path: string; remoteName?: string };
  "nav:redirect": { to: string; replace?: boolean };

  // Remote lifecycle
  "remote:mounted": { remoteName: string };
  "remote:unmounted": { remoteName: string };
  "remote:error": { remoteName: string; error: string };

  // Shell notifications
  "shell:notification": { type: "info" | "warn" | "error" | "success"; message: string };
  "shell:theme-change": { theme: "light" | "dark" };
  "shell:locale-change": { locale: string };

  // Generic — catch-all cho custom events
  [key: `custom:${string}`]: unknown;
}

type EventHandler<T> = (data: T) => void;

interface EventRecord<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  source?: string;
}

class MFEventBusImpl {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();
  private history: EventRecord[] = [];
  private maxHistory = 50;

  /**
   * Subscribe to an event.
   * Returns unsubscribe function.
   */
  on<K extends keyof MFEventMap>(
    type: K,
    handler: EventHandler<MFEventMap[K]>,
  ): () => void {
    const key = type as string;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler as EventHandler<unknown>);

    return () => {
      this.handlers.get(key)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Subscribe + nhận last emitted event (replay).
   * Hữu ích khi remote mount sau khi shell đã emit event.
   */
  onWithReplay<K extends keyof MFEventMap>(
    type: K,
    handler: EventHandler<MFEventMap[K]>,
  ): () => void {
    // Replay last event of this type
    const lastEvent = this.getLastEvent(type);
    if (lastEvent) {
      try {
        handler(lastEvent.data as MFEventMap[K]);
      } catch (err) {
        console.error(`[MF EventBus] Replay handler error for "${type as string}":`, err);
      }
    }

    return this.on(type, handler);
  }

  /**
   * Emit event tới tất cả subscriber.
   */
  emit<K extends keyof MFEventMap>(
    type: K,
    data: MFEventMap[K],
    source?: string,
  ): void {
    const key = type as string;

    // Lưu history
    const record: EventRecord = {
      type: key,
      data,
      timestamp: Date.now(),
      source,
    };
    this.history.push(record);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify handlers
    const handlers = this.handlers.get(key);
    if (!handlers?.size) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (err) {
        console.error(`[MF EventBus] Handler error for "${key}":`, err);
      }
    }

    // Cũng dispatch window CustomEvent cho interop với non-React code
    window.dispatchEvent(new CustomEvent(`mf:${key}`, { detail: data }));
  }

  /** Lấy event cuối cùng theo type */
  getLastEvent<K extends keyof MFEventMap>(type: K): EventRecord<MFEventMap[K]> | undefined {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].type === (type as string)) {
        return this.history[i] as EventRecord<MFEventMap[K]>;
      }
    }
    return undefined;
  }

  /** Debug: xem toàn bộ event history */
  getHistory(): readonly EventRecord[] {
    return this.history;
  }

  /** Clear tất cả handler — dùng cho test */
  reset(): void {
    this.handlers.clear();
    this.history = [];
  }
}

/** Singleton event bus instance */
export const mfEventBus = new MFEventBusImpl();

// ─── React Hooks ───────────────────────────────────────────────

/**
 * React hook — auto unsubscribe khi component unmount.
 *
 * @example
 * function MyComponent() {
 *   useMFEvent("auth:token-refreshed", (data) => {
 *     console.log("New token:", data.token);
 *   });
 * }
 */
export function useMFEvent<K extends keyof MFEventMap>(
  type: K,
  handler: EventHandler<MFEventMap[K]>,
  options?: { replay?: boolean },
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler: EventHandler<MFEventMap[K]> = (data) => {
      handlerRef.current(data);
    };

    const unsub = options?.replay
      ? mfEventBus.onWithReplay(type, stableHandler)
      : mfEventBus.on(type, stableHandler);

    return unsub;
  }, [type, options?.replay]);
}

/**
 * React hook — emit event khi component mount (lifecycle signal).
 *
 * @example
 * function DashboardRemote() {
 *   useMFMountSignal("dashboard");
 *   return <Dashboard />;
 * }
 */
export function useMFMountSignal(remoteName: string): void {
  useEffect(() => {
    mfEventBus.emit("remote:mounted", { remoteName });
    return () => {
      mfEventBus.emit("remote:unmounted", { remoteName });
    };
  }, [remoteName]);
}

// Expose trên window cho debug
if (process.env.NODE_ENV === "development") {
  (window as Record<string, unknown>).__MF_EVENT_BUS__ = mfEventBus;
}
