import { describe, expect, it } from "vitest";

import { mapApiNodeToINode, mapApiToWorkflowValue, mapNodeToEditorNode } from "./node-mapper-utils";

describe("node-mapper-utils", () => {
  describe("mapNodeToEditorNode", () => {
    it("maps palette node into editor node with business node worker type", () => {
      const result = mapNodeToEditorNode({
        id: "node-1",
        name: "Approval",
        node_type: "TASK",
        category: "workflow",
        description: "Approve request",
        worker_id: null,
        node_definition_id: "def-1",
        capabilities: [],
        input_schema: [],
        output_schema: [],
        node_class: "task",
        icon: "check",
        color: "#111111",
        tags: ["approval"],
        ports: {
          in: [
            {
              id: "input-1",
              label: "Input",
              required: true,
              description: "Input port",
            },
          ],
          out: [
            {
              id: "output-1",
              label: "Output",
              required: false,
              description: "Output port",
            },
          ],
        },
      });

      expect(result.id).toBe("node-1");
      expect(result.name).toBe("Approval");
      expect(result.title).toBe("Approval");
      expect(result.worker_type).toBe("def-1");
      expect(result.node_definition_id).toBe("def-1");
      expect(result.color).toBe("#111111");
      expect(result.status).toBe("active");
      expect(result.ports.inputs).toEqual([
        {
          id: "input-1",
          label: "Input",
          description: "Input port",
          required: true,
          readonly: true,
        },
      ]);
      expect(result.ports.outputs).toEqual([
        {
          id: "output-1",
          label: "Output",
          description: "Output port",
          required: false,
          readonly: true,
        },
      ]);
    });

    it("uses node id as worker type for non business node and falls back to default values", () => {
      const result = mapNodeToEditorNode({
        id: "node-2",
        name: "Manual",
        node_type: "INPUT",
        category: "workflow",
        description: "",
        worker_id: null,
        capabilities: [],
        input_schema: [],
        output_schema: [],
        node_class: "input",
        icon: "input",
        color: "",
        tags: [],
        ports: {
          in: [],
          out: [],
        },
      });

      expect(result.worker_type).toBe("node-2");
      expect(result.node_definition_id).toBeNull();
      expect(result.title).toBe("Manual");
      expect(result.color).toBe("#3b82f6");
    });
  });

  describe("mapApiNodeToINode", () => {
    it("maps api node and keeps explicit node type", () => {
      const result = mapApiNodeToINode({
        id: "api-node-1",
        name: "API Node",
        type: "TASK",
        description: "From API",
        instruction: "Run it",
        icon: "cpu",
        color: "#222222",
        tags: ["api"],
        worker_type: "worker-1",
        node_definition_id: "def-2",
        parameters: { retry: 1 },
        ports: {
          in: [
            {
              id: "in-1",
              label: "Input",
              data_type: "string",
              required: true,
              description: "Input port",
              readonly: false,
            },
          ],
          out: [
            {
              id: "out-1",
              label: "Output",
              data_type: "string",
              required: false,
              description: "Output port",
              readonly: true,
            },
          ],
        },
        x: 12,
        y: 24,
      });

      expect(result.node_type).toBe("TASK");
      expect(result.worker_type).toBe("worker-1");
      expect(result.description).toBe("From API");
      expect(result.parameters).toEqual({ retry: 1 });
      expect(result.ports.inputs[0]).toEqual({
        id: "in-1",
        label: "Input",
        data_type: "string",
        description: "Input port",
        required: true,
        readonly: false,
      });
      expect(result.ports.outputs[0]).toEqual({
        id: "out-1",
        label: "Output",
        data_type: "string",
        description: "Output port",
        required: false,
        readonly: true,
      });
    });

    it("falls back to type when node_type is missing and handles empty ports", () => {
      const result = mapApiNodeToINode({
        id: "api-node-2",
        name: "Fallback Node",
        type: "MERGE",
        worker_type: null,
        ports: {
          in: [],
          out: [],
        },
      });

      expect(result.node_type).toBe("MERGE");
      expect(result.worker_type).toBeNull();
      expect(result.ports.inputs).toEqual([]);
      expect(result.ports.outputs).toEqual([]);
    });
  });

  describe("mapApiToWorkflowValue", () => {
    it("maps api workflow into editor value", () => {
      const result = mapApiToWorkflowValue({
        id: "wf-1",
        name: "Workflow",
        status: "DRAFT",
        nodes: [
          {
            id: "node-1",
            name: "Node 1",
            type: "TASK",
            ports: { in: [], out: [] },
            x: 10,
            y: 20,
          },
        ],
        edges: [
          {
            id: "edge-1",
            source_node_id: "node-1",
            target_node_id: "node-2",
            source_port_id: "out-1",
            target_port_id: "in-1",
          },
        ],
      });

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toEqual({
        id: "node-1",
        position: { x: 10, y: 20 },
        data: expect.objectContaining({
          id: "node-1",
          name: "Node 1",
          node_type: "TASK",
        }),
      });
      expect(result.connections).toEqual([
        {
          id: "edge-1",
          source: "node-1",
          sourceOutput: "out-1",
          target: "node-2",
          targetInput: "in-1",
        },
      ]);
    });

    it("defaults node position to origin when coordinates missing", () => {
      const result = mapApiToWorkflowValue({
        id: "wf-2",
        name: "Workflow 2",
        status: "DRAFT",
        nodes: [
          {
            id: "node-2",
            name: "Node 2",
            ports: { in: [], out: [] },
          },
        ],
        edges: [],
      });

      expect(result.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(result.connections).toEqual([]);
    });
  });
});