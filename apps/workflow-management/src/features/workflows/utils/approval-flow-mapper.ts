import { IEditorConnectionValue, IEditorNode, IEditorNodeValue, IEditorValue } from "@common/components/ldc-workflow-editor/components/rete-editor/types";
import { createEditorNode, generatePortId, isValidConnection } from "@common/lib/workflow-mappers";
import { IApprovalFlowEdge, IApprovalFlowNode, IApprovalFlowPayload } from "../types/socket-event";

function getRoleIcon(role: string): string {
  const roleIconMap: Record<string, string> = {
    Start: "play",
    End: "square",
    Contributor: "person",
    Approver: "verified_user",
  };
  return roleIconMap[role] || "account_circle";
}

function getRoleColor(role: string): string {
  const roleColorMap: Record<string, string> = {
    Start: "#10b981",
    End: "#3b82f6",
    Contributor: "#f59e0b",
    Approver: "#8b5cf6",
  };
  return roleColorMap[role] || "#6b7280";
}

function mapApprovalFlowNodeToEditorNode(node: IApprovalFlowNode): IEditorNode {
  const inputPortId = generatePortId(node.id, "input");
  const outputPortId = generatePortId(node.id, "output");
  
  const normalizedStatus = node.status.toLowerCase();

  return createEditorNode({
    id: node.id,
    name: node.name || node.role,
    title: node.role,
    node_type: "approval_flow_node",
    color: getRoleColor(node.role),
    icon: getRoleIcon(node.role),
    description: node.name ? `${node.role}: ${node.name}` : node.role,
    status: normalizedStatus,
    version: 1,
    ports: {
      inputs: [
        {
          id: inputPortId,
          label: "in",
          readonly: true,
        },
      ],
      outputs: [
        {
          id: outputPortId,
          label: "out",
          readonly: true,
        },
      ],
    },
    role: node.role,
    approvalStatus: normalizedStatus,
    assignee: node.name,
  });
}

function mapApprovalFlowEdgeToConnection(
  edge: IApprovalFlowEdge,
  index: number,
  nodeIds: Set<string>
): IEditorConnectionValue | null {
  if (!isValidConnection(edge.source, edge.target, nodeIds)) {
    console.warn(
      `[ApprovalFlowMapper] Invalid edge: ${edge.source} -> ${edge.target}. Nodes not found.`
    );
    return null;
  }

  return {
    id: `connection_${edge.source}_${edge.target}_${index}`,
    source: edge.source,
    sourceOutput: generatePortId(edge.source, "output"),
    target: edge.target,
    targetInput: generatePortId(edge.target, "input"),
  };
}

export function mapApprovalFlowToEditorValue(
  payload: IApprovalFlowPayload
): IEditorValue {

  const nodes: IEditorNodeValue[] = payload.nodes.map((node) => ({
    id: node.id,
    position: { x: 0, y: 0 },
    data: mapApprovalFlowNodeToEditorNode(node),
  }));

  const nodeIds = new Set(payload.nodes.map((n) => n.id));

  const connections: IEditorConnectionValue[] = payload.edges
    .map((edge, index) => mapApprovalFlowEdgeToConnection(edge, index, nodeIds))
    .filter((conn): conn is IEditorConnectionValue => conn !== null);

  return { nodes, connections };
}
