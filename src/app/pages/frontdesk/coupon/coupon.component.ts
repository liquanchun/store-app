import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { CouponService } from './coupon.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss'],
  providers: [CouponService],
})
export class CouponComponent implements OnInit {

  title = '早餐券管理';
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
      couponTime: {
        title: '有效日期',
        type: 'string',
        width: '100px',
        filter: false,
      },
      couponMan: {
        title: '客户姓名',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseCode: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      address: {
        title: '数量',
        type: 'string',
        filter: false,
        width: '80px',
      },
      isOverStay: {
        title: '发放时间',
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
    private couponService: CouponService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'couponMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.couponService.getCoupons().then((data) => {
      this.source.load(data);
    });
  }
}
