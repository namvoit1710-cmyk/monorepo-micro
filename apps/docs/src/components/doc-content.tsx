import { getAdjacentDocs, getDocBySlug } from "@/data/nav";
import { useMdLoader } from "@/hooks/use-load-md";
import { Skeleton } from "@ldc/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";
import { DocPager } from "./doc-paper";
import { MdRenderer } from "./md-renderer";

interface DocContentProps {
    slug: string;
    onNavigate: (slug: string) => void;
}

export function DocContent({ slug, onNavigate }: DocContentProps) {
    const doc = getDocBySlug(slug);
    console.log("Loading content for slug:", slug, "with doc:", doc);
    const { prev, next } = getAdjacentDocs(slug);
    const { content, loading, error } = useMdLoader(doc?.file ?? "");
    const contentRef = useRef<HTMLDivElement>(null);

    if (!doc) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <p className="text-sm">Page not found.</p>
            </div>
        );
    }

    return (
        <main className="w-full max-w-3xl mx-auto px-6 py-10">
            {loading ? (
                <div className="flex flex-col gap-4 pt-8">
                    <Skeleton className="h-9 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="h-4 w-4/6 rounded-md" />
                    <Skeleton className="h-40 w-full rounded-md mt-4" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
            ) : null}

            {error ? (
                <div className="flex items-center gap-3 p-4 my-8 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{error}</p>
                </div>
            ) : null}

            {content && !loading ? (
                <>
                    <MdRenderer ref={contentRef} content={content} onNavigate={onNavigate} />
                    <DocPager prev={prev} next={next} onNavigate={onNavigate} />
                </>
            ) : null}
        </main>
    );
}