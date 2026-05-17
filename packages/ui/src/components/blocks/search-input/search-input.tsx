import { Search } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../../../lib/utils";
import { Input } from "../../ui/input";

const SearchInput = forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { wrapperClassName?: string }>(
    ({ className, type, wrapperClassName, ...props }, ref) => {
        return (
            <div className={cn("relative", wrapperClassName)}>
                <span className="flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Search className="size-4" />
                </span>

                <Input ref={ref}
                    type={type}
                    placeholder="Search..."
                    className={cn(
                        "pl-8",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
SearchInput.displayName = "SearchInput";


export { Input, SearchInput };

