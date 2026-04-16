"use client";

import { Trash2, Upload as UploadIcon } from "lucide-react";
import * as React from "react";
import type { UseUploadOptions, UseUploadReturn } from "../../hooks/use-upload";
import { useUpload } from "../../hooks/use-upload";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

type UploadContextValue = UseUploadReturn & {
    accept: string;
    maxSize: number;
    multiple: boolean;
};

const UploadContext = React.createContext<UploadContextValue | null>(null);

function useUploadContext(componentName: string): UploadContextValue {
    const ctx = React.useContext(UploadContext);
    if (!ctx) {
        throw new Error(`<${componentName}> must be used within <Upload>`);
    }
    return ctx;
}

interface UploadProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "onDragOver">,
    UseUploadOptions {
    /** Controlled files (optional). If omitted, state is internal. */
    files?: File[];
    /** Called whenever the file list changes */
    onFilesChange?: (files: File[]) => void;
}

const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
    (
        {
            className,
            children,
            maxSize = 4 * 1024 * 1024,
            accept = "image/*",
            multiple = true,
            onFileAccepted,
            onFileRejected,
            onFilesChange,
            ...rest
        },
        ref,
    ) => {
        const upload = useUpload({ maxSize, accept, multiple, onFileAccepted, onFileRejected });

        // Notify parent of file list changes
        React.useEffect(() => {
            onFilesChange?.(upload.uploadedFiles);
        }, [upload.uploadedFiles, onFilesChange]);

        const value = React.useMemo<UploadContextValue>(
            () => ({ ...upload, accept, maxSize, multiple }),
            [upload, accept, maxSize, multiple],
        );

        return (
            <UploadContext.Provider value={value}>
                <div ref={ref} className={cn("flex flex-col", className)} {...rest}>
                    {children}
                </div>
            </UploadContext.Provider>
        );
    },
);
Upload.displayName = "Upload";

// ─── Dropzone ────────────────────────────────────────────────────────────

interface UploadDropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    /** Override primary text */
    title?: React.ReactNode;
    /** Override secondary/helper text */
    description?: React.ReactNode;
    /** Custom icon (defaults to Upload icon) */
    icon?: React.ReactNode;
}

const UploadDropzone = React.forwardRef<HTMLDivElement, UploadDropzoneProps>(
    ({ className, title, description, icon, ...props }, ref) => {
        const {
            fileInputRef,
            handleBoxClick,
            handleDragOver,
            handleDrop,
            handleInputChange,
            accept,
            maxSize,
            multiple,
        } = useUploadContext("Upload.Dropzone");

        const maxSizeMB = Math.round(maxSize / (1024 * 1024));

        return (
            <div className={cn("", className)} {...props}>
                <div
                    ref={ref}
                    role="button"
                    tabIndex={0}
                    className={cn(
                        "border-2 border-dashed border-border rounded-md p-8",
                        "flex flex-col items-center justify-center text-center cursor-pointer",
                        "hover:border-primary/50 hover:bg-muted/30 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    onClick={handleBoxClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleBoxClick();
                        }
                    }}
                >
                    <div className="mb-2 bg-muted rounded-full p-3">
                        {icon ?? <UploadIcon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {title ?? "Upload a project image"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {description ?? (
                            <>
                                or,{" "}
                                <span className="text-primary hover:text-primary/90 font-medium">
                                    click to browse
                                </span>{" "}
                                ({maxSizeMB}MB max)
                            </>
                        )}
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        );
    },
);
UploadDropzone.displayName = "Upload.Dropzone";

interface UploadFileListProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Render prop for full custom item rendering */
    renderItem?: (file: File, progress: number) => React.ReactNode;
    /** Message shown when no files */
    emptyState?: React.ReactNode;
}

const UploadFileList = React.forwardRef<HTMLDivElement, UploadFileListProps>(
    ({ className, renderItem, emptyState = null, ...props }, ref) => {
        const { uploadedFiles, fileProgresses } = useUploadContext("Upload.FileList");

        if (uploadedFiles.length === 0) {
            return emptyState ? <>{emptyState}</> : null;
        }

        return (
            <div
                ref={ref}
                className={cn("pb-5 space-y-3 mt-4", className)}
                {...props}
            >
                {uploadedFiles.map((file, index) =>
                    renderItem ? (
                        <React.Fragment key={file.name + index}>
                            {renderItem(file, fileProgresses[file.name] ?? 0)}
                        </React.Fragment>
                    ) : (
                        <UploadFileItem
                            key={file.name + index}
                            file={file}
                            progress={fileProgresses[file.name] ?? 0}
                        />
                    ),
                )}
            </div>
        );
    },
);
UploadFileList.displayName = "Upload.FileList";

interface UploadFileItemProps extends React.HTMLAttributes<HTMLDivElement> {
    file: File;
    progress: number;
}

const UploadFileItem = React.forwardRef<HTMLDivElement, UploadFileItemProps>(
    ({ className, file, progress, ...props }, ref) => {
        const { removeFile } = useUploadContext("Upload.FileItem");
        const imageUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

        React.useEffect(() => {
            return () => URL.revokeObjectURL(imageUrl);
        }, [imageUrl]);

        const isImage = file.type.startsWith("image/");

        return (
            <div
                ref={ref}
                className={cn(
                    "border border-border rounded-lg p-2 flex flex-col",
                    className,
                )}
                {...props}
            >
                <div className="flex items-center gap-2">
                    <div className="w-18 h-14 bg-muted rounded-sm flex items-center justify-center self-start overflow-hidden shrink-0">
                        {isImage ? (
                            <img
                                src={imageUrl}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-muted-foreground uppercase">
                                {file.name.split(".").pop()}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 pr-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm text-foreground truncate">
                                    {file.name}
                                </span>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-transparent! hover:text-red-500 shrink-0 cursor-pointer"
                                onClick={() => removeFile(file.name)}
                                aria-label={`Remove ${file.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress || 0}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {Math.round(progress || 0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);
UploadFileItem.displayName = "Upload.FileItem";

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export {
    Upload,
    UploadDropzone, UploadFileItem, UploadFileList
};

export type {
    UploadDropzoneProps, UploadFileItemProps, UploadFileListProps, UploadProps
};

