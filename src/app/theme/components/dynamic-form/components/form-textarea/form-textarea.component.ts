import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  selector: 'form-textarea',
  styleUrls: ['form-textarea.component.scss'],
  template: `
    <div 
      class="dynamic-field form-textarea row" 
      [formGroup]="group">
      <label for="config.name" class="col-md-3 col-form-label">{{ config.label }}</label>
      <div class="col-md-8">
      <textarea class="form-control" 
        [formControlName]="config.name"> </textarea>
      </div>  
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `
})
export class FormTextareaComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
}
