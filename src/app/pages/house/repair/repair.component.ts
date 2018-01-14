import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { RepairService } from './repair.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-repair',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.scss'],
  providers: [RepairService],
})
export class RepairComponent implements OnInit {

  title = '维修记录';
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
      houseCode: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      startTime: {
        title: '开始时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      endTime: {
        title: '结束时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      status: {
        title: '维修状态',
        type: 'string',
        filter: false,
        width: '80px',
      },
      reason: {
        title: '维修原因',
        type: 'string',
        filter: false,
        width: '80px',
      },
      result: {
        title: '维修结果',
        type: 'string',
        filter: false,
        width: '80px',
      },
      remark: {
        title: '备注',
        type: 'string',
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
    private repairService: RepairService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'repairMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.repairService.getRepairs().then((data) => {
      this.source.load(data);
    });
  }
}
