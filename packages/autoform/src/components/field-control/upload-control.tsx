import { Upload, UploadDropzone, UploadFileList } from "@ldc/ui/components/upload";
import type { FieldComponentProps } from "../../types/schema";

interface FileType {
    name: string,
    size: number,
    type: string,
}

export interface IUploadControlProps extends FieldComponentProps {
    value?: (File | FileType)[]
    onChange?: (files: File[]) => void
}

const UploadControl = (props: IUploadControlProps) => {
    const { value, onChange, field: _field, ...rest } = props

    const initialFiles = (value ?? []).map(file => {
        if (file instanceof File) {
            return file
        } else {
            const blob = new Blob([], { type: file.type })
            return new File([blob], file.name, { type: file.type, lastModified: Date.now() })
        }
    })

    return (
        <Upload
            {...rest}
            files={initialFiles}
            onFilesChange={onChange}
        >
            <UploadDropzone />
            <UploadFileList />
        </Upload>
    )
}

export default UploadControl