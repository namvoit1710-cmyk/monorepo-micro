import { Button } from "@ldc/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@ldc/ui/components/dialog";
import type { ComponentProps } from "react";
import { useRef } from "react";
import type { IField } from "../../../../types/schema";
import type { BuilderRef } from "../../../builder/builder";
import Builder from "../../../builder/builder";

interface IOdataAddEditModalProps extends ComponentProps<typeof Dialog> {
    field: IField;
    isEdit: boolean;
    readOnly?: boolean;
    defaultValues?: any;

    onSubmit?: (values: any) => void;
}

const OdataAddEditModal = (props: IOdataAddEditModalProps) => {
    const { field, isEdit, defaultValues, onSubmit, readOnly, ...dialogProps } = props;

    const subFields = field.fields?.[0] ?? { fields: [] };

    const builderRef = useRef<BuilderRef>(null);

    const handleFormSubmit = (values: any) => {
        if (onSubmit) {
            onSubmit(values);
        }
    }

    return (
        <Dialog {...dialogProps}>
            <DialogContent className="min-w-150">
                <DialogHeader>
                    {isEdit ? readOnly ? `View Row` : `Edit Row` : `Add Item`}
                </DialogHeader>

                <div className="flex-2 overflow-y-auto relative">
                    {readOnly && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center" />
                    )}

                    <Builder
                        ref={builderRef}
                        schema={{ fields: subFields?.fields || [] }}
                        defaultValues={defaultValues}

                        onSubmit={handleFormSubmit}
                    />
                </div>

                <DialogFooter className="p-1 flex items-center justify-end">
                    <Button variant="outline" onClick={() => dialogProps.onOpenChange?.(false)}>
                        Cancel
                    </Button>

                    {!readOnly && (
                        <Button onClick={() => builderRef.current?.onSubmit()}>
                            {isEdit ? `Save Changes` : `Add Item`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default OdataAddEditModal;