import { Component, ViewContainerRef, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'form-truefalse',
  styleUrls: ['form-truefalse.component.scss'],
  template: ` 
    <div class="dynamic-field form-group row" [formGroup]="group" >
      <div class="col-md-3"></div>
      <div class="col-md-8">
          <label class="form-check-label">
            <input [name]="config.name"  [formControlName]="config.name" class="form-check-input" (click)="onCheck(config.name,$event)" type="checkbox"> {{ config.label }}
          </label>
      </div>
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `,
})
export class FormTrueFalseComponent implements Field, OnInit, AfterViewInit {
  config: FieldConfig;
  group: FormGroup;

  selectVal: any = [];
  ngOnInit() {
  }

  ngAfterViewInit() {
    const that = this;

    this.group.controls[this.config.name].valueChanges
      .subscribe(data => {
      });
  }

  onCheck(name, event) { 
    this.group.controls[this.config.name].setValue(this.selectVal, { emitEvent: true });
  }
}
