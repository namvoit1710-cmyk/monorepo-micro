import type { IEditorNode, IEditorNodeValue, IEditorValue } from "@ldc/workflow-editor";
import type { INodePallete } from "../types/node-pallete";
import type { IWorkflow, IWorkflowNode } from "../types/workflows";

export const mapNodeToEditorNode = (node: INodePallete): IEditorNode => {
  const isBusinessNode = !!node.node_definition_id;

  return {
    ...node,
    title: node.name,
    status: 'idle',
    worker_type: isBusinessNode ? node.node_definition_id : node.id,
    node_definition_id: node.node_definition_id ?? null,
    ports: {
      inputs: (node.ports.in).map(p => ({
        ...p,
        id: p.id,
        label: p.label,
        required: p.required,
        readonly: true
      })),
      outputs: (node.ports.out).map(p => ({
        ...p,
        id: p.id,
        label: p.label,
        required: p.required,
        readonly: true
      }))
    }
  };
};

export const mapApiNodeToINode = (apiNode: IWorkflowNode): IEditorNode => ({
  ...apiNode,
  title: apiNode.name,
  status: 'idle',
  node_type: apiNode.node_type ?? apiNode.type ?? "",
  color: apiNode.color ?? '#000000',
  description: apiNode.description ?? '',
  worker_type: apiNode.worker_type,
  ports: {
    inputs: (apiNode.ports?.in ?? []).map(port => ({
      ...port,
      id: port.id,
      label: port.label,
      required: port.required,
      readonly: port.readonly ?? false
    })),
    outputs: (apiNode.ports?.out ?? []).map(port => ({
      ...port,
      id: port.id,
      label: port.label,
      required: port.required,
      readonly: port.readonly ?? false
    }))
  }
});


export function mapApiToWorkflowValue(apiWorkflow: IWorkflow): IEditorValue {
  const nodes: IEditorNodeValue[] = apiWorkflow.nodes.map((apiNode) => ({
    id: apiNode.id,
    position: { x: apiNode.x ?? 0, y: apiNode.y ?? 0 },
    data: mapApiNodeToINode(apiNode),
  }));

  const connections = apiWorkflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source_node_id ?? "",
    sourceOutput: edge.source_port_id ?? "",
    target: edge.target_node_id ?? "",
    targetInput: edge.target_port_id ?? "",
  }));

  return { nodes, connections };
}
