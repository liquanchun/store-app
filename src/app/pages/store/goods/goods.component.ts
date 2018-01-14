import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { LocalDataSource } from 'ng2-smart-table';
import { GoodsService } from './goods.services';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import { DicService } from '../../sys/dic/dic.services';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-goods',
  templateUrl: './goods.component.html',
  styleUrls: ['./goods.component.scss'],
  providers: [GoodsService, DicService]
})
export class GoodsComponent implements OnInit {

  loading = false;
  title = '货品信息';
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
        width: '30px',
      },
      name: {
        title: '名称',
        type: 'string',
        filter: false,
      },
      typeName: {
        title: '类别',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '单位',
        type: 'string',
        filter: false,
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false,
      },
      maxAmount: {
        title: '最大库存',
        type: 'number',
        filter: false
      },
      minAmount: {
        title: '最小库存',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
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
      type: 'select',
      label: '类别',
      name: 'typeId',
      options: [],
    },
    {
      type: 'input',
      label: '单位',
      name: 'unit',
      placeholder: '输入单位',
    },
    {
      type: 'input',
      label: '最大库存',
      name: 'maxAmount',
      placeholder: '输入最大库存',
    },
    {
      type: 'input',
      label: '最小库存',
      name: 'minAmount',
      placeholder: '输入最小库存',
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
    private goodsService: GoodsService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _dicService: DicService,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.onGetGoodsType();
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'goodsstoreMan', search: query },
      { field: 'houseCode', search: query },
      { field: 'createdBy', search: query },
    ], false);
  }

  getDataList(): void {
    this.loading = true;
    this.goodsService.getGoodss().then((data) => {
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
    modalRef.componentInstance.title = '新增货品信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.goodsService.create(JSON.parse(result)).then((data) => {
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
    modalRef.componentInstance.title = '修改货品信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.goodsService.update(event.data.id, JSON.parse(result)).then((data) => {
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
      this.goodsService.delete(event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

  onGetGoodsType() {
    this._dicService.getDicByName('商品类别', (data) => {
      let cfg = _.find(this.config, f => { return f['name'] == 'typeId'; });
      if (cfg) {
        cfg.options = data;
      }
    });
  }
}
