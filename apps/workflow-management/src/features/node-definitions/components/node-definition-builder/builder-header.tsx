import { useLanguage } from "@/components/containers/language-provider";
import LoadingSpin from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/loading-spin/loading-spin";
import { Button } from "@common/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BuilderHeaderProps {
    isSaving?: boolean;
    onSave: () => void;
}

const BuilderHeader = ({ isSaving, onSave }: BuilderHeaderProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-2 justify-end">
            <Button variant="link" onClick={() => navigate("/node-definitions")}>
                {t("node_definition_builder.back")}
            </Button>

            <Button variant="default" disabled={isSaving} onClick={onSave}>
                <div className="flex items-center gap-2">
                    {isSaving ? <LoadingSpin /> : <SaveIcon className="size-4" strokeWidth={1.5} />}
                    <span>{t("save")}</span>
                </div>
            </Button>
        </div>
    );
};

export default BuilderHeader;
