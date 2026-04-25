import { Button } from "@ldc/ui/components/button";
import { useCallback, useState, type ComponentProps } from "react";
import type { FieldComponentProps, IButtonAction } from "../../types/schema";
import { useBuilderContext } from "../../contexts/builder.context";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";


export interface IButtonControlProps extends FieldComponentProps, Omit<ComponentProps<typeof Button>, "name" | "onChange" | "value"> {
    label?: string;

    // ---- Action Engine props (mới) ----
    /** Action name — dispatch qua onFormActions */
    action?: string;
    /** Static payload gửi kèm action */
    actionPayload?: Record<string, unknown>;
    /** Events object — backward compatible với TableWrapper buttonAction */
    events?: IButtonAction;
    /** Hiện loading spinner khi action đang chạy */
    loadingOnAction?: boolean;
    /** Hiện confirm dialog trước khi execute */
    confirmBefore?: boolean;
    /** Custom confirm message */
    confirmMessage?: string;
    /** Icon name (dùng khi render icon, app level tự map) */
    icon?: string;
}

const ButtonControl = (props: IButtonControlProps) => {
    const {
        label,
        className,
        variant,
        size,

        // Action props
        action,
        actionPayload,
        events,
        loadingOnAction = false,
        confirmBefore = false,
        confirmMessage = "Are you sure?",

        // Legacy props
        onClick,

        // Filtered out
        field: _field,
        icon,
        name: _name,

        ...rest
    } = props;

    const { onFormActions } = useBuilderContext();
    const formContext = useFormContext();
    const [loading, setLoading] = useState(false);

    // Resolve action name: ưu tiên action > events.action
    const resolvedAction = action ?? events?.action;

    const executeAction = useCallback(async () => {
        if (!resolvedAction || !onFormActions) return;

        const payload: Record<string, unknown> = {
            ...actionPayload,
            ...(events ?? {}),
            formValues: formContext?.getValues?.() ?? {},
        };

        if (loadingOnAction) setLoading(true);

        try {
            await onFormActions(resolvedAction, payload);
        } finally {
            if (loadingOnAction) setLoading(false);
        }
    }, [resolvedAction, onFormActions, actionPayload, events, formContext, loadingOnAction]);

    const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Nếu có onClick legacy (từ TableWrapper table-cell-field) → dùng nó
        if (onClick && !resolvedAction) {
            onClick(e);
            return;
        }

        // Confirm trước khi execute
        if (confirmBefore) {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return;
        }

        await executeAction();
    }, [onClick, resolvedAction, confirmBefore, confirmMessage, executeAction]);

    return (
        <Button
            type="button"
            variant={variant ?? "default"}
            size={size ?? "default"}
            disabled={rest.disabled || loading}
            className={className}
            onClick={handleClick}
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!loading && icon && (
                <DynamicIcon
                    name={pascalToKebabCase(icon) as IconName}
                    className="mr-1 h-4 w-4"
                    strokeWidth={1.5}
                />
            )}
            {label ?? ""}
        </Button>
    );
};

export default ButtonControl;