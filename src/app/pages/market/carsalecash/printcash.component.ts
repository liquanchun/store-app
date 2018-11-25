import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'print-cash-view',
  template: `
      <div style="padding-top: 3px;padding-bottom: 3px;" class="dropdown">
      <button style="height:32px;padding:0.1rem 1rem" class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">操作</button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" (click)="onDetail()" href="javaScript:void(0)">详情</a>
        <a class="dropdown-item" (click)="onClick()" href="javaScript:void(0)">打印交款明细</a>
        <a class="dropdown-item" (click)="onClick2()" href="javaScript:void(0)">打印精品明细</a>
        <a class="dropdown-item" (click)="onClick3()" href="javaScript:void(0)">打印销售合同</a>
        <a *ngIf="value.AuditResult != '通过'" class="dropdown-item" (click)="onAudit()" href="javaScript:void(0)">审核</a>
        <a *ngIf="value.AuditResult == '通过'" class="dropdown-item" (click)="onAuditNot()" href="javaScript:void(0)">反审核</a>
      </div>
    </div>
    `,
})

export class PrintCashComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: any;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  currentUser:string;
  constructor(
    private _state: GlobalState,
  ) { }

  ngOnInit() {
    this.currentUser = sessionStorage.getItem("userName");
  }
  onInvoice(){
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash.invoice', { id: this.value.Id, time: getTimestamp });
  }
  onDetail() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash.detail', { id: this.value.Id, time: getTimestamp });
  }
  onAudit() {

    if (this.value.Status == "现车") {
      this.save.emit(this.rowData);

      const getTimestamp = new Date().getTime();
      this._state.notifyDataChanged("print.carsalecash.audit", {
        id: this.value.Id,
        time: getTimestamp
      });
    } else {
      this._state.notifyDataChanged("messagebox", {
        type: "warning",
        msg: "只有现车才能审核。",
        time: new Date().getTime()
      });
    }
  }
  onAuditNot() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged("print.carsalecash.auditnot", {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onClick() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash', { id: this.value.Id, time: getTimestamp });
  }
  onClick2() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash2', { id: this.value.Id, time: getTimestamp });
  }
  onClick3() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash3', { id: this.value.Id, time: getTimestamp });
  }
}