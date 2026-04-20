import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, EditorDirection, Schemes } from "../types";
import { LineConnection } from "./line-connection";

interface Props {
    editor: NodeEditor<Schemes>;
    area: AreaPlugin<Schemes, AreaExtra>
    direction: EditorDirection;
    readOnly?: boolean;
}

export const createSelectableConnection = ({ editor, area, direction, readOnly }: Props) => {
    const SelectableConnectionBind = (
        props: { data: Schemes["Connection"] & { isMagnetic?: boolean }; styles?: () => any }
    ) => {
        return (
            <LineConnection
                {...props}
                area={area}
                readOnly={readOnly}
                direction={direction}
                onRemove={(id) => {
                    editor.removeConnection(id);
                }}
            />
        );
    };

    return SelectableConnectionBind;
};