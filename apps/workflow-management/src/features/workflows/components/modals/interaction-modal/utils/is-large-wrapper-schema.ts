import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";

export function isLargeWrapperSchema(fields: IField[]): boolean {
    if (!fields || !Array.isArray(fields)) return false;

    for (const field of fields) {
        const fieldWrapper = field?.fieldConfig?.fieldWrapper;
        const fieldControl = field?.fieldConfig?.fieldControl;

        if (fieldWrapper === "TableWrapper" || fieldWrapper === "OdataWrapper" || fieldControl === "SingleUploadFieldMappingControl") {
            return true;
        }

        if (field.fields?.length) {
            if (isLargeWrapperSchema(field.fields)) return true;
        }
    }

    return false;
}