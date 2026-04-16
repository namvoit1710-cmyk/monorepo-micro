import type { IField } from "../../types/schema";
import BuilderField from "./builder-field";

export interface IBuilderObjectFieldProps {
    field: IField;
    path: string[];
}

const BuilderObjectField = (props: IBuilderObjectFieldProps) => {
    const { field, path } = props;
    const hasSchema: boolean = !!field.fields && field.fields.length > 0;

    console.log(`Rendering BuilderObjectField for field: ${field.key}, hasSchema: ${hasSchema}, subFields:`, field.fields);

    return (
        <>
            {hasSchema &&
                field.fields?.map((subField: IField) => (
                    <BuilderField
                        key={`${path.join(".")}.${subField.key}`}
                        field={subField}
                        path={[...path, subField.key]}
                    />
                ))}
        </>
    );
};

export default BuilderObjectField;
