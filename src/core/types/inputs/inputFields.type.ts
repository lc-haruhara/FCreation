export type InputOption = {
  value: string;
  label: string;
};

type BaseInputField = {
  name: string;
  label?: string;
  required?: boolean;
  helpText?: string;
};

type TextInputField = BaseInputField & {
  type: 'text' | 'email' | 'tel';
  placeholder?: string;
  maxLength?: number;
  autocomplete?: string;
};

type TextareaInputField = BaseInputField & {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
  rows?: number;
};

type SelectInputField = BaseInputField & {
  type: 'select';
  placeholder?: string;
  options: InputOption[];
};

type RadioInputField = BaseInputField & {
  type: 'radio';
  options: InputOption[];
};

type CheckboxGroupInputField = BaseInputField & {
  type: 'checkbox-group';
  options: InputOption[];
  minSelect?: number;
  maxSelect?: number;
};

export type InputField =
  | TextInputField
  | TextareaInputField
  | SelectInputField
  | RadioInputField
  | CheckboxGroupInputField;
