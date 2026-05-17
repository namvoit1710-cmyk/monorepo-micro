import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@common/configs/socket", async () => {
  const { createMockSocket } = await import(
    "@common/configs/socket/__tests__/mocks/socket.mock"
  );
  const MockSocketClient = vi.fn(function () {
    return createMockSocket();
  });
  return { SocketClient: MockSocketClient };
});

const importFreshSocketModule = async () => {
  vi.resetModules();
  return import("../socket");
};

describe("socket lib — socketInstance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe("Module exports", () => {
    it("should export a socketInstance", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      const { socketInstance } = await importFreshSocketModule();
      expect(socketInstance).toBeDefined();
    });

    it("should call SocketClient constructor once when module is loaded", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledTimes(1);
    });
  });

  describe("SocketClient constructor config", () => {
    it("should initialize with baseUrl from VITE_WORKFLOW_API_URL", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://api.production.com");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: "http://api.production.com" })
      );
    });

    it("should initialize with correct hardcoded timeout of 10000ms", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it("should initialize with reconnection enabled", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledWith(
        expect.objectContaining({ reconnection: true })
      );
    });

    it("should initialize with reconnectionAttempts of 5", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledWith(
        expect.objectContaining({ reconnectionAttempts: 5 })
      );
    });

    it("should initialize with reconnectionDelay of 1000ms", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledWith(
        expect.objectContaining({ reconnectionDelay: 1000 })
      );
    });

    it("should pass the full config object shape to SocketClient constructor", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://staging.api.com");
      await importFreshSocketModule();
      const { SocketClient } = await import("@common/configs/socket");
      expect(SocketClient).toHaveBeenCalledTimes(1);
      expect(SocketClient).toHaveBeenCalledWith({
        baseUrl: "http://staging.api.com",
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    });
  });

  describe("Singleton behavior", () => {
    it("should export the same socketInstance reference on multiple imports", async () => {
      vi.stubEnv("VITE_WORKFLOW_API_URL", "http://localhost:5000");
      // Do NOT use importFreshSocketModule here — we want the cached module
      const [mod1, mod2] = await Promise.all([
        import("../socket"),
        import("../socket"),
      ]);
      expect(mod1.socketInstance).toBe(mod2.socketInstance);
    });
  });
});

