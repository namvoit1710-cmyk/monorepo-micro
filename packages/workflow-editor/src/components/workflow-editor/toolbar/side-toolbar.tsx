import { handlerLoadingType } from "@common/components/ldc-workflow-editor/hooks/use-editor-clipboard";
import { RETE_EDITOR_I18N_NAMESPACE } from "@common/components/ldc-workflow-editor/i18n";
import { Button } from "@common/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@common/components/ui/tooltip";
import { Clipboard, CopyIcon, LoaderCircle, PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type IExtension = {
    icon: React.ReactNode;
    label: string;
    callback: () => void;
    key: string;
}

interface ISideToolBarProps {
    isHandlerLoading?: handlerLoadingType
    clipboardHandlers: {
        onCopy: () => Promise<void>;
        onPaste: () => Promise<void>;
    }
    extensions?: IExtension[];
    onAddNode?: () => void;
}

const SideToolBar = ({ clipboardHandlers, isHandlerLoading, extensions, onAddNode }: ISideToolBarProps) => {
    const { t } = useTranslation(RETE_EDITOR_I18N_NAMESPACE);

    const menuItems = useMemo(() => {
        return [
            {
                icon: <PlusIcon />,
                label: t("toolbar.add_node"),
                onClick: onAddNode,
            },
            {
                icon: isHandlerLoading?.isCopyLoading ? <LoaderCircle className="animate-spin text-blue-500" /> : <CopyIcon />,
                label: t("toolbar.copy"),
                onClick: clipboardHandlers.onCopy,
            },
            {
                icon: isHandlerLoading?.isPasteLoading ? <LoaderCircle className="animate-spin text-blue-500" /> : <Clipboard />,
                label: t("toolbar.paste"),
                onClick: clipboardHandlers.onPaste,
            },
        ]
    }, [t, onAddNode, clipboardHandlers, isHandlerLoading])

    return (
        <TooltipProvider>
            <div className="absolute right-4 top-4 z-20">
                <div className="flex items-center flex-col gap-2">
                    {menuItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon-lg"
                                    variant="outline"
                                    className="shadow-lg cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    {item.icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}

                    {extensions?.map(item => (
                        <Tooltip key={item.key}>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon-lg"
                                    variant="outline"
                                    className="shadow-lg cursor-pointer"
                                    onClick={item.callback}
                                >
                                    {item.icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <>
                                    <div>{item.label}</div>
                                </>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    )
}

export default SideToolBar
