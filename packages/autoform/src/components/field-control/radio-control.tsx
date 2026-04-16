import { Label } from "@ldc/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@ldc/ui/components/radio-group";
import { forwardRef } from "react";
import type { FieldComponentProps } from "../../types/schema";

export interface IRadioOption {
    id: string;
    value: string;
    label: string;
}

type OptionRecord = Record<string, string | number>;

export interface RadioControlProps extends FieldComponentProps {
    options: IRadioOption[] | OptionRecord[];
    valueKey?: string;
    labelKey?: string;
    onValueChange?: (value: string) => void;
}

const RadioControl = forwardRef<HTMLDivElement, RadioControlProps>((props, ref) => {
    const {
        field: _field,
        options,
        value,
        onChange,
        onValueChange,
        valueKey = "id",
        labelKey = "label",
        className,
        ...rest
    } = props;

    const handleValueChange = (newValue: string) => {
        onValueChange?.(newValue);
        onChange?.(newValue);
    };

    return (
        <RadioGroup
            ref={ref}
            value={value as string}
            onValueChange={handleValueChange}
            {...rest}
            className={className}
        >
            {options.map((option: IRadioOption | OptionRecord, index: number) => {
                const optionValue = String((option as OptionRecord)[valueKey]);
                const optionLabel = String((option as OptionRecord)[labelKey]);
                const itemId = `radio-${optionValue}-${index}`;

                return (
                    <div key={itemId} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionValue} id={itemId} />
                        <Label htmlFor={itemId}>{optionLabel}</Label>
                    </div>
                );
            })}
        </RadioGroup>
    );
});

RadioControl.displayName = "RadioControl";

export default RadioControl;
