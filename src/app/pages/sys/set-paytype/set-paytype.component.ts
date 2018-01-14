import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { NgbdModalContent } from '../../../modal-content.component'
import { SetPaytypeService } from './set-paytype.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-set-paytype',
  templateUrl: './set-paytype.component.html',
  styleUrls: ['./set-paytype.component.scss'],
  providers: [SetPaytypeService],
})
export class SetPaytypeComponent implements OnInit, AfterViewInit {

  loading = false;
  query: string = '';

  settings = {
    mode: 'external',
    hideSubHeader: true,
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
    columns: {
      id: {
        title: 'ID',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      code: {
        title: '代码',
        type: 'string',
        filter: false
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      payType: {
        title: '支付类型',
        type: 'string',
        filter: false
      },
      isReturnT: {
        title: '是否可退',
        filter: false,
        editor: {
          type: 'checkbox',
          config: {
            true: '是',
            false: '否',
          },
        },
      },
      isIntegralT: {
        title: '是否积分',
        filter: false,
        editor: {
          type: 'checkbox',
          config: {
            true: '是',
            false: '否',
          },
        },
      },
      isDefaultT: {
        title: '是否默认',
        filter: false,
        editor: {
          type: 'checkbox',
          config: {
            true: '是',
            false: '否',
          },
        },
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '代码',
      name: 'code',
      placeholder: '输入代码',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '支付类型',
      name: 'payType',
      placeholder: '输入支付类型',
    },
    {
      type: 'truefalse',
      label: '是否可退',
      name: 'isReturn',
    },
    {
      type: 'truefalse',
      label: '是否积分',
      name: 'isIntegral',
    },
    {
      type: 'truefalse',
      label: '是否默认',
      name: 'isDefault',
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
    private setPaytypeService: SetPaytypeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
  }
  ngAfterViewInit() {

  }

  getDataList(): void {
    this.loading = true;
    this.setPaytypeService.getSetPaytypes().then((data) => {
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }
  newHouse() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增支付方式';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.setPaytypeService.create(JSON.parse(result)).then((data) => {
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

  onEdit(event) {
    console.log(event);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改支付方式';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.setPaytypeService.update(event.data.id, JSON.parse(result)).then((data) => {
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
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.setPaytypeService.delete(event.data.id).then((data) => {
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
