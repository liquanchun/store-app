import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'print-cash-view',
  template: `
	    <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" style="line-height: 15px;" class="btn btn-success btn-sm tablebutton" (click)="onDetail()">详情</button>
        <button type="button" style="line-height: 15px;" class="btn btn-success btn-sm tablebutton" (click)="onClick()">打印</button>
      </div>
    `,
})

export class PrintCashComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(
    private _state: GlobalState,
  ) { }

  ngOnInit() {
  }
  onDetail() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash.detail', { id: this.value, time: getTimestamp });
  }

  onClick() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsalecash', { id: this.value, time: getTimestamp });
  }
}