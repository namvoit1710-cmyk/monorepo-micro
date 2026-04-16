import { useTheme } from "@ldc/ui";
import ModeSwitcher from "@ldc/ui/blocks/mode-switcher/mode-switcher";
import ThemePicker from "@ldc/ui/blocks/theme-picker/theme-picker";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@ldc/ui/components/breadcrumb";
import { Button } from "@ldc/ui/components/button";
import { Separator } from "@ldc/ui/components/separator";
import { SidebarTrigger } from "@ldc/ui/components/sidebar";
import { BellRing } from "lucide-react";

export function AppHeader() {
    const { mode, setMode, theme, setTheme } = useTheme();
    return (
        <header className="flex h-16 shrink-0 items-center px-4 justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                                Build Your Application
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
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
