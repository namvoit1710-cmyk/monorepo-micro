import { cn } from "@ldc/ui";
import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState } from "react";
import type { FieldComponentProps } from "../../types/schema";

export interface LdcCodeEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    value?: string;
    onChange?: (value: string) => void;
    language: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    minHeight?: number;
    maxHeight?: number;
    className?: string;
    dark?: boolean;
}

const LdcCodeEditor = forwardRef<HTMLDivElement, LdcCodeEditorProps>(({
    value = "",
    onChange,
    language = "javascript",
    placeholder = "Write your code here…",
    disabled = false,
    readOnly = false,
    minHeight = 160,
    maxHeight = 480,
    className = "",
    dark = false,
}, ref) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [editorHeight, setEditorHeight] = useState<number>(minHeight);
    const editorRef = useRef<any>(null);

    const showPlaceholder = !value && !isFocused;

    function handleMount(editor: any, monaco: any) {
        editorRef.current = editor;

        editor.getDomNode()?.style.setProperty("outline", "none");

        editor.onDidFocusEditorText(() => setIsFocused(true));
        editor.onDidBlurEditorText(() => setIsFocused(false));

        editor.onDidContentSizeChange(() => {
            const contentHeight = Math.min(
                maxHeight,
                Math.max(minHeight, editor.getContentHeight())
            );
            setEditorHeight(contentHeight);
        });

        monaco.editor.defineTheme("shadcn-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#ffffff",
                "editor.foreground": "#09090b",
                "editorLineNumber.foreground": "#a1a1aa",
                "editorLineNumber.activeForeground": "#71717a",
                "editor.selectionBackground": "#f4f4f5",
                "editor.inactiveSelectionBackground": "#f4f4f580",
                "editorCursor.foreground": "#09090b",
                "editorIndentGuide.background": "#f4f4f5",
                "editorIndentGuide.activeBackground": "#e4e4e7",
                "editor.lineHighlightBackground": "#fafafa",
                "editorGutter.background": "#ffffff",
                "scrollbarSlider.background": "#e4e4e780",
                "scrollbarSlider.hoverBackground": "#d4d4d8",
            },
        });

        monaco.editor.defineTheme("shadcn-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#09090b",
                "editor.foreground": "#fafafa",
                "editorLineNumber.foreground": "#52525b",
                "editorLineNumber.activeForeground": "#a1a1aa",
                "editor.selectionBackground": "#27272a",
                "editor.inactiveSelectionBackground": "#27272a80",
                "editorCursor.foreground": "#fafafa",
                "editorIndentGuide.background": "#27272a",
                "editorIndentGuide.activeBackground": "#3f3f46",
                "editor.lineHighlightBackground": "#18181b",
                "editorGutter.background": "#09090b",
                "scrollbarSlider.background": "#27272a80",
                "scrollbarSlider.hoverBackground": "#3f3f46",
            },
        });

        monaco.editor.setTheme(dark ? "shadcn-dark" : "shadcn-light");

        editor.updateOptions({
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
        });

        setTimeout(() => {
            editor.getAction("editor.action.formatDocument").run();
        }, 100);

        const editorContainer = editor.getContainerDomNode();

        editorContainer.addEventListener("dragover", (e: any) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });

        editorContainer.addEventListener("drop", (e: any) => {
            e.preventDefault();

            const textToInsert = e.dataTransfer.getData("text/plain");

            if (textToInsert) {
                const target = editor.getTargetAtClientPoint(e.clientX, e.clientY);

                if (target?.position) {
                    const position = target.position;

                    editor.setPosition(position);
                    editor.focus();

                    editor.executeEdits("dnd-drop", [
                        {
                            range: new monaco.Range(
                                position.lineNumber,
                                position.column,
                                position.lineNumber,
                                position.column
                            ),
                            text: `"${textToInsert}"`,
                            forceMoveMarkers: true
                        },
                    ]);

                    editor.trigger("dnd-drop", "editor.action.formatDocument");
                }
            }
        });
    }

    return (
        <div ref={ref} className={`flex flex-col gap-1.5 w-full ${className}`}>
            <div
                className={cn(
                    "relative rounded-lg border overflow-hidden",
                    "transition-[border-color,box-shadow] duration-150",
                    "bg-background dark:bg-input/30",
                    isFocused
                        ? "border-ring ring-3 ring-ring/50"
                        : "border-input",
                    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive aria-invalid:ring-3",
                    "dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50",
                    "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:bg-input/50",
                    "dark:aria-disabled:bg-input/80",
                )}
                aria-disabled={disabled}
            >
                {showPlaceholder && (
                    <div
                        className={cn(
                            "absolute top-2 left-2 z-10 pointer-events-none",
                            "text-xs leading-[21px] whitespace-pre font-mono",
                            "text-muted-foreground",
                        )}
                    >
                        {placeholder}
                    </div>
                )}

                <div
                    className={cn(
                        "absolute top-1.5 right-2 z-20",
                        "px-1.5 py-px rounded text-[11px] font-medium",
                        "tracking-wide uppercase select-none",
                        "bg-muted text-muted-foreground"
                    )}
                >
                    {language}
                </div>

                <Editor
                    height={editorHeight}
                    language={language}
                    value={value}
                    onChange={(val) => onChange?.(val ?? "")}
                    onMount={handleMount}
                    theme={dark ? "shadcn-dark" : "shadcn-light"}
                    options={{
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        lineNumbersMinChars: 0,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        fontSize: 13,
                        tabSize: 2,
                        insertSpaces: true,
                        renderLineHighlight: "line",
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        padding: { top: 8, bottom: 8 },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            vertical: "auto",
                            horizontal: "hidden",
                            verticalScrollbarSize: 6,
                            useShadows: false,
                        },
                        lineDecorationsWidth: 0,
                        automaticLayout: true,
                        readOnly,
                        domReadOnly: readOnly,
                        contextmenu: !readOnly,

                        folding: true,
                        foldingHighlight: true,
                        glyphMargin: false,
                        showFoldingControls: "mouseover",
                    }}
                />
            </div>
        </div>
    );
});

LdcCodeEditor.displayName = "LdcCodeEditor";

export interface ICodeControlProps extends FieldComponentProps {
    language?: string;
}

const CodeControl = forwardRef<HTMLDivElement, ICodeControlProps>(
    (props, ref) => {
        const { language = "json", value, onChange, error, ...rest } = props;

        return (
            <LdcCodeEditor ref={ref} language={language} value={value} onChange={onChange} {...rest} aria-invalid={!!error} />
        )
    });

CodeControl.displayName = "CodeControl";

export { CodeControl };

export default LdcCodeEditor;
