import { APISdk } from "@common/configs/axios/axios-instance";

const apiWorkflowControlPlane = new APISdk({
    baseURL: "https://smdg-ai-dev-ai-workflow-workflow-supervisor-agent-qas.cfapps.br10.hana.ondemand.com",
    headers: {
        "X-Tenant-ID": "system"
    },
    timeout: 5 * 60 * 1000,
    withCredentials: false,

    onSessionExpired: () => {
        window.location.href = "/login";
    }
});

export default apiWorkflowControlPlane;
