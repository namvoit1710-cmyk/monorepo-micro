import { cn } from "@common/lib/utils";
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
}

const JsonView = ({
    value,
    className,
    prefix,
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
            className={cn("text-sm", className)}
        >
            <UiwJsonView.KeyName
                render={(props, result) => (
                    <span
                        {...props}
                        draggable={!!draggableKeys}
                        onDragStart={(e) => {
                            const path = Array.isArray(result.keys)
                                ? result.keys.join(".")
                                : String(result.keyName);

                            const validValue = prefix ? prefix.replace("#path", path) : `{{$${path}}}`;
                            e.dataTransfer.setData("text/plain", `${validValue}`);
                            onKeyDragStart?.(validValue, result.keyName);
                        }}
                        className={cn(
                            props.className,
                            draggableKeys && "cursor-pointer active:cursor-grabbing",
                            draggableKeys && "hover:bg-blue-50 hover:text-blue-700",
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