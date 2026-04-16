import type { ColorMode } from "@ldc/tailwind-config"
import { Moon, Sun } from "lucide-react"
import { useState } from "react"
import { Toggle } from "../../ui/toggle"

export interface IModeSwitcherProps {
    mode?: ColorMode
    onModeChange?: (mode: ColorMode) => void
}

const ModeSwitcher = ({ mode, onModeChange }: IModeSwitcherProps) => {
    const [modeState, setModeState] = useState<ColorMode>(mode ?? "light")

    return (
        <Toggle
            pressed={modeState === "dark"}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="aspect-square cursor-pointer"

            onPressedChange={() => {
                setModeState(prev => {
                    const newMode = prev === "light" ? "dark" : "light"
                    onModeChange?.(newMode)
                    return newMode
                })
            }}
        >
            <Sun className="group-data-[state=off]/toggle:hidden" />
            <Moon className="group-data-[state=on]/toggle:hidden" />
        </Toggle>
    )
}

export default ModeSwitcher