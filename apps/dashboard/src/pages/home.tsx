import { Link } from "react-router-dom";

import { env } from "@/env";
import { buildRegistryTheme } from "@ldc/tailwind-config";
import ModeSwitcher from "@ldc/ui/blocks/mode-switcher/mode-switcher";
import ThemePicker from "@ldc/ui/blocks/theme-picker/theme-picker";
import { Button } from "@ldc/ui/components/button";

const HomePage = () => {

    const builderTheme = buildRegistryTheme({
        baseColor: "neutral",
        theme: "green",
    })

    console.log(builderTheme)

    return (
        <div className="bg-muted w-screen h-screen flex flex-col items-center justify-center">
            <ModeSwitcher />

            <ThemePicker />
            <div className="bg-card size-100 rounded">
                {env.PUBLIC_WORKFLOW_API_URL}

                <Link to="/">
                    <Button variant={"default"}>Home</Button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
