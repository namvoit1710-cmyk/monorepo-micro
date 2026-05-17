/**
 * Metadata describing how each worker input field should be edited
 * in the input_mapping UI.
 *
 * Derived from node-definition-mapping-guide.md — HTTP Request Worker Reference.
 */

export type WorkerFieldMode =
    | "expression"       // simple value or expression string
    | "key_value_array"  // array of { nameKey: "...", valueKey: "..." } objects
    | "json_template";   // textarea where user composes JSON mixing custom fields

export interface IWorkerFieldMeta {
    key: string;
    label: string;
    description: string;
    mode: WorkerFieldMode;
    /** For key_value_array: column names */
    nameKey?: string;
    valueKey?: string;
    nameLabel?: string;
    valueLabel?: string;
}

/**
 * All fields the http-request-worker accepts, with the editor mode that best
 * fits the data shape the backend expects.
 */
export const HTTP_WORKER_FIELDS: IWorkerFieldMeta[] = [
    {
        key: "method",
        label: "HTTP Method",
        description: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
        mode: "expression",
    },
    {
        key: "url",
        label: "URL",
        description: "Full URL (supports expressions for path params)",
        mode: "expression",
    },
    {
        key: "query_params",
        label: "Query Parameters",
        description: "URL query string parameters",
        mode: "key_value_array",
        nameKey: "param_name",
        valueKey: "param_value",
        nameLabel: "Parameter",
        valueLabel: "Value",
    },
    {
        key: "headers",
        label: "Headers",
        description: "HTTP request headers",
        mode: "key_value_array",
        nameKey: "header_name",
        valueKey: "header_value",
        nameLabel: "Header",
        valueLabel: "Value",
    },
    {
        key: "body_type",
        label: "Body Type",
        description: "none, raw_json, raw_text, structured, form_urlencoded",
        mode: "expression",
    },
    {
        key: "body",
        label: "Request Body",
        description: "JSON body — compose from user input fields",
        mode: "json_template",
    },
    {
        key: "body_fields",
        label: "Body Fields (structured)",
        description: "Structured body fields (form/urlencoded)",
        mode: "key_value_array",
        nameKey: "field_name",
        valueKey: "field_value",
        nameLabel: "Field",
        valueLabel: "Value",
    },
    {
        key: "timeout_seconds",
        label: "Timeout (seconds)",
        description: "Request timeout, 1-300",
        mode: "expression",
    },
    {
        key: "auth_type",
        label: "Auth Type",
        description: "none, bearer, basic, api_key",
        mode: "expression",
    },
    {
        key: "auth_token",
        label: "Auth Token",
        description: "Token for bearer or api_key auth",
        mode: "expression",
    },
    {
        key: "auth_username",
        label: "Auth Username",
        description: "Username for basic auth",
        mode: "expression",
    },
    {
        key: "auth_password",
        label: "Auth Password",
        description: "Password for basic auth",
        mode: "expression",
    },
    {
        key: "api_key_header",
        label: "API Key Header Name",
        description: "Header name for api_key auth (default: X-API-Key)",
        mode: "expression",
    },
    {
        key: "follow_redirects",
        label: "Follow Redirects",
        description: "Default: true",
        mode: "expression",
    },
    {
        key: "verify_ssl",
        label: "Verify SSL",
        description: "Default: true",
        mode: "expression",
    },
];

export function getWorkerFieldMeta(key: string): IWorkerFieldMeta | undefined {
    return HTTP_WORKER_FIELDS.find((f) => f.key === key);
}
