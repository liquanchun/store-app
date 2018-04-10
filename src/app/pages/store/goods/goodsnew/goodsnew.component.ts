import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import { DynamicFormComponent }
  from '../../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';
import { Common } from '../../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

import { DicService } from '../../../sys/dic/dic.services';
import { SupplierService } from '../../supplier/supplier.services';
import { UserService } from '../../../sys/components/user/user.services';
import { OrgService } from '../../../sys/components/org/org.services';

import { GlobalState } from '../../../../global.state';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-goodsnew',
  templateUrl: './goodsnew.component.html',
  providers: [DicService, GoodsService, SupplierService, UserService, OrgService],
})
export class GoodsNewComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  title = '新增产品入库';
  isSaved: boolean = false;
  isEnable: boolean = true;
  private goodsid = 0;
  private isNewMenu: boolean = true;
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '产品名称',
      name: 'name',
      placeholder: '输入产品名称',
      validation: [Validators.required],
    },
    {
      type: 'select',
      label: '产品类别',
      name: 'typeId',
      options: [],
    },
    {
      type: 'input',
      label: '产品型号',
      name: 'unit',
      placeholder: '输入产品型号',
    },
    {
      type: 'input',
      label: '产品代码',
      name: 'goodsCode',
      placeholder: '输入产品代码',
    },
    {
      type: 'input',
      label: '产品编码',
      name: 'goodsNo',
      placeholder: '输入产品编码',
    },
    {
      type: 'input',
      label: '最小库存',
      name: 'minAmount',
      placeholder: '输入最小库存',
    },
    {
      type: 'input',
      label: '产品说明',
      name: 'remark',
      placeholder: '输入产品说明',
    },
    {
      type: 'input',
      label: '参考价格',
      name: 'price',
      placeholder: '输入参考价格',
    },
    {
      label: '保存',
      name: 'submit',
      type: 'button',
      callback: function () {
        console.log('back');
      },
    },
  ];
  
  constructor(
    private modalService: NgbModal,
    private goodsService: GoodsService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _dicService: DicService,
    private _router: Router,
    private route: ActivatedRoute,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.goodsid = this.route.snapshot.params['id'];
    this.isNewMenu = !(this.goodsid > 0);
    this.onGetGoodsType();
    this._state.subscribe('backup-click', (data) => {
      this._router.navigate(['/pages/store/goods']);
    });
  }

  submit(value: { [name: string]: any }) {
    const that = this;
    if (this.isNewMenu) {
      this.goodsService.create(value).then(function (menu) {
        that.toastOptions.msg = "保存成功。";
        that.toastyService.success(that.toastOptions);
        that.form.setDisabled('submit', false);
      }, (err) => {

      });
    } else {
      this.goodsService.update(value.id, value).then(function (menu) {
        that.form.setDisabled('submit', false);
      }, (err) => {

      });
    }
  }

  onGetGoodsType() {
    this._dicService.getDicByName('产品类别', (data) => {
      let cfg = _.find(this.config, f => { return f['name'] == 'typeId'; });
      if (cfg) {
        cfg.options = data;
      }
    });
  }
}
