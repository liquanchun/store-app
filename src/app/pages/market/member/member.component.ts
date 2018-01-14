import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';

import { MemberService } from './member.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  providers: [MemberService],
})
export class MemberComponent implements OnInit {

  title = '会员信息管理';
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
      customerMan: {
        title: '姓名',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseCode: {
        title: '手机号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      address: {
        title: '微信号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      customerTime: {
        title: '卡号',
        type: 'string',
        width: '100px',
        filter: false,
      },
      cardtype: {
        title: '卡类型',
        type: 'string',
        width: '100px',
        filter: false,
      },
      isOverStay: {
        title: '发卡日期',
        type: 'number',
        filter: false
      },
      ljxfje: {
        title: '累计消费金额',
        type: 'number',
        filter: false
      },
      ljjf: {
        title: '累计积分',
        type: 'number',
        filter: false
      },
      syjf: {
        title: '剩余积分',
        type: 'number',
        filter: false
      },
    }
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private memberService: MemberService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'memberMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.memberService.getMembers().then((data) => {
      this.source.load(data);
    });
  }
}
