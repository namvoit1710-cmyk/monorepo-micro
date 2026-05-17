export enum TYPE_CONFIG_PARAMETER {
    TEXT = "string",
    FILE = "file",
    FILES = "files",
    NUMBER = "number",
    BOOLEAN = "boolean",
    OBJECT = "object",
    ENUM = "enum"
}

export enum WORKER_TYPE_UPDATE_PORT {
    CONDITION = "builtin:condition",
    SWITCH = "builtin:switch",
}

export const SERVICE_CONFIGS = {
    governance: {
        baseUrl: import.meta.env.VITE_URL_GOVERNANCE_API,
        basePath: "api/v1",
    },
    odata: {
        baseUrl: import.meta.env.VITE_URL_FILE_SERVICE,
        basePath: "api/v1",
    },
    workflow: {
        baseUrl: import.meta.env.VITE_WORKFLOW_API_URL,
        basePath: "api/v1",
    },
    "workflow-validate": {
        baseUrl: import.meta.env.VITE_WORKFLOW_VALIDATION_RULE_AGENT_API_URL,
        basePath: "api/v1",
    },
    "governance-agent": {
        baseUrl: import.meta.env.VITE_WORKFLOW_GOVERNANCE_AGENT_API_URL,
        basePath: "api/v1",
    },
    "profile-manager-agent": {
        baseUrl: import.meta.env.VITE_WORKFLOW_PROFILE_MANAGER_API_URL,
        basePath: "api/v1",
    },
    "intergration-hub": {
        baseUrl: import.meta.env.VITE_INTEGRATION_HUB_API_URL,
        basePath: "api/v1",
    },
};