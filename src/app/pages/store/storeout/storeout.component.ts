import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { StoreoutService } from './storeout.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-storeout',
  templateUrl: './storeout.component.html',
  styleUrls: ['./storeout.component.scss'],
  providers: [StoreoutService],
})
export class StoreoutComponent implements OnInit {

  title = '出库查询';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
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
      storeoutTime: {
        title: '单据号',
        type: 'string',
        width: '100px',
        filter: false,
      },
      storeoutMan: {
        title: '类型',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseCode: {
        title: '日期',
        type: 'string',
        filter: false,
        width: '80px',
      },
      address: {
        title: '仓库',
        type: 'string',
        filter: false,
        width: '80px',
      },
      isOverStay: {
        title: '经办人',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'number',
        filter: false
      },
      createdBy: {
        title: '操作员',
        type: 'string',
        filter: false
      },
    }
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private storeoutService: StoreoutService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'storeoutMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.storeoutService.getStoreouts().then((data) => {
      this.source.load(data);
    });
  }
}
