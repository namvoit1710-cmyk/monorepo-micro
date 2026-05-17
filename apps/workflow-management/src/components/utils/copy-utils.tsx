import { CheckIcon, CopyIcon, Loader } from "lucide-react";
import { useState } from "react";

interface CopyUtilsProps {
    content: string;
}

const CopyUtils = ({ content }: CopyUtilsProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        } catch (error) {
            console.error("Failed to copy text: ", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <span
            className="ml-2 cursor-pointer text-muted-foreground hover:text-primary"
            onClick={handleCopy}
        >
            {!isLoading && !isCopied && <CopyIcon className="size-3" />}
            {isLoading && !isCopied && <Loader className="size-3 animate-spin text-primary" />}
            {!isLoading && isCopied && <CheckIcon className="size-3 text-green-500" />}
        </span>
    )
}

export default CopyUtils;