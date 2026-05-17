import type { JSX } from "react";
import { memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useBuilderContext } from "../../contexts/builder.context";
import type { SlotEntry } from "../../contexts/slot.context";
import { SlotProvider } from "../../contexts/slot.context";
import { useCheckCondition } from "../../hooks/use-check-condittion";
import type { IField, IFieldComponent, IWrapperComponent } from "../../types/schema";
import FragmentWrapper from "../field-wrapper/fragment-wrapper";
import OdataWrapper from "../field-wrapper/odata-wrapper/components/odata-wrapper";
import TableWrapper from "../field-wrapper/table-wrapper/table-wrapper";
import BuilderArrayField from "./builder-array-field";
import BuilderObjectField from "./builder-object-field";

interface IBuilderFieldProps {
    field: IField;
    path: string[];
    id?: string;
}

const EXCLUDED_OUTPUT_TYPE = new Set(["SingleUploadControl", "SingleUploadFileControl", "FieldMappingControlBase", "MultipleComboBoxControl", "SingleUploadFieldMappingControl"]);

const BuilderField = (props: IBuilderFieldProps) => {
    const { field, path } = props;
    const { wrapperComponent, fieldComponent, onFormActions } = useBuilderContext();
    const { control } = useFormContext();
    const { isDisabled, invisible } = useCheckCondition(field, path);

    const name: string = useMemo(() => path.join("."), [path]);

    const { slots } = useMemo(() => {
        const subFields = field.fields ?? [];
        const main: IField[] = [];
        const slotMap: Record<string, SlotEntry[]> = {};

        for (const f of subFields) {
            if (f.fieldConfig.slot) {
                const slotName = f.fieldConfig.slot;
                if (!slotMap[slotName]) slotMap[slotName] = [];
                slotMap[slotName].push({ field: f, path: [...path, f.key] });
            } else {
                main.push(f);
            }
        }

        return { mainFields: main, slots: slotMap };
    }, [field.fields, path]);

    const getPrimaryFieldComponent = (field: IField) => {
        const fieldControl: IFieldComponent = field?.fieldConfig?.fieldControl;
        const controlProps: Record<string, any> = field?.fieldConfig?.controlProps || {};
        const componentKey = typeof fieldControl === "string" ? fieldControl : undefined;
        const Component: React.ElementType | null | undefined = componentKey ? fieldComponent?.[componentKey] : undefined;

        if (fieldControl === "ButtonControl") {
            return Component ? <Component {...controlProps} field={field} /> : <span />;
        }

        return Component ? (
            <Controller
                name={name}
                control={control}
                defaultValue={controlProps?.value}
                render={({ field: controllerField, fieldState }) => (
                    <Component
                        {...controlProps}
                        {...controllerField}
                        {...fieldState}
                        onFormActions={onFormActions}
                        disabled={isDisabled || controlProps?.disabled}
                    />
                )}
            />
        ) : (
            <span />
        );
    };

    const getArrayOutputTypeComponent = (field: IField): JSX.Element => {
        switch (field?.fieldConfig?.fieldWrapper) {
            case "TableWrapper":
                return <TableWrapper field={field} path={path} />;
            case "OdataWrapper":
                return <OdataWrapper field={field} path={path} />;
            default:
                return <BuilderArrayField field={field} path={path} />;
        }
    };

    const getObjectOutputTypeComponent = (field: IField): JSX.Element => {
        switch (field?.fieldConfig?.fieldWrapper) {
            default:
                return <BuilderObjectField field={field} path={path} />;
        }
    };

    const getFieldComponents = (field: IField): JSX.Element => {
        if (EXCLUDED_OUTPUT_TYPE.has(field?.fieldConfig?.fieldControl)) return getPrimaryFieldComponent(field);
        if (field.outputType === "array") return getArrayOutputTypeComponent(field);
        if (field.outputType === "object" && !EXCLUDED_OUTPUT_TYPE.has(field?.fieldConfig?.fieldControl)) return getObjectOutputTypeComponent(field);
        return getPrimaryFieldComponent(field);
    };

    const fieldWrapper: IWrapperComponent = field?.fieldConfig?.fieldWrapper;
    const wrapperProps: Record<string, any> = field?.fieldConfig?.wrapperProps || {};
    const WrapperComponent: React.ElementType = ["TableWrapper", "OdataWrapper"].includes(fieldWrapper)
        ? (wrapperComponent?.[fieldWrapper] || FragmentWrapper)
        : FragmentWrapper;

    const FieldComponent = useMemo(() => {
        return getFieldComponents(field);
    }, [field, isDisabled, name]);

    if (invisible) {
        return null;
    }

    return (
        <SlotProvider value={{ slots }}>
            <WrapperComponent {...wrapperProps} field={field} path={path}>
                {FieldComponent}
            </WrapperComponent>
        </SlotProvider>
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
        (prev.field?.outputType === next.field?.outputType &&
            prev.field?.fieldConfig === next.field?.fieldConfig);

    return isSamePath && isSameField;
};

BuilderField.displayName = "BuilderField";

export default memo(BuilderField, arePropsEqual);
