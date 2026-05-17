import { useLanguage } from "@/components/containers/language-provider";
import Page from "@/components/containers/page";
import NodeDefinitionList from "@/features/node-definitions/components/node-definitions/node-definition-list";
import LdcSeo from "@common/components/ldc-seo/ldc-seo";
import { Button } from "@common/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NodeDefinitionsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <>
            <LdcSeo 
                title={t("node_definitions.tab_title")}
                description={t("node_definitions.seo_description")}
            />
            
            <Page>
                <Page.Header
                    title={t("node_definitions.tab_title")}
                    actions={
                        <Button onClick={() => navigate("/node-definitions/new")}>
                            <PlusIcon className="size-4" />
                            {t("node_definitions.create_button")}
                        </Button>
                    }
                />

                <NodeDefinitionList />
            </Page>
        </>
    );
};

export default NodeDefinitionsPage;