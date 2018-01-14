import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import { SupplierService } from './supplier.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  providers: [SupplierService],
})
export class SupplierComponent implements OnInit {

  loading = false;
  title = '供应商信息';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
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
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false,
      },
      address: {
        title: '地址',
        type: 'string',
        filter: false,
      },
      linkMan: {
        title: '联系人',
        type: 'string',
        filter: false,
      },
      tel: {
        title: '联系电话',
        type: 'string',
        filter: false,
      },
      bankName: {
        title: '银行',
        type: 'string',
        filter: false,
      },
      bankAcc: {
        title: '账户名',
        type: 'string',
        filter: false,
      },
      bankAccNo: {
        title: '账号',
        type: 'string',
        filter: false,
      },
      createdBy: {
        title: '操作员',
        type: 'string',
        filter: false
      },
    }
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '地址',
      name: 'address',
      placeholder: '输入地址',
    },
    {
      type: 'input',
      label: '联系人',
      name: 'linkMan',
      placeholder: '输入联系人',
    },
    {
      type: 'input',
      label: '联系电话',
      name: 'tel',
      placeholder: '输入联系电话',
    },
    {
      type: 'input',
      label: '银行',
      name: 'bankName',
      placeholder: '输入银行',
    },
    {
      type: 'input',
      label: '账户名',
      name: 'bankAcc',
      placeholder: '输入账户名',
    },
    {
      type: 'input',
      label: '账号',
      name: 'bankAccNo',
      placeholder: '输入账号',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
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
    private supplierService: SupplierService,
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
      { field: 'supplierMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.loading = true;
    this.supplierService.getSuppliers().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }

  onCreate(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增供应商信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.supplierService.create(JSON.parse(result)).then((data) => {
        closeBack();
        that.toastOptions.msg = "新增成功。";
        that.toastyService.success(that.toastOptions);
        that.getDataList();
      },
        (err) => {
          that.toastOptions.msg = err;
          that
            .toastyService.error(that.toastOptions);
        }
      )
    }
  }

  onEdit(event){
    const that = this;
    const modalRef =this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改供应商信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.supplierService.update(event.data.id, JSON.parse(result)).then((data) => {
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

  onDelete(event){
    if (window.confirm('你确定要删除吗?')) {
      this.supplierService.delete(event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

}
