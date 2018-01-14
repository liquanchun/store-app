import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { StatelogService } from './statelog.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-statelog',
  templateUrl: './statelog.component.html',
  styleUrls: ['./statelog.component.scss'],
  providers: [StatelogService],
})
export class StatelogComponent implements OnInit {

  title = '房态日志';
  query: string = '';
  loading = false;
  settings = {
    mode: 'external',
    actions: false,
    hideSubHeader: true,
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      createdAt: {
        title: '变更时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      houseCode: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      oldStateTxt: {
        title: '原状态',
        type: 'string',
        filter: false,
        width: '80px',
      },
      newStateTxt: {
        title: '新状态',
        type: 'string',
        filter: false,
        width: '80px',
      },
      orderNo: {
        title: '订单号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      createdBy: {
        title: '操作员',
        type: 'string',
        filter: false
      },
    }
  };

  source: LocalDataSource = new LocalDataSource();
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(
    private statelogService: StatelogService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'oldState', search: query },
      { field: 'houseCode', search: query },
      { field: 'newState', search: query },
    ], false);
  }

  getDataList(): void {
    this.loading = true;
    this.statelogService.getStatelogs().then((data) => {
      this.loading = false;
      this.source.load(data);
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }
}
