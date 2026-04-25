import { Slot } from "@common/components/ldc-auto-form/contexts/slot.context";
import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const MoreActionDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="bottom" className="">
                <Slot name="more-action" />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MoreActionDropdown;