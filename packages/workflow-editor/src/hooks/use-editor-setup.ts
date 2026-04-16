import { makeCreateEditor } from "@common/components/ldc-workflow-editor/components/rete-editor";
import { BaseNode } from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/base-node";
import { EditorConfig, IEditorValue } from "@common/components/ldc-workflow-editor/components/rete-editor/types";
import { useEffect, useMemo, useRef } from "react";
import { useRete } from "rete-react-plugin";

interface UseEditorSetupOptions {
    direction?: EditorConfig["direction"];
    openNodeContext: (ref: HTMLDivElement, nodeId: string) => void;
    onOpenNodePopup?: (node: BaseNode) => void;
    readOnly?: boolean;
    onLoadedData?: () => void;
}

export function useEditorSetup(value: IEditorValue, options: UseEditorSetupOptions) {
    const { openNodeContext, onOpenNodePopup, onLoadedData, direction, readOnly } = options;

    const editorConfig: EditorConfig = useMemo(() => ({
        readOnly,
        direction,
        additionalConfig: { openNodeContext, onOpenNodePopup },
    }), [direction]);

    const factoryEditor = useMemo(() => makeCreateEditor(editorConfig), [editorConfig]);
    const [ref, editorInstance] = useRete(factoryEditor);

    const isLoadingRef = useRef(false);
    const lastValueRef = useRef<string>("");

    useEffect(() => {
        if (!editorInstance || !value) {
            return;
        }

        const serializedValue = JSON.stringify({ nodes: value.nodes, connections: value.connections });
        if (lastValueRef.current === serializedValue) {
            return;
        }
        lastValueRef.current = serializedValue;

        isLoadingRef.current = true;

        const load = async () => {
            if (!editorInstance) return;

            if (readOnly) {
                await editorInstance.removeAllNodes();
            }

            if (!editorInstance.getNodes().length) {
                await editorInstance.initialLoadNodes(value);
            }

            onLoadedData?.();
            isLoadingRef.current = false;
        };

        load();
    }, [editorInstance, value]);

    return { ref, editorInstance, isLoadingRef };
}
