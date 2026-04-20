import { useTranslation } from "@ldc/i18n";
import { Button } from "@ldc/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ldc/ui/components/tooltip";
import { BrushCleaning, Minimize, RedoIcon, UndoIcon, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo } from "react";
import type { IEditorInstance } from "../../../components/rete-editor/types";
import useEditorHistory from "../../../hooks/use-editor-history";
import { RETE_EDITOR_I18N_NAMESPACE } from "../../../i18n";

interface IBottomToolbarProps {
    editorInstance: IEditorInstance | null;
}

const BottomToolbar = (props: IBottomToolbarProps) => {
    const { t } = useTranslation(RETE_EDITOR_I18N_NAMESPACE);

    const { editorInstance } = props;

    const { canRedo, canUndo } = useEditorHistory(editorInstance);

    const menuItems = useMemo(() => {
        return [
            {
                icon: <UndoIcon />,
                label: t("toolbar.undo"),
                onClick: editorInstance?.undo,
                disabled: !canUndo,
            },
            {
                icon: <RedoIcon />,
                label: t("toolbar.redo"),
                onClick: editorInstance?.redo,
                disabled: !canRedo,
            },
            {
                icon: <Minimize />,
                label: t("toolbar.zoom_fit"),
                onClick: editorInstance?.zoomToFit,
            },
            {
                icon: <ZoomIn />,
                label: t("toolbar.zoom_in"),
                onClick: editorInstance?.zoomIn,
            },
            {
                icon: <ZoomOut />,
                label: t("toolbar.zoom_out"),
                onClick: editorInstance?.zoomOut,
            },
            {
                icon: <BrushCleaning />,
                label: t("toolbar.clean_up"),
                onClick: editorInstance?.layout,
            },
        ]
    }, [editorInstance, canRedo, canUndo, t])

    return (
        <TooltipProvider>
            <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center gap-2">
                    {menuItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon-lg"
                                    variant="outline"
                                    disabled={item.disabled}
                                    className="shadow-lg cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    {item.icon}
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="top">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    )
}

export default BottomToolbar;