import type { IWorkflowSessionData } from "./workflow-session";

export interface IWorkflowNodeMetadata {
    groups?: string[];
    tags?: string[];
    categories?: string[];
}

export interface IWorkflowNodeParamBinding {
    key: string;
    type: string;
    value: any;
}

export type WorkflowStatus = "DRAFT" | "VALID" | "DEPLOYED" | "ARCHIVED";
export type PortDataType = "any" | "string" | "number" | "boolean" | "object" | "array";
export type NodeType =
    | "TASK"
    | "PARALLEL"
    | "CONDITION"
    | "LOOP"
    | "SWITCH"
    | "MERGE"
    | "TRIGGER"
    | "WORKFLOW"
    | "COMPUTE"
    | "GROUP"
    | "INPUT"
    | "HUMAN_ACTION";

export interface IWorkflowNodePorts {
    in?: IWorkflowNodePort[];
    out?: IWorkflowNodePort[];
}

export interface IWorkflowNodePort {
    id: string;
    label: string;
    data_type: PortDataType;
    required: boolean;
    description: string;
    readonly?: boolean;
}

export interface IWorkflowSchemaField {
    key: string;
    outputType?: string;
    fieldConfig?: Record<string, any>;
    rules?: Record<string, any>;
    [key: string]: any;
}

export interface IWorkflowNodeDefinitionSchemaField {
    key: string;
    type?: string;
    label?: string;
    required?: boolean;
    [key: string]: any;
}

export interface IWorkflowNodeDefinition {
    id: string;
    tenant_id?: string;
    name: string;
    description?: string;
    base_type: string;
    base_worker_id: string;
    locked_defaults?: Record<string, any>;
    input_schema?: IWorkflowNodeDefinitionSchemaField[];
    output_schema?: IWorkflowNodeDefinitionSchemaField[];
    input_mapping?: Record<string, any>;
    output_mapping?: Record<string, any>;
    icon?: string;
    color?: string;
    tags?: string[];
    data_mode?: string;
    edit_mode?: string;
}

export interface IWorkflowNode {
    id: string;
    name: string;
    type?: NodeType;
    node_type?: NodeType;
    node_class?: string;
    description?: string;
    instruction?: string;
    icon?: string;
    color?: string;
    tags?: string[];
    worker_type?: string | null;
    node_definition_id?: string | null;
    parameters?: Record<string, any>;
    ports?: IWorkflowNodePorts;
    x?: number | null;
    y?: number | null;
}

export interface IWorkflowEdge {
    id: string;
    source_node_id?: string;
    target_node_id?: string;
    condition?: string | null;
    source_port_id?: string;
    target_port_id?: string;
    label?: string;
    description?: string;
}

export interface IWorkflow {
    id: string;
    name: string;
    main_flow?: boolean;
    version?: string;
    description?: string;
    status: WorkflowStatus;
    input_schema?: IWorkflowSchemaField[];
    output_schema?: IWorkflowSchemaField[];
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
    purpose?: string;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
    schema_version?: string;
    workflowSession?: IWorkflowSessionData;
    test_run_id?: string;
    routing_path?: string;
}

// Detail workflow
export interface IWorkflowDetailResponse {
    ok: boolean;
    data: IWorkflow;
}

// List workflow
export interface IWorkflowParams {
    $skip?: number;
    $top?: number;
    $filter?: string;
    $orderby?: string;
    $count?: boolean;
    offset?: number;
    limit?: number;
}
export interface IWorkflowListResponse {
    status: string;
    data: {
        items: IWorkflow[];
        total: number;
        $skip: number;
        $top: number;
    };
}

// Create workflow

export interface ICreateWorkflowPayload {
    name: string;
    description: string;
    input_schema?: IWorkflowSchemaField[];
    output_schema?: IWorkflowSchemaField[];
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
    metadata?: Record<string, any>;
    schema_version?: string;
}

export interface ICreateWorkflowResponse {
    ok: boolean;
    data: IWorkflow;
}

// Create workflow with AI prompt
export interface ICreateWorkflowWithAIPayload {
    message: string;
    conv_id?: string;
    user_id?: string;
    tenant_id?: string;
    source?: string;
}

export interface IWorkflowSchema {
    name: string;
    description: string;
    input_schema: IWorkflowSchemaField[];
    output_schema: IWorkflowSchemaField[];
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
    metadata: Record<string, any>;
    schema_version: string;
}

export interface IAgentData {
    content: string;
    status: string;
    missing_inputs: string[];
    workflow_schema: IWorkflowSchema;
    validation_errors: string[];
    workflow_id: string;
    conv_id?: string;
}

export interface ICreateWorkflowWithAIResponse {
    message: string;
    status: string;
    session_id: string;
    data: Record<string, any>;
    agent_data: IAgentData;
    error: string | null;
    error_code: string | null;
    correlation_id: string | null;
    duration_ms: number;
    interrupted: boolean;
    interrupt_payload: any | null;
}

// Save workflow
export interface IWorkflowSaveNode {
    id: string;
    name: string;
    node_type?: NodeType;
    node_class?: string;
    worker_type?: string | null;
    node_definition_id?: string | null;

    parameters?: Record<string, any>;

    ports?: IWorkflowNodePorts;
    x?: number | null;
    y?: number | null;

    description?: string;
    instruction?: string;
    icon?: string;
    color?: string;
    tags?: string[];
}

export interface IWorkflowSavePayload {
    id: string;
    name: string;
    description?: string;
    status: WorkflowStatus;
    purpose?: string;
    input_schema?: IWorkflowSchemaField[];
    output_schema?: IWorkflowSchemaField[];
    nodes: IWorkflowSaveNode[];
    edges: IWorkflowEdge[];
    metadata?: Record<string, any>;
    routing_path?: string;
}

// Workflow Config
export interface IWorkflowConfigParameter {
    key: string;
    label: string;
    description: string;
    type: string;
    required: boolean;
    default: any;
}

export interface IWorkflowConfig {
    id: string;
    workflow_id: string;
    tenantId: string;
    parameters: IWorkflowConfigParameter[];
    metadata?: Record<string, any>;
    created_at: number;
    updated_at: number;
}

export interface IVariableSuggestionPath {
    path: string;
    kind: string;
    output_type: string;
    item_type: string | null;
    sample: any;
    columns: string[];
    preview_rows: any[];
    label: string;
    expandable: boolean;
    display_path: string;
}

export interface IWorkflowArtifact {
    file_id: string;
    name: string;
    content_type?: string;
    artifact_type: string;
    row_count: number;
    links?: {
        data: string;
        patch: string;
    };
}

export interface IVariableSuggestionScope {
    scope_type: string;
    scope_id: string;
    label: string;
    expression_prefix: string;
    paths: IVariableSuggestionPath[];
    node_type: string | null;
    has_file_data: boolean;
    file_id: string | null;
    columns: string[];
    preview_rows: Record<string, any>[];
    artifacts: IWorkflowArtifact[];
    default_artifact_path: string | null;
}

// Legacy types for backward compatibility
export interface IVariableSuggestionSource {
    node_id: string | null;
    node_name: string;
    node_type: string;
    expression_prefix: string;
    paths: IVariableSuggestionPath[];
    has_file_data: boolean;
    file_id: string | null;
    columns: string[];
    preview_rows: Record<string, any>[];
    artifacts: IWorkflowArtifact[];
}

export interface IArtifactVariableSuggestionSource extends IVariableSuggestionSource {
    node_id: null;
    node_name: "artifacts";
    node_type: "";
    expression_prefix: "{{$artifacts";
}

export interface IVariableSuggestionData {
    run_id: string;
    node_id: string;
    workflow: any;
    run: any;
    scopes: IVariableSuggestionScope[];
    error: string | null;
    error_code: string;
    error_details: Record<string, any>;
    // Legacy fields for backward compatibility
    artifacts?: IArtifactVariableSuggestionSource;
    sources?: IVariableSuggestionSource[];
}

export interface IVariableSuggestionResponse {
    status: string;
    data: IVariableSuggestionData;
}

export interface IExecuteAIPayload {
    message: string
    conv_id?: string
    user_id?: string
    tenant_id?: string
    source?: string
    correlation_id?: string
    parameters?: Record<string, any>
    context?: Record<string, any>
    reply_to?: string
    reply_topic?: string
    action?: string
    agent_type?: string
    intent?: Record<string, any>
    execution_context?: Record<string, any>
    context_snapshot?: Record<string, any>
}

export interface IExecuteAIResponse {
    ok: boolean
    data?: any
    message?: string
}
