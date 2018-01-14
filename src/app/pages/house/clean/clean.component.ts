import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { CleanService } from './clean.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-clean',
  templateUrl: './clean.component.html',
  styleUrls: ['./clean.component.scss'],
  providers: [CleanService],
})
export class CleanComponent implements OnInit {

  title = '房扫查询';
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
      cleanTime: {
        title: '房扫时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      cleanMan: {
        title: '房扫人员',
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
        title: '房型',
        type: 'string',
        filter: false,
        width: '80px',
      },
      isOverStay: {
        title: '是否续住',
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
    private cleanService: CleanService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'cleanMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.cleanService.getCleans().then((data) => {
      this.source.load(data);
    });
  }
}
