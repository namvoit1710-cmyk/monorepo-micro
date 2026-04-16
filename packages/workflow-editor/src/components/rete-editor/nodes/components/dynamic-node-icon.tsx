import { pascalToKebabCase } from "@common/components/ldc-workflow-editor/utils/string-utils";
import { EthernetPort } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { ComponentProps, memo } from "react";

interface IDynamicNodeIconProps extends Omit<ComponentProps<typeof DynamicIcon>, "name" | "strokeWidth"> {
    name: string
    strokeWidth?: number
    fallbackIconName?: string
}

const DynamicNodeIcon = ({ name, strokeWidth, fallbackIconName, fallback, ...props }: IDynamicNodeIconProps) => {
    const iconName = name
        ? (pascalToKebabCase(name) as IconName)
        : ((fallbackIconName as IconName) ?? "ethernet-port");

    return (
        <DynamicIcon
            {...props}
            name={iconName}
            strokeWidth={strokeWidth ?? 1}
            fallback={fallback ?? (() => <EthernetPort  {...props} strokeWidth={strokeWidth ?? 1} />)}
        />
    )
}

const memoizedDynamicNodeIcon = (prev: IDynamicNodeIconProps, next: IDynamicNodeIconProps) =>
    prev.name === next.name &&
    prev.strokeWidth === next.strokeWidth &&
    prev.fallbackIconName === next.fallbackIconName &&
    prev.className === next.className &&
    prev.style === next.style

export default memo(DynamicNodeIcon, memoizedDynamicNodeIcon)