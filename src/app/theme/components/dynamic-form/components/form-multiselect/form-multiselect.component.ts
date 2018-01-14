import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'form-multiselect',
  styleUrls: ['form-multiselect.component.scss'],
  template: `
    <div 
      class="dynamic-field form-select row"
      [formGroup]="group">
      <label  for="config.name" class="col-md-3 col-form-label">{{ config.label }}</label>
      <div class="col-md-8">
      <ss-multiselect-dropdown [formControlName]="config.name" [options]="myOptions" [texts]="myTexts" [settings]="mySettings">
      </ss-multiselect-dropdown>
      </div>  
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `
})
export class FormMultiSelectComponent implements Field, AfterViewInit, OnInit {
  config: FieldConfig;
  group: FormGroup;

  // Default selection
  optionsModel: number[] = [1, 2];

  // Settings configuration
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 10,
    displayAllSelectedText: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  // Labels / Parents
  myOptions: IMultiSelectOption[] = [];
  constructor() {

  }
  ngOnInit() {
    const that = this;
    _.each(this.config.options, (f) => {
      const opt: IMultiSelectOption = { id: f.id, name: f.name, isLabel: f.isLabel, parentId: f.parentId };
      that.myOptions.push(opt);
    });
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   $('.dropdown-item a').each(function (index, item) {
    //     $(item).css('color', 'red');
    //   });
    // }, 5000);
  }

  onChange() {
    console.log(this.optionsModel);
  }
}
