import { Input } from "@ldc/ui/components/input";
import { forwardRef } from "react";
import type { FieldComponentProps } from "../../types/schema";

const InputControl = forwardRef<HTMLInputElement, FieldComponentProps>((props, ref) => {
    const { field: _field, error, ...rest } = props;
    return <Input ref={ref} aria-invalid={!!error} {...rest} />;
});

InputControl.displayName = "InputControl";

export default InputControl;