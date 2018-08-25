import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbdModalContent } from '../../../modal-content.component'

import { SetGroupService } from './set-group.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import { DateTimeComponent } from '../../components/dateTimeRender/dateTimeRender.component';
import { DatepickerViewComponent } from '../../components/datepickerView/datepickerView.component';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-set-group',
  templateUrl: './set-group.component.html',
  styleUrls: ['./set-group.component.scss'],
  providers: [SetGroupService],
})
export class SetGroupComponent implements OnInit {

  loading = false;
  title = '协议单位';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      name: {
        title: '名称',
        type: 'string',
        width: '100px',
        filter: false,
      },
      linkMan: {
        title: '联系人',
        type: 'string',
        filter: false,
        width: '80px',
      },
      mobile: {
        title: '电话',
        type: 'number',
        filter: false,
        width: '80px',
      },
      address: {
        title: '地址',
        type: 'string',
        filter: false
      },
      contractNo: {
        title: '合同号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      contractDate1: {
        title: '合同开始日期',
        type: 'string',
        filter: false,
      },
      contractDate2: {
        title: '合同截止日期',
        type: 'string',
        filter: false,
      },
      coupons: {
        title: '早餐券',
        type: 'number',
        filter: false
      },
      accountFee: {
        title: '挂账金额',
        type: 'number',
        filter: false,
        editable: false,
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
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required, Validators.minLength(3)],
    },
    {
      type: 'input',
      label: '联系人',
      name: 'linkMan',
      placeholder: '输入联系人',
      validation: [Validators.required],
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
      label: '合同号',
      name: 'contractNo',
      placeholder: '输入合同号',
    },
    {
      type: 'datepicker',
      label: '合同开始日期',
      name: 'contractDate1',
      placeholder: '输入合同开始日期',
    },
    {
      type: 'datepicker',
      label: '合同终止日期',
      name: 'contractDate2',
      placeholder: '输入合同终止日期',
    },
    {
      type: 'input',
      label: '早餐券',
      name: 'coupons',
      placeholder: '输入早餐券',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];
  source: LocalDataSource = new LocalDataSource();

  constructor(
    private modalService: NgbModal,
    private setGroupService: SetGroupService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'name', search: query },
      { field: 'linkMan', search: query },
      { field: 'mobile', search: query },
    ], false);
  }

  getDataList(): void {
    this.loading = true;
    this.setGroupService.getSetGroups().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  onCreate() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增协议单位';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let grp = JSON.parse(result);
      grp.contractDate1 = this._common.getDateString(grp.contractDate1);
      grp.contractDate2 = this._common.getDateString(grp.contractDate2);
      that.setGroupService.create(grp).then((data) => {
        closeBack();
        that.getDataList();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '新增成功。', time: new Date().getTime() });
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    };
  }

  onEdit(event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改协议单位';
    modalRef.componentInstance.config = this.config;
    event.data.contractDate1 = this._common.getDateObject(event.data.contractDate1);
    event.data.contractDate2 = this._common.getDateObject(event.data.contractDate2);
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let grp = JSON.parse(result);
      grp.contractDate1 = this._common.getDateString(grp.contractDate1);
      grp.contractDate2 = this._common.getDateString(grp.contractDate2);
      that.setGroupService.update(event.data.id, grp).then((data) => {
        closeBack();
        that.getDataList();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '修改成功。', time: new Date().getTime() });
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    };
  }
  //删除
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.setGroupService.delete(event.data.id).then((data) => {
        this.getDataList();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '删除成功。', time: new Date().getTime() });
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    }
  }
}
