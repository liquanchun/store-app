import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'carstore-invoice-view',
  template: `
	    <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onInvoice()">收到发票</button>
      </div>
    `,
})

export class InvoiceComponent implements ViewCell, OnInit {
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
}