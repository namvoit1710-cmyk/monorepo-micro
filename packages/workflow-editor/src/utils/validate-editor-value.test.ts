import { IEditorValue } from "@common/components/ldc-workflow-editor/components/rete-editor/types";
import { describe, expect, it } from "vitest";
import { validateEditorValue } from "./validate-editor-value";

describe("validateEditorValue", () => {
  describe("Valid inputs (Happy Path)", () => {
    it("returns true for a fully valid IEditorValue", () => {
      const validValue: IEditorValue = {
        nodes: [
          {
            id: "1",
            position: { x: 0, y: 0 },
            data: { id: "1", name: "StartNode", color: "#fff", worker_id: "w1", title: "Start", node_type: "trigger", description: "", status: "idle", version: 1, ports: { inputs: [], outputs: [] } },
          },
          {
            id: "2",
            position: { x: 200, y: 0 },
            data: { id: "2", name: "ActionNode", color: "#fff", worker_id: "w2", title: "Action", node_type: "action", description: "", status: "idle", version: 1, ports: { inputs: [], outputs: [] } },
          },
        ],
        connections: [
          { id: "conn-1", source: "1", target: "2", sourceOutput: "out", targetInput: "in" }
        ]
      };
      expect(validateEditorValue(validValue)).toBe(true);
    });

    it("returns true for an object with empty nodes and connections arrays", () => {
      const emptyValue = { nodes: [], connections: [] };
      expect(validateEditorValue(emptyValue)).toBe(true);
    });
  });

  describe("Invalid core types", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["string", "{\"nodes\":[],\"connections\":[]}"],
      ["number", 123],
      ["boolean", true],
    ])("returns false when value is %s", (_, val) => {
      expect(validateEditorValue(val)).toBe(false);
    });
  });

  describe("Invalid root structures", () => {
    it("returns false when missing nodes array", () => {
      const invalid = { connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false when missing connections array", () => {
      const invalid = { nodes: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false when nodes is not an array", () => {
      const invalid = { nodes: {}, connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false when connections is not an array", () => {
      const invalid = { nodes: [], connections: {} };
      expect(validateEditorValue(invalid)).toBe(false);
    });
  });

  describe("Invalid nodes properties", () => {
    it("returns false if a node is null", () => {
      const invalid = { nodes: [null], connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a node is missing id", () => {
      const invalid = { nodes: [{ data: {} }], connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a node is missing data", () => {
      const invalid = { nodes: [{ id: "1" }], connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a node data is not an object", () => {
      const invalid = { nodes: [{ id: "1", data: "invalid" }], connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a node id is not a string", () => {
      const invalid = { nodes: [{ id: 1, data: {} }], connections: [] };
      expect(validateEditorValue(invalid)).toBe(false);
    });
  });

  describe("Invalid connections properties", () => {
    it("returns false if a connection is null", () => {
      const invalid = { nodes: [], connections: [null] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a connection missing id", () => {
      const invalid = { nodes: [], connections: [{ source: "1", target: "2" }] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a connection missing source", () => {
      const invalid = { nodes: [], connections: [{ id: "conn-1", target: "2" }] };
      expect(validateEditorValue(invalid)).toBe(false);
    });

    it("returns false if a connection missing target", () => {
      const invalid = { nodes: [], connections: [{ id: "conn-1", source: "1" }] };
      expect(validateEditorValue(invalid)).toBe(false);
    });
  });
});
