import type { ToastVariant } from "../config/variants";
import { VARIANT_CONFIG } from "../config/variants";

function getIcon(variant: ToastVariant, color: string) {
    const IconComponent = VARIANT_CONFIG[variant].icon;
    const icon = <IconComponent className="h-4 w-4 shrink-0" style={{ color }} />;

    if (variant === "loading") {
        return <span className="animate-spin inline-flex">{icon}</span>;
    }

    return icon;
}

export { getIcon };

