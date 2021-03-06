import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
  disabled?: boolean,
  label?: string,
  name: string,
  options?: any[],
  placeholder?: string,
  type: string,
  validation?: ValidatorFn[],
  value?: any,
  check?: string,
  callback?: any,
  time?: string,
  password?: boolean,
  config?: Select2Options,
  width?: string,
  width2?: string,
  group?: string,
}
