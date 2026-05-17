import { useState } from "react"

export const useDownloadArtifact = () => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    // const downloadArtifact = useCallback(async (artifact: IWorkflowArtifact) => {
    //     if (!artifact.file_id) {
    //         toast.error("Download failed", "This artifact is missing a file reference.")
    //         return
    //     }

    //     setDownloadingId(artifact.file_id)

    //     try {
    //         // const fileResponse = await axios.get<Blob>(
    //         //     `${import.meta.env.VITE_URL_FILE_SERVICE}/api/v1/${artifact.links.data}`,
    //         //     {
    //         //         responseType: "blob",
    //         //     }
    //         // )

    //         const fileResponse = await getFileById(artifact.file_id)
    //         console.log("File response:", fileResponse)

    //         return;
    //         const blobUrl = window.URL.createObjectURL(fileResponse.data)
    //         const link = document.createElement("a")

    //         link.href = blobUrl
    //         link.download = artifact.name || `artifact-${artifact.file_id}`

    //         document.body.appendChild(link)
    //         link.click()
    //         link.remove()
    //         window.URL.revokeObjectURL(blobUrl)
    //     } catch (error) {
    //         toast.error("Download failed", `Unable to download ${artifact.name || "artifact"}.`)
    //     } finally {
    //         setDownloadingId(null)
    //     }
    // }, [])

    return {
        downloadArtifact: () => null,
        downloadingId,
        isDownloading: (fileId: string) => downloadingId === fileId
    }
}
