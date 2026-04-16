import { getNodeSize } from "@common/components/ldc-workflow-editor/components/rete-editor/config/node-config";
import { BaseNode } from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/base-node";
import { IEditorInstance, IEditorNode } from "@common/components/ldc-workflow-editor/components/rete-editor/types";
import { useCallback, useRef, useState } from "react";
import { generateUUID } from "../utils/generate-uuid";

export function useEditorDnd(editorInstance: IEditorInstance | undefined, readOnly: boolean) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [dragPreview, setDragPreview] = useState<{ editorNode: IEditorNode } | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (readOnly) return;

        e.preventDefault();

        if (!dragPreview) {
            try {
                setDragPreview({ editorNode: null as any });
            } catch { /* ignore */ }
        }
        if (previewRef.current) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            previewRef.current.style.left = `${x}px`;
            previewRef.current.style.top = `${y}px`;
        }
    }, [dragPreview]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const { clientX, clientY } = e;
        if (
            clientX <= rect.left ||
            clientX >= rect.right ||
            clientY <= rect.top ||
            clientY >= rect.bottom
        ) {
            setDragPreview(null);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        if (readOnly) return;

        e.preventDefault();
        setDragPreview(null);

        const raw = e.dataTransfer.getData("nodeType");
        if (!raw || !editorInstance) return;

        try {
            const editorNode: IEditorNode = JSON.parse(raw);
            const node = new BaseNode(generateUUID(), editorNode.name, editorNode.ports, getNodeSize(editorNode.name), editorNode);
            
            await editorInstance.addNode(node);
            const transform = editorInstance.getTransform();
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            let x = (e.clientX - rect.left - transform.x) / transform.k;
            let y = (e.clientY - rect.top - transform.y) / transform.k;

            editorInstance.translateNode(node.id, { x, y });
        } catch (error) {
            console.warn("Failed to parse dropped node data");
        }
    }, [editorInstance]);

    return {
        dragPreview,
        previewRef,
        dndHandlers: {
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
    };
}
