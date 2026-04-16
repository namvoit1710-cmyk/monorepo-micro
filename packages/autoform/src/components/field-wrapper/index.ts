import FormItemWrapper from "./form-item-wrapper";
import FragmentWrapper from "./fragment-wrapper";
import { TabItemWrapper, TabWrapper } from "./tab-wrapper";

export const FieldWrapper = {
    FragmentWrapper: FragmentWrapper,
    FormItemWrapper: FormItemWrapper,
    TableWrapper: () => "TableWrapper",
    TabWrapper: TabWrapper,
    TabItemWrapper: TabItemWrapper,
}