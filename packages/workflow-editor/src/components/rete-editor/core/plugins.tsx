import { easeInOut } from "popmotion";
import { createRoot } from "react-dom/client";
import { NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
    ArrangeAppliers,
    Presets as ArrangePresets,
    AutoArrangePlugin,
} from "rete-auto-arrange-plugin";
import {
    ConnectionPlugin,
    Presets as ConnectionPresets
} from "rete-connection-plugin";
import { HistoryExtensions, HistoryPlugin, Presets as HistoryPresets } from "rete-history-plugin";
import { Presets, ReactPlugin } from "rete-react-plugin";
import { getNodeFactory } from "../config/node-config";
import { MagneticConnection } from "../connections/magnetic-connection";
import { createSelectableConnection } from "../connections/selectable-connection";
import { SetupMagneticConnection } from "../connections/setup-magnetic-connection";
import type { AreaExtra, EditorConfig, Schemes } from "../types";
import { applyContainerStyles } from "./styles";

export interface PluginBundle {
    editor: NodeEditor<Schemes>;
    area: AreaPlugin<Schemes, AreaExtra>;
    connection: ConnectionPlugin<Schemes, AreaExtra>;
    render: ReactPlugin<Schemes, AreaExtra>;
    arrange: AutoArrangePlugin<Schemes, AreaExtra>;
    applier: ArrangeAppliers.TransitionApplier<Schemes, never>;
    history: HistoryPlugin<Schemes>;
}

export const setupPlugins = async (
    container: HTMLElement,
    config: EditorConfig
): Promise<PluginBundle> => {
    const {
        direction = "horizontal",
        layout = { duration: 500, animated: true },
        readOnly = false,
        additionalConfig: { openNodeContext, onOpenNodePopup } = {},
    } = config;

    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
    const arrange = new AutoArrangePlugin<Schemes, AreaExtra>();
    const history = new HistoryPlugin<Schemes>();

    HistoryExtensions.keyboard(history);
    history.addPreset(HistoryPresets.classic.setup());

    applyContainerStyles(container);

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl(),
    });

    const SelectableConnectionBind = createSelectableConnection({ editor, area, direction, readOnly });

    render.addPreset(
        Presets.classic.setup({
            customize: {
                node(context) {
                    const NodeComp = getNodeFactory(context.payload.label);

                    return (props: any) => (
                        <NodeComp
                            {...props}
                            readOnly={readOnly}
                            direction={direction}
                            onContextMenu={(ref: any, nodeId: string) => {
                                openNodeContext?.(ref, nodeId);
                            }}
                            onDoubleClick={(nodeId: string) => {
                                onOpenNodePopup?.(editor.getNode(nodeId));
                            }}
                        />
                    );
                },
                connection(data) {
                    if (data.payload.isMagnetic) return MagneticConnection;
                    return SelectableConnectionBind;
                },
            },
        })
    );

    connection.addPreset(ConnectionPresets.classic.setup());

    const applier = new ArrangeAppliers.TransitionApplier<Schemes, never>({
        duration: layout.animated ? layout.duration : 0,
        timingFunction: easeInOut,
    });

    arrange.addPreset(ArrangePresets.classic.setup());

    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(arrange);
    area.use(history);

    await arrange.layout({
        applier,
        options: {
            "elk.direction": direction === "vertical" ? "DOWN" : "RIGHT",
        }
    });

    AreaExtensions.simpleNodesOrder(area);

    SetupMagneticConnection(connection, editor);

    AreaExtensions.zoomAt(area, editor.getNodes());

    return { editor, area, connection, render, arrange, applier, history };
};