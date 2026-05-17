import { SORT_TYPE } from "@/constants/common";
import { IWorkflow } from "./workflows";

export interface IWorkflowExecutionParams {
    $skip?: number;
    $top?: number;
    $filter?: string;
    $orderby?: string;
    $count?: boolean;
    offset?: number;
    limit?: number;
}

export interface IWorkflowExecutionOutputSummary {
    total_items: number;
    preview: Record<string, any>;
}

export interface IWorkflowExecutionOutputRef {
    output_id: string;
    chunk_size: number;
}

export interface IWorkflowExecutionOutput {
    type: string;
    summary: IWorkflowExecutionOutputSummary;
    ref: IWorkflowExecutionOutputRef;
}

export interface IWorkflowExecutionErrorMessage {
    message: string;
    at: number;
}

export interface IWorkflowExecutionError {
    node_id: string;
    code: string;
    messages: IWorkflowExecutionErrorMessage[];
}

export interface IWorkflowExecutionHistory {
    id: string;
    workflow_id: string;
    workflow_name: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    error: any | null;
    is_test: boolean;
    tenant_id: string;
}

export interface IWorkflowExecutionHistoryResponse {
    status: string;
    data: {
        items: IWorkflowExecutionHistory[];
        total: number;
        $skip: number;
        $top: number;
    };
}


// Execute Node status types

export type NodeExecutionStatus = "idle" | "executing" | "completed" | "failed"

interface NodeOutputSummary {
  total_items: number
  preview: Record<string, unknown>
}

interface NodeOutputRef {
  output_id: string
  chunk_size: number
}

interface NodeOutput {
  type: string
  summary: NodeOutputSummary
  ref: NodeOutputRef
}

interface ExecutionRun {
  id: string
  status: string
  workflow_id: string
  workflow_name: string
}

export interface NodeExecutionOutput {
  $params: Record<string, unknown>
  $payload: Record<string, unknown>
  $outputs: Record<string, NodeOutput> 
  $workflow: Record<string, unknown>
  $run: ExecutionRun
  $artifacts: Record<string, unknown>
  $input: Record<string, unknown>
}

export interface NodeExecutionState {
  status: NodeExecutionStatus
  sessionId?: string
  runId?: string
  cacheKey?: string
  timestamp?: number
  output?: NodeExecutionOutput
  hasLargeOutput?: boolean
}

export interface IResumeTaskPayload {
    updated_input?: Record<string, any>;
}

export interface INodeOutputPath {
    path: string;
    type: string;
    label: string;
    sample: any;
}

export interface INodeOutputData {
    run_id: string;
    node_id: string;
    node_name: string;
    node_type: string;
    status: string;
    data_type: string;
    file_id?: string;
    paths: INodeOutputPath[];
    columns: string[];
    preview_rows: Record<string, any>[];
    artifacts: any[];
    links: {
        data: string;
        patch?: string;
        [key: string]: string | undefined;
    };
    expression_prefix: string;
    error: string | null;
}

export interface IGetNodeOutputResponse {
    status: string;
    data: INodeOutputData;
}

