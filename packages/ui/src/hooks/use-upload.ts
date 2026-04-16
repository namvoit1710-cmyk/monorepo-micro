import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useRef, useState } from "react";

export interface UseUploadOptions {
    /** Max file size in bytes. Default: 4MB */
    maxSize?: number;
    /** Accepted MIME types, e.g. "image/*". Default: "image/*" */
    accept?: string;
    /** Allow multiple file selection. Default: true */
    multiple?: boolean;
    /** Callback after a file is accepted (post-validation) */
    onFileAccepted?: (file: File) => void;
    /** Callback when a file is rejected (size/type) */
    onFileRejected?: (file: File, reason: "size" | "type") => void;
}

export interface UseUploadReturn {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    uploadedFiles: File[];
    fileProgresses: Record<string, number>;
    handleBoxClick: () => void;
    handleDragOver: (e: DragEvent) => void;
    handleDrop: (e: DragEvent) => void;
    handleFileSelect: (files: FileList | null) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeFile: (filename: string) => void;
    clearFiles: () => void;
}

const DEFAULT_MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
    const {
        maxSize = DEFAULT_MAX_SIZE,
        accept = "image/*",
        multiple = true,
        onFileAccepted,
        onFileRejected,
    } = options;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});

    const validateFile = useCallback(
        (file: File): "size" | "type" | null => {
            if (file.size > maxSize) return "size";
            if (accept !== "*" && !matchesAccept(file, accept)) return "type";
            return null;
        },
        [maxSize, accept],
    );

    const simulateProgress = useCallback((filename: string) => {
        // Replace with real upload logic (XHR / fetch progress).
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setFileProgresses((prev) => ({ ...prev, [filename]: progress }));
            if (progress >= 100) clearInterval(interval);
        }, 150);
    }, []);

    const handleFileSelect = useCallback(
        (files: FileList | null) => {
            if (!files?.length) return;

            const accepted: File[] = [];
            Array.from(files).forEach((file) => {
                const reason = validateFile(file);
                if (reason) {
                    onFileRejected?.(file, reason);
                    return;
                }
                accepted.push(file);
                onFileAccepted?.(file);
                simulateProgress(file.name);
            });

            setUploadedFiles((prev) => (multiple ? [...prev, ...accepted] : accepted));
        },
        [validateFile, multiple, onFileAccepted, onFileRejected, simulateProgress],
    );

    const handleBoxClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect],
    );

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            handleFileSelect(e.target.files);
            // Reset input so same file can be re-selected
            e.target.value = "";
        },
        [handleFileSelect],
    );

    const removeFile = useCallback((filename: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.name !== filename));
        setFileProgresses((prev) => {
            const { [filename]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const clearFiles = useCallback(() => {
        setUploadedFiles([]);
        setFileProgresses({});
    }, []);

    return {
        fileInputRef,
        uploadedFiles,
        fileProgresses,
        handleBoxClick,
        handleDragOver,
        handleDrop,
        handleFileSelect,
        handleInputChange,
        removeFile,
        clearFiles,
    };
}

function matchesAccept(file: File, accept: string): boolean {
    const types = accept.split(",").map((t) => t.trim());
    return types.some((type) => {
        if (type.endsWith("/*")) {
            const prefix = type.slice(0, -1); // "image/"
            return file.type.startsWith(prefix);
        }
        return file.type === type;
    });
}