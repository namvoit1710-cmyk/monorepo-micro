import { Builder } from "@ldc/autoform";
import { useTranslation } from "@ldc/i18n";

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
                                            key: "firstName",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldControl: "InputControl",
                                                controlProps: {
                                                    label: "First Name",
                                                    placeholder: "Enter your first name"
                                                }
                                            }
                                        },
                                        {
                                            key: "age",
                                            outputType: "number",
                                            fieldConfig: {
                                                fieldControl: "NumberControl",
                                                controlProps: {
                                                    label: "Age",
                                                    placeholder: "Enter your age"
                                                }
                                            }
                                        },
                                        {
                                            key: "gender",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldControl: "SelectControl",
                                                controlProps: {
                                                    label: "Gender",
                                                    placeholder: "Select your gender",
                                                    options: [
                                                        { id: "male", value: "Male" },
                                                        { id: "female", value: "Female" },
                                                        { id: "other", value: "Other" }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            key: "hobbies",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldControl: "TextareaControl",
                                                controlProps: {
                                                    label: "Hobbies",
                                                    placeholder: "Enter your hobbies"
                                                }
                                            }
                                        },

                                        {
                                            key: "newsletter",
                                            outputType: "boolean",
                                            fieldConfig: {
                                                fieldControl: "SwitchControl",
                                                controlProps: {
                                                    label: "Subscribe to newsletter"
                                                }
                                            }
                                        },
                                        {
                                            key: "terms",
                                            outputType: "boolean",
                                            fieldConfig: {
                                                fieldControl: "CheckBoxControl",
                                                controlProps: {
                                                    label: "Agree to terms and conditions"
                                                }
                                            }
                                        },
                                        {
                                            key: "color",
                                            outputType: "string",
                                            fieldConfig: {
                                                fieldControl: "RadioPopupControl",
                                                controlProps: {
                                                    label: "Favorite Color",
                                                    className: "flex flex-row items-center gap-x-4",
                                                    options: [
                                                        { id: "red", label: "Red" },
                                                        { id: "green", label: "Green" },
                                                        { id: "blue", label: "Blue" }
                                                    ]
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }}

                onValuesChange={(values) => console.log(values)}
            />
        </>
    );
};

export default HomePage;
