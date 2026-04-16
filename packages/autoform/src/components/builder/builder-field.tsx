import type { ComponentType, JSX } from "react";
import { memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useBuilderContext } from "../../contexts/builder.context";
import { useCheckCondition } from "../../hooks/use-check-condittion";
import type { FieldComponentProps, IField } from "../../types/schema";
import FragmentWrapper from "../field-wrapper/fragment-wrapper";
import BuilderArrayField from "./builder-array-field";
import BuilderObjectField from "./builder-object-field";

interface IBuilderFieldProps {
    field: IField;
    path: string[];
    id?: string;
}

const EXCLUDED_OUTPUT_TYPE = new Set(["SingleUploadControl", "SingleUploadFileControl", "FieldMappingControlBase", "MultipleComboboxControl", "SingleUploadFieldMappingControl"]);

const BuilderField = (props: IBuilderFieldProps) => {
    const { field, path } = props;
    const { wrapperComponent, fieldComponent, onFormActions } = useBuilderContext();
    const { control } = useFormContext();
    const { isDisabled, invisible } = useCheckCondition(field, path);

    const name: string = useMemo(() => path.join("."), [path]);

    const getPrimaryFieldComponent = (field: IField) => {
        const fieldControl: string = field.fieldConfig.fieldControl ?? "InputControl";
        const controlProps: Record<string, unknown> = field.fieldConfig.controlProps ?? {};
        const Component: ComponentType<FieldComponentProps> | null = fieldComponent?.[fieldControl] ?? null;

        if (!Component) return <span />;

        if (fieldControl === "MarkdownControl" || fieldControl === "ButtonControl") {
            return <Component name={field.key} {...controlProps} field={field} data-testid={field.key} />;
        }

        return (
            <Controller
                name={name}
                control={control}
                defaultValue={controlProps.value}
                render={({ field: controllerField, fieldState }) => (
                    <Component
                        {...controlProps}
                        {...controllerField}
                        {...fieldState}
                        onFormActions={onFormActions}
                        disabled={isDisabled || controlProps.disabled}
                    />
                )}
            />
        );
    };

    const getArrayOutputTypeComponent = (field: IField): JSX.Element | null => {
        switch (field.fieldConfig.fieldWrapper) {
            case "TableWrapper":
                // return <TableWrapper field={field} path={path} />;
                return null;
            default:
                return <BuilderArrayField field={field} path={path} />;
        }
    };

    const getObjectOutputTypeComponent = (field: IField): JSX.Element | null => {
        switch (field.fieldConfig.fieldWrapper) {
            default:
                return <BuilderObjectField field={field} path={path} />;
        }
    };

    const getFieldComponents = (field: IField): JSX.Element | null => {
        if (EXCLUDED_OUTPUT_TYPE.has(field.fieldConfig.fieldControl ?? "")) return getPrimaryFieldComponent(field);
        if (field.outputType === "array") return getArrayOutputTypeComponent(field);
        if (field.outputType === "object" && !EXCLUDED_OUTPUT_TYPE.has(field.fieldConfig.fieldControl ?? "")) return getObjectOutputTypeComponent(field);
        return getPrimaryFieldComponent(field);
    };

    const fieldWrapper: string = field.fieldConfig.fieldWrapper ?? "FragmentWrapper";
    const wrapperProps: Record<string, unknown> = field.fieldConfig.wrapperProps ?? {};
    const WrapperComponent: React.ElementType = !["TableWrapper", "SequenceWrapper"].includes(fieldWrapper)
        ? (wrapperComponent[fieldWrapper] ?? FragmentWrapper)
        : FragmentWrapper;

    const FieldComponent = useMemo(() => {
        return getFieldComponents(field);
    }, [field, isDisabled, name]);

    if (invisible) {
        return null;
    }

    return (
        <WrapperComponent {...wrapperProps} field={field} path={path}>
            {FieldComponent}
        </WrapperComponent>
    );
};

const arePropsEqual = (
    prev: IBuilderFieldProps,
    next: IBuilderFieldProps
): boolean => {
    if (prev.id !== next.id) return false;

    const isSamePath =
        prev.path.length === next.path.length &&
        prev.path.every((segment, i) => segment === next.path[i]);

    const isSameField =
        prev.field === next.field ||
        (prev.field.outputType === next.field.outputType &&
            prev.field.fieldConfig === next.field.fieldConfig);

    return isSamePath && isSameField;
};

BuilderField.displayName = "BuilderField";

export default memo(BuilderField, arePropsEqual);