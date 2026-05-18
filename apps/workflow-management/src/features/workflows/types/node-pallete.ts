import type { IField } from "@ldc/autoform";

export interface IGroupNodePallete {
    _id: string;
    name: string;
    description: string;
    icon: string;
}

export interface INodeMetadata {
    groups: string[];
    tags: string[];
    categories: string[];
}

export interface IFieldConfig {
    label: string;
    description: string;
    fieldControl: string;
    fieldWrapper?: string;
    controlProps?: Record<string, any>;
}

export interface IFieldConfigExtended {
    fieldWrapper?: string;
    wrapperProps?: {
        label?: string;
        required?: boolean;
        labelSpan?: string;
        fieldSpan?: string;
        [key: string]: any;
    };
    fieldControl?: string;
    controlProps?: {
        placeholder?: string;
        value?: any;
        readonly?: boolean;
        type?: string;
        options?: {
            id: string;
            value: string;
        }[];
        rowsLength?: number;
        language?: string;
        className?: string;
        [key: string]: any;
    };
    condition?: {
        fieldKey: string;
        conditionValue: string;
        action: string;
        operator: string;
    };
    rules?: {
        method: string;
        [key: string]: any;
    }[];
}

export interface INodeInputSchema {
    key: string;
    outputType: string;
    fieldConfig: IFieldConfig;
    rules?: {
        isRequired?: boolean;
        [key: string]: any;
    };
    default?: any;
    show_when?: {
        field: string;
        operator: string;
        value: any;
    };
}

export interface INodeSchemaField {
    key: string;
    outputType: string;
    fieldConfig: IFieldConfigExtended;
    fields?: INodeSchemaField[];
}

export interface INodeOutputSchema {
    key: string;
    outputType: string;
    fieldConfig: IFieldConfig;
}

export interface IWorkerPortDetail {
    id: string;
    label: string;
    required: boolean;
    description: string;
    data_type?: string;
}

export interface INodePorts {
    in: IWorkerPortDetail[];
    out: IWorkerPortDetail[];
}

export interface INodeCatalogItem {
    id: string;
    name: string;
    node_type: string;
    category: string;
    description: string;
    worker_id: string;
    spec_version: string;
    capabilities: string[];
    input_schema: INodeSchemaField[];
    output_schema: INodeSchemaField[];
    node_class: string;
    icon: string;
    color: string;
    tags: string[];
    ports: INodePorts;
}

export interface INodeTypeInfo {
    node_type: string;
    node_class: string;
    icon: string;
    color: string;
    ports: INodePorts;
}

export interface INodePalleteResponse {
    data: {
        categories: Record<string, INodePallete[]>;
        total: number;
        node_types: INodeTypeInfo[];
    },
    ok: boolean
}

export interface INodeCatalogPort {
    id: string;
    label: string;
}

export interface INodeCatalogPorts {
    inputs: INodeCatalogPort[];
    outputs: INodeCatalogPort[];
}

export interface INodePallete {
    id: string;
    name: string;
    description: string;
    provider: string;
    node_type: string;
    category: string;
    icon: string;
    color: string;
    tags: string[];
    spec_version: string;
    visibility: string;
    runtime: string;

    ports: INodeCatalogPorts;
}

export interface ICategoryMetadata {
    label: string;
    order: number;
}

export interface INodeCatalogResponse {
    status: string;
    data: {
        definitions: INodePallete[];
        category_tree: Record<string, string[]>;
        categories: Record<string, ICategoryMetadata>;
        generated_at: string;
        total: number;
    };
}

export interface INodeCapability {
    domain: string;
    action: string;
}

export interface INodeCatalogDetail extends Omit<INodePallete, "ports"> {
    ports: INodeCatalogPorts;
    input_schema: IField[];
    output_schema: IField[];
    capabilities: INodeCapability[];
    worker_type: string | null;
    base_worker_id: string | null;
    base_node_type: string | null;
    parent_definition_id: string | null;
    locked_defaults: Record<string, any>;
    input_mapping: Record<string, any>;
    output_mapping: Record<string, any>;
    data_mode: string;
    edit_mode: string;
}

export interface INodeCatalogDetailResponse {
    status: string;
    data: INodeCatalogDetail;
}

export interface IMenuItem {
    icon?: string
    text: string
    type: "Node" | "Group"
    original?: INodePallete
    nodes?: IMenuItem[]
}

