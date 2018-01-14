import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { InvoiceService } from './invoice.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  providers: [InvoiceService],
})
export class InvoiceComponent implements OnInit {

  title = '发票管理';
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
      createdAt: {
        title: '姓名',
        type: 'string',
        width: '100px',
        filter: false,
      },
      typeName: {
        title: '发票抬头',
        type: 'string',
        filter: false,
        width: '80px',
      },
      goodsName: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      goodsPrice: {
        title: '消费金额',
        type: 'string',
        filter: false,
        width: '80px',
      },
      cusName: {
        title: '开票金额',
        type: 'string',
        filter: false
      },
      mobile: {
        title: '税金',
        type: 'string',
        filter: false
      },
      houseCode: {
        title: '发票号码',
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
    private invoiceService: InvoiceService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'invoiceMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.invoiceService.getInvoices().then((data) => {
      this.source.load(data);
    });
  }
}
