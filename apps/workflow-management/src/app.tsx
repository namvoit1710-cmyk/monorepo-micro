import { ToasterRoot } from "@ldc/ui/blocks/toast/components/toast-root";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layouts/main-layout";
import NodeDefinitionBuilderPage from "./pages/node-definition-builder";
import NodeDefinitionsPage from "./pages/node-definitions";
import WorkflowDetailPage from "./pages/workflow-detail";
import WorkflowsPage from "./pages/workflows";

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<WorkflowsPage />} />

                        <Route path="/workflow/:workflowId" element={<WorkflowDetailPage />} />

                        <Route path="/node-definitions" element={<NodeDefinitionsPage />} />

                        <Route path="/node-definitions/:definitionId" element={<NodeDefinitionBuilderPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>

            <ToasterRoot />
        </>
    );
};

export default App;
