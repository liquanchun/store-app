import { Component, ViewContainerRef, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'form-check',
  styleUrls: ['form-check.component.scss'],
  template: ` 
    <div class="dynamic-field form-group row" [formGroup]="group" >
      <div class="text-right col-md-3"><label>{{config.label}}</label></div>
      <div [ngClass]="{'col-md-9':config.validation === undefined,'col-md-8':config.validation !== undefined}">
        <div *ngFor="let option of config.options" class="form-check form-check-inline">
          <label class="form-check-label">
            <input [name]="config.name"  [formControlName]="config.name" class="form-check-input" (click)="onCheck(option.id,$event)" [type]="config.check" [id]="option.id" [value]="option.id"> {{ option.text }}
          </label>
        </div>
        <input type="hidden" [value]="selectVal" (input)="selectVal=$event.target.value" >
      </div>
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `,
})
export class FormCheckComponent implements Field, OnInit, AfterViewInit {
  config: FieldConfig;
  group: FormGroup;

  selectVal: any = [];
  ngOnInit() {
  }

  ngAfterViewInit() {
    const that = this;

    this.group.controls[this.config.name].valueChanges
      .subscribe(data => {
        that.selectVal = data.split(',');
        $('.form-check-input').removeAttr('checked');
        $('.form-check-input').each(function (i, e) {
          if (_.indexOf(that.selectVal, $(this).attr('id')) > -1) {
            $(this).attr('checked', 'checked');
          }
        });
      });
  }

  onCheck(id, event) {
    if (this.config.check === 'checkbox') {
      if (_.indexOf(this.selectVal, id.toString()) > -1) {
        _.remove(this.selectVal, function (n) {
          return n === id.toString();
        });
      } else {
        this.selectVal.push(id);
      }
    } else {
      this.selectVal = [];
      this.selectVal.push(id);
    }
    this.group.controls[this.config.name].setValue(this.selectVal.toString(), { emitEvent: true });
  }
}
