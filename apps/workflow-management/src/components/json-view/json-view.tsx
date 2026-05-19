import { cn } from "@ldc/ui";
import UiwJsonView from "@uiw/react-json-view";

interface IJsonViewProps {
    value: object;
    prefix?: string;
    className?: string;
    enableClipboard?: boolean;
    draggableKeys?: boolean;
    onKeyDragStart?: (keyPath: string, keyName: string | number) => void;
    collapsed?: boolean | number;
    displayDataTypes?: boolean;
    displayObjectSize?: boolean;
    raw?: object;
    replacePathKey?: string;
}

const JsonView = ({
    value,
    className,
    prefix,
    raw,
    replacePathKey,
    enableClipboard = false,
    draggableKeys = false,
    onKeyDragStart,
    collapsed,
    displayDataTypes = false,
    displayObjectSize = false,
}: IJsonViewProps) => {
    return (
        <UiwJsonView
            value={value}
            enableClipboard={enableClipboard}
            collapsed={collapsed}
            displayDataTypes={displayDataTypes}
            displayObjectSize={displayObjectSize}
            className={cn("text-sm", draggableKeys && "[&_.w-rjv-line]:my-1", className)}
        >
            <UiwJsonView.KeyName
                render={(props, result) => (
                    <span
                        {...props}
                        draggable={!!draggableKeys}
                        onDragStart={(e) => {
                            console.log("drag start", raw, replacePathKey)
                            const path = (() => {
                                if (replacePathKey && raw) {
                                    return raw[result.keyName as keyof typeof raw][replacePathKey];
                                }

                                return Array.isArray(result.keys)
                                    ? result.keys.join(".")
                                    : String(result.keyName);
                            })()

                            const validValue = (() => {
                                if (replacePathKey && raw) {
                                    return path
                                }

                                return prefix ? prefix.replace("#path", path) : `{{$${path}}}`
                            })();

                            e.dataTransfer.setData("text/plain", `${validValue}`);
                            onKeyDragStart?.(validValue, result.keyName!);
                        }}
                        className={cn(
                            props.className,
                            draggableKeys &&
                            "cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 transition-all duration-150",
                            draggableKeys && "hover:bg-blue-100 hover:border-blue-400 hover:shadow-sm",
                            !draggableKeys && "px-1 py-0.5 rounded transition-colors duration-100",
                        )}
                    >
                        {result.keyName}
                    </span>
                )}
            />
        </UiwJsonView>
    );
};

export default JsonView;