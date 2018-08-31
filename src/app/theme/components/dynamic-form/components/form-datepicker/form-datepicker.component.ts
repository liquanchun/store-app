import { Component, ViewContainerRef ,AfterViewInit,OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import {NgbTimepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import {NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'form-datepicker',
  styleUrls: ['form-datepicker.component.scss'],
  template: `
    <div 
      class="dynamic-field form-input row" 
      [formGroup]="group">
      <label for="config.name" class="text-right col-md-3 col-form-label">{{ config.label }}</label>
      <div class="form-group col-md-8">
        <div class="input-group">
          <input class="form-control" placeholder="yyyy-mm-dd"
                [formControlName]="config.name" [(ngModel)]="selectVal" ngbDatepicker #d="ngbDatepicker">
          <div class="input-group-addon" (click)="d.toggle()" >
            <i class="fa fa-calendar" aria-hidden="true"></i>
          </div>
          <input *ngIf="config.time" (change)="onChange($event)" type="time" style="border:1px solid rgba(0, 0, 0, 0.1)" [value]="config.time"/>
        </div>
      </div>
      <span style='color:red' class="col-md-1" *ngIf="config.validation">*</span>
    </div>
  `
})
export class FormDatepickerComponent implements Field,AfterViewInit,OnInit {
  config: FieldConfig;
  group: FormGroup;
  model;

  selectVal: any;
  selectTime:any;

  ngOnInit() {
    this.selectTime = this.config.time;
  }
  ngAfterViewInit() {
    const that = this;
    this.group.controls[this.config.name].valueChanges
      .subscribe(data => {
        if(data){
          that.selectVal = data;
          if(that.selectTime){
            that.selectVal.time =  `${that.selectTime}:00`;
          }
        }
      });
  }
  onChange(event){
    this.selectTime = event.target.value;
    this.setSelectVal();
  }

  setSelectVal(){
    this.selectVal.time =  `${this.selectTime}:00`;
    this.group.controls[this.config.name].setValue(this.selectVal, { emitEvent: true });
  }
}
