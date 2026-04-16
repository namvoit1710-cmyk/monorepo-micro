import type { BreadcrumbItem } from "@/hooks/use-breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useTheme } from "@ldc/ui";
import { BreadcrumbBlock } from "@ldc/ui/blocks/breadcrumb/breadcrumb";
import ModeSwitcher from "@ldc/ui/blocks/mode-switcher/mode-switcher";
import ThemePicker from "@ldc/ui/blocks/theme-picker/theme-picker";

import { Button } from "@ldc/ui/components/button";
import { Separator } from "@ldc/ui/components/separator";
import { SidebarTrigger } from "@ldc/ui/components/sidebar";
import { BellRing } from "lucide-react";

export function AppHeader() {
    const { mode, setMode, theme, setTheme } = useTheme();

    const breadcrumbs: BreadcrumbItem[] = useBreadcrumbs();

    return (
        <header className="flex h-16 shrink-0 items-center px-4 justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />

                <BreadcrumbBlock items={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2 justify-end">
                <ModeSwitcher mode={mode as "light" | "dark"} onModeChange={setMode} />
                <ThemePicker theme={theme} onChangeTheme={setTheme} />

                <Button size="icon" variant="outline" className="size-7 cursor-pointer">
                    <BellRing />
                </Button>
            </div>
        </header>
    );
}
