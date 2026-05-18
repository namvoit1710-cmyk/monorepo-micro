import { useLanguage } from "@/hooks/use-language";
import { Builder, IField } from "@ldc/autoform";
import { EyeIcon } from "lucide-react";
import { useMemo } from "react";
import { IWorkflowSchemaField } from "../../../workflows/types/workflows";

interface SchemaPreviewProps {
    schema: IWorkflowSchemaField[];
    title?: string;
}

const SchemaPreview = ({ schema, title }: SchemaPreviewProps) => {
    const { t } = useLanguage();

    const previewFields: IField[] = useMemo(() => {
        if (!schema?.length) return [];

        return (schema as IField[]).map((field) => ({
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
    }, [schema]);

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2">
                <EyeIcon className="size-4 text-gray-500" />
                <h4 className="text-sm font-semibold uppercase text-gray-600">
                    {title || t("node_definition_builder.preview")}
                </h4>
            </div>

            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 flex-1 overflow-y-auto">
                {previewFields.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                        {t("node_definition_builder.preview_empty")}
                    </div>
                ) : (
                    <Builder
                        schema={{
                            fields: [
                                {
                                    outputType: "object",
                                    key: "preview",
                                    fieldConfig: {
                                        wrapperProps: { className: "h-full" },
                                    },
                                    fields: previewFields,
                                },
                            ],
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default SchemaPreview;
