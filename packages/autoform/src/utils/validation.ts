import z from "zod";
import type { IField } from "../types/schema";
import type { IValidationRules } from "../types/validation";

type RuleHandler = (validator: any, rule: IValidationRules) => any;
interface RuleHandlersMap {
    required: RuleHandler;
    // Add other rule methods here as needed
}

const RULE_HANDLERS: RuleHandlersMap = {
    required: (validator: any, rule: IValidationRules) => {
        if (validator instanceof z.ZodString) {
            return validator.min(1, rule.message || "This field is required");
        }
        return validator.refine(
            (val: any) => {
                if (val === null || val === undefined) return false;
                if (typeof val === "string" && val.trim() === "") return false;
                if (Array.isArray(val) && val.length === 0) return false;
                return true;
            },
            { message: rule.message || "This field is required" }
        );
    }
};

export const createZodSchema = (schema: IField[] = []) => {
    const shape: Record<string, z.ZodTypeAny> = {};

    schema.forEach((field: IField) => {
        let validator: z.ZodTypeAny;

        switch (field.outputType) {
            case "array": {
                if (!field?.fields?.length) {
                    validator = z.any().nullable().optional();
                } else {
                    const subField = field.fields[0];
                    if (subField?.outputType === "object") {
                        validator = z.array(createZodSchema(subField.fields).loose());
                    } else {
                        validator = z.array(z.any());
                    }
                }
                break;
            }
            case "object":
                if (!field.fields?.length) {
                    validator = z.any().nullable().optional();
                } else {
                    validator = createZodSchema(field.fields).loose();
                }
                break;

            case "string":
            case "number":
            case "boolean":
            default:
                validator = z.any();
        }

        let hasRequired = false;

        if (field.fieldConfig.rules?.length) {
            field.fieldConfig.rules.forEach((rule: IValidationRules) => {
                const handler = RULE_HANDLERS[rule.method as keyof typeof RULE_HANDLERS];
                if (rule.method === "required") hasRequired = true;
                if (handler) validator = handler(validator, rule);
            });
        }

        if (!hasRequired) {
            validator = validator.nullable().optional();
        }

        shape[field.key] = validator;
    });

    return z.object(shape);
};