/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_GOVERNANCE_API_URL: string;
  readonly PUBLIC_FILE_SERVICE_URL: string;
  readonly PUBLIC_WORKFLOW_API_URL: string;
  readonly PUBLIC_WORKFLOW_VALIDATION_RULE_AGENT_API_URL: string;
  readonly PUBLIC_WORKFLOW_GOVERNANCE_AGENT_API_URL: string;
  readonly PUBLIC_WORKFLOW_PROFILE_MANAGER_API_URL: string;
  readonly PUBLIC_WORKFLOW_SUPERVISOR_AGENT_API_URL: string;
  readonly PUBLIC_INTEGRATION_HUB_API_URL: string;
  readonly PUBLIC_PUSH_GATEWAY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
