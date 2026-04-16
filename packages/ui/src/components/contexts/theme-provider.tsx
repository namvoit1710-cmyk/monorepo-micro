import type { BaseColorName, ColorMode } from "@ldc/tailwind-config";
import { buildThemeCssText, getStoredValue, isBaseColorTheme, mergeThemes, resolveMode, storeValue, THEMES } from "@ldc/tailwind-config";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

const STORAGE_MODE_KEY = "mode-system";
const STORAGE_THEME_KEY = "theme-system";
const STYLE_ELEMENT_ID = "theme-provider-styles";

export interface ThemeContextValue {
    /** Color mode: light, dark, system */
    mode: ColorMode;
    /** Set color mode */
    setMode: (mode: ColorMode) => void;

    /** Theme mode */
    theme: { baseColor: BaseColorName; themeColor: string } | undefined;
    /** Set theme */
    setTheme: (theme: { baseColor: BaseColorName; themeColor: string } | undefined) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within <ThemeProvider>");
    }
    return ctx;
}

export interface ThemeProviderProps {
    children: ReactNode;
    /** Default theme if nothing stored */
    defaultTheme?: { baseColor: BaseColorName; themeColor: string } | null;
    /** Default color mode */
    defaultMode?: ColorMode;
}

export function ThemeProvider({
    children,
    defaultTheme,
    defaultMode = "system",
}: ThemeProviderProps) {

    const [theme, setTheme] = useState<{ baseColor: BaseColorName; themeColor: string } | undefined>(
        () => {
            const stored = getStoredValue(STORAGE_THEME_KEY, JSON.stringify(defaultTheme));
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return defaultTheme ?? { baseColor: "olive", themeColor: "green" };
                }
            }
            return defaultTheme ?? { baseColor: "olive", themeColor: "green" };
        }
    );

    const [mode, setModeState] = useState<ColorMode>(getStoredValue(STORAGE_MODE_KEY, defaultMode));

    const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(
        () => resolveMode(mode)
    );

    const changeTheme = useCallback(
        (theme: { baseColor: BaseColorName; themeColor: string } | undefined) => {
            setTheme(theme);
            if (theme) storeValue(STORAGE_THEME_KEY, JSON.stringify(theme));
        },
        []
    );

    const setMode = useCallback(
        (m: ColorMode) => {
            setModeState(m);
            storeValue(STORAGE_MODE_KEY, m);
        },
        []
    );

    useEffect(() => {
        setResolvedMode(resolveMode(mode));

        if (mode !== "system") return;

        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => {
            setResolvedMode(e.matches ? "dark" : "light");
        };
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [mode]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", resolvedMode === "dark");
        root.classList.toggle("light", resolvedMode === "light");
    }, [resolvedMode]);

    useLayoutEffect(() => {
        const baseDef = THEMES.find((t) => t.name === theme?.baseColor);
        if (!baseDef) return;

        const accentDef = theme?.themeColor ? THEMES.find((t) => t.name === theme.themeColor) : null;

        const cssVars =
            accentDef && !isBaseColorTheme(accentDef)
                ? mergeThemes(baseDef, accentDef)
                : baseDef.cssVars;

        let styleEl = document.getElementById(
            STYLE_ELEMENT_ID
        ) as HTMLStyleElement | null;

        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = STYLE_ELEMENT_ID;
            document.head.appendChild(styleEl);
        }

        styleEl.textContent = buildThemeCssText(cssVars);

        return () => {
            document.getElementById(STYLE_ELEMENT_ID)?.remove();
        };
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            mode,
            resolvedMode,
            themes: THEMES,
            setTheme: changeTheme,
            setMode,
        }),
        [
            mode,
            resolvedMode,
            setMode,

            theme,
            changeTheme,
        ]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}