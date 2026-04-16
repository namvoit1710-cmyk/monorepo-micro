import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { EShowWhenOperator } from "../types/condition";
import type { IField } from "../types/schema";

const evaluateCondition = (watchValue: unknown, operator: EShowWhenOperator, conditionValue: unknown): boolean => {
    switch (operator) {
        case EShowWhenOperator.Equals:
            return watchValue === conditionValue;
        case EShowWhenOperator.NotEquals:
            return watchValue !== conditionValue;
        case EShowWhenOperator.Exists:
            return !!watchValue;
        case EShowWhenOperator.NotExists:
            return !watchValue;
        case EShowWhenOperator.GreaterThan:
            return Number(watchValue) > Number(conditionValue);
        case EShowWhenOperator.LessThan:
            return Number(watchValue) < Number(conditionValue);
        case EShowWhenOperator.GreaterOrEqual:
            return Number(watchValue) >= Number(conditionValue);
        case EShowWhenOperator.LessOrEqual:
            return Number(watchValue) <= Number(conditionValue);
        case EShowWhenOperator.Contains:
            return (typeof watchValue === "string" || Array.isArray(watchValue))
                ? watchValue.includes(conditionValue as string)
                : false;
        case EShowWhenOperator.In:
            return Array.isArray(conditionValue)
                ? conditionValue.includes(watchValue)
                : false;
        default:
            return false;
    }
}

const useCheckCondition = (field: IField, path: string[]) => {
    const { control } = useFormContext();

    const parentPath = useMemo(() => path.slice(0, -1), [path]);
    const watchValue = useWatch({
        control,
        name: `${parentPath.join(".")}.${field.fieldConfig.condition?.fieldKey}`,
    });

    const isDisabled: boolean = useMemo(() => {
        if (field.fieldConfig.condition?.action !== "disabled") return false;

        return evaluateCondition(
            watchValue,
            field.fieldConfig.condition.operator ?? EShowWhenOperator.Equals,
            field.fieldConfig.condition.conditionValue
        );
    }, [watchValue]);

    const invisible: boolean = useMemo(() => {
        if (field.fieldConfig.condition?.action !== "invisible") return false;

        return evaluateCondition(
            watchValue,
            field.fieldConfig.condition.operator ?? EShowWhenOperator.Equals,
            field.fieldConfig.condition.conditionValue
        );
    }, [watchValue]);

    return { isDisabled, invisible };
}

export { useCheckCondition };

