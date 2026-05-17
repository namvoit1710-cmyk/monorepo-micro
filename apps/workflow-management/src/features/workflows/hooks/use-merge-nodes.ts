import { useLanguage } from "@/components/containers/language-provider";
import { useQueryNodePallete } from "@/features/workflows/hooks/apis/node-pallete";
import { IMenuItem } from "@/features/workflows/types/node-pallete";
import { useMemo } from "react";

const useGenerateWorkerMenu = () => {
    const { t } = useLanguage();
    const { data: nodes, isLoading: isNodeLoading } = useQueryNodePallete()

    const menuGroups = useMemo<IMenuItem[]>(() => {
        return Object.entries(nodes?.data?.categories ?? {}).map(([cateKey, cateValue]) => {
            return {
                text: t(`nodes.${cateKey}`),
                type: "Group",
                nodes: cateValue.map((node) => {
                    return {
                        text: node.name,
                        type: "Node",
                        icon: node.icon ?? "ethernet-port",
                        original: node,
                    }
                })
            }
        })
    }, [nodes])

    const nodeMenuItems = useMemo<IMenuItem[]>(() => {
        return Object.values(nodes?.data?.categories ?? {}).flatMap((cateValue) => {
            return cateValue.map((node) => {
                return {
                    text: node.name,
                    type: "Node",
                    icon: node.icon ?? "ethernet-port",
                    original: node,
                }
            })
        })
    }, [nodes])

    return {
        nodeMenuItems,
        menuGroups,
        isLoading: isNodeLoading
    }
}

export default useGenerateWorkerMenu;