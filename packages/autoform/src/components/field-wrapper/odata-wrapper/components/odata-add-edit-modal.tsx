import { IField } from "@common/components/ldc-auto-form/interfaces/component.interface";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@common/components/ui/dialog";
import { ComponentProps, useRef } from "react";
import Builder, { BuilderRef } from "../../../builder/builder";

interface IOdataAddEditModalProps extends ComponentProps<typeof Dialog> {
    field: IField;
    isEdit: boolean;
    defaultValues?: any;

    onSubmit?: (values: any) => void;
}

const OdataAddEditModal = (props: IOdataAddEditModalProps) => {
    const { field, isEdit, defaultValues, onSubmit, ...dialogProps } = props;

    const subFields = field.fields?.[0] ?? { fields: [] };

    const builderRef = useRef<BuilderRef>(null);

    const handleFormSubmit = (values: any) => {
        console.log("Form Submitted with values: ", values);
        if (onSubmit) {
            onSubmit(values);
        }
    }

    console.log("defaultValues", defaultValues)

    return (
        <Dialog {...dialogProps}>
            <DialogContent className="min-w-150">
                <DialogHeader>
                    {isEdit ? `Edit Row` : `Add Item`}
                </DialogHeader>

                <div className="flex-2 overflow-y-auto">
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

                    <Button onClick={() => builderRef.current?.onSubmit()}>
                        {isEdit ? `Save Changes` : `Add Item`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default OdataAddEditModal;