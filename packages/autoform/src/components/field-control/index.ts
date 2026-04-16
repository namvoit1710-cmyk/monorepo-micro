import ButtonControl from "./button-control";
import CheckBoxControl from "./checkbox-control";
import { CodeControl } from "./code-control";
import InputControl from "./input-control";
import NumberControl from "./number-control";
import RadioControl from "./radio-control";
import SelectControl from "./select-control";
import SwitchControl from "./switch-control";
import TextareaControl from "./textarea-control";
import UploadControl from "./upload-control";

export const FieldControl = {
    InputControl: InputControl,
    NumberControl: NumberControl,
    TextareaControl: TextareaControl,
    SelectControl: SelectControl,
    RadioPopupControl: RadioControl,
    SwitchControl: SwitchControl,
    CheckBoxControl: CheckBoxControl,
    UploadControl: UploadControl,

    CodeControl: CodeControl,

    ButtonControl: ButtonControl,

    // SingleUploadControl: () => "SingleUploadControl",
    // SingleUploadFileControl: () => "SingleUploadFileControl",
    // ComboBoxControl: () => "ComboBoxControl",
    // MultipleComboboxControl: () => "MultipleComboboxControl",
    // SingleUploadFieldMappingControl: () => "SingleUploadFieldMappingControl",
    // FieldMappingControlBase: () => "FieldMappingControlBase",
    // SelectTableControl: () => "SelectTableControl",
}