import type { buildRegistryTheme } from "../utils/builder";

export type ColorMode = "light" | "dark" | "system";

export type RegistryThemeCssVars = NonNullable<
    ReturnType<typeof buildRegistryTheme>["cssVars"]
>