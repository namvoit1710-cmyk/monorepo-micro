import { APISdk } from "@common/configs/axios/axios-instance";
import { ENDPOINTS } from "@common/configs/endpoints.config";

const api = new APISdk({
    baseURL: import.meta.env.VITE_WORKFLOW_API_URL,
    headers: {
        "X-Tenant-ID": "system"
    },
    timeout: 5 * 60 * 1000,
    withCredentials: false,

    onSessionExpired: () => {
        window.location.href = "/login";
    }
});

const workflowValidationRuleAgentApi = new APISdk({
    baseURL: import.meta.env.VITE_WORKFLOW_VALIDATION_RULE_AGENT_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

const workflowProfileManagerApi = new APISdk({
    baseURL: import.meta.env.VITE_WORKFLOW_PROFILE_MANAGER_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

const workflowAgentApi = new APISdk({
    baseURL: import.meta.env.VITE_WORKFLOW_SUPERVISOR_AGENT_API_URL,
    timeout: 5 * 60 * 1000,
    withCredentials: false,
});

export { api, workflowAgentApi, workflowProfileManagerApi, workflowValidationRuleAgentApi };

export default api;