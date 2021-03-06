import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'print-cash-view',
  template: `
    <div style="padding-top: 3px;padding-bottom: 3px;" class="dropdown">
      <button
        style="height:32px;padding:0.1rem 1rem"
        class="btn btn-light dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        操作
      </button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" (click)="onDetail()" href="javaScript:void(0)">详情</a>
        <a class="dropdown-item" (click)="onClick()" href="javaScript:void(0)">打印交款明细</a>
        <a class="dropdown-item" (click)="onClick2('DN')" href="javaScript:void(0)">打印精品明细(店内)</a>
        <a class="dropdown-item" (click)="onClick2('HZ')" href="javaScript:void(0)">打印精品明细(合作店)</a>
        <a class="dropdown-item" (click)="onClick3()" href="javaScript:void(0)">打印销售合同</a>
      </div>
    </div>
  `
})
export class PrintCashComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: any;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  currentUser: string;
  constructor(private _state: GlobalState) {}

  ngOnInit() {
    this.currentUser = sessionStorage.getItem('userName');
  }
  onDetail() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash.detail', { id: this.value.Id, time: getTimestamp });
  }
  onAudit() {
    if (this.value.Status == '现车') {
      this.save.emit(this.rowData);

      const getTimestamp = new Date().getTime();
      this._state.notifyDataChanged('print.carsalecash.audit', {
        id: this.value.Id,
        time: getTimestamp
      });
    } else {
      this._state.notifyDataChanged('messagebox', {
        type: 'warning',
        msg: '只有现车才能审核。',
        time: new Date().getTime()
      });
    }
  }
  onAuditNot() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash.auditnot', {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onClick() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash', { id: this.value.Id, time: getTimestamp });
  }
  onClick2(dn) {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash2', { id: this.value.Id, time: getTimestamp, dn: dn });
  }
  onClick3() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash3', { id: this.value.Id, time: getTimestamp });
  }
}
