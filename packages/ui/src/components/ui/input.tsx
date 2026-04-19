import * as React from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

Input.displayName = "Input";

const sanitizeNumberInput = (value: string): string => {
  const cleaned = value.replace(/(?!^)-|[^\d.-]/g, "")
  const firstDot = cleaned.indexOf(".")
  if (firstDot === -1) return cleaned
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
}

export interface INumberInputProps {
  min?: number
  max?: number
  value?: number
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  step?: number
  className?: string
  onChange?: (value: number | undefined) => void
}

const NumberInput = forwardRef<HTMLInputElement, INumberInputProps>((props, ref) => {
  const { min, max, value: propValue, onChange } = props;

  const format = useCallback((num: number): string => {
    return Intl.NumberFormat("en-US", { style: "decimal" }).format(num)
  }, [])

  const parse = useCallback((raw: string): number | undefined => {
    const sanitized = sanitizeNumberInput(raw)
    if (sanitized === "" || sanitized === "-") return undefined
    const n = Number(sanitized)
    return isNaN(n) ? undefined : n
  }, [])

  const clamp = useCallback((n: number): number => {
    const lo = min ?? Number.MIN_SAFE_INTEGER
    const hi = max ?? Number.MAX_SAFE_INTEGER
    return Math.max(lo, Math.min(hi, n))
  }, [min, max])

  const [display, setDisplay] = useState<string>(
    propValue !== undefined ? format(propValue) : ""
  )
  useEffect(() => {
    setDisplay(propValue !== undefined ? format(propValue) : "")
  }, [propValue, format])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const sanitized = sanitizeNumberInput(raw)
    setDisplay(sanitized)
  }

  const handleBlur = () => {
    const parsed = parse(display)
    if (parsed === undefined) {
      setDisplay("")
      onChange?.(undefined)
      return
    }
    const clamped = clamp(parsed)
    setDisplay(format(clamped))
    onChange?.(clamped)
  }

  return (
    <Input
      {...props}
      ref={ref}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="decimal"
    />
  )
})

NumberInput.displayName = "NumberInput";

export default NumberInput

export { Input, NumberInput };

