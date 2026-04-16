import { Button } from "@ldc/ui/components/button";
import type { ComponentProps } from "react";
import type { FieldComponentProps } from "../../types/schema";

export interface IButtonControlProps extends FieldComponentProps, Omit<ComponentProps<typeof Button>, "name"> {
    label?: string
}

const ButtonControl = (props: IButtonControlProps) => {
    const { label, className, variant, size, onClick, field: _field, ...rest } = props;

    return (
        <Button
            variant={variant ?? "default"}
            size={size ?? "default"}
            disabled={rest.disabled}

            className={className}

            onClick={onClick}
        >
            {label ?? ""}
        </Button>
    )
}

export default ButtonControl;