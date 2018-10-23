import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ViewCell } from "ng2-smart-table";
import { GlobalState } from "../../../global.state";

import * as _ from "lodash";
@Component({
  selector: "print-button-view",
  template: `
	    <div class="btn-group" role="group" aria-label="Basic example">
        <button *ngIf="value.Creator == currentUser" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onDetail()">详情</button>
        <button *ngIf="value.Creator == currentUser" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onClick()">打印</button>
        <button *ngIf="value.Creator == currentUser && value.Status == '订单' && value.AuditResult == '通过'" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onCheck()">转结算单</button>
        <button *ngIf="value.Status != '已开票' && value.AuditResult != '通过'" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onAudit()">审核</button>
        <button *ngIf="value.Status != '已开票' && value.AuditResult == '通过'" type="button" style="line-height: 15px;" class="btn btn-light btn-sm tablebutton" (click)="onAuditNot()">反审核</button>
        </div>
    `
})
export class PrintButtonComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input()
  value: any;
  @Input()
  rowData: any;

  @Output()
  save: EventEmitter<any> = new EventEmitter();

  currentUser: string;
  constructor(private _state: GlobalState) {}

  ngOnInit() {
    this.currentUser = sessionStorage.getItem("userName");
  }
  onDetail() {
    this.save.emit(this.rowData);
    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged("print.carsale.detail", {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onCheck() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged("print.carsale.check", {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onAudit() {
    if (this.value.Status == "现车") {
      this.save.emit(this.rowData);

      const getTimestamp = new Date().getTime();
      this._state.notifyDataChanged("print.carsale.audit", {
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
    this._state.notifyDataChanged("print.carsale.auditnot", {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onClick() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged("print.carsale", {
      id: this.value.Id,
      time: getTimestamp
    });
  }
}
