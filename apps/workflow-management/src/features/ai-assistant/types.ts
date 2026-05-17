
export interface IAIAssistantMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    workflowId?: string;
    isThinking?: boolean;
    createdAt: number;
}

export interface ICreateWorkflowWithAIPayload {
    message: string;
}

export interface ICreateWorkflowWithAIResponse {
    status: string;
    message?: string;
    agent_data?: {
        workflow_id?: string;
        status?: string;
        content?: string;
    };
}

export interface IApiErrorBody {
    message?: string;
    error?: string;
    statusCode?: number;
}