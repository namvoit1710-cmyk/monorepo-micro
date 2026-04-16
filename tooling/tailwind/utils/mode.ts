import type { ColorMode } from "../types";

const resolveMode = (mode: ColorMode): "light" | "dark" => {
    if (mode !== "system") return mode;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}


const getStoredValue = <T extends string>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
        const value = localStorage.getItem(key);
        return (value !== null ? (value as T) : fallback);
    } catch {
        return fallback;
    }
}

const storeValue = (key: string, value: string | null) => {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch {
        //
    }
}

export { getStoredValue, resolveMode, storeValue };

