import { useLanguage } from "@/hooks/use-language"
import { useDebounceCallback } from "@common/hooks/use-debounce-callback"
import { Input } from "@ldc/ui/components/input"
import { SearchIcon } from "lucide-react"

interface IPaletteSearchProps {
    onChange: (value: string) => void
}

const PaletteSearch = ({ onChange }: IPaletteSearchProps) => {
    const { t } = useLanguage()

    const debouncedOnChange = useDebounceCallback(onChange, 500)

    return (
        <div className="px-4 relative">
            <Input
                className="w-full pr-8 h-9"
                placeholder={t("search_node_placeholder")}
                onChange={(e) => debouncedOnChange(e.target.value)}
            />

            <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 size-4" strokeWidth={1.5} />
        </div>
    )
}

export default PaletteSearch