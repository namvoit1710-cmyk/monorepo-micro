import { cn } from "@common/lib/utils";
import { useRef } from "react";
import { ClassicScheme } from "rete-react-plugin";
import { IEditorNode } from "../../types";

type NodeExtraData = { width?: number; height?: number };

type Props<S extends ClassicScheme> = {
    data: S["Node"] & NodeExtraData & { original: IEditorNode };
    styles?: () => any;
};

const GroupNodes = (props: Props<ClassicScheme>) => {
    const { data } = props;
    const { original } = data;

    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            data-groupid={data.id}
            className={cn(
                "border border-dashed border-gray-400 rounded-lg",
                "p-1"
            )}
            {...props}
        >
            <div
                className="text-sm text-muted"
                data-testid="title"
            >
                {original?.title ?? original?.name ?? data.label}
            </div>
        </div>
    )
}

export default GroupNodes;