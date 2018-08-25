import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'

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
    pager: {
      perPage: 15
    },
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
      name: {
        title: '名称',
        type: 'string',
        filter: false,
      },
      city: {
        title: '城市',
        type: 'string',
        filter: false,
      },
      address: {
        title: '地址',
        type: 'string',
        filter: false,
      },
      tel: {
        title: '联系电话',
        type: 'string',
        filter: false,
      },
      faxNo: {
        title: '传真号码',
        type: 'string',
        filter: false,
      },
      linkMan: {
        title: '联系人',
        type: 'string',
        filter: false,
      },
      linkManTitle: {
        title: '联系人职位',
        type: 'string',
        filter: false,
      },
      linkManTel: {
        title: '联系人电话',
        type: 'string',
        filter: false,
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false,
      },
      createdBy: {
        title: '录入人',
        type: 'string',
        filter: false
      },
    }
  };
  source: LocalDataSource = new LocalDataSource();
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
      label: '城市',
      name: 'city',
      placeholder: '输入城市',
    },
    {
      type: 'input',
      label: '地址',
      name: 'address',
      placeholder: '输入地址',
    },
    {
      type: 'input',
      label: '联系电话',
      name: 'tel',
      placeholder: '输入联系电话',
    },
    {
      type: 'input',
      label: '传真号码',
      name: 'faxNo',
      placeholder: '输入传真号码',
    },
    {
      type: 'input',
      label: '联系人',
      name: 'linkMan',
      placeholder: '输入联系人',
    },
    {
      type: 'input',
      label: '联系人职位',
      name: 'linkManTitle',
      placeholder: '输入联系人职位',
    },
    {
      type: 'input',
      label: '联系人电话',
      name: 'linkManTel',
      placeholder: '输入联系人电话',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  constructor(
    private modalService: NgbModal,
    private supplierService: SupplierService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'name', search: query },
      { field: 'address', search: query },
      { field: 'linkManTitle', search: query },
      { field: 'linkManTel', search: query },
    ], false);
  }

  getDataList(): void {
    this.loading = true;
    this.supplierService.getSuppliers().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
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
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '新增成功。', time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
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
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '修改成功。', time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    };
  }

  onDelete(event){
    if (window.confirm('你确定要删除吗?')) {
      this.supplierService.delete(event.data.id).then((data) => {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '删除成功。', time: new Date().getTime() });
        this.getDataList();
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    }
  }

}
