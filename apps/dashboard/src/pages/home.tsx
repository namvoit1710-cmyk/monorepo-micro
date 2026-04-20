import { Builder } from "@ldc/autoform";
import { useTranslation } from "@ldc/i18n";
import { Upload, UploadDropzone, UploadFileList } from "@ldc/ui/components/upload";
import { WorkflowEditor } from "@ldc/workflow-editor";
import { UploadIcon } from "lucide-react";

const HomePage = () => {
    const { t } = useTranslation("dashboard")

    return (
        <>
            <div className="bg-muted w-full h-full flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-primary">{t("greeting")}</h1>
                <p className="text-lg text-muted-foreground">{t("welcome")}</p>
            </div>

            <Builder
                schema={{
                    fields: [
                        {
                            key: "data",
                            outputType: "array",
                            fieldConfig: {
                                controlProps: {
                                    label: "Name",
                                    placeholder: "Enter your name"
                                }
                            },
                            fields: [
                                {
                                    key: "field_id",
                                    outputType: "string",
                                    fieldConfig: {

                                    },
                                    fields: [
                                        {
                                            key: "name",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldWrapper: "FormItemWrapper",
                                                wrapperProps: {
                                                    label: "Name",
                                                },
                                                fieldControl: "InputControl",
                                                controlProps: {
                                                    placeholder: "Enter your name"
                                                }
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }}

                onValuesChange={(values) => console.log(values)}
            />
            <Builder
                schema={{
                    fields: [
                        {
                            key: "data",
                            outputType: "object",
                            fieldConfig: {
                                fieldWrapper: "TabWrapper",
                                wrapperProps: {
                                    variant: "line"
                                }
                            },
                            fields: [
                                {
                                    key: "field_id",
                                    outputType: "object",
                                    fieldConfig: {
                                        fieldWrapper: "TabItemWrapper",
                                        wrapperProps: {
                                            label: "Tab 1"
                                        }
                                    },
                                    fields: [
                                        {
                                            key: "name",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldWrapper: "FormItemWrapper",
                                                wrapperProps: {
                                                    label: "Name",
                                                },
                                                fieldControl: "InputControl",
                                                controlProps: {
                                                    placeholder: "Enter your name"
                                                }
                                            },
                                        }
                                    ]
                                },
                                {
                                    key: "field_id_2",
                                    outputType: "object",
                                    fieldConfig: {
                                        fieldWrapper: "TabItemWrapper",
                                        wrapperProps: {
                                            label: "Tab 2"
                                        }
                                    },
                                    fields: [
                                        {
                                            key: "name",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldWrapper: "FormItemWrapper",
                                                wrapperProps: {
                                                    label: "Age",
                                                },
                                                fieldControl: "InputControl",
                                                controlProps: {
                                                    placeholder: "Enter your age"
                                                }
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }}

                onValuesChange={(values) => console.log(values)}
            />

            <Upload
                onFilesChange={(files) => console.log(files)}
            >
                <UploadDropzone
                    icon={<UploadIcon className="text-primary" />}
                    title="Upload your files"
                    description="Drag and drop files here or click to upload"
                />

                <UploadFileList />
            </Upload>


            <Builder
                schema={{
                    fields: [
                        {
                            key: "data",
                            outputType: "array",
                            fieldConfig: {
                                fieldWrapper: "TableWrapper",
                                wrapperProps: {
                                    variant: "line"
                                }
                            },
                            fields: [
                                {
                                    key: "0",
                                    outputType: "object",
                                    fieldConfig: {
                                        wrapperProps: {
                                            "add": true,
                                            "minus": true
                                        }
                                    },
                                    fields: [
                                        {
                                            key: "name",
                                            outputType: "string",
                                            fieldConfig: {
                                                wrapperProps: {
                                                    label: "Name",
                                                },
                                                fieldControl: "InputControl"
                                            },
                                        },
                                        {
                                            key: "age",
                                            outputType: "string",
                                            fieldConfig: {
                                                wrapperProps: {
                                                    label: "Age",
                                                },
                                                fieldControl: "InputControl"
                                            },
                                        },
                                        {
                                            key: "address",
                                            outputType: "string",
                                            fieldConfig: {
                                                wrapperProps: {
                                                    size: 400,
                                                    label: "Address",
                                                },
                                                fieldControl: "InputControl"
                                            },
                                        },
                                    ]
                                }
                            ]
                        }
                    ]
                }}

                onValuesChange={(values) => console.log(values)}
            />

            <div className="h-[400px] w-full bg-muted">

                <WorkflowEditor
                    value={{
                        "nodes": [
                            {
                                "id": "d81f0b86-5011-45f2-a8c0-b4f58c0dcbea",
                                "position": {
                                    "x": 0,
                                    "y": 75
                                },
                                "data": {
                                    "id": "d81f0b86-5011-45f2-a8c0-b4f58c0dcbea",
                                    "name": "Input table selection criteria",
                                    "node_type": "INPUT",
                                    "worker_type": "builtin:input",
                                    "parameters": {
                                        "input_schema": "[\r\n  {\r\n    \"key\": \"tbl_criteria\",\r\n    \"outputType\": \"array\",\r\n    \"fieldConfig\": {\r\n      \"fieldWrapper\": \"TableWrapper\",\r\n      \"wrapperProps\": {\r\n        \"label\": \"Table\",\r\n        \"enablePagination\": true\r\n      },\r\n      \"rules\": [\r\n        {\r\n          \"method\": \"required\"\r\n        }\r\n      ],\r\n      \"controlProps\": {}\r\n    },\r\n    \"fields\": [\r\n      {\r\n        \"key\": \"tbl_criteria_row\",\r\n        \"outputType\": \"object\",\r\n        \"fieldConfig\": {\r\n          \"fieldWrapper\": \"FragmentWrapper\",\r\n          \"wrapperProps\": {\r\n            \"add\": true,\r\n            \"minus\": true\r\n          }\r\n        },\r\n        \"fields\": [\r\n          {\r\n            \"key\": \"selectionType\",\r\n            \"outputType\": \"string\",\r\n            \"fieldConfig\": {\r\n              \"fieldWrapper\": \"FormItemWrapper\",\r\n              \"fieldControl\": \"SelectControl\",\r\n              \"controlProps\": {\r\n                \"options\": [\r\n                  {\r\n                    \"id\": \"USER\",\r\n                    \"value\": \"USER\"\r\n                  }\r\n                ]\r\n              },\r\n              \"wrapperProps\": {\r\n                \"label\": \"Selection Type\"\r\n              }\r\n            }\r\n          },\r\n          {\r\n            \"key\": \"description\",\r\n            \"outputType\": \"string\",\r\n            \"fieldConfig\": {\r\n              \"fieldControl\": \"InputControl\",\r\n              \"wrapperProps\": {\r\n                \"label\": \"Description\"\r\n              },\r\n              \"controlProps\": {\r\n                \"placeholder\": \"Description\"\r\n              },\r\n              \"rules\": [\r\n                {\r\n                  \"method\": \"required\"\r\n                }\r\n              ]\r\n            }\r\n          },\r\n          {\r\n            \"key\": \"isActive\",\r\n            \"outputType\": \"boolean\",\r\n            \"default\": true,\r\n            \"fieldConfig\": {\r\n              \"fieldControl\": \"CheckBoxControl\",\r\n              \"wrapperProps\": {\r\n                \"label\": \"isActive\"\r\n              },\r\n              \"controlProps\": {\r\n                \"placeholder\": \"input\"\r\n              }\r\n            }\r\n          },\r\n          {\r\n            \"key\": \"button\",\r\n            \"outputType\": \"string\",\r\n            \"fieldConfig\": {\r\n              \"fieldControl\": \"ButtonControl\",\r\n              \"wrapperProps\": {\r\n                \"fixed\": \"right\",\r\n                \"size\": 80,\r\n                \"label\": \"Validate\"\r\n              },\r\n              \"controlProps\": {\r\n                \"events\": {\r\n                  \"action\": \"validate_row_by_key\",\r\n                  \"key\": \"description\"\r\n                },\r\n                \"label\": \"Validate\"\r\n              }\r\n            }\r\n          }\r\n        ]\r\n      }\r\n    ]\r\n  }\r\n]",
                                        "instruction": "please fill selection criteria into the table",
                                        "timeout_seconds": 30,
                                        "follow_redirects": true,
                                        "verify_ssl": true,
                                        "headers": [],
                                        "query_params": [],
                                        "body_fields": []
                                    },
                                    "x": 0,
                                    "y": 75,
                                    "node_class": "",
                                    "description": "Pauses workflow to collect structured input from a user.",
                                    "instruction": "",
                                    "icon": "FormInput",
                                    "color": "#8B5CF6",
                                    "tags": [],
                                    "ports": {
                                        "inputs": [
                                            {
                                                "id": "in_default",
                                                "label": "Input",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "id": "out_default",
                                                "label": "Output",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ]
                                    },
                                    "node_definition_id": null,
                                    "editable": true,
                                    "title": "Input table selection criteria",
                                    "status": "active",
                                    "version": 1
                                }
                            },
                            {
                                "id": "c43b8bc5-4a14-4ad7-9d84-a8345c0c3e89",
                                "position": {
                                    "x": 661,
                                    "y": 75
                                },
                                "data": {
                                    "id": "c43b8bc5-4a14-4ad7-9d84-a8345c0c3e89",
                                    "name": "HTTP Request Worker - API set selection criteria",
                                    "node_type": "TASK",
                                    "worker_type": "worker:http_request",
                                    "parameters": {
                                        "method": "POST",
                                        "url": "https://smdg-ai-dev-governance-qas.cfapps.br10.hana.ondemand.com/api/v1/templates/{{$input.templateId}}/selection-criteria",
                                        "timeout_seconds": 30,
                                        "follow_redirects": true,
                                        "verify_ssl": true,
                                        "headers": [],
                                        "query_params": [],
                                        "body_fields": [],
                                        "body": "{\n  \"items\": {{$6e29ea40-faf1-462d-bf4e-449f46f9a849.response_body.data}}\n}",
                                        "body_type": "raw_json"
                                    },
                                    "x": 661,
                                    "y": 75,
                                    "node_class": "",
                                    "description": "Executes tasks via 'HTTP Request Worker'. Capabilities: http_request.execute.",
                                    "instruction": "",
                                    "icon": "Cog",
                                    "color": "#3B82F6",
                                    "tags": [],
                                    "ports": {
                                        "inputs": [
                                            {
                                                "id": "in_default",
                                                "label": "Input",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "id": "success",
                                                "label": "Success",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            },
                                            {
                                                "id": "failure",
                                                "label": "Failure",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ]
                                    },
                                    "node_definition_id": null,
                                    "editable": true,
                                    "title": "HTTP Request Worker - API set selection criteria",
                                    "status": "active",
                                    "version": 1
                                }
                            },
                            {
                                "id": "6e29ea40-faf1-462d-bf4e-449f46f9a849",
                                "position": {
                                    "x": 355,
                                    "y": 75
                                },
                                "data": {
                                    "id": "6e29ea40-faf1-462d-bf4e-449f46f9a849",
                                    "name": "get data by file id",
                                    "node_type": "TASK",
                                    "worker_type": "worker:http_request",
                                    "parameters": {
                                        "method": "GET",
                                        "url": "https://smdg-ai-dev-file-service-qas.cfapps.br10.hana.ondemand.com/api/v1/odata/{{$artifacts.tbl_criteria}}/data",
                                        "timeout_seconds": 30,
                                        "follow_redirects": true,
                                        "verify_ssl": true,
                                        "headers": [],
                                        "query_params": [],
                                        "body_fields": [],
                                        "body": "",
                                        "body_type": "none",
                                        "auth_type": "none"
                                    },
                                    "x": 355,
                                    "y": 75,
                                    "node_class": "",
                                    "description": "Executes tasks via 'HTTP Request Worker'. Capabilities: http_request.execute.",
                                    "instruction": "",
                                    "icon": "Cog",
                                    "color": "#3B82F6",
                                    "tags": [],
                                    "ports": {
                                        "inputs": [
                                            {
                                                "id": "in_default",
                                                "label": "Input",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "id": "success",
                                                "label": "Success",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            },
                                            {
                                                "id": "failure",
                                                "label": "Failure",
                                                "data_type": "any",
                                                "required": true,
                                                "description": "",
                                                "readonly": true
                                            }
                                        ]
                                    },
                                    "node_definition_id": null,
                                    "editable": true,
                                    "title": "get data by file id",
                                    "status": "active",
                                    "version": 1
                                }
                            }
                        ],
                        "connections": [
                            {
                                "id": "7594a179-2b3d-43a4-bfe9-f987098ebd3c",
                                "source": "d81f0b86-5011-45f2-a8c0-b4f58c0dcbea",
                                "sourceOutput": "out_default",
                                "target": "6e29ea40-faf1-462d-bf4e-449f46f9a849",
                                "targetInput": "in_default"
                            },
                            {
                                "id": "1f35667b-745e-43ae-bd46-2f7de1940143",
                                "source": "6e29ea40-faf1-462d-bf4e-449f46f9a849",
                                "sourceOutput": "success",
                                "target": "c43b8bc5-4a14-4ad7-9d84-a8345c0c3e89",
                                "targetInput": "in_default"
                            }
                        ]
                    }}
                />
            </div>
        </>
    );
};

export default HomePage;
