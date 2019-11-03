import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';
import { FormService } from '../form/form.services';
import * as _ from 'lodash';
@Component({
  selector: 'print-button-view',
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
        <a class="dropdown-item" (click)="onClick()" href="javaScript:void(0)">打印</a>
        <a *ngIf="value.Creator == currentUser && value.Status == '订单' && value.AuditResult == '通过'" class="dropdown-item" (click)="onCheck()" href="javaScript:void(0)"
          >转结算单</a
        >
        <a *ngIf="value.Status != '订单' && value.AuditResult != '通过'" class="dropdown-item" (click)="onAudit()" href="javaScript:void(0)">审核</a>
        <a *ngIf="value.Status == '订单' && value.AuditResult == '通过'" class="dropdown-item" (click)="onAuditNot()" href="javaScript:void(0)">反审核</a>
        <a *ngIf="value.Status == '订单' && value.AuditResult == '通过'" class="dropdown-item" (click)="onAddDeposit()" href="javaScript:void(0)">追加订金</a>
      </div>
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
    this.currentUser = sessionStorage.getItem('userName');
  }
  // 详情
  onDetail() {
    this.checkRoles('AuditRoles').then(d => {
      if (d == 1) {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged('print.carsale.detail', {
          id: this.value.Id,
          time: getTimestamp
        });
      } else {
        this.checkRoles('ReadRoles').then(d => {
          if (d == 0) {
            this._state.notifyDataChanged('messagebox', {
              type: 'warning',
              msg: '你无权查看。',
              time: new Date().getTime()
            });
          } else {
            this.save.emit(this.rowData);

            const getTimestamp = new Date().getTime();
            this._state.notifyDataChanged('print.carsale.detail', {
              id: this.value.Id,
              time: getTimestamp
            });
          }
        });
      }
    });
  }
  // 转结算
  onAddDeposit() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsale.adddeposit', {
      id: this.value.Id,
      time: getTimestamp
    });
  }
  onCheck() {
    this.save.emit(this.rowData);

    const getTimestamp = new Date().getTime();
    this._state.notifyDataChanged('print.carsale.check', {
      id: this.value.Id,
      time: getTimestamp
    });
  }

  onAudit() {
    this.checkRoles('AuditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权审核。',
          time: new Date().getTime()
        });
      } else {
        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged('print.carsale.audit', {
          id: this.value.Id,
          time: getTimestamp
        });
      }
    });
  }
  onAuditNot() {
    this.checkRoles('AuditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权审核。',
          time: new Date().getTime()
        });
      } else {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged('print.carsale.auditnot', {
          id: this.value.Id,
          time: getTimestamp
        });
      }
    });
  }
  // 打印
  onClick() {
    this.checkRoles('ReadRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权打印。',
          time: new Date().getTime()
        });
      } else {
        this.save.emit(this.rowData);

        const getTimestamp = new Date().getTime();
        this._state.notifyDataChanged('print.carsale', {
          id: this.value.Id,
          time: getTimestamp
        });
      }
    });
  }

  checkRoles(power) {
    const that = this;
    return new Promise((resolve, reject) => {
      const roleIds = sessionStorage.getItem('roleIds');
      const roleName = that.value[power];
      if (roleName) {
        that.formService.getForms('sys_role').then(
          data => {
            const roles = data.Data;
            const rl = _.find(roles, f => {
              return f['RoleName'] == roleName;
            });
            if (rl && roleIds.includes(rl['Id'])) {
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
