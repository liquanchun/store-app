import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { PremoneyService } from './premoney.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-premoney',
  templateUrl: './premoney.component.html',
  styleUrls: ['./premoney.component.scss'],
  providers: [PremoneyService],
})
export class PremoneyComponent implements OnInit {

  title = '预定金查询';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作',
      add: false,
      edit: false,
      delete: false,
    },
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
        title: '消费时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      cusName: {
        title: '客户姓名',
        type: 'string',
        filter: false,
        width: '80px',
      },
      payTypeTxt: {
        title: '支付类型',
        type: 'string',
        filter: false,
        width: '80px',
      },
      amount: {
        title: '金额',
        type: 'string',
        filter: false,
        width: '80px',
      },
      orderNo: {
        title: '单据号',
        type: 'string',
        filter: false
      },
      createdBy: {
        title: '操作员',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      },
    }
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private premoneyService: PremoneyService,
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
    this.premoneyService.getPremoneys().then((data) => {
      this.source.load(data);
    });
  }
}
