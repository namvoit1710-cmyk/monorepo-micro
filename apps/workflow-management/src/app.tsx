import { ToasterRoot } from "@common/components/ldc-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layouts/main-layout";
import FormDesignPage from "./pages/form-design";
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

                        <Route path="/form-design" element={<FormDesignPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>

            <ToasterRoot />
        </>
    );
};

export default App;
