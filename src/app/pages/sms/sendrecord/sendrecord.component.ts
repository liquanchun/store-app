import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SendrecordService } from './sendrecord.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-sendrecord',
  templateUrl: './sendrecord.component.html',
  styleUrls: ['./sendrecord.component.scss'],
  providers: [SendrecordService],
})
export class SendrecordComponent implements OnInit {

  loading = false;
  title = '发送记录';
  query: string = '';

  settings = {
    mode: 'external',
    selectMode: 'multi',
    actions: {
      columnTitle: '操作',
      edit:false
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
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
        title: '发送时间',
        type: 'string',
        filter: false,
        width: '80px',
      },
      mobile: {
        title: '手机号码',
        type: 'string',
        filter: false,
        width: '80px',
      },
      business: {
        title: '业务',
        type: 'string',
        filter: false,
        width: '80px',
      },
      content: {
        title: '内容',
        type: 'string',
        filter: false,
        width: '80px',
      },
      status: {
        title: '状态',
        type: 'string',
        filter: false,
        width: '80px',
      },
    }
  };

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
    private sendrecordService: SendrecordService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'mobile', search: query },
      { field: 'content', search: query },
    ], false);
  }

  //删除
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.sendrecordService.delete(event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

  getDataList(): void {
    this.loading = true;
    this.sendrecordService.getSendrecords().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }
}
