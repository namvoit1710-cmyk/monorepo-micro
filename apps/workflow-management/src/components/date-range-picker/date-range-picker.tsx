import { useLanguage } from "@/components/containers/language-provider"
import { Button } from "@common/components/ui/button"
import { Calendar } from "@common/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover"
import { useDebounceCallback } from "@common/hooks/use-debounce-callback"
import { format } from "date-fns"
import type { Locale } from "date-fns/locale"
import { de, enUS, es, fr, ja, ko, vi, zhCN } from "date-fns/locale"
import { CalendarIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"

const DATE_FNS_LOCALES: Record<string, Locale> = {
    en: enUS,
    vi,
    ja,
    ko,
    "zh-CN": zhCN,
    fr,
    de,
    es,
}

interface IDateRangePicker {
    value: DateRange | undefined
    onChange: (date: DateRange | undefined) => void
}

const DateRangePicker = ({ value, onChange }: IDateRangePicker) => {
    const { i18n, t } = useLanguage()
    const locale = DATE_FNS_LOCALES[i18n.language] ?? enUS

    const [internalValue, setInternalValue] = useState<DateRange | undefined>(value)

    const debouncedOnChange = useDebounceCallback((date: DateRange | undefined) => {
        if (date?.from && date.to) {
            onChange(date)
        }
    }, 500)

    const handleSelect = (date: DateRange | undefined) => {
        setInternalValue(date)
        debouncedOnChange(date)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setInternalValue(undefined)
        onChange(undefined)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="date-picker-range"
                    className="justify-start px-2.5 font-normal min-w-[220px]"
                >
                    <CalendarIcon />

                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(value.from, "LLL dd, y", { locale })} -{" "}
                                {format(value.to, "LLL dd, y", { locale })}
                            </>
                        ) : (
                            format(value.from, "LLL dd, y", { locale })
                        )
                    ) : (
                        <span className="text-muted-foreground">{t("pick_a_date")}</span>
                    )}

                    {value?.from && (
                        <span
                            role="button"
                            aria-label="Clear date range"
                            className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
                            onClick={handleClear}
                        >
                            <XIcon className="h-4 w-4 opacity-50 hover:opacity-100" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={internalValue?.from}
                    selected={internalValue}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DateRangePicker