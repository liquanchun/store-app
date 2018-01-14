import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';
import { CustomerService } from './customer.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [CustomerService],
})
export class CustomerComponent implements OnInit {
  loading = false;
  title = '顾客档案';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作',
      delete: false
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
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
      customerName: {
        title: '姓名',
        type: 'string',
        filter: false,
      },
      sex: {
        title: '性别',
        type: 'string',
        filter: false,
      },
      mobile: {
        title: '手机号',
        type: 'string',
        filter: false,
      },
      wechat: {
        title: '微信号',
        type: 'string',
        filter: false,
      },
      idCardNo: {
        title: '证件号',
        type: 'string',
        filter: false,
      },
      address: {
        title: '地址',
        type: 'string',
        filter: false,
      },
      birthday: {
        title: '生日',
        type: 'string',
        filter: false,
      },
      isCard: {
        title: '是否会员',
        type: 'string',
        filter: false,
      },
      comeTimes: {
        title: '来店次数',
        type: 'number',
        filter: false
      },
      consumeFee: {
        title: '累计消费',
        type: 'number',
        filter: false
      },
      lastTime: {
        title: '最近来店',
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

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '客户姓名',
      name: 'customerName',
      placeholder: '输入CustomerName',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '性别',
      name: 'sex',
      check: 'radio',
      options: [{ id: '男', name: '男' }, { id: '女', name: '女' }]
    },
    {
      type: 'input',
      label: '电话',
      name: 'mobile',
      placeholder: '输入电话',
    },
    {
      type: 'input',
      label: '地址',
      name: 'address',
      placeholder: '输入地址',
    },
    {
      type: 'input',
      label: '生日',
      name: 'birthday',
      placeholder: '输入地址',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    },
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
    private customerService: CustomerService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'customerName', search: query },
      { field: 'mobile', search: query },
      { field: 'address', search: query },
    ], false);
  }
  onEdit(event){
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.customerService.update(event.data.id, JSON.parse(result)).then((data) => {
          closeBack();
          that.toastOptions.msg = "修改成功。";
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
  getDataList(): void {
    this.loading = true;
    this.customerService.getCustomers().then((data) => {
      this.loading = false;
      this.source.load(data);
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }
}
