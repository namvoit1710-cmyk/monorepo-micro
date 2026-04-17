import type { DocNavItem } from "@/data/nav";
import { Button } from "@ldc/ui/components/button";
import { Separator } from "@ldc/ui/components/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocPagerProps {
    prev?: DocNavItem;
    next?: DocNavItem;
    onNavigate: (slug: string) => void;
}

export function DocPager({ prev, next, onNavigate }: DocPagerProps) {
    return (
        <div className="mt-14">
            <Separator className="mb-6" />
            <div className="flex items-center justify-between gap-4">
                {prev ? (
                    <Button
                        variant="outline"
                        onClick={() => onNavigate(prev.slug)}
                        className="flex items-center gap-2 h-auto py-2.5 px-4 text-left"
                    >
                        <ChevronLeft size={15} className="text-primary shrink-0" />
                        <span className="flex flex-col items-start">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                                Previous
                            </span>
                            <span className="text-sm text-foreground font-medium">
                                {prev.title}
                            </span>
                        </span>
                    </Button>
                ) : (
                    <div />
                )}

                {next ? (
                    <Button
                        variant="outline"
                        onClick={() => onNavigate(next.slug)}
                        className="flex items-center gap-2 h-auto py-2.5 px-4 text-right ml-auto"
                    >
                        <span className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                                Next
                            </span>
                            <span className="text-sm text-foreground font-medium">
                                {next.title}
                            </span>
                        </span>
                        <ChevronRight size={15} className="text-primary shrink-0" />
                    </Button>
                ) : (
                    <div />
                )}
            </div>
        </div>
    );
}