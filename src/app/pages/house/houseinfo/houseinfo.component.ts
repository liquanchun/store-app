import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import { HouseinfoService } from './houseinfo.services';
import { HouseTypeService } from '../../sys/house-type/house-type.services';

import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-houseinfo',
  templateUrl: './houseinfo.component.html',
  styleUrls: ['./houseinfo.component.scss'],
  providers: [HouseinfoService, HouseTypeService],
})
export class HouseinfoComponent implements OnInit {

  loading = false;
  title = '房间管理';
  query: string = '';

  settings = {
    mode: 'external',
    selectMode: 'multi',
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
      code: {
        title: '房号',
        type: 'string',
        filter: false,
        width: '80px',
      },
      floor: {
        title: '楼层',
        type: 'string',
        filter: false,
        width: '80px',
      },
      houseTypeTxt: {
        title: '房型',
        type: 'string',
        filter: false,
        width: '80px',
      },
      tags: {
        title: '房屋信息',
        type: 'string',
        filter: false,
        width: '80px',
      },
      stateTxt: {
        title: '房屋状态',
        type: 'string',
        filter: false,
        width: '80px',
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
      type: 'select',
      label: '楼层',
      name: 'floor',
      options: [{ id: '6楼', name: '6楼' }, { id: '7楼', name: '7楼' }, { id: '8楼', name: '8楼' }],
      placeholder: '选择楼层',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '房间编号',
      name: 'code',
      placeholder: '输入房间编号',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '房间类型',
      name: 'houseType',
      check: 'radio',
      options: []
    },
    {
      type: 'input',
      label: '房间特征',
      name: 'tags',
      placeholder: '输入房间特征',
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
    private houseinfoService: HouseinfoService,
    private _houseTypeService: HouseTypeService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
    this.getHouseType();
  }

  newHouse() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseinfoService.create(JSON.parse(result)).then((data) => {
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
      { field: 'code', search: query },
      { field: 'tags', search: query },
      { field: 'state', search: query },
    ], false);
  }

  onEdit(event) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.houseinfoService.update(event.data.id, JSON.parse(result)).then((data) => {
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
  //删除
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.houseinfoService.delete(event.data.id).then((data) => {
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
    this.houseinfoService.getHouseinfos().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }
  getHouseType(): void {

    this._houseTypeService.getHouseTypes().then((data) => {
      const that = this;
      let houseT = _.find(this.config, function (f) { return f.name == 'houseType'; })
      _.each(data, function (d) {
        houseT.options.push({ id: d.id, name: d.typeName });
      });
    });
  }
}
