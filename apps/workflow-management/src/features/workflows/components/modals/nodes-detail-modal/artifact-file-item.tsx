import { IWorkflowArtifact } from "@/features/workflows/types/workflows"
import { File, FileSpreadsheet, FileText } from "lucide-react"

interface ArtifactFileItemProps {
    artifact: IWorkflowArtifact
    isDownloading: boolean
    onDownload: (artifact: IWorkflowArtifact) => void
}

interface ArtifactIconProps {
    contentType: string
    className?: string
}

const ArtifactIcon = ({ contentType, className }: ArtifactIconProps) => {
    if (contentType.includes("csv") || contentType.includes("spreadsheet")) {
        return <FileSpreadsheet className={className} />
    }
    if (contentType.includes("text")) {
        return <FileText className={className} />
    }
    return <File className={className} />
}

const ArtifactFileItem = ({ artifact, isDownloading, onDownload }: ArtifactFileItemProps) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 flex-1">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <ArtifactIcon contentType={artifact.content_type} className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                            {artifact.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="capitalize">{artifact.artifact_type}</span>
                            <span>•</span>
                            <span>{artifact.content_type}</span>
                        </div>
                    </div>
                </div>

                {/* <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={isDownloading}
                    onClick={() => onDownload(artifact)}
                    className="shrink-0"
                >
                    <Download className="size-4" strokeWidth={1.5} />
                </Button> */}
            </div>
        </div>
    )
}

export default ArtifactFileItem
