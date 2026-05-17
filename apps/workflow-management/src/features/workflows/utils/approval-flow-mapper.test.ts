import { describe, expect, it } from "vitest";
import { IApprovalFlowPayload } from "../types/socket-event";
import { mapApprovalFlowToEditorValue } from "./approval-flow-mapper";

describe("approval-flow-mapper", () => {
  describe("mapApprovalFlowToEditorValue", () => {
    describe("Happy Path - Valid payloads", () => {
      it("correctly maps a simple linear approval flow", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-1",
          run_id: "run-1",
          root_run_id: "run-1",
          depth: 0,
          node_id: "node-1",
          change_request_id: "cr-1",
          output_port: "default",
          error: "",
          nodes: [
            { id: "start", role: "Start", name: null, status: "None" },
            { id: "1", role: "Approver", name: "john.doe@example.com", status: "Completed" },
            { id: "2", role: "Approver", name: "jane.smith@example.com", status: "Awaiting" },
            { id: "end", role: "End", name: null, status: "None" },
          ],
          edges: [
            { source: "start", target: "1" },
            { source: "1", target: "2" },
            { source: "2", target: "end" },
          ],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        // Verify correct number of nodes and connections
        expect(result.nodes).toHaveLength(4);
        expect(result.connections).toHaveLength(3);

        // Verify node_type is set correctly
        result.nodes.forEach((node) => {
          expect(node.data.node_type).toBe("approval_flow_node");
        });

        // Verify role, approvalStatus, and assignee are mapped
        const approverNode1 = result.nodes.find((n) => n.id === "1");
        expect(approverNode1?.data.role).toBe("Approver");
        expect(approverNode1?.data.approvalStatus).toBe("completed"); // lowercase
        expect(approverNode1?.data.assignee).toBe("john.doe@example.com");

        // Verify status normalization
        const approverNode2 = result.nodes.find((n) => n.id === "2");
        expect(approverNode2?.data.approvalStatus).toBe("awaiting"); // normalized to lowercase
        expect(approverNode2?.data.status).toBe("awaiting");
      });

      it("correctly handles all status types", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-2",
          run_id: "run-2",
          root_run_id: "run-2",
          depth: 0,
          node_id: "node-2",
          change_request_id: "cr-2",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Contributor", name: "user1", status: "REWORK" },
            { id: "2", role: "Contributor", name: "user2", status: "Rejected" },
            { id: "3", role: "Contributor", name: "user3", status: "Completed" },
            { id: "4", role: "Approver", name: "user4", status: "Awaiting" },
            { id: "5", role: "Approver", name: "user5", status: "Processing" },
            { id: "6", role: "Start", name: null, status: "None" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        // Verify all statuses are normalized to lowercase
        const statuses = result.nodes.map((n) => n.data.approvalStatus);
        expect(statuses).toEqual(["rework", "rejected", "completed", "awaiting", "processing", "none"]);
      });

      it("generates default port IDs from node IDs", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-3",
          run_id: "run-3",
          root_run_id: "run-3",
          depth: 0,
          node_id: "node-3",
          change_request_id: "cr-3",
          output_port: "default",
          error: "",
          nodes: [
            { id: "node-123", role: "Approver", name: "test", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        const node = result.nodes[0];
        expect(node.data.ports.inputs[0].id).toBe("node-123_input");
        expect(node.data.ports.outputs[0].id).toBe("node-123_output");
      });

      it("correctly maps connections with generated port IDs", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-4",
          run_id: "run-4",
          root_run_id: "run-4",
          depth: 0,
          node_id: "node-4",
          change_request_id: "cr-4",
          output_port: "default",
          error: "",
          nodes: [
            { id: "A", role: "Start", name: null, status: "None" },
            { id: "B", role: "Approver", name: "test", status: "Awaiting" },
          ],
          edges: [{ source: "A", target: "B" }],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        const connection = result.connections[0];
        expect(connection.source).toBe("A");
        expect(connection.target).toBe("B");
        expect(connection.sourceOutput).toBe("A_output");
        expect(connection.targetInput).toBe("B_input");
      });

      it("handles nodes with null assignee names", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-5",
          run_id: "run-5",
          root_run_id: "run-5",
          depth: 0,
          node_id: "node-5",
          change_request_id: "cr-5",
          output_port: "default",
          error: "",
          nodes: [
            { id: "start", role: "Start", name: null, status: "None" },
            { id: "end", role: "End", name: null, status: "None" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        result.nodes.forEach((node) => {
          expect(node.data.assignee).toBeNull();
        });
      });
    });

    describe("Edge Cases", () => {
      it("validates and filters out invalid edges referencing non-existent nodes", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-6",
          run_id: "run-6",
          root_run_id: "run-6",
          depth: 0,
          node_id: "node-6",
          change_request_id: "cr-6",
          output_port: "default",
          error: "",
          nodes: [
            { id: "A", role: "Start", name: null, status: "None" },
            { id: "B", role: "End", name: null, status: "None" },
          ],
          edges: [
            { source: "A", target: "B" }, // Valid
            { source: "A", target: "C" }, // Invalid - C doesn't exist
            { source: "X", target: "B" }, // Invalid - X doesn't exist
          ],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        // Only the valid edge should be included
        expect(result.connections).toHaveLength(1);
        expect(result.connections[0].source).toBe("A");
        expect(result.connections[0].target).toBe("B");
      });

      it("handles empty nodes and edges arrays", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-7",
          run_id: "run-7",
          root_run_id: "run-7",
          depth: 0,
          node_id: "node-7",
          change_request_id: "cr-7",
          output_port: "default",
          error: "",
          nodes: [],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        expect(result.nodes).toHaveLength(0);
        expect(result.connections).toHaveLength(0);
      });

      it("handles complex branching flow with multiple parallel approvers", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-8",
          run_id: "run-8",
          root_run_id: "run-8",
          depth: 0,
          node_id: "node-8",
          change_request_id: "cr-8",
          output_port: "default",
          error: "",
          nodes: [
            { id: "start", role: "Start", name: null, status: "None" },
            { id: "1", role: "Contributor", name: "contrib1", status: "Completed" },
            { id: "2", role: "Approver", name: "approver1", status: "Awaiting" },
            { id: "3", role: "Approver", name: "approver2", status: "Awaiting" },
            { id: "4", role: "Approver", name: "approver3", status: "Processing" },
            { id: "end", role: "End", name: null, status: "None" },
          ],
          edges: [
            { source: "start", target: "1" },
            { source: "1", target: "2" },
            { source: "1", target: "3" },
            { source: "1", target: "4" },
            { source: "2", target: "end" },
            { source: "3", target: "end" },
            { source: "4", target: "end" },
          ],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        expect(result.nodes).toHaveLength(6);
        expect(result.connections).toHaveLength(7);

        // Verify all connections are valid
        result.connections.forEach((conn) => {
          const sourceExists = result.nodes.some((n) => n.id === conn.source);
          const targetExists = result.nodes.some((n) => n.id === conn.target);
          expect(sourceExists).toBe(true);
          expect(targetExists).toBe(true);
        });
      });

      it("sets position property for all nodes", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-9",
          run_id: "run-9",
          root_run_id: "run-9",
          depth: 0,
          node_id: "node-9",
          change_request_id: "cr-9",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Start", name: null, status: "None" },
            { id: "2", role: "Approver", name: "test", status: "Awaiting" },
            { id: "3", role: "End", name: null, status: "None" },
          ],
          edges: [
            { source: "1", target: "2" },
            { source: "2", target: "3" },
          ],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        // Verify positions are set (currently all at origin)
        result.nodes.forEach((node) => {
          expect(node.position).toBeDefined();
          expect(typeof node.position.x).toBe("number");
          expect(typeof node.position.y).toBe("number");
        });
      });
    });

    describe("Role and Icon Mapping", () => {
      it("maps role-specific icons correctly", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-10",
          run_id: "run-10",
          root_run_id: "run-10",
          depth: 0,
          node_id: "node-10",
          change_request_id: "cr-10",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Start", name: null, status: "None" },
            { id: "2", role: "End", name: null, status: "None" },
            { id: "3", role: "Contributor", name: "user1", status: "Completed" },
            { id: "4", role: "Approver", name: "user2", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        const iconMap: Record<string, string> = {
          Start: "play",
          End: "square",
          Contributor: "person",
          Approver: "verified_user",
        };

        result.nodes.forEach((node) => {
          const role = node.data.role as string;
          expect(node.data.icon).toBe(iconMap[role]);
        });
      });

      it("maps role-specific colors correctly", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-11",
          run_id: "run-11",
          root_run_id: "run-11",
          depth: 0,
          node_id: "node-11",
          change_request_id: "cr-11",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Start", name: null, status: "None" },
            { id: "2", role: "End", name: null, status: "None" },
            { id: "3", role: "Contributor", name: "user1", status: "Completed" },
            { id: "4", role: "Approver", name: "user2", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        const colorMap: Record<string, string> = {
          Start: "#10b981",
          End: "#3b82f6",
          Contributor: "#f59e0b",
          Approver: "#8b5cf6",
        };

        result.nodes.forEach((node) => {
          const role = node.data.role as string;
          expect(node.data.color).toBe(colorMap[role]);
        });
      });

      it("uses default icon and color for unknown roles", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-12",
          run_id: "run-12",
          root_run_id: "run-12",
          depth: 0,
          node_id: "node-12",
          change_request_id: "cr-12",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "UnknownRole", name: "test", status: "None" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        expect(result.nodes[0].data.icon).toBe("account_circle"); // default icon
        expect(result.nodes[0].data.color).toBe("#6b7280"); // default color
      });
    });

    describe("Metadata and Field Completeness", () => {
      it("sets all required metadata fields correctly", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-13",
          run_id: "run-13",
          root_run_id: "run-13",
          depth: 0,
          node_id: "node-13",
          change_request_id: "cr-13",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Approver", name: "john@example.com", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);
        const node = result.nodes[0];

        expect(node.data.version).toBe(1);
        expect(node.data.title).toBe("Approver");
        expect(node.data.description).toBe("Approver: john@example.com");
        expect(node.data.name).toBe("john@example.com");
        expect(node.data.node_type).toBe("approval_flow_node");
      });

      it("sets correct description for nodes without assignee names", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-14",
          run_id: "run-14",
          root_run_id: "run-14",
          depth: 0,
          node_id: "node-14",
          change_request_id: "cr-14",
          output_port: "default",
          error: "",
          nodes: [
            { id: "start", role: "Start", name: null, status: "None" },
            { id: "end", role: "End", name: null, status: "None" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        result.nodes.forEach((node) => {
          // When name is null, description should just be the role
          expect(node.data.description).toBe(node.data.role);
        });
      });

      it("sets correct port labels and readonly flags", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-15",
          run_id: "run-15",
          root_run_id: "run-15",
          depth: 0,
          node_id: "node-15",
          change_request_id: "cr-15",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Approver", name: "test", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);
        const node = result.nodes[0];

        expect(node.data.ports.inputs[0].label).toBe("in");
        expect(node.data.ports.inputs[0].readonly).toBe(true);
        expect(node.data.ports.outputs[0].label).toBe("out");
        expect(node.data.ports.outputs[0].readonly).toBe(true);
      });

      it("generates port IDs with correct format", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-16",
          run_id: "run-16",
          root_run_id: "run-16",
          depth: 0,
          node_id: "node-16",
          change_request_id: "cr-16",
          output_port: "default",
          error: "",
          nodes: [
            { id: "test-node-123", role: "Approver", name: "test", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);
        const node = result.nodes[0];

        expect(node.data.ports.inputs[0].id).toMatch(/^test-node-123_input$/);
        expect(node.data.ports.outputs[0].id).toMatch(/^test-node-123_output$/);
      });

      it("sets name field to assignee for nodes with assignee", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-17",
          run_id: "run-17",
          root_run_id: "run-17",
          depth: 0,
          node_id: "node-17",
          change_request_id: "cr-17",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Approver", name: "jane.doe@example.com", status: "Awaiting" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);
        const node = result.nodes[0];

        expect(node.data.name).toBe("jane.doe@example.com");
      });

      it("sets name field to role for nodes without assignee", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-18",
          run_id: "run-18",
          root_run_id: "run-18",
          depth: 0,
          node_id: "node-18",
          change_request_id: "cr-18",
          output_port: "default",
          error: "",
          nodes: [
            { id: "start", role: "Start", name: null, status: "None" },
          ],
          edges: [],
        };

        const result = mapApprovalFlowToEditorValue(payload);
        const node = result.nodes[0];

        expect(node.data.name).toBe("Start");
      });
    });

    describe("Position Handling", () => {
      it("sets all node positions to origin (0, 0)", () => {
        const payload: IApprovalFlowPayload = {
          workflow_id: "wf-19",
          run_id: "run-19",
          root_run_id: "run-19",
          depth: 0,
          node_id: "node-19",
          change_request_id: "cr-19",
          output_port: "default",
          error: "",
          nodes: [
            { id: "1", role: "Start", name: null, status: "None" },
            { id: "2", role: "Approver", name: "test", status: "Awaiting" },
            { id: "3", role: "End", name: null, status: "None" },
          ],
          edges: [
            { source: "1", target: "2" },
            { source: "2", target: "3" },
          ],
        };

        const result = mapApprovalFlowToEditorValue(payload);

        // Currently all positions are set to (0, 0) as calculateNodePositions is commented out
        result.nodes.forEach((node) => {
          expect(node.position).toEqual({ x: 0, y: 0 });
        });
      });
    });
  });
});
