import { Group, Panel } from "react-resizable-panels"
import NodeDetailForm from "./detail-form"
import NodeDetailInput from "./detail-input"
import NodeDetailOutput from "./detail-output"
import IncomerNodes from "./incomer-nodes"
import OutcomerNodes from "./outcomer-nodes"

const NodesPopupContent = () => {

    return (
        <>
            <Group className="[&>div[data-panel]]:h-full! [&>div[data-panel]]:w-full! [&>div[data-panel]]:overflow-hidden!">
                <Panel minSize={300} className="border-r border-gray-200 h-full w-full overflow-hidden!">
                    <NodeDetailInput />
                </Panel>
                <Panel minSize={500} defaultSize={800} className="border-r border-gray-200  h-full w-full overflow-hidden!">
                    <NodeDetailForm />
                </Panel>
                <Panel minSize={300} className="h-full w-full overflow-hidden!">
                    <NodeDetailOutput />
                </Panel>
            </Group>

            <IncomerNodes />
            <OutcomerNodes />
        </>
    )
}

export default NodesPopupContent