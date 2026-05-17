import { toast as sonnerToast } from "sonner";
import { ToastContent } from "./components/toast-content";
import type { ToastVariant } from "./config/variants";
import { VARIANT_CONFIG } from "./config/variants";
import type { IToastErrorOptions } from "./type";

function show(variant: ToastVariant, title: string, message?: string, options?: IToastErrorOptions) {
    return sonnerToast.custom(
        () => <ToastContent variant={variant} title={title} message={message} options={options} />,
        { duration: VARIANT_CONFIG[variant].duration }
    );
}

export const toast = {
    success: (title: string, message?: string, options?: IToastErrorOptions) => show("success", title, message, options),
    error: (title: string, message?: string, options?: IToastErrorOptions) => show("error", title, message, options),
    warning: (title: string, message?: string, options?: IToastErrorOptions) => show("warning", title, message, options),
    info: (title: string, message?: string, options?: IToastErrorOptions) => show("info", title, message, options),
    loading: (title: string, message?: string, options?: IToastErrorOptions) => show("loading", title, message, options),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};