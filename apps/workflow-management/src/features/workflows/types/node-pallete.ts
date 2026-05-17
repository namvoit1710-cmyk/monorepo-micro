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
}

export interface INodePorts {
    in: IWorkerPortDetail[];
    out: IWorkerPortDetail[];
}

export interface INodePallete {
    id: string;
    name: string;
    node_type: string;
    category: string;
    description: string;
    worker_id: string | null;
    node_definition_id?: string | null;
    capabilities: string[];
    input_schema: INodeInputSchema[];
    output_schema: INodeOutputSchema[];
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

export interface IMenuItem {
    icon?: string
    text: string
    type: "Node" | "Group"
    original?: INodePallete
    nodes?: IMenuItem[]
}

