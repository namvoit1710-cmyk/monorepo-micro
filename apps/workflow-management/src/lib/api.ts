import { env } from "@/env";
import { APISdk } from "@ldc/api-sdk";

const api = new APISdk({
    baseURL: env.PUBLIC_WORKFLOW_API_URL,
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

export { api, workflowAgentApi, workflowProfileManagerApi, workflowValidationRuleAgentApi };

export default api;