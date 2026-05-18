import JsonView from "@/components/json-view/json-view";
import { useTestNodeDefinition } from "@/features/node-definitions/hooks/apis/node-definitions";
import { ITestNodeDefinitionDataResponse, ITestNodeDefinitionResponse } from "@/features/node-definitions/types/node-definition";
import { IWorkflowSchemaField } from "@/features/workflows/types/workflows";
import { useLanguage } from "@/hooks/use-language";
import { Builder, BuilderRef, IField } from "@ldc/autoform";
import { toast } from "@ldc/ui/blocks/toast/toast";
import { Badge } from "@ldc/ui/components/badge";
import { Button } from "@ldc/ui/components/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@ldc/ui/components/resizable";
import { Spinner } from "@ldc/ui/components/spinner";
import { PlayIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

interface NodeDefinitionTestTabProps {
    definitionId: string;
    inputSchema: IWorkflowSchemaField[];
}

const isSuccessStatus = (status: string) =>
    ["success", "completed"].includes(status.toLowerCase());

const isFailedStatus = (status: string) =>
    ["failed", "error"].includes(status.toLowerCase());

const TestResultPanel = ({
    result,
    error,
    isTesting,
    t,
}: {
    result: ITestNodeDefinitionResponse | null;
    error: string | null;
    isTesting: boolean;
    t: (key: string) => string;
}) => {

    if (isTesting) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (error && !result) {
        return (
            <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                {t("node_definition_builder.test_idle_message")}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Badge
                    className={
                        isSuccessStatus(result.status)
                            ? "bg-green-100 text-green-800 border-green-200"
                            : ""
                    }
                    variant={isFailedStatus(result.status) ? "destructive" : "outline"}
                >
                    {result.status}
                </Badge>
                {result.execution_time_ms > 0 && (
                    <span className="text-sm text-muted-foreground">
                        {result.execution_time_ms}ms
                    </span>
                )}
            </div>

            {result.error && (
                <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-3 text-sm text-destructive">
                    <strong>{t("node_definition_builder.test_error")}:</strong>{" "}
                    {result.error}
                </div>
            )}

            <div>
                <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                    {t("node_definition_builder.test_resolved_input")}
                </h5>
                <div className="border rounded-lg bg-gray-50 p-3">
                    <JsonView value={result.resolved_input || {}} collapsed={2} />
                </div>
            </div>

            <div>
                <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                    {t("node_definition_builder.test_outputs")}
                </h5>
                <div className="border rounded-lg bg-gray-50 p-3">
                    <JsonView value={result.outputs || {}} collapsed={2} />
                </div>
            </div>

            {result.output_reference && (
                <div>
                    <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                        {t("node_definition_builder.test_output_reference")}
                    </h5>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {result.output_reference}
                    </code>
                </div>
            )}
        </div>
    );
};

const NodeDefinitionTestTab = ({
    definitionId,
    inputSchema,
}: NodeDefinitionTestTabProps) => {
    const { t } = useLanguage();
    const testBuilderRef = useRef<BuilderRef>(null);

    const [result, setResult] = useState<ITestNodeDefinitionDataResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const testFields: IField[] = useMemo(() => {
        if (!inputSchema?.length) return [];
        return (inputSchema as IField[]).map((field) => ({
            ...field,
            outputType: field.outputType || "string",
            fieldConfig: {
                ...field.fieldConfig,
                wrapperProps: {
                    ...field.fieldConfig?.wrapperProps,
                    labelSpan: "xl-12 lg-12 md-12 xs-12",
                    fieldSpan: "xl-12 lg-12 md-12 xs-12",
                },
                controlProps: {
                    ...field.fieldConfig?.controlProps,
                    className: "w-full",
                },
            },
        }));
    }, [inputSchema]);

    const { mutate: testDefinition, isPending: isTesting } = useTestNodeDefinition({
        onSuccess: (data: any) => {
            setResult(data);
            setError(null);
        },
        onError: (err: any) => {
            setResult(null);
            const errorBody = err.response?.data;
            const message =
                errorBody?.errors?.join(", ") || err.message || "Test failed";
            setError(message);
            toast.error(t("notification.error"), message);
        },
    });

    const handleTestSubmit = useCallback(
        (formValues: Record<string, any>) => {
            testDefinition({
                id: definitionId,
                payload: { input_data: formValues },
            });
        },
        [definitionId, testDefinition]
    );

    const handleRunTest = useCallback(() => {
        if (testFields.length > 0) {
            testBuilderRef.current?.onSubmit();
        } else {
            testDefinition({
                id: definitionId,
                payload: { input_data: {} },
            });
        }
    }, [testFields.length, definitionId, testDefinition]);

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <p className="text-sm text-muted-foreground">
                {t("node_definition_builder.test_description")}
            </p>

            <ResizablePanelGroup className="flex-1 overflow-hidden">
                <ResizablePanel defaultSize={40} minSize={25}>
                    <div className="flex flex-col gap-4 h-full pr-4">
                        <h4 className="text-sm font-semibold uppercase text-gray-600">
                            {t("node_definition_builder.section_input_schema")}
                        </h4>

                        {testFields.length > 0 ? (
                            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 flex-1 overflow-y-auto">
                                <Builder
                                    ref={testBuilderRef}
                                    schema={{ fields: testFields }}
                                    onSubmit={handleTestSubmit}
                                />
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 py-4">
                                {t("node_definition_builder.test_no_input_fields")}
                            </div>
                        )}

                        <Button
                            onClick={handleRunTest}
                            disabled={isTesting}
                            className="self-start"
                        >
                            {isTesting ? (
                                <>
                                    <Spinner className="size-4 mr-2" />
                                    {t("node_definition_builder.test_running")}
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="size-4 mr-2" />
                                    {t("node_definition_builder.test_run")}
                                </>
                            )}
                        </Button>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="h-full overflow-y-auto pl-4">
                        <TestResultPanel
                            result={result?.data!}
                            error={error}
                            isTesting={isTesting}
                            t={t}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default NodeDefinitionTestTab;
