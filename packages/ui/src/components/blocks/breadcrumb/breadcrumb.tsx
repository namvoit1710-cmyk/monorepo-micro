import { Fragment } from "react"
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../../ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu"

export interface BreadcrumbItemType {
    label: string
    href?: string
}

interface BreadcrumbBlockProps {
    items: BreadcrumbItemType[]
    maxItems?: number
    onClickItem?: (item: BreadcrumbItemType, index: number) => void
}

export function BreadcrumbBlock({
    items,
    maxItems = 3,
    onClickItem,
}: BreadcrumbBlockProps) {
    if (!items.length) return null

    const lastItem = items[items.length - 1]

    // Không cần ellipsis nếu ít item
    const needsEllipsis = items.length > maxItems

    // Item đầu (Home)
    const firstItem = items[0]

    // Item bị ẩn (ở giữa)
    const hiddenItems = needsEllipsis
        ? items.slice(1, items.length - (maxItems - 1))
        : []

    // Item hiển thị ở giữa (sau ellipsis)
    const visibleMiddleItems = needsEllipsis
        ? items.slice(items.length - (maxItems - 1), items.length - 1)
        : items.slice(1, items.length - 1)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* First item */}
                <BreadcrumbItem
                    className="cursor-pointer"
                    onClick={() => onClickItem?.(firstItem ?? { label: "", href: "#" }, 0)}
                >
                    {firstItem?.label}
                </BreadcrumbItem>

                {/* Ellipsis với dropdown cho hidden items */}
                {needsEllipsis && hiddenItems.length > 0 && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="cursor-pointer">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <BreadcrumbEllipsis className="cursor-pointer" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {hiddenItems.map((item, i) => (
                                        <DropdownMenuItem
                                            key={i}
                                            onClick={() => onClickItem?.(item, i + 1)}
                                        >

                                            {item.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    </>
                )}

                {/* Visible middle items */}
                {visibleMiddleItems.map((item, i) => {
                    const originalIndex = needsEllipsis
                        ? items.length - (maxItems - 1) + i
                        : i + 1
                    return (
                        <Fragment key={i}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem className="cursor-pointer" onClick={() => onClickItem?.(item, originalIndex)}>
                                {item.label}
                            </BreadcrumbItem>
                        </Fragment>
                    )
                })}

                {/* Last item (current page) - chỉ hiện nếu có nhiều hơn 1 item */}
                {items.length > 1 && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem onClick={() => onClickItem?.(lastItem ?? { label: "", href: "#" }, items.length - 1)}>
                            <BreadcrumbPage>{lastItem?.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}