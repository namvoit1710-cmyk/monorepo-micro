import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import { AreaExtensions } from "rete-area-plugin";
import type { AutoArrangePlugin } from "rete-auto-arrange-plugin";
import type { AreaExtra, Schemes } from "../types";

interface LayoutOptions {
    direction: "vertical" | "horizontal";
}

export function createLayoutOperations(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, any>,
    arrange: AutoArrangePlugin<Schemes, AreaExtra> | null,
    syncNodeSizesFromDOM: () => void
) {
    const layoutNodes = async (options: LayoutOptions) => {
        if (!arrange) return;

        const { direction } = options;
        const isVertical = direction === "vertical";

        syncNodeSizesFromDOM();

        await arrange.layout({
            applier: undefined,
            options: {
                "elk.algorithm": "layered",
                "elk.direction": isVertical ? "DOWN" : "RIGHT",
                "elk.spacing.nodeNode": "40",
                "elk.layered.spacing.nodeNodeBetweenLayers": "80",
                "elk.padding": "[top=40, left=40, bottom=40, right=40]",
            },
        });

        const nodes = editor.getNodes();
        const connections = editor.getConnections();
        const positions = new Map<string, { x: number; y: number; w: number; h: number }>();

        for (const node of nodes) {
            const view = area.nodeViews.get(node.id);
            if (!view) continue;
            positions.set(node.id, {
                x: view.position.x,
                y: view.position.y,
                w: node.width ?? 200,
                h: node.height ?? 100,
            });
        }

        const getCross = (pos: { x: number; y: number }) => (isVertical ? pos.x : pos.y);
        const getCrossSize = (pos: { w: number; h: number }) => (isVertical ? pos.w : pos.h);

        const nodeDepthMap = new Map<string, number>();
        const incomingMap = new Map<string, string[]>();

        for (const node of nodes) {
            incomingMap.set(node.id, []);
        }
        for (const conn of connections) {
            incomingMap.get(conn.target)?.push(conn.source);
        }

        const queue: string[] = [];
        for (const node of nodes) {
            if (incomingMap.get(node.id)?.length === 0) {
                nodeDepthMap.set(node.id, 0);
                queue.push(node.id);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift()!;
            const currentDepth = nodeDepthMap.get(current)!;
            const outgoing = connections.filter((c) => c.source === current);

            for (const conn of outgoing) {
                const existing = nodeDepthMap.get(conn.target);
                const newDepth = currentDepth + 1;

                if (existing === undefined || newDepth > existing) {
                    nodeDepthMap.set(conn.target, newDepth);
                    queue.push(conn.target);
                }
            }
        }

        const layerByDepth = new Map<number, string[]>();
        for (const [nodeId, depth] of nodeDepthMap) {
            if (!layerByDepth.has(depth)) layerByDepth.set(depth, []);
            layerByDepth.get(depth)!.push(nodeId);
        }

        const sortedLayers = [...layerByDepth.entries()].sort((a, b) => a[0] - b[0]);

        for (const [, nodeIds] of sortedLayers) {
            if (nodeIds.length <= 1) continue;

            const nodeSocketOrder = new Map<string, number>();

            for (const nodeId of nodeIds) {
                const incomingConns = connections.filter((c) => c.target === nodeId);

                for (const conn of incomingConns) {
                    const sourceNode = editor.getNode(conn.source);
                    const sourcePos = positions.get(conn.source);
                    if (!sourceNode || !sourcePos) continue;

                    const outputKeys = Object.keys(sourceNode.outputs);
                    const socketIndex = outputKeys.indexOf(conn.sourceOutput);
                    if (socketIndex < 0) continue;

                    const totalSockets = outputKeys.length;
                    const sourceCrossSize = getCrossSize(sourcePos);
                    const socketRelative = ((socketIndex + 1) / (totalSockets + 1)) * sourceCrossSize;
                    const socketAbs = getCross(sourcePos) + socketRelative;

                    nodeSocketOrder.set(nodeId, socketAbs);
                }
            }

            nodeIds.sort((a, b) => (nodeSocketOrder.get(a) ?? 0) - (nodeSocketOrder.get(b) ?? 0));
        }

        let minCross = Infinity;
        let maxCross = -Infinity;
        for (const [, pos] of positions) {
            minCross = Math.min(minCross, getCross(pos));
            maxCross = Math.max(maxCross, getCross(pos) + getCrossSize(pos));
        }
        const layoutCenter = (minCross + maxCross) / 2;

        const layerPositions = new Map<number, number>();
        let layerCursor = 0;

        for (const [depth, nodeIds] of sortedLayers) {
            layerPositions.set(depth, layerCursor);

            const maxLayerSize = Math.max(
                ...nodeIds.map((id) => {
                    const pos = positions.get(id)!;
                    return isVertical ? pos.h : pos.w;
                })
            );

            layerCursor += maxLayerSize + 80;
        }

        for (const [depth, nodeIds] of sortedLayers) {
            const layerNodes = nodeIds.map((id) => ({
                id,
                pos: positions.get(id)!,
                crossSize: getCrossSize(positions.get(id)!),
            }));

            const totalCrossSize =
                layerNodes.reduce((sum, n) => sum + n.crossSize, 0) + (layerNodes.length - 1) * 40;

            let crossCursor = layoutCenter - totalCrossSize / 2;
            const layerAxisPos = layerPositions.get(depth)!;

            for (const n of layerNodes) {
                const finalPos = isVertical
                    ? { x: crossCursor, y: layerAxisPos }
                    : { x: layerAxisPos, y: crossCursor };

                await area.translate(n.id, finalPos);
                crossCursor += n.crossSize + 40;
            }
        }

        AreaExtensions.zoomAt(area, editor.getNodes());
    };

    return { layoutNodes };
}