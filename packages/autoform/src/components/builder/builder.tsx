import { zodResolver } from "@hookform/resolvers/zod";
import type {
    ComponentType
} from "react";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import type {
    FieldValues
} from "react-hook-form";
import {
    FormProvider, useForm,
    useFormState, useWatch,
} from "react-hook-form";
import { BuilderProvider } from "../../contexts/builder.context";
import type { FieldComponentProps, IField, ISchema } from "../../types/schema";
import { getDefaultValues } from "../../utils/helpers";
import { createZodSchema } from "../../utils/validation";
import { FieldControl } from "../field-control";
import { FieldWrapper } from "../field-wrapper";
import BuilderField from "./builder-field";

interface IBuilderProps {
    schema: ISchema;
    defaultValues?: FieldValues;

    fieldControl?: Record<string, ComponentType<FieldComponentProps> | null>;
    fieldWrapper?: Record<string, ComponentType<FieldComponentProps> | null>;

    onSubmit?: (values: FieldValues) => void;
    onValuesChange?: (values: FieldValues) => void;
    onValidChange?: (isValid: boolean) => void;
    onFormActions?: (action: string, payload?: Record<string, unknown>) => Promise<void> | void | Record<string, unknown> | null;
}

export interface BuilderRef {
    getPreviousValues: () => FieldValues;
    setPreviousValues: (values: FieldValues) => void;
    getValues?: () => void;
    onSubmit: () => void;
    getMethods: () => ReturnType<typeof useForm>;
    setRefresh: () => void;
}

const Builder = forwardRef<BuilderRef, IBuilderProps>((props, ref) => {
    const {
        defaultValues,
        schema,

        fieldControl: customFieldControl = {},
        fieldWrapper: customFieldWrapper = {},

        onSubmit,
        onValuesChange,
        onValidChange,
        onFormActions
    } = props;
    const [previousValues, setPreviousValues] = useState<FieldValues>({});
    const [refresh, setRefresh] = useState(false);

    const zodSchema = useMemo(
        () => createZodSchema(schema.fields),
        [schema.fields]
    );

    const methods = useForm({
        defaultValues: defaultValues ?? getDefaultValues(schema.fields),
        mode: "onChange",
        resolver: zodResolver(zodSchema)
    });

    const formValues: FieldValues = useWatch({ control: methods.control });
    const { isValid } = useFormState({ control: methods.control });

    useImperativeHandle(ref, () => ({
        onSubmit: methods.handleSubmit(onSubmit ?? (() => null)),
        getValues: () => methods.getValues(),
        getPreviousValues: () => { return previousValues },
        setPreviousValues: (values: FieldValues) => { setPreviousValues(values) },
        getMethods: () => { return methods },
        setRefresh: () => {
            setRefresh(true);
            setTimeout(() => setRefresh(false), 500);
        }
    }));

    useEffect(() => onValuesChange?.(formValues), [formValues]);
    useEffect(() => onValidChange?.(isValid), [isValid]);

    return (
        <FormProvider {...methods}>
            <BuilderProvider
                value={{
                    schema,
                    refresh,
                    setRefresh,
                    onFormActions: onFormActions,
                    wrapperComponent: {
                        ...customFieldWrapper,
                        ...FieldWrapper,
                    },
                    fieldComponent: {
                        ...customFieldControl,
                        ...FieldControl,
                    },
                }}
            >
                {schema.fields.map((field: IField) => {
                    return (
                        <BuilderField
                            key={field.key}
                            field={field}
                            path={[field.key]}
                        />
                    );
                })}
            </BuilderProvider>
        </FormProvider>
    );
});

Builder.displayName = "Builder";

export default Builder;
