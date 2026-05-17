import FormDesigner from "@common/components/ldc-auto-form/components/form-designer/form-designer";

const FormDesignPage = () => {
    return (
        <div className="w-full h-full overflow-hidden">
            <FormDesigner initialSchema={{ fields: [] }} onChange={(value) => console.log("onChange", value)} />
        </div>
    )
}

export default FormDesignPage;