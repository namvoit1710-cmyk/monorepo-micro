import { Builder } from "@ldc/autoform";
import { useTranslation } from "@ldc/i18n";
import { Upload, UploadDropzone, UploadFileList } from "@ldc/ui/components/upload";
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
        </>
    );
};

export default HomePage;
