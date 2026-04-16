export enum EShowWhenOperator {
    Equals = "equals",
    NotEquals = "notEquals",
    Exists = "exists",
    NotExists = "notExists",
    GreaterThan = "greaterThan",
    LessThan = "lessThan",
    GreaterOrEqual = "greaterOrEqual",
    LessOrEqual = "lessOrEqual",
    Contains = "contains",
    In = "in"
}

export interface IConditionConfig {
    fieldKey: string;
    conditionValue: unknown;
    action: "disabled" | "invisible";
    operator?: EShowWhenOperator;
}
