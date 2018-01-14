import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { ScheduleService } from './schedule.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  providers: [ScheduleService],
})
export class ScheduleComponent implements OnInit {

  title = '排房查询';
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
      scheduleTime: {
        title: '预定时间',
        type: 'string',
        width: '100px',
        filter: false,
      },
      scheduleMan: {
        title: '预定单号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseCode: {
        title: '预定人',
        type: 'string',
        filter: false,
        width: '80px',
      },
      address: {
        title: '预定方式',
        type: 'string',
        filter: false,
        width: '80px',
      },
      isOverStay: {
        title: '预抵时间',
        type: 'number',
        filter: false
      },
      createdBy: {
        title: '房型',
        type: 'string',
        filter: false
      },
      code: {
        title: '房号',
        type: 'string',
        filter: false
      },
      state: {
        title: '状态',
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
    private scheduleService: ScheduleService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'scheduleMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.scheduleService.getSchedules().then((data) => {
      this.source.load(data);
    });
  }
}
