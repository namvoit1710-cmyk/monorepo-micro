import JsonView from "@/components/json-view/json-view"
import type { IScopedVariable } from "@/features/workflows/types/node-detail"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@ldc/ui/components/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ldc/ui/components/collapsible"
import { ChevronDown, Download, File, FileSpreadsheet, FileText } from "lucide-react"
import { useState } from "react"

interface ArtifactItemProps {
    paths: IScopedVariable["paths"]
    enableDragKey?: boolean
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

interface ArtifactSample {
    file_id: string
    filename: string
    content_type: string
    size_bytes: number
    produced_by_node: string
    produced_by_task: string
    registered_at: string
}

const ArtifactItem = ({ paths, enableDragKey }: ArtifactItemProps) => {
    const { t } = useLanguage()
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

    // Format file size
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    const handleDownloadArtifact = async (fileId: string) => {
        setDownloadingFileId(fileId)
        try {
            // TODO: Implement actual download logic
            console.log('Downloading artifact:', fileId)
            // Example: await downloadArtifact(fileId)
        } catch (error) {
            console.error('Failed to download artifact:', error)
        } finally {
            setDownloadingFileId(null)
        }
    }

    // Filter only file_ref artifacts
    const fileArtifacts = Object.entries(paths).filter(
        ([_, pathData]) => pathData.kind === 'file_ref'
    )

    // If no file artifacts, show empty state
    if (fileArtifacts.length === 0) {
        return (
            <span className="text-sm text-gray-500 text-center block">
                {t("nodes.nodes_popup_no_artifacts")}
            </span>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <ArtifactCard
                pathData={paths}
                onDownload={handleDownloadArtifact}
                formatBytes={formatBytes}
            />
        </div>
    )
}

interface ArtifactCardProps {
    pathData: IScopedVariable["paths"]
    onDownload: (fileId: string) => void
    formatBytes: (bytes: number) => string
}

const ArtifactCard = ({ pathData, onDownload, formatBytes }: ArtifactCardProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const fileRef = Object.values(pathData).find(data => data.kind === 'file_ref')?.sample as ArtifactSample | undefined
    const sampleData = Object.entries(pathData).filter(([_, data]) => data.kind !== 'file_ref').reduce((acc, [key, data]) => {
        return { ...acc, [key]: data.sample }
    }, {})
    const hasPreviewData = !!sampleData

    console.log(pathData, fileRef, sampleData);

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            <div className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3 flex-1 truncate">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                            <ArtifactIcon contentType={fileRef?.content_type ?? ''} className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {fileRef?.filename}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{fileRef?.content_type}</span>
                                {fileRef?.size_bytes && (
                                    <>
                                        <span>•</span>
                                        <span>{formatBytes(fileRef.size_bytes)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => fileRef?.file_id && onDownload(fileRef.file_id)}
                        >
                            <Download className="size-4" strokeWidth={1.5} />
                        </Button>

                        {hasPreviewData && (
                            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                    >
                                        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                </CollapsibleTrigger>
                            </Collapsible>
                        )}
                    </div>
                </div>
            </div>

            {hasPreviewData && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent>
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <JsonView
                                value={sampleData}
                                draggableKeys
                                raw={pathData}
                                replacePathKey="displayPath"
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    )
}

export default ArtifactItem
