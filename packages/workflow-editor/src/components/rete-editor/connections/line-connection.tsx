import { Button } from "@ldc/ui/components/button";
import { TrashIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AreaPlugin } from "rete-area-plugin";
import { Presets } from "rete-react-plugin";
import type { BaseNode } from "../nodes/base-node";
import type { AreaExtra, Connection, EditorDirection, NodeExecutionStatus, Schemes } from "../types";
import { computeStepPath } from "./path-router";

const { useConnection } = Presets.classic;

const BUTTON_SIZE = 32;

function getMidpoint(pathEl: SVGPathElement): { x: number; y: number } {
    const totalLength = pathEl.getTotalLength();
    const pt = pathEl.getPointAtLength(totalLength / 2);
    return { x: pt.x, y: pt.y };
}

export function LineConnection({ data, area, direction, readOnly, ...props }: {
    area: AreaPlugin<Schemes, AreaExtra>
    data: Connection<BaseNode> & { isLoop?: boolean };
    styles?: () => any;
    onRemove?: (connectionId: string) => void;
    direction: EditorDirection;
    readOnly?: boolean;
}) {
    const { path, start, end } = useConnection();
    const pathRef = useRef<SVGPathElement>(null);
    const [hovered, setHovered] = useState(false);
    const [midpoint, setMidpoint] = useState<{ x: number; y: number } | null>(null);

    const executionStatus = data.executionStatus;
    const CONNECTION_STROKE: Partial<Record<NodeExecutionStatus, string>> = {
        idle: "#6b7280",
        completed: "#34d399",
    };
    const stroke = CONNECTION_STROKE[executionStatus ?? "idle"] ?? "#6b7280";

    const arrowTranslate = useMemo(() => {
        if (!end) return "translate(0, 0)";

        return direction === "vertical"
            ? `translate(${end?.x + 12}, ${end?.y - 5})`
            : `translate(${end?.x}, ${end?.y})`;
    }, [direction, end?.x, end?.y])

    const updateMidpoint = useCallback(() => {
        if (pathRef.current) {
            setMidpoint(getMidpoint(pathRef.current));
        }
    }, []);

    useEffect(() => {
        if (hovered) {
            updateMidpoint();
        }
    }, [hovered, path, updateMidpoint]);

    const handleMouseEnter = useCallback(() => {
        setHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHovered(false);
    }, []);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        props.onRemove?.(data.id);
    }, [props.onRemove, data.id]);

    if (!path) return null;

    const { d: customPath, angle: customAngle } = computeStepPath(start!, end!, direction);

    return (
        <svg
            data-id="line-connection"
            className="overflow-visible! absolute pointer-events-none w-[9999px] h-[9999px]"
        >
            <path
                d={path}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="fill-none stroke-transparent stroke-[16px] pointer-events-auto cursor-pointer"
            />

            <path
                ref={pathRef}
                d={path ? customPath : path}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="fill-none stroke-[2px] pointer-events-auto blur-[0.5px] cursor-pointer hover:stroke-[3px] hover:stroke-[#2563eb] hover:blur-none"
                style={{
                    stroke: stroke,
                    ...props.styles?.()
                }}
            />

            <g transform={`${arrowTranslate} rotate(${customAngle})`}>
                <polygon
                    points="-7,-4 0,0 -7,4"
                    fill={stroke}
                />
            </g>

            {!readOnly && hovered && midpoint && (
                <foreignObject
                    x={midpoint.x - BUTTON_SIZE / 2}
                    y={midpoint.y - BUTTON_SIZE / 2}
                    width={BUTTON_SIZE}
                    height={BUTTON_SIZE}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{ overflow: "visible" }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        style={{
                            pointerEvents: "auto",
                        }}
                        className="shadow-lg cursor-pointer"
                        onClick={handleRemove}
                    >
                        <TrashIcon className="text-destructive" />
                    </Button>
                </foreignObject>
            )}
        </svg>
    );
}
