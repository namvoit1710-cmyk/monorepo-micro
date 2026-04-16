import type { BaseColorName } from "@ldc/tailwind-config";
import { BASE_COLOR_NAMES, THEMES } from "@ldc/tailwind-config";
import { Check, Palette } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

const ThemePicker = ({
    theme,
    onChangeTheme,
}: {
    theme?: { baseColor: BaseColorName; themeColor: string };
    onChangeTheme?: ({ baseColor, themeColor }: { baseColor: BaseColorName; themeColor: string }) => void;
}) => {
    const [baseColor, setBaseColor] = useState<BaseColorName>(theme?.baseColor ?? "neutral");
    const [themeColor, setThemeColor] = useState(theme?.themeColor ?? "blue");

    const handleApply = () => {
        onChangeTheme?.({ baseColor, themeColor });
    };

    const accentThemes = THEMES.filter(
        (t) => !(BASE_COLOR_NAMES as readonly string[]).includes(t.name)
    );

    return (
        <TooltipProvider>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                            "size-7 group relative overflow-hidden transition-all hover:scale-105 cursor-pointer"
                        )}
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20" />
                        <Palette className="relative h-4 w-4 transition-transform group-hover:rotate-12" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="text-xs font-semibold">
                        Base Color
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-7 gap-1.5 p-1.5">
                        {BASE_COLOR_NAMES.map((color) => (
                            <Tooltip key={color}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setBaseColor(color)}
                                        className={cn(
                                            "group relative aspect-square rounded border transition-all hover:scale-110",
                                            baseColor === color
                                                ? "border-primary ring-1 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div
                                            className="h-full w-full rounded-sm transition-opacity"
                                            style={{
                                                backgroundColor:
                                                    color === "neutral" ? "hsl(0, 0%, 50%)" :
                                                        color === "stone" ? "hsl(25, 5%, 45%)" :
                                                            color === "zinc" ? "hsl(240, 5%, 34%)" :
                                                                color === "mauve" ? "hsl(300, 5%, 45%)" :
                                                                    color === "olive" ? "hsl(85, 10%, 40%)" :
                                                                        color === "mist" ? "hsl(210, 10%, 60%)" :
                                                                            "hsl(30, 5%, 50%)", // taupe
                                            }}
                                        />

                                        {baseColor === color && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full bg-background p-px">
                                                    <Check className="h-2.5 w-2.5 text-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p className="capitalize">{color}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="text-xs font-semibold">
                        Accent Color
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-6 gap-2 p-1.5">
                        {accentThemes.map((color) => (
                            <Tooltip key={color.name}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setThemeColor(color.name)}
                                        className={cn(
                                            "group relative aspect-square rounded-full p-0.5 transition-all hover:scale-110",
                                            themeColor === color.name
                                                ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                                                : "hover:ring-2 hover:ring-primary/30"
                                        )}
                                    >
                                        <div
                                            className="h-7 w-7 rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: color.cssVars.light.primary ?? "hsl(0, 0%, 50%)",
                                            }}
                                        >
                                            {themeColor === color.name && (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <div className="rounded-full bg-white/90 p-0.5">
                                                        <Check className="h-3 w-3" style={{ color: 'inherit' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{color.title || color.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-between gap-2 p-2">
                        <p className="text-[10px] text-muted-foreground">
                            <span className="font-semibold capitalize">{baseColor}-{themeColor}</span>
                        </p>
                        <Button
                            size="sm"
                            onClick={handleApply}
                            className="h-6 px-3 text-xs cursor-pointer"
                        >
                            Apply
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    );
};

export default ThemePicker;