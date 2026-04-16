import { DEFAULT_SIZE_NODE } from "@common/components/ldc-workflow-editor/constants/node";

import React from "react";
import BaseNodeShell from "../nodes/components/base-node-shell";
import GroupNodes from "../nodes/components/group-nodes";
import { NodeSizeConfig } from "../types";

export enum NODE_FACTORY_REGISTRY_KEY {
    GROUP_NODE = "group_node",
}

const nodeSizeConfig: Record<string, NodeSizeConfig> = {
    "loop_worker": {
        width: DEFAULT_SIZE_NODE.WIDTH * 1.25,
        height: DEFAULT_SIZE_NODE.HEIGHT,
    },
}

export function getNodeSize(name: string): NodeSizeConfig | undefined {
    return nodeSizeConfig[name];
}

const NODE_FACTORY_REGISTRY = new Map<string, React.ComponentType<any>>([
    [NODE_FACTORY_REGISTRY_KEY.GROUP_NODE, GroupNodes],
]);

export function getNodeFactory(workerType: string): React.ComponentType<any> {
    return NODE_FACTORY_REGISTRY.get(workerType) ?? BaseNodeShell;
}

export function registerNodeFactory(workerType: string, factory: React.ComponentType<any>) {
    NODE_FACTORY_REGISTRY.set(workerType, factory);
}

export default NODE_FACTORY_REGISTRY;
