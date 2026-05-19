
export interface IArtifactNode {
    artifact_id: string;
    file_id: string;
    columns: string[];
    parent_row_key_column?: string | null;
    artifact_type?: string;
    content_type?: string;
    children: IArtifactNode[];
}

export interface INodeDataDetails {
    etag: string;
    version: number;
    scalars: Record<string, string>;
    root: IArtifactNode;
    output_port: string | null;
    taken_edge_ports: string | null;
}

export interface IGetNodeDataInfo {
    run_id: string;
    node_id: string;
    task_id: string;
    node_kind: string;
    node_state: string;
    schema_ref: {
        version: string;
        [key: string]: any;
    };
    data: INodeDataDetails;
    output: any | null;
    produced_artifacts: any[];
    etag: string;
}

export interface IGetNodeDataInfoResponse {
    status: boolean;
    data: IGetNodeDataInfo
}