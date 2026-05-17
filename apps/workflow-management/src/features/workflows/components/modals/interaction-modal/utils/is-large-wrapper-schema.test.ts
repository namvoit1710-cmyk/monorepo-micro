import { describe, expect, it } from "vitest";
import { isLargeWrapperSchema } from "./is-large-wrapper-schema";

describe("isLargeWrapperSchema", () => {
  it("returns false for empty or invalid input", () => {
    expect(isLargeWrapperSchema([])).toBe(false);
    expect(isLargeWrapperSchema(null as any)).toBe(false);
    expect(isLargeWrapperSchema(undefined as any)).toBe(false);
  });

  it.each([
    { key: "table", outputType: "string", fieldConfig: { fieldWrapper: "TableWrapper" } },
    { key: "odata", outputType: "string", fieldConfig: { fieldWrapper: "OdataWrapper" } },
    { key: "upload", outputType: "string", fieldConfig: { fieldControl: "SingleUploadFieldMappingControl" } },
  ])("returns true for direct large wrapper markers", (field) => {
    expect(isLargeWrapperSchema([field as any])).toBe(true);
  });

  it("returns true when marker exists in nested field list", () => {
    const fields = [
      {
        key: "group",
        outputType: "object",
        fieldConfig: {},
        fields: [
          {
            key: "inner",
            outputType: "string",
            fieldConfig: { fieldControl: "SingleUploadFieldMappingControl" },
          },
        ],
      },
    ];

    expect(isLargeWrapperSchema(fields as any)).toBe(true);
  });

  it("returns false when no marker exists anywhere", () => {
    const fields = [
      {
        key: "simple",
        outputType: "string",
        fieldConfig: { fieldControl: "TextField" },
        fields: [
          {
            key: "nested",
            outputType: "number",
            fieldConfig: { fieldWrapper: "InputWrapper" },
          },
        ],
      },
    ];

    expect(isLargeWrapperSchema(fields as any)).toBe(false);
  });
});