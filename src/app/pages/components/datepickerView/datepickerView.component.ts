import { Component, Input, OnInit, AfterViewInit, DoCheck } from '@angular/core';

import { ViewCell, Cell, DefaultEditor, Editor } from 'ng2-smart-table';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
@Component({
    selector: 'datepickerview',
    template: `
    <div class="form-group">
    <div class="input-group">
      <input class="form-control" placeholder="yyyy-mm-dd"
             name="dp" [(ngModel)]="model" ngbDatepicker #d="ngbDatepicker">
      <button class="input-group-addon" (click)="d.toggle()" type="button">
        <i class="icon ion-calendar"></i>
      </button>
    </div>
  </div>
  `
})
export class DatepickerViewComponent extends DefaultEditor implements DoCheck {

    model;
    @Input() value: string | number;
    @Input() rowData: any;

    _oldDateString: string;
    constructor() {
        super();
    }
    ngDoCheck() {
        if (this._oldDateString !== JSON.stringify(this.model)) {
            this._oldDateString = JSON.stringify(this.model);
            this.cell.newValue = `${this.model.year}-${this.model.month}-${this.model.day}`;
            console.log(this.cell.newValue);
        }
    }
}