/**
 * MF Auth Propagation
 * ===================
 * Đồng bộ auth state từ shell xuống tất cả remote.
 *
 * Vấn đề giải quyết:
 *  - Mỗi remote có auth context riêng → user phải login nhiều lần
 *  - Token refresh ở shell nhưng remote dùng token cũ → 401
 *  - Remote mount sau khi login → không có auth info
 *  - Logout ở shell nhưng remote vẫn giữ state → security risk
 *
 * Cách hoạt động:
 *  1. Shell wrap app trong <MFAuthProvider> với auth state
 *  2. Provider broadcast auth qua event bus (cho cross-framework remote)
 *  3. Remote dùng useMFAuth() hook hoặc subscribe event bus
 *  4. Token refresh tự động propagate xuống tất cả remote
 *
 * Usage (Shell):
 *   <MFAuthProvider
 *     user={currentUser}
 *     token={accessToken}
 *     onLogout={handleLogout}
 *   >
 *     <App />
 *   </MFAuthProvider>
 *
 * Usage (Remote):
 *   function RemoteComponent() {
 *     const { user, token, isAuthenticated } = useMFAuth();
 *   }
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
  
  
} from "react";
import type {FC, ReactNode} from "react";
import { mfEventBus, useMFEvent } from "./mf-event-bus";

// ─── Types ─────────────────────────────────────────────────────

export interface MFUser {
  id: string;
  email?: string;
  name?: string;
  roles?: string[];
  [key: string]: unknown; // extensible
}

export interface MFAuthState {
  isAuthenticated: boolean;
  user: MFUser | null;
  token: string | null;
  expiresAt: number | null;
  /** Permissions cho RBAC — remote check quyền trước khi render */
  permissions: string[];
}

export interface MFAuthActions {
  /** Remote gọi để request logout (shell xử lý) */
  logout: (reason?: string) => void;
  /** Check permission — tiện hơn tự check permissions array */
  hasPermission: (permission: string) => boolean;
  /** Check role */
  hasRole: (role: string) => boolean;
}

type MFAuthContextValue = MFAuthState & MFAuthActions;

// ─── Context ───────────────────────────────────────────────────

const MFAuthContext = createContext<MFAuthContextValue | null>(null);

// ─── Provider (Shell side) ─────────────────────────────────────

export interface MFAuthProviderProps {
  children: ReactNode;
  user: MFUser | null;
  token: string | null;
  expiresAt?: number | null;
  permissions?: string[];
  onLogout?: (reason?: string) => void;
}

export const MFAuthProvider: FC<MFAuthProviderProps> = ({
  children,
  user,
  token,
  expiresAt = null,
  permissions = [],
  onLogout,
}) => {
  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  const isAuthenticated = !!user && !!token;

  // Broadcast auth state qua event bus khi thay đổi
  useEffect(() => {
    if (isAuthenticated && token) {
      mfEventBus.emit("auth:token-refreshed", {
        token,
        expiresAt: expiresAt ?? Date.now() + 3600_000,
      });
      mfEventBus.emit("auth:login", {
        userId: user.id,
        token,
      });
    }
  }, [isAuthenticated, token, user?.id, expiresAt]);

  // Cũng lưu vào window cho non-React remote (Vue, Angular, vanilla)
  useEffect(() => {
    (window as Record<string, unknown>).__MF_AUTH__ = {
      isAuthenticated,
      user,
      token,
      expiresAt,
      permissions,
    };
    return () => {
      delete (window as Record<string, unknown>).__MF_AUTH__;
    };
  }, [isAuthenticated, user, token, expiresAt, permissions]);

  const value = useMemo<MFAuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      token,
      expiresAt,
      permissions,
      logout: (reason?: string) => {
        mfEventBus.emit("auth:logout", { reason });
        onLogoutRef.current?.(reason);
      },
      hasPermission: (perm: string) => permissions.includes(perm),
      hasRole: (role: string) => user?.roles?.includes(role) ?? false,
    }),
    [isAuthenticated, user, token, expiresAt, permissions],
  );

  return React.createElement(MFAuthContext.Provider, { value }, children);
};

// ─── Consumer Hook (Remote side) ───────────────────────────────

/**
 * Hook cho remote lấy auth state.
 * Hoạt động 2 cách:
 *  1. Nếu remote nằm trong React tree của shell → dùng Context
 *  2. Nếu remote standalone → dùng event bus + window fallback
 */
export function useMFAuth(): MFAuthContextValue {
  const contextValue = useContext(MFAuthContext);

  // Nếu có context (remote nằm trong shell React tree), dùng trực tiếp
  if (contextValue) return contextValue;

  // Fallback: remote standalone — lấy từ window + listen event bus
  const [authState, setAuthState] = useState<MFAuthState>(() => {
    const windowAuth = (window as Record<string, unknown>).__MF_AUTH__ as MFAuthState | undefined;
    return (
      windowAuth ?? {
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null,
        permissions: [],
      }
    );
  });

  useMFEvent(
    "auth:token-refreshed",
    (data) => {
      setAuthState((prev) => ({
        ...prev,
        token: data.token,
        expiresAt: data.expiresAt,
        isAuthenticated: true,
      }));
    },
    { replay: true },
  );

  useMFEvent("auth:logout", () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null,
      permissions: [],
    });
  });

  return useMemo<MFAuthContextValue>(
    () => ({
      ...authState,
      logout: (reason?: string) => {
        mfEventBus.emit("auth:logout", { reason });
      },
      hasPermission: (perm: string) => authState.permissions.includes(perm),
      hasRole: (role: string) => authState.user?.roles?.includes(role) ?? false,
    }),
    [authState],
  );
}

/**
 * Non-React helper — cho Vue, Angular, hoặc vanilla JS remote.
 *
 * @example
 * const auth = getMFAuth();
 * if (auth.isAuthenticated) {
 *   fetch("/api", { headers: { Authorization: `Bearer ${auth.token}` } });
 * }
 */
export function getMFAuth(): MFAuthState {
  return (
    ((window as Record<string, unknown>).__MF_AUTH__ as MFAuthState) ?? {
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null,
      permissions: [],
    }
  );
}
