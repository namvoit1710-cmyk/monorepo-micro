import { describe, expect, it } from "vitest";
import { mapEditorConnectionToEdge, mapEditorNodeToSaveNode, mapWorkflowToSavePayload } from "./workflow-save-mapper";

describe("workflow-save-mapper", () => {
  describe("mapEditorNodeToSaveNode", () => {
    it("maps editor node fields and normalizes ports", () => {
      const result = mapEditorNodeToSaveNode({
        id: "node-1",
        position: { x: 100, y: 200 },
        data: {
          id: "node-1",
          name: "Node 1",
          title: "Title 1",
          node_type: "TASK",
          worker_type: "worker-1",
          node_definition_id: "def-1",
          parameters: { retry: 3 },
          ports: {
            inputs: [
              { id: "in-1", label: "Input 1", data_type: "string", required: false, description: "desc", readonly: true },
            ],
            outputs: [
              { id: "out-1", label: "Output 1" },
            ],
          },
          instruction: "Run",
          description: "Node desc",
          icon: "cpu",
          color: "#101010",
          tags: ["tag-1"],
        },
      } as any);

      expect(result).toEqual({
        id: "node-1",
        name: "Title 1",
        node_type: "TASK",
        worker_type: "worker-1",
        node_definition_id: "def-1",
        parameters: { retry: 3 },
        ports: {
          in: [
            {
              id: "in-1",
              label: "Input 1",
              data_type: "string",
              required: false,
              description: "desc",
              readonly: true,
            },
          ],
          out: [
            {
              id: "out-1",
              label: "Output 1",
              data_type: "any",
              required: true,
              description: "",
              readonly: false,
            },
          ],
        },
        x: 100,
        y: 200,
        instruction: "Run",
        description: "Node desc",
        icon: "cpu",
        color: "#101010",
        tags: ["tag-1"],
      });
    });

    it("uses node name when title is missing and keeps null worker type", () => {
      const result = mapEditorNodeToSaveNode({
        id: "node-2",
        position: { x: 0, y: 0 },
        data: {
          id: "node-2",
          name: "Node 2",
          node_type: "INPUT",
          worker_type: null,
          ports: { inputs: [], outputs: [] },
        },
      } as any);

      expect(result.name).toBe("Node 2");
      expect(result.worker_type).toBeNull();
      expect(result.ports).toEqual({ in: [], out: [] });
    });
  });

  describe("mapEditorConnectionToEdge", () => {
    it("maps editor connection into workflow edge", () => {
      expect(
        mapEditorConnectionToEdge({
          id: "conn-1",
          source: "node-1",
          sourceOutput: "out-1",
          target: "node-2",
          targetInput: "in-1",
        })
      ).toEqual({
        id: "conn-1",
        source_node_id: "node-1",
        target_node_id: "node-2",
        source_port_id: "out-1",
        target_port_id: "in-1",
        condition: null,
        label: "",
        description: "",
      });
    });
  });

  describe("mapWorkflowToSavePayload", () => {
    it("maps workflow and editor value into save payload", () => {
      const result = mapWorkflowToSavePayload(
        {
          id: "wf-1",
          name: "Workflow",
          description: "Workflow desc",
          status: "DRAFT",
          nodes: [],
          edges: [],
          purpose: "demo",
          routing_path: "/route",
        },
        {
          nodes: [
            {
              id: "node-1",
              position: { x: 10, y: 20 },
              data: {
                id: "node-1",
                name: "Node 1",
                title: "Node 1",
                node_type: "TASK",
                color: "#000000",
                description: "",
                ports: { inputs: [], outputs: [] },
                status: "active",
              },
            } as any,
          ],
          connections: [
            {
              id: "conn-1",
              source: "node-1",
              sourceOutput: "out-1",
              target: "node-2",
              targetInput: "in-1",
            },
          ],
        }
      );

      expect(result).toEqual({
        id: "wf-1",
        name: "Workflow",
        description: "Workflow desc",
        status: "DRAFT",
        nodes: [
          expect.objectContaining({
            id: "node-1",
            name: "Node 1",
            x: 10,
            y: 20,
          }),
        ],
        edges: [
          {
            id: "conn-1",
            source_node_id: "node-1",
            target_node_id: "node-2",
            source_port_id: "out-1",
            target_port_id: "in-1",
            condition: null,
            label: "",
            description: "",
          },
        ],
        purpose: "demo",
        routing_path: "/route",
      });
    });

    it("returns empty collections when editor value is empty", () => {
      const result = mapWorkflowToSavePayload(
        {
          id: "wf-2",
          name: "Empty Workflow",
          status: "DRAFT",
          nodes: [],
          edges: [],
        },
        {
          nodes: [],
          connections: [],
        }
      );

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });
  });
});