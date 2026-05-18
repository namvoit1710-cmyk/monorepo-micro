import type { OperationRecord } from "../../../../../../packages/autoform/src/components/field-wrapper/odata-wrapper/hooks/use-change-tracker";
import type { IFileRefNode } from "./node-data-utils";

export interface IArtifactSubmitEntry {
    artifact_id: string;
    operations: OperationRecord[];
}

function getRootColumns(root: IFileRefNode): string[] {
    const columns = (root as { columns?: unknown }).columns;

    if (!Array.isArray(columns)) {
        return [];
    }

    return columns.filter((col): col is string => typeof col === "string" && !col.startsWith("__"));
}

function collectArrayArtifactKeys(node: IFileRefNode): Set<string> {
    const keys = new Set<string>();

    if (node.artifact_type === "array_field") {
        keys.add(node.artifact_id);
    }

    if (node.children?.length) {
        for (const child of node.children) {
            for (const key of collectArrayArtifactKeys(child)) {
                keys.add(key);
            }
        }
    }

    return keys;
}

export function buildSubmitOperations(
    values: Record<string, unknown>,
    root: IFileRefNode,
    rootDefaultRow: Record<string, unknown> | null
): IArtifactSubmitEntry[] {
    const result: IArtifactSubmitEntry[] = [];
    const arrayArtifactKeys = collectArrayArtifactKeys(root);
    const rootColumns = getRootColumns(root);

    if (rootColumns.length > 0) {
        const rootData: Record<string, unknown> = {};
        for (const col of rootColumns) {
            rootData[col] = values[col] ?? "";
        }

        const hasExistingData = rootDefaultRow !== null
            && Object.keys(rootDefaultRow).some((k) => !k.startsWith("__"));

        result.push({
            artifact_id: root.artifact_id,
            operations: [
                {
                    operation: hasExistingData ? "edit" : "insert",
                    row_id: hasExistingData
                        ? (rootDefaultRow?.__row_id as string) ?? null
                        : null,
                    data: rootData,
                },
            ],
        });
    }

    for (const artifactKey of arrayArtifactKeys) {
        const operations = values[artifactKey] as OperationRecord[] | undefined;

        if (!operations || !Array.isArray(operations) || operations.length === 0) {
            continue;
        }

        result.push({
            artifact_id: artifactKey,
            operations,
        });
    }

    return result;
}

export function createConfirmRejectPayload(action: "confirm" | "reject") {
    return {
        artifact_id: "__root__",
        operations: [
            {
                operation: "insert",
                row_id: null,
                data: {
                    _action: action
                }
            }
        ]
    };
}