import { env } from "@/env";
import { APISdk } from "@ldc/api-sdk";

const api = new APISdk({
    baseURL: env.PUBLIC_URL_AI_WORKFLOW_CONTROL_PLANE + "/api/v1",
    timeout: 5 * 60 * 1000,
    withCredentials: false,

    onSessionExpired: () => {
        window.location.href = "/login";
    }
});

const fileApi = new APISdk({
    baseURL: env.PUBLIC_URL_FILE_SERVICE + "/api/v1",
    timeout: 5 * 60 * 1000,
    withCredentials: false,

    onSessionExpired: () => {
        window.location.href = "/login";
    }
});

const apiV2 = new APISdk({
    baseURL: env.PUBLIC_URL_AI_WORKFLOW_CONTROL_PLANE + "/api/v2",
    timeout: 5 * 60 * 1000,
    withCredentials: false,

    onSessionExpired: () => {
        window.location.href = "/login";
    }
});

const workflowValidationRuleAgentApi = new APISdk({
    baseURL: env.PUBLIC_WORKFLOW_VALIDATION_RULE_AGENT_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

const workflowProfileManagerApi = new APISdk({
    baseURL: env.PUBLIC_WORKFLOW_PROFILE_MANAGER_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

const workflowAgentApi = new APISdk({
    baseURL: env.PUBLIC_WORKFLOW_SUPERVISOR_AGENT_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

export { api, apiV2, fileApi, workflowAgentApi, workflowProfileManagerApi, workflowValidationRuleAgentApi };

export default api;