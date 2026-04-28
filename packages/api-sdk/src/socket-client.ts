// socket.io-client được cung cấp bởi app consumer (peer dep).
// @ldc/api-sdk định nghĩa ISocket tối giản để tránh phụ thuộc type cứng vào socket.io-client.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { io } = require("socket.io-client") as typeof import("socket.io-client");

// ----------------------------------------------------------------------------
// ISocket — Minimal interface
// ----------------------------------------------------------------------------
// Mô tả những method/property engine cần từ một socket instance.
// socket.io-client Socket tương thích structurally với interface này.
// App consumer truyền socket.io-client Socket — không cần cast ở phía app.
// ----------------------------------------------------------------------------

export interface ISocket {
  /** True khi socket đã kết nối thành công */
  connected: boolean;
  /** True khi socket đã bị ngắt */
  disconnected: boolean;
  /** Đăng ký listener cho event */
  on(event: string, listener: (...args: unknown[]) => void): this;
  /** Hủy listener cho event */
  off(event: string, listener?: (...args: unknown[]) => void): this;
  /** Phát event đến server */
  emit(event: string, ...args: unknown[]): this;
  /** Ngắt kết nối */
  disconnect(): this;
}

// ----------------------------------------------------------------------------
// Config Types
// ----------------------------------------------------------------------------

export interface SocketClientConfig {
  baseUrl: string;
  timeout?: number;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  auth?: Record<string, unknown>;
  query?: Record<string, string>;
}

export interface SocketNamespaceOptions {
  query?: Record<string, string>;
}

// ----------------------------------------------------------------------------
// SocketClient
// ----------------------------------------------------------------------------

export class SocketClient {
  private readonly config: SocketClientConfig;
  private sockets: Map<string, ISocket> = new Map();

  constructor(config: SocketClientConfig) {
    this.config = config;
  }

  /**
   * Lấy hoặc tạo socket connection cho namespace.
   * Reuse nếu đã connected/disconnected — không tạo connection mới.
   */
  connect(namespace: string = "/", options?: SocketNamespaceOptions): ISocket {
    if (this.sockets.has(namespace)) {
      const existing = this.sockets.get(namespace)!;
      if (existing.connected || existing.disconnected) {
        return existing;
      }
    }

    const socket = io(`${this.config.baseUrl}${namespace}`, {
      transports: ["websocket", "polling"],
      timeout: this.config.timeout ?? 10000,
      reconnection: this.config.reconnection ?? true,
      reconnectionAttempts: this.config.reconnectionAttempts ?? 5,
      reconnectionDelay: this.config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      auth: this.config.auth,
      query: options?.query ?? this.config.query,
    }) as unknown as ISocket;

    this.sockets.set(namespace, socket);
    return socket;
  }

  getSocket(namespace: string = "/"): ISocket | undefined {
    return this.sockets.get(namespace);
  }

  isConnected(namespace: string = "/"): boolean {
    return this.sockets.get(namespace)?.connected ?? false;
  }

  disconnect(namespace: string = "/"): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  disconnectAll(): void {
    this.sockets.forEach((socket) => socket.disconnect());
    this.sockets.clear();
  }

  emit<T = unknown>(namespace: string, event: string, data?: T): void {
    const socket = this.sockets.get(namespace);
    if (!socket?.connected) {
      console.warn(
        `[SocketClient] emit "${event}" skipped — namespace "${namespace}" not connected.`
      );
      return;
    }
    socket.emit(event, data);
  }
}

// ----------------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------------

/**
 * Factory helper — tạo SocketClient instance để inject vào useActionEngine.
 *
 * @example
 * const actionSocket = createActionSocket({
 *   baseUrl: import.meta.env.VITE_SOCKET_URL,
 *   auth: { token: authToken },
 * });
 */
export function createActionSocket(config: SocketClientConfig): SocketClient {
  return new SocketClient(config);
}
