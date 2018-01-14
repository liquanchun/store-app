import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Common } from '../../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

import { StoreinNewService } from './storeinnew.services';
import { DicService } from '../../../sys/dic/dic.services';
import { SupplierService } from '../../supplier/supplier.services';
import { UserService } from '../../../sys/components/user/user.services';

import { GlobalState } from '../../../../global.state';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-storeinnew',
  templateUrl: './storeinnew.component.html',
  styleUrls: ['./storeinnew.component.scss'],
  providers: [StoreinNewService, DicService, GoodsService, SupplierService, UserService],
})
export class StoreinNewComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  title = '新增产品入库';
  isSaved: boolean = false;

  storeIn: any = {
    typeId: 0,
    inTime: '',
    supplierId: 0,
    storeId: '',
    orgid: 0,
    orgtext: '',
    operator: '',
    amount: 0,
    billNo: '',
    remark: ''
  };
  //选择的行
  selectedRow: any;
  //仓库
  stores: any = [];
  //入库类型
  inType: any = [];
  //供应商
  suppliers: any = [];
  //操作人
  operator: any = [];
  //用户
  users: any = [];
  //产品类别
  goodsType: any = [];
  //产品信息
  goodsInfo: any = [];
  //选中的产品信息
  selectedGoods: any = [];
  //选中的产品信息表格
  selectedGrid: LocalDataSource = new LocalDataSource();
  //弹出框表格
  popGrid: LocalDataSource = new LocalDataSource();

  settingsGoods = {
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
    noDataMessage: '',
    add: {
      addButtonContent: '<i class="ion-ios-plus-outline"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      saveButtonContent: '保存',
      cancelButtonContent: '取消',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      name: {
        title: '产品名称',
        type: 'string',
        filter: false,
        editable: false
      },
      unit: {
        title: '产品型号',
        type: 'string',
        filter: false,
        editable: false
      },
      goodssite: {
        title: '货位',
        type: 'string',
        filter: false
      },
      goodscode: {
        title: '产品编码',
        type: 'string',
        filter: false
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false,
      },
      number: {
        title: '数量',
        type: 'number',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'number',
        filter: false
      },
      amount: {
        title: '金额',
        type: 'number',
        filter: false,
        editable: false
      }
    }
  };

  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    mode: 'external',
    selectMode: 'multi',
    hideSubHeader: true,
    columns: {
      typeName: {
        title: '类型',
        type: 'string',
        filter: false,
      },
      name: {
        title: '产品名称',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '单位规格',
        type: 'string',
        filter: false,
      }
    }
  };


  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _storeinNewService: StoreinNewService,
    private _goodsService: GoodsService,
    private _supplierService: SupplierService,
    private _userService: UserService,
    private _dicService: DicService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _router: Router,
    private route: ActivatedRoute) {

    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
    this.storeIn.inTime = this._common.getTodayObj();
  }

  getDataList(): void {
    this._goodsService.getGoodss().then((data) => {
      this.popGrid.load(data);
      this.goodsInfo = data;
    });
    this._supplierService.getSuppliers().then((data) => {
      const that = this;
      _.each(data, f => {
        that.suppliers.push({ id: f.id, name: f.name });
      })
    });
    this._userService.getUsers().then((data) => {
      this.users = data;
    });
    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });
    this._dicService.getDicByName('入库类型', (data) => { this.inType = data; });
    this._dicService.getDicByName('产品类别', (data) => { this.goodsType = data; });
  }

  //选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      if (!_.some(this.selectedGoods, ['id', event.data.id])) {
        this.selectedGoods.push(
          {
            goodsTypeId: event.data.typeId,
            goodsId: event.data.id,
            price: event.data.price,
            name: event.data.name,
            unit: event.data.unit,
            number: 1,
            batchno: '',
            amount: event.data.price,
          });
      }
    } else {
      _.remove(this.selectedGoods, function (n) {
        return n['id'] == event.data.id;
      });
    }
    this.refreshTable();
  }
  //刷新表格数据
  refreshTable() {
    this.storeIn.amount = _.sumBy(this.selectedGoods, function (o) { return o['amount']; });
    this.selectedGrid.load(this.selectedGoods);
  }
  // 删除
  onDeleteConfirm(event): void {
    if (window.confirm('你确定要删除吗?')) {
      _.remove(this.selectedGoods, function (n) {
        return n['id'] == event.data.id;
      });
      this.refreshTable();
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
  onEditConfirm(event): void {
    _.remove(this.selectedGoods, function (n) {
      return n['id'] == event.data.id;
    });
    event.newData['amount'] = event.newData['price'] * event.newData['number'];
    this.selectedGoods.push(event.newData);
    this.refreshTable();
    event.confirm.resolve();
  }

  onUserRowSelect(event) {
    this.selectedRow = event.data;
  }
  showPop(event): void {
    _.delay(function (text) {
      $(".popover").css("max-width", "520px");
      $(".popover").css("min-width", "400px");
    }, 100, 'later');
  }
  showPopOrg(event): void {
    _.delay(function (text) {
      $(".popover").css("max-width", "320px");
      $(".popover").css("min-width", "200px");
    }, 100, 'later');
  }
  onSearch(query: string = '') {
    this.popGrid.setFilter([
      { field: 'name', search: query },
      { field: 'id', search: query },
    ], false);
  }
  //选择产品类型
  onSelectGoodsType(id: number) {
    this.popGrid.load(_.filter(this.goodsInfo, (f) => { return f['typeId'] == id; }));
  }

  onChange(event) {
    this.onSearch(event.target.value);
  }
  onKeyPress(event: any) {
    event.returnValue = false;
    // let keyCode = event.keyCode;
    // if ((keyCode >= 48 && keyCode <= 57){
    //   event.returnValue = true;
    // } else {
    //   event.returnValue = false;
    // }
  }
  onSelectedOrg(org) {
    if (org) {
      this.storeIn.orgid = org.id;
      this.storeIn.orgtext = org.name;
      const that = this;
      const orguser = _.filter(this.users, f => { return f['orgId'] == org.id; });
      that.operator = [];
      _.each(orguser, f => {
        that.operator.push({ id: f['userId'], name: f['userName'] });
      })
    }
  }
  onBack(){
    this._router.navigate(['/pages/store/storein']);
  }
  //确认入住
  onConfirm(): void {
    if (!this.storeIn.typeId || !this.storeIn.inTime || !this.storeIn.billNo
      || !this.storeIn.supplierId || !this.storeIn.storeId
      || !this.storeIn.orgid || !this.storeIn.operator) {
      this.toastOptions.msg = "请填写完整。";
      this.toastyService.warning(this.toastOptions);
      return;
    }
    if (this.selectedGoods.length == 0) {
      this.toastOptions.msg = "请选择产品。";
      this.toastyService.warning(this.toastOptions);
      return;
    }
    this.isSaved = true;
    const that = this;
    this.storeIn.inTime = this._common.getDateString(this.storeIn.inTime);
    console.log(this.storeIn);
    console.log(this.selectedGoods);
    this._storeinNewService.create(
      {
        storein: this.storeIn,
        storeinList: this.selectedGoods
      }
    ).then(
      function (v) {
        that.toastOptions.msg = "保存成功。";
        that.toastyService.success(that.toastOptions);
        that.isSaved = false;
        that.storeIn.inType = '';
        that.storeIn.inTime = '';
        that.storeIn.supplierId = '';
        that.storeIn.storeCode = '';
        that.storeIn.orgid = 0;
        that.storeIn.orgtext = '';
        that.storeIn.operator = '';
        that.storeIn.amount = 0;
        that.storeIn.billNo = '';
        that.selectedGoods = [];
        that.selectedGrid.load(that.selectedGoods);
      },
      (err) => {
        that.toastOptions.title = "保存失败";
        that.toastOptions.msg = err;
        that.toastyService.error(that.toastOptions);
        that.isSaved = false;
      }
      )
  }
}
