import { env } from "@/env";

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
        baseUrl: env.PUBLIC_GOVERNANCE_API_URL,
        basePath: "api/v1",
    },
    odata: {
        baseUrl: env.PUBLIC_FILE_SERVICE_URL,
        basePath: "api/v1",
    },
    workflow: {
        baseUrl: env.PUBLIC_WORKFLOW_API_URL,
        basePath: "api/v1",
    },
    "workflow-validate": {
        baseUrl: env.PUBLIC_WORKFLOW_VALIDATION_RULE_AGENT_API_URL,
        basePath: "api/v1",
    },
    "governance-agent": {
        baseUrl: env.PUBLIC_WORKFLOW_GOVERNANCE_AGENT_API_URL,
        basePath: "api/v1",
    },
    "profile-manager-agent": {
        baseUrl: env.PUBLIC_WORKFLOW_PROFILE_MANAGER_API_URL,
        basePath: "api/v1",
    },
    "integration-hub": {
        baseUrl: env.PUBLIC_INTEGRATION_HUB_API_URL,
        basePath: "api/v1",
    },
};