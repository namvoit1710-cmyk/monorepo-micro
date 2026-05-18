import type { IArtifactNode } from "../types/node-data";

export type IFileRefNode = Pick<
    IArtifactNode,
    "artifact_id" | "file_id" | "artifact_type" | "content_type" | "parent_row_key_column"
> & {
    children?: IFileRefNode[];
};
 
export interface IArtifactFileEntry {
    artifact_id: string;
    file_id: string;
}

export function extractArrayArtifacts(node: IFileRefNode): IArtifactFileEntry[] {
    const result: IArtifactFileEntry[] = [];
 
    if (node.artifact_type === "array_field") {
        result.push({
            artifact_id: node.artifact_id,
            file_id: node.file_id,
        });
    }
 
    if (node.children?.length) {
        for (const child of node.children) {
            result.push(...extractArrayArtifacts(child));
        }
    }
 
    return result;
}

export function buildArtifactDefaultValues(
    root: IFileRefNode
): Record<string, string> {
    const artifacts = extractArrayArtifacts(root);
    const defaults: Record<string, string> = {};
 
    for (const { artifact_id, file_id } of artifacts) {
        defaults[`__${artifact_id}_file_id`] = file_id;
    }
 
    return defaults;
}