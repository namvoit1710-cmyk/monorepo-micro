import { DocContent } from "@/components/doc-content";
import { useDocNavigation } from "@/hooks/use-doc-navigation";

const ShareDocPage = () => {
    const { activeSlug, handleSelect } = useDocNavigation();

    console.log("Rendering ShareDocPage with slug:", activeSlug);
    return (
        <div id="doc-scroll">
            <DocContent slug={activeSlug} onNavigate={handleSelect} />
        </div>
    )
}

export default ShareDocPage;