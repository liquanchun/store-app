import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'form-input',
  styleUrls: ['form-input.component.scss'],
  template: `
    <div 
      class="dynamic-field form-input row" 
      [formGroup]="group">
      <label for="config.name" class="col-md-3 col-form-label">{{ config.label }}</label>
      <div class="col-md-8">
      <input class="form-control" 
        [type]="config.password ? 'password':'text'"
        [attr.placeholder]="config.placeholder"
        [formControlName]="config.name">
      </div>  
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `
})
export class FormInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
