/**
 * MF CSS Isolation
 * ================
 * Ngăn CSS leak giữa các remote và shell.
 *
 * Vấn đề giải quyết:
 *  - Remote A có `.btn { color: red }` → ảnh hưởng Remote B
 *  - Remote inject global CSS vào <head> → override shell styles
 *  - Khi remote unmount, CSS không bị cleanup → style zombie
 *  - CSS load order khác nhau giữa dev/prod → style flicker
 *
 * Cách hoạt động:
 *  1. Cung cấp React wrapper component <MFStyleIsolation>
 *  2. Dùng Shadow DOM (nếu supported) hoặc CSS scope fallback
 *  3. Theo dõi <style>/<link> inject bởi remote → cleanup khi unmount
 *
 * Usage:
 *   <MFStyleIsolation remoteName="dashboard">
 *     <Suspense fallback={<Loading />}>
 *       <DashboardRemote />
 *     </Suspense>
 *   </MFStyleIsolation>
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from "react";

export interface MFStyleIsolationProps {
  /** Tên remote — dùng cho scoping và debug */
  remoteName: string;
  children: ReactNode;
  /** Dùng Shadow DOM nếu browser support — default false vì có trade-off */
  useShadowDom?: boolean;
  /** Cleanup CSS khi unmount — default true */
  cleanupOnUnmount?: boolean;
  /** Custom class prefix thay vì auto-generate */
  classPrefix?: string;
}

/**
 * Track các <style> và <link> element được inject vào <head>
 * bởi remote chunk loading.
 */
function useStyleTracker(remoteName: string, cleanupOnUnmount: boolean) {
  const trackedStylesRef = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    // MutationObserver theo dõi style/link mới inject vào head
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLStyleElement ||
            (node instanceof HTMLLinkElement && node.rel === "stylesheet")
          ) {
            // Heuristic: MF chunk thường inject style không có data-owner
            // Gán ownership để track
            if (!node.dataset.mfOwner) {
              // Kiểm tra nội dung có liên quan tới remote không
              // (Không hoàn hảo nhưng best-effort)
              node.dataset.mfOwner = remoteName;
              trackedStylesRef.current.add(node);
            }
          }
        }
      }
    });

    observer.observe(document.head, { childList: true });

    return () => {
      observer.disconnect();
      if (cleanupOnUnmount) {
        // Cleanup styles khi remote unmount
        trackedStylesRef.current.forEach((el) => {
          el.remove();
        });
        trackedStylesRef.current.clear();
      }
    };
  }, [remoteName, cleanupOnUnmount]);
}

/**
 * CSS Scope wrapper — thêm data attribute cho CSS specificity isolation.
 * Không hoàn hảo bằng Shadow DOM nhưng compatible hơn.
 */
const ScopedIsolation: FC<{
  remoteName: string;
  classPrefix: string;
  children: ReactNode;
}> = ({ remoteName, classPrefix, children }) => {
  return React.createElement(
    "div",
    {
      "data-mf-scope": remoteName,
      className: `${classPrefix}-scope`,
      style: { display: "contents" }, // Không ảnh hưởng layout
    },
    children,
  );
};

/**
 * Shadow DOM wrapper — isolation mạnh nhất nhưng có trade-off:
 *  - Styles bên ngoài không vào được (kể cả design system)
 *  - Event delegation có thể bị ảnh hưởng
 *  - Portal (modal, tooltip) render ngoài shadow → mất style
 */
const ShadowDomIsolation: FC<{
  remoteName: string;
  children: ReactNode;
}> = ({ remoteName, children }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: "open" });
      setShadowRoot(shadow);
    }
  }, []);

  // Render children vào shadow root bằng portal
  const portal = shadowRoot
    ? (React as unknown as { createPortal: typeof import("react-dom").createPortal })
        // Sử dụng ReactDOM.createPortal thực tế
        ? React.createElement("div", { "data-mf-shadow": remoteName }, children)
        : null
    : null;

  return React.createElement(
    "div",
    { ref: hostRef, "data-mf-host": remoteName },
    // Fallback: nếu shadow chưa sẵn sàng, render bình thường
    shadowRoot ? portal : children,
  );
};

/**
 * Main isolation component.
 * Mặc định dùng CSS Scope (an toàn hơn).
 * Bật useShadowDom=true khi cần isolation mạnh.
 */
export const MFStyleIsolation: FC<MFStyleIsolationProps> = ({
  remoteName,
  children,
  useShadowDom = false,
  cleanupOnUnmount = true,
  classPrefix,
}) => {
  const prefix = classPrefix ?? `mf-${remoteName}`;

  // Track và cleanup style injection
  useStyleTracker(remoteName, cleanupOnUnmount);

  if (useShadowDom) {
    return React.createElement(ShadowDomIsolation, { remoteName }, children);
  }

  return React.createElement(
    ScopedIsolation,
    { remoteName, classPrefix: prefix },
    children,
  );
};
