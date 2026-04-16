import type { IField } from "../types/schema";

export function getDefaultValues(
    fields: IField[] = []
): Record<string, unknown> {
    return fields.reduce<Record<string, unknown>>((acc, field) => {
        const { key, outputType, default: defaultVal, fields: children } = field;

        if (outputType === "object") {
            acc[key] = defaultVal ?? getDefaultValues(children ?? []);
        }
        else if (outputType === "array" && defaultVal) {
            acc[key] = defaultVal;
        }
        else if (defaultVal) {
            acc[key] = defaultVal;
        }

        return acc;
    }, {});
}