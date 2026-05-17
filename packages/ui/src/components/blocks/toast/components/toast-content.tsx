import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import type { ToastVariant } from "../config/variants";
import { ICON_COLOR, VARIANT_CONFIG } from "../config/variants";
import { getIcon } from "../icons";
import type { IToastErrorOptions } from "../type";

interface ToastContentProps {
    variant: ToastVariant;
    title: string;
    message?: string;
    options?: IToastErrorOptions;
}

export function ToastContent({ variant, title, message, options }: ToastContentProps) {
    const { bar } = VARIANT_CONFIG[variant];
    const iconColor = ICON_COLOR[variant];
    const hasDetails = options && (options.code || options.errors?.length);
    const [expanded, setExpanded] = React.useState(false);

    return (
        <div className="flex items-stretch min-w-[20rem] max-w-[26rem] rounded-lg border border-[#d9d9d9] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className={`w-1 shrink-0 ${bar}`} />

            <div className="flex flex-col w-full px-4 py-3 gap-1">
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0">
                        {getIcon(variant, iconColor)}
                    </span>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p className="text-[0.875rem] font-semibold leading-snug text-[#1d2d3e]">
                            {title}
                        </p>
                        {message && (
                            <p className="text-[0.75rem] font-normal leading-snug text-[#556b82]">
                                {message}
                            </p>
                        )}
                    </div>

                    {hasDetails && (
                        <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="ml-auto shrink-0 text-[0.7rem] cursor-pointer text-[#0070f2] hover:underline focus:outline-none"
                            aria-expanded={expanded}
                        >
                            {expanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                    )}
                </div>

                {expanded && hasDetails && (
                    <div className="mt-1 rounded-md border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2 flex flex-col gap-1">
                        {options.code && (
                            <p className="text-[0.7rem] font-mono font-medium text-[#aa0808]">
                                {options.code}
                            </p>
                        )}
                        {options.errors?.map((error) => (
                            <p key={error} className="text-[0.7rem] font-normal leading-snug text-[#556b82]">
                                • {error}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}