import { Component, AfterViewInit, OnInit, forwardRef } from '@angular/core';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { Select2OptionData } from 'ng2-select2';
import * as $ from 'jquery';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FormSelectComponent),
    }
  ],
  selector: 'form-select',
  styleUrls: ['form-select.component.scss'],
  template: `
    <div 
      class="dynamic-field form-select row"
      [formGroup]="group">
      <label  for="config.name" class="text-right col-md-3 col-form-label">{{ config.label }}</label>
      <div class="col-md-9">
      <select2 type="text" [value]="config.value ? config.value :'' "  [width]="200" [options]="options" [data]="config.options">
      </select2>
      </div>  
    </div>
  `
})
export class FormSelectComponent implements Field, AfterViewInit, OnInit {
  config: FieldConfig;
  group: FormGroup;
  options: Select2Options;
  public exampleData: Array<Select2OptionData>;
  ngOnInit() {
    this.options = {
      closeOnSelect: false,
    }
  }
  ngAfterViewInit() {
    //$('.ui.dropdown').dropdown();
  }
}
