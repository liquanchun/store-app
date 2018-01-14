import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbdModalContent } from '../../../modal-content.component'
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { HouseFeeService } from './house-fee.services';
import { HouseTypeService } from '../../sys/house-type/house-type.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-house-fee',
  templateUrl: './house-fee.component.html',
  styleUrls: ['./house-fee.component.scss'],
  providers: [HouseFeeService, HouseTypeService],
})
export class HouseFeeComponent implements OnInit, AfterViewInit {

  loading = false;
  query: string = '';

  settingsAll = {
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
        width: '30px',
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false,
      },
      halfPriceHours: {
        title: '首日计半价时长',
        type: 'number',
        filter: false
      },
      allPriceHours: {
        title: '首日计全价时长',
        type: 'number',
        filter: false
      },
      leaveTime: {
        title: '退房时间',
        type: 'string',
        filter: false
      },
      addFeeHours: {
        title: '加收缓冲时长',
        type: 'number',
        filter: false
      },
      addFeeType: {
        title: '加收方式',
        type: 'string',
        filter: false
      },
      addAllDay: {
        title: '固定加收全日租',
        type: 'number',
        filter: false
      },
      addAllHours: {
        title: '加租全日租时长',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };


  settingsHours = {
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
        width: '30px',
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      hours: {
        title: '时长',
        type: 'number',
        filter: false
      },
      halfPriceHours: {
        title: '计半价时长',
        type: 'number',
        filter: false
      },
      checkInTime1: {
        title: '入住时间起',
        type: 'string',
        filter: false
      },
      checkInTime2: {
        title: '入住时间止',
        type: 'string',
        filter: false
      },
      addBuffTime: {
        title: '加收缓冲时间',
        type: 'number',
        filter: false
      },
      turnNormal: {
        title: '超过多少分钟转正常',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };


  settingsOther = {
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
        width: '30px',
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      halfPriceHours: {
        title: '计半价时长',
        type: 'number',
        filter: false
      },
      allPriceHours: {
        title: '计全价时长',
        type: 'number',
        filter: false
      },
      checkInTime1: {
        title: '入住时间起',
        type: 'string',
        filter: false
      },
      checkInTime2: {
        title: '入住时间止',
        type: 'string',
        filter: false
      },
      leaveTime: {
        title: '退房时间',
        type: 'string',
        filter: false
      },
      addBuffTime: {
        title: '加收缓冲时间',
        type: 'number',
        filter: false
      },
      addFeeType: {
        title: '加收方式',
        type: 'number',
        filter: false
      },
      turnNormal: {
        title: '超过多少分钟转正常',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  configAll: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '首日计半价时长',
      name: 'halfPriceHours',
      placeholder: '输入首日计半价时长',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '首日计全价时长',
      name: 'allPriceHours',
      placeholder: '输入首日计全价时长',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '退房时间',
      name: 'leaveTime',
      placeholder: '输入退房时间',
    },
    {
      type: 'input',
      label: '加收缓冲时长',
      name: 'addFeeHours',
      placeholder: '输入加收缓冲时长',
    },
    {
      type: 'input',
      label: '固定加收全日租',
      name: 'addAllDay',
      placeholder: '输入固定加收全日租',
    },
    {
      type: 'input',
      label: '加租全日租时长',
      name: 'addAllHours',
      placeholder: '输入加租全日租时长',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configHours: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '时长',
      name: 'hours',
      placeholder: '输入时长',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '计半价时长',
      name: 'halfPriceHours',
      placeholder: '输入计半价时长',
    },
    {
      type: 'input',
      label: '入住时间起',
      name: 'checkInTime1',
      placeholder: '输入入住时间起',
    },
    {
      type: 'input',
      label: '入住时间止',
      name: 'checkInTime2',
      placeholder: '输入入住时间止',
    },
    {
      type: 'input',
      label: '加收缓冲时间',
      name: 'addBuffTime',
      placeholder: '输入加收缓冲时间',
    },
    {
      type: 'input',
      label: '超过多少分钟转正常',
      name: 'turnNormal',
      placeholder: '输入超过多少分钟转正常',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configOther: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '计半价时长',
      name: 'halfPriceHours',
      placeholder: '输入计半价时长',
    },
    {
      type: 'input',
      label: '计全价时长',
      name: 'allPriceHours',
      placeholder: '输入计全价时长',
    },
    {
      type: 'input',
      label: '入住时间起',
      name: 'checkInTime1',
      placeholder: '输入入住时间起',
    },
    {
      type: 'input',
      label: '入住时间止',
      name: 'checkInTime2',
      placeholder: '输入入住时间止',
    },
    {
      type: 'input',
      label: '退房时间',
      name: 'leaveTime',
      placeholder: '输入退房时间',
    },
    {
      type: 'input',
      label: '加收缓冲时间',
      name: 'addBuffTime',
      placeholder: '输入加收缓冲时间',
    },
    {
      type: 'input',
      label: '超过多少分钟转正常',
      name: 'turnNormal',
      placeholder: '输入超过多少分钟转正常',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  modalConfig: any = {};

  sourceAll: LocalDataSource = new LocalDataSource();
  sourceHours: LocalDataSource = new LocalDataSource();
  sourceOther: LocalDataSource = new LocalDataSource();

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  constructor(
    private modalService: NgbModal,
    private houseFeeService: HouseFeeService,
    private _houseTypeService: HouseTypeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
    this.modalConfig.SetAllhousePrice = this.configAll;
    this.modalConfig.SetHourhousePrice = this.configHours;
    this.modalConfig.SetOtherhousePrice = this.configOther;
  }
  ngAfterViewInit() {

  }

  getDataList(): void {
    this.loading = true;
    this.houseFeeService.getHouseFees('SetAllhousePrice').then((data) => {
      this.sourceAll.load(data);
      this.loading = false;
    });
    this.houseFeeService.getHouseFees('SetHourhousePrice').then((data) => {
      this.sourceHours.load(data);
      this.loading = false;
    });
    this.houseFeeService.getHouseFees('SetOtherhousePrice').then((data) => {
      this.sourceOther.load(data);
      this.loading = false;
    });
  }

  onNewFee(modalname, title) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.config = this.modalConfig[modalname];
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseFeeService.create(modalname, JSON.parse(result)).then((data) => {
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

  onEdit(modalname, title, event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.config = this.modalConfig[modalname];
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseFeeService.update(modalname, event.data.id, JSON.parse(result)).then((data) => {
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

  //删除
  onDelete(modalname, event) {
    if (window.confirm('你确定要删除吗?')) {
      this.houseFeeService.delete(modalname, event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

  getHouseType(): void {
    this._houseTypeService.getHouseTypes().then((data) => {
      const that = this;
      let houseT = _.find(this.configAll, function (f) { return f.name == 'houseType'; })
      _.each(data, function (d) {
        houseT.options.push({ id: d.id, name: d.typeName });
      });
    });
  }
}
