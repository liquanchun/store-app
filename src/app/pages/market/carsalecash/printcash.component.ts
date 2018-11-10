import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'print-cash-view',
  template: `
	    <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onDetail()">详情</button>
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onClick()">打印交款明细</button>
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onClick2()">打印精品明细</button>
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onClick3()">打印销售合同</button>
        <button *ngIf="value.AuditResult != '通过'" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onAudit()">审核</button>
        <button *ngIf="value.AuditResult == '通过'" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onAuditNot()">反审核</button>
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onInvoice()">收到发票</button>
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
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged("print.carsalecash.audit", {
      id: this.value.Id,
      time: getTimestamp
    });
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