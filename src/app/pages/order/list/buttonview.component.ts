import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'button-view',
  template: `
  <div class="btn-group tablebutton dropup">
  <button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    操作
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item" href="#">取消订单</a>
    <a class="dropdown-item" href="#">退房结算</a>
  </div>
</div>
    `,
})

export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  code: string;
  constructor(
    private _state: GlobalState,
  ) { }

  ngOnInit() {

  }

  onClick() {

  }
}