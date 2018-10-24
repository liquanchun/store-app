import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ViewCell } from "ng2-smart-table";
import { GlobalState } from "../../../global.state";
import { FormService } from "../form/form.services";
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
    `,
  providers: [FormService]
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
  constructor(private _state: GlobalState, private formService: FormService) {}

  ngOnInit() {
    this.currentUser = sessionStorage.getItem("userName");
  }
  onDetail() {
    this.checkRoles("ReadRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权打印。",
          time: new Date().getTime()
        });
      } else {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged("print.carsale.detail", {
          id: this.value.Id,
          time: getTimestamp
        });
      }
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
    this.checkRoles("AuditRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权审核。",
          time: new Date().getTime()
        });
      } else {
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
    });
  }
  onAuditNot() {
    this.checkRoles("AuditRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权审核。",
          time: new Date().getTime()
        });
      } else {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged("print.carsale.auditnot", {
          id: this.value.Id,
          time: getTimestamp
        });
      }
    });
  }
  onClick() {
    this.checkRoles("ReadRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权打印。",
          time: new Date().getTime()
        });
      } else {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged("print.carsale", {
          id: this.value.Id,
          time: getTimestamp
        });
      }
    });
  }

  checkRoles(power) {
    const that = this;
    return new Promise((resolve, reject) => {
      const roles = sessionStorage.getItem("roleIds");
      const roleName = that.value[power];
      if (roleName) {
        that.formService.getForms("sys_role").then(
          data => {
            const roles = data.Data;
            const rl = _.find(roles, f => {
              return f["RoleName"] == roleName;
            });
            if (rl && roles.includes(rl["Id"])) {
              resolve(1);
            } else {
              resolve(0);
            }
          },
          err => {}
        );
      } else {
        resolve(1);
      }
    });
  }
}
