import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { AdddelService } from './adddel.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-adddel',
  templateUrl: './adddel.component.html',
  styleUrls: ['./adddel.component.scss'],
  providers: [AdddelService],
})
export class AdddelComponent implements OnInit {

  title = '报损报溢';
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
      adddelTime: {
        title: '单据号',
        type: 'string',
        width: '100px',
        filter: false,
      },
      adddelMan: {
        title: '日期',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseCode: {
        title: '类型',
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
      remak: {
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
    private adddelService: AdddelService,
    private _common: Common,
    private _state: GlobalState) {
    this.getDataList();
  }
  ngOnInit() {

  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'adddelMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.adddelService.getAdddels().then((data) => {
      this.source.load(data);
    });
  }
}
