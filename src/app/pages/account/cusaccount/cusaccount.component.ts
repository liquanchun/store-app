import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { CusaccountService } from './cusaccount.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-cusaccount',
  templateUrl: './cusaccount.component.html',
  styleUrls: ['./cusaccount.component.scss'],
  providers: [CusaccountService],
})
export class CusaccountComponent implements OnInit {

  title = '客账查询';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作',
      edit: false,
      delete: false,
      add: false
    },
    hideSubHeader: true,
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
      },
      houseCode: {
        title: '房间号',
        type: 'string',
        filter: false
      },
      cusName: {
        title: '客户姓名',
        type: 'string',
        filter: false
      },
      createdAt: {
        title: '消费时间',
        type: 'string',
        filter: false,
      },
      itemName: {
        title: '项目',
        type: 'string',
        filter: false,
      },
      number: {
        title: '数量',
        type: 'string',
        filter: false,
      },
      amount: {
        title: '金额',
        type: 'string',
        filter: false,
      },
      orderNo: {
        title: '订单号',
        type: 'string',
        filter: false
      },
      payTypeTxt: {
        title: '支付方式',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      },
      createdBy: {
        title: '操作人',
        type: 'string',
        filter: false
      }
    }
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private cusaccountService: CusaccountService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'cusName', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.cusaccountService.getCusaccounts().then((data) => {
      this.source.load(data);
    });
  }
}
