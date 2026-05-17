import useGenerateWorkerMenu from "@/features/workflows/hooks/use-merge-nodes";
import { IMenuItem, INodePallete } from "@/features/workflows/types/node-pallete";
import DynamicNodeIcon from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/dynamic-node-icon";
import { cn } from "@common/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { mapNodeToEditorNode } from "../../utils/node-mapper-utils";
import NodePalette from "./node-palette";
import PaletteSearch from "./palette-search";

interface INodePaletteContentProps {
    onCloseDrawer?: () => void
    onSelectNode: (node: INodePallete) => void
}

const NodePaletteContent = (props: INodePaletteContentProps) => {
    const { onCloseDrawer, onSelectNode } = props

    const [searchString, setSearchString] = useState<string>("")
    const [selectedGroupItem, setSelectedGroupItem] = useState<IMenuItem | null>(null)
    const [showItems, setShowItems] = useState(false)

    const { nodeMenuItems, menuGroups, isLoading } = useGenerateWorkerMenu()

    useEffect(() => {
        const handleShowItems = () => {
            if (!isLoading) {
                const timer = setTimeout(() => setShowItems(true), 50);
                return () => clearTimeout(timer);
            } else {
                setShowItems(false);
            }
        }

        handleShowItems()
    }, [isLoading]);

    const filteredMenuGroups = useMemo(() => {
        if (searchString) {
            return nodeMenuItems.filter((node) => node.original.description.toLowerCase().includes(
                searchString.toLowerCase()) || node.text.toLowerCase().includes(searchString.toLowerCase())
            )
        }

        return menuGroups
    }, [menuGroups, searchString, selectedGroupItem])

    const filterMenuNodes = useMemo(() => {
        if (searchString) {
            return (selectedGroupItem?.nodes ?? [])?.filter((node) => node.original.description.toLowerCase().includes(
                searchString.toLowerCase()) || node.text.toLowerCase().includes(searchString.toLowerCase())
            )
        }

        return selectedGroupItem?.nodes ?? []
    }, [selectedGroupItem, searchString])

    return (
        <>
            <div className="flex flex-col gap-3 h-full overflow-hidden py-3">
                <PaletteSearch onChange={(value) => setSearchString(value)} />

                <div className="flex-[2] overflow-y-auto py-1 overflow-x-hidden">
                    {!!isLoading && (
                        <div className="flex flex-col px-4 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredMenuGroups?.map((group, index) => (
                        <div
                            className={cn(
                                "flex items-center justify-between hover:bg-gray-100 cursor-pointer px-4",
                                "transition-all duration-300 ease-in-out",
                                showItems ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                            )}
                            style={{ transitionDelay: `${index * 30}ms` }}
                            key={`${group.text}-${index}`}
                            onClick={() => {
                                if (group.type === "Group" && group.nodes && group.nodes.length > 0) {
                                    setSelectedGroupItem(group)
                                }

                                if (group.type === "Node") {
                                    onSelectNode?.(group.original)
                                    onCloseDrawer?.()
                                }
                            }}
                            onDragStart={(e) => {
                                if (group.type === "Node") {
                                    const editorNode = mapNodeToEditorNode(group.original);
                                    e.dataTransfer.setData("nodeType", JSON.stringify(editorNode))
                                    onCloseDrawer?.()
                                }
                            }}

                            draggable={group.type === "Node"}
                        >
                            <div className="flex items-center gap-3 py-3">
                                <div
                                    className="p-1 rounded-md"
                                    style={{
                                        color: group?.original?.color,
                                        backgroundColor: group?.original?.color ? `color-mix(in srgb, ${group?.original?.color} 10%, transparent)` : undefined
                                    }}
                                >
                                    <DynamicNodeIcon name={group.icon} fallbackIconName="group" className="size-5" />
                                </div>
                                <h3>{group.text}</h3>
                            </div>

                            {group.nodes && group.nodes.length > 0 && (<ChevronRightIcon className="size-4" strokeWidth={1.5} />)}
                        </div>

                    ))}
                </div>
            </div>

            <NodePalette
                side="right"
                isOpen={!!selectedGroupItem}
                onClose={() => {
                    setSelectedGroupItem(null)
                    setSearchString("")
                }}
                title={selectedGroupItem?.text}
            >
                <div className="flex flex-col gap-3 h-full overflow-hidden py-3">
                    <PaletteSearch onChange={(value) => setSearchString(value)} />

                    <div className="flex-2 overflow-y-auto py-1">
                        {filterMenuNodes?.map((node, index) => (
                            <div
                                className="flex items-center justify-between hover:bg-gray-100 cursor-pointer px-4"
                                key={`${node.text}-${index}`}
                                onClick={() => {
                                    onSelectNode?.(node.original)
                                    onCloseDrawer?.()
                                }}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("nodeType", JSON.stringify(mapNodeToEditorNode(node.original)))
                                }}
                                onDragEnd={() => {
                                    onCloseDrawer?.()
                                }}
                            >
                                <div className="flex items-center gap-3 py-4">
                                    <div
                                        className="p-1 rounded-md"
                                        style={{
                                            color: node.original.color,
                                            backgroundColor: node.original.color ? `color-mix(in srgb, ${node.original.color} 10%, transparent)` : undefined
                                        }}
                                    >
                                        <DynamicNodeIcon
                                            className="size-5"
                                            name={node.icon}
                                            strokeWidth={1}
                                        />
                                    </div>

                                    <h3 className="whitespace-nowrap line-clamp-1">{node.text}</h3>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </NodePalette>
        </>
    )
}

export default NodePaletteContent