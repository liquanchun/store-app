import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { HouseinfoService } from '../../house/houseinfo/houseinfo.services';
import { HouseTypeService } from '../../sys/house-type/house-type.services';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { NgbdModalContent } from '../../../modal-content.component'
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { BookService } from './book.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';
import { retry } from 'rxjs/operator/retry';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [BookService, HouseinfoService, HouseTypeService],
})
export class BookComponent implements OnInit {

  loading = false;
  title = '预定管理';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    edit: {
      editButtonContent: '详情',
      confirmSave: false,
    },
    delete: {
      deleteButtonContent: '取消',
      confirmDelete: true
    },
    columns: {
      orderNo: {
        title: '单号',
        type: 'string',
        editable: false,
        filter: false,
      },
      status: {
        title: '状态',
        type: 'string',
        filter: false,
      },
      cusName: {
        title: '预定人',
        type: 'string',
        filter: false,
      },
      mobile: {
        title: '手机号',
        type: 'string',
        filter: false,
      },
      bookTime: {
        title: '预定时间',
        type: 'string',
        filter: false,
      },
      reachTime: {
        title: '预抵时间',
        type: 'string',
        filter: false
      },
      days: {
        title: '天数',
        type: 'number',
        filter: false
      },
      leaveTime: {
        title: '预离时间',
        type: 'string',
        filter: false
      },
      retainTime: {
        title: '保留时间',
        type: 'string',
        filter: false
      },
      checkInType: {
        title: '入住方式',
        type: 'string',
        filter: false
      },
      houseTypeId: {
        title: '房型',
        type: 'string',
        filter: false
      },
      houseNum: {
        title: '房间数',
        type: 'number',
        filter: false
      },
      channels: {
        title: '渠道',
        type: 'string',
        filter: false
      },
    }
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '预定人',
      name: 'cusName',
      placeholder: '输入预定人',
      validation: [Validators.required, Validators.minLength(2)],
    },
    {
      type: 'input',
      label: '电话',
      name: 'mobile',
      placeholder: '输入电话',
      validation: [Validators.required, Validators.minLength(3)],
    },
    {
      type: 'input',
      label: '身份证',
      name: 'iDCard',
      placeholder: '输入身份证',
      validation: [Validators.required],
    },
    {
      type: 'datepicker',
      label: '预抵时间',
      name: 'reachTime',
      time: '15:30',
    },
    {
      type: 'input',
      label: '天数',
      name: 'days',
      placeholder: '输入天数',
    },
    {
      type: 'datepicker',
      label: '预离时间',
      name: 'leaveTime',
      time: '15:30',
    },
    {
      type: 'datepicker',
      label: '保留时间',
      name: 'retainTime',
      time: '15:30',
    },
    {
      type: 'check',
      label: '入住方式',
      name: 'checkInType',
      check: 'radio',
      options: [
        { id: '全天房', name: '全天房' },
        { id: '钟点房', name: '钟点房' },
        { id: '特殊房', name: '特殊房' },
      ]
    },
    {
      type: 'check',
      label: '房型',
      name: 'houseTypeId',
      check: 'radio',
      options: []
    },
    {
      type: 'input',
      label: '房间数',
      name: 'houseNum',
      placeholder: '输入房间数',
    }
  ];

  source: LocalDataSource = new LocalDataSource();
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  constructor(
    private modalService: NgbModal,
    private bookService: BookService,
    private houseinfoService: HouseinfoService,
    private _houseTypeService: HouseTypeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _common: Common,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
    this.getHouseType();
  }

  onCreate() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增预定';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      const book = JSON.parse(result);
      if (book.reachTime) {
        book.reachTime = that._common.getDateString2(book.reachTime);
      }
      if (book.leaveTime) {
        book.leaveTime = that._common.getDateString2(book.leaveTime);
      }
      if (book.retainTime) {
        book.retainTime = that._common.getDateString2(book.retainTime);
      }
      that.bookService.create(book).then((data) => {
        closeBack();
        that.toastOptions.msg = "新增成功。";
        that.toastyService.success(that.toastOptions);
        that.getDataList();
      },
        (err) => {
          that.toastOptions.msg = err;
          that.toastyService.error(that.toastOptions);
        }
      )
    };
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'cusName', search: query },
      { field: 'mobile', search: query },
      { field: 'channels', search: query },
    ], false);
  }
  getHouseType(): void {
    this._houseTypeService.getHouseTypes().then((data) => {
      let opt = [];
      _.each(data, d => {
        opt.push({ id: d['id'], name: d['typeName'] });
      });
      let conf = _.find(this.config, f => { return f.name == 'houseTypeId'; });
      conf.options = opt;
    });
  }
  getDataList(): void {
    this.loading = true;
    this.bookService.getBooks().then((data) => {
      this.loading = false;
      this.source.load(data);
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }

  onDelete(event) {
    if (window.confirm('你确定要取消吗?')) {
      this.bookService.delete(event.data.id).then((data) => {
        this.getDataList();
      });
    }
  }

  onEdit(event) {

  }
}
