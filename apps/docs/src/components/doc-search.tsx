import { ALL_DOCS } from "@/data/nav";
import { cn } from "@ldc/ui";
import { Button } from "@ldc/ui/components/button";
import { Input } from "@ldc/ui/components/input";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface DocSearchProps {
    onSelect: (slug: string) => void;
}

export function DocSearch({ onSelect }: DocSearchProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const results = query.trim()
        ? ALL_DOCS.filter((d) =>
            d.title.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    function handleSelect(slug: string) {
        onSelect(slug);
        setQuery("");
        setOpen(false);
    }

    return (
        <div className="relative">
            <div className="relative flex items-center">
                <Search
                    size={13}
                    className="absolute left-2.5 text-muted-foreground pointer-events-none"
                />
                <Input
                    type="text"
                    placeholder="Search docs..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    className="pl-8 pr-8 h-8 text-xs bg-sidebar-accent border-sidebar-border placeholder:text-muted-foreground/50"
                />
                {query ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 size-6"
                        onClick={() => {
                            setQuery("");
                            setOpen(false);
                        }}
                    >
                        <X size={11} />
                    </Button>
                ) : null}
            </div>

            {open && results.length > 0 ? (
                <ul className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-popover border border-border rounded-md shadow-md overflow-hidden p-1 list-none m-0">
                    {results.map((item) => (
                        <li key={item.id}>
                            <button
                                onMouseDown={() => handleSelect(item.slug)}
                                className={cn(
                                    "w-full text-left px-2.5 py-1.5 text-xs rounded-sm",
                                    "text-popover-foreground",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    "transition-colors cursor-pointer border-none bg-transparent"
                                )}
                            >
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}