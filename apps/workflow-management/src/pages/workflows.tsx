import Page from "@/components/containers/page"
import { WORKFLOW_TAB_ENUM } from "@/constants/workflows"
import WorkflowExecutionHistory from "@/features/workflows/components/execution-history/execution-history"
import WorkflowCreateModal from "@/features/workflows/components/modals/workflow-create-modal"
import WorkflowCreateChatbotPanel from "@/features/workflows/components/panels/workflow-create-chatbot-panel"
import WorkflowList from "@/features/workflows/components/workflow-list/workflow-list"
import { workflowKey } from "@/features/workflows/hooks/apis/workflows"
import { useLanguage } from "@/hooks/use-language"
import { useQueryClient } from "@ldc/tanstack-query"
import { Button } from "@ldc/ui/components/button"
import { ResizablePanel, ResizablePanelGroup } from "@ldc/ui/components/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ldc/ui/components/tabs"
import { PlusIcon, SparklesIcon } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const WorkflowsPage = () => {
    const { t } = useLanguage()

    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault(WORKFLOW_TAB_ENUM.WORKFLOWS))
    const [isCreateWorkflowPopup, setIsCreateWorkflowPopup] = useState(false);
    const [isCreateWorkflowChatbotOpen, setIsCreateWorkflowChatbotOpen] = useState(false);

    const queryClient = useQueryClient()
    const handleCreateWorkflowSuccess = (workflowId: string) => {
        setIsCreateWorkflowPopup(false)
        setIsCreateWorkflowChatbotOpen(false)

        if (workflowId) {
            navigate(`/workflow/${workflowId}`)
        }

        queryClient.invalidateQueries({ queryKey: workflowKey.all })
    }

    return (
        <>
            <ResizablePanelGroup className="overflow-hidden">
                <ResizablePanel className="h-full overflow-hidden">
                    <Page>
                        <Page.Header
                            title={t("overview")}
                            description={t("overview_description")}
                            actions={
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setIsCreateWorkflowPopup(true)}>
                                        <PlusIcon />
                                        <span>{t("create_manually")}</span>
                                    </Button>
                                    <Button size="sm" onClick={() => setIsCreateWorkflowChatbotOpen(true)}>
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>{t("create_with_ai")}</span>
                                    </Button>
                                </div>
                            }
                        />

                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            className="h-full overflow-hidden flex flex-col gap-0"
                        >
                            <TabsList variant="line" className="px-4 border-b border-b-border justify-start w-full">
                                <TabsTrigger value={WORKFLOW_TAB_ENUM.WORKFLOWS} className="flex-0 cursor-pointer data-active:after:bg-primary">
                                    {t("workflows")}
                                </TabsTrigger>

                                <TabsTrigger value={WORKFLOW_TAB_ENUM.EXECUTION_HISTORY} className="flex-0 cursor-pointer data-active:after:bg-primary">
                                    {t("execution_history")}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent className="flex-2 overflow-hidden" value={WORKFLOW_TAB_ENUM.WORKFLOWS}>
                                <WorkflowList isActive={activeTab === WORKFLOW_TAB_ENUM.WORKFLOWS} />
                            </TabsContent>

                            <TabsContent className="flex-2 overflow-hidden" value={WORKFLOW_TAB_ENUM.EXECUTION_HISTORY}>
                                <WorkflowExecutionHistory isActive={activeTab === WORKFLOW_TAB_ENUM.EXECUTION_HISTORY} />
                            </TabsContent>
                        </Tabs>
                    </Page>
                </ResizablePanel>

                {isCreateWorkflowChatbotOpen && (
                    <ResizablePanel
                        minSize={400}
                        defaultSize={500}
                        className="border-l h-full overflow-hidden"
                    >
                        <WorkflowCreateChatbotPanel
                            onClose={() =>
                                setIsCreateWorkflowChatbotOpen(false)
                            }
                        />
                    </ResizablePanel>
                )}
            </ResizablePanelGroup>

            <WorkflowCreateModal
                open={isCreateWorkflowPopup}
                onOpenChange={(open) => { setIsCreateWorkflowPopup(open) }}
                onSave={handleCreateWorkflowSuccess}
            />
        </>
    )
}

export default WorkflowsPage