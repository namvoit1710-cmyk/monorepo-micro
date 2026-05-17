import { useLanguage } from "@/hooks/use-language";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ldc/ui/components/dropdown-menu";
import { Edit, FileText, Settings } from "lucide-react";
import { useMemo } from "react";

export enum MenuActionEnum {
    ReplaceName = "replace-name",
    ReplaceDescription = "replace-description",
    SettingRoutingPath = "setting-routing-path",
}

interface IMenuConfigSettingProps {
    onAction?: (action: MenuActionEnum) => void;
    children: React.ReactNode;
}

const MenuConfigSetting = ({ onAction, children }: IMenuConfigSettingProps) => {
    const { t } = useLanguage();

    const menus = useMemo(() => ([
        {
            id: MenuActionEnum.ReplaceName,
            label: t("replace_name"),
            icon: <Edit />
        },
        {
            id: MenuActionEnum.ReplaceDescription,
            label: t("replace_workflow_description"),
            icon: <FileText />
        },
        {
            id: MenuActionEnum.SettingRoutingPath,
            label: t("setting_routing_path"),
            icon: <Settings />
        }
    ]), [])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
                {menus.map(item => (
                    <DropdownMenuItem
                        key={item.id}
                        onClick={() => onAction?.(item.id)}
                    >
                        {item.icon}
                        {item.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MenuConfigSetting
