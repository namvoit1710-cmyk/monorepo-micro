import JsonView from "@/components/json-view/json-view"
import type { IScopedVariable } from "@/features/workflows/types/node-detail"
import { useMemo } from "react"

const InputSchema = ({ scopePath }: { scopePath: IScopedVariable["paths"] }) => {
    const raw = useMemo(() => {
        return Object.entries(scopePath).reduce((acc, [key, value]) => {
            acc[key] = value.sample
            return acc
        }, {} as Record<string, any>)
    }, [scopePath])

    const value = useMemo(() => {
        return Object.entries(scopePath).reduce((acc, [key, value]) => {
            acc[key] = value.sample
            return acc
        }, {} as Record<string, any>)
    }, [scopePath])

    return (
        <JsonView
            value={value}
            enableClipboard
            draggableKeys
            raw={raw}
            replacePathKey="displayPath"
        />

    )
}

export default InputSchema;