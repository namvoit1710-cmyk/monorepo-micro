import { Field, FieldGroup, FieldLabel, FieldSet } from "@ldc/ui/components/field";
import type { FieldWrapperProps } from "../../types/schema";

const FormItemWrapper = ({ children, field }: FieldWrapperProps) => {
    const wrapperProps = field?.fieldConfig.wrapperProps ?? {};

    return (
        <FieldSet className="w-full">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor={field?.key}>
                        {wrapperProps.label ?? field?.key}
                    </FieldLabel>

                    {children}
                </Field>
            </FieldGroup>
        </FieldSet>
    )
}

export default FormItemWrapper;