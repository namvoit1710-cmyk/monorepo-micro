import type { ComponentType } from "react";
import type { FieldControl } from "../components/field-control";
import type { FieldWrapper } from "../components/field-wrapper";
import type { IConditionConfig } from "./condition";
import type { IValidationRules } from "./validation";
import type { IServerOptionsConfig } from "./server-option-config";

export type OutputType = "string" | "number" | "boolean" | "array" | "object";

export interface FieldComponentProps {
    field?: IField;
    name: string;
    [key: string]: any;
}

export interface FieldWrapperProps extends FieldComponentProps {
    path?: string[];
    children: React.ReactNode;
}

export type IWrapperComponent = Record<string, ComponentType<FieldWrapperProps> | null> | keyof typeof FieldWrapper;
export type IFieldComponent = Record<string, ComponentType<FieldComponentProps> | null> | keyof typeof FieldControl;
export interface ISchema {
    fields: IField[];
}

export interface IField {
    key: string;
    outputType: OutputType;
    default?: unknown;
    fieldConfig: IFieldConfig;
    fields?: IField[];
}

export interface IFieldConfig {
    fieldWrapper?: string;
    wrapperProps?: Record<string, any>;
    fieldControl?: string;
    controlProps?: Record<string, any>  & { serverOptions?: IServerOptionsConfig };
    condition?: IConditionConfig;
    rules?: IValidationRules[];
}

export interface IButtonAction {
    action: string;
    label: string;

    [key: string]: unknown;
}
