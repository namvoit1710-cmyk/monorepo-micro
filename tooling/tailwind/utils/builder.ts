import type { BaseColorName } from "../registry/theme";
import { BASE_COLOR_NAMES, THEMES } from "../registry/theme";

export function getThemesForBaseColor(baseColorName: string) {
    const baseColorNames = BASE_COLOR_NAMES.map((bc) => bc)

    return THEMES.filter((theme) => {
        if (theme.name === baseColorName) {
            return true
        }
        return !baseColorNames.includes(theme.name as BaseColorName)
    })
}

export function getBase(name: BaseColorName) {
    return BASE_COLOR_NAMES.find((base) => base === name)
}

export function getTheme(name: string) {
    return THEMES.find((theme) => theme.name === name)
}

export function getBaseColor(name: BaseColorName) {
    return THEMES.find((color) => color.name === name)
}

export function buildRegistryTheme(config: {
    baseColor: BaseColorName;
    theme: string;
}) {
    const baseColor = getBaseColor(config.baseColor)
    const theme = getTheme(config.theme)

    if (!baseColor || !theme) {
        throw new Error(
            `Base color "${config.baseColor}" or theme "${config.theme}" not found`
        )
    }

    const lightVars: Record<string, string> = {
        ...(baseColor.cssVars.light),
        ...(theme.cssVars.light),
    }
    const darkVars: Record<string, string> = {
        ...(baseColor.cssVars.dark),
        ...(theme.cssVars.dark),
    }
    const themeVars: Record<string, string> = {}

    return {
        name: `${config.baseColor}-${config.theme}`,
        type: "registry:theme" as const,
        cssVars: {
            theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
            light: lightVars,
            dark: darkVars,
        },
    }
}

export function buildCssRule(selector: string, cssVars?: Record<string, string>) {
    const declarations = Object.entries(cssVars ?? {})
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n")

    if (!declarations) {
        return `${selector} {}\n`
    }

    return `${selector} {\n${declarations}\n}\n`
}