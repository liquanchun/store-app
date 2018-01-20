import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
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
import { OrgService } from '../../../sys/components/org/org.services';

import { GlobalState } from '../../../../global.state';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-storeinnew',
  templateUrl: './storeinnew.component.html',
  styleUrls: ['./storeinnew.component.scss'],
  providers: [StoreinNewService, DicService, GoodsService, SupplierService, UserService, OrgService],
})
export class StoreinNewComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  title = '新增产品入库';
  isSaved: boolean = false;
  isEnable: boolean = true;
  storeIn: any = {
    typeId: 0,
    inTime: '',
    inTimeNg: {},
    supplierId: '',
    supplierIdNg: [],
    storeId: '',
    orgid: '',
    orgidNg: [],
    orgtext: '',
    operator: 0,
    amount: 0,
    orderNo: '',
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
  //用户
  users: any = [];
  //产品类别
  goodsType: any = [];
  //采购人
  operatorList = [];
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

  myOptions: IMultiSelectOption[];
  myOptionsOper: IMultiSelectOption[];
  myOptionsSup: IMultiSelectOption[];
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    selectionLimit: 1,
    autoUnselect: true,
  };
  mySettingsOper: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
  };
  myTexts: IMultiSelectTexts = {
    defaultTitle: '--选择--',
    searchPlaceholder: '查询...'
  }

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
    private _orgService: OrgService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _router: Router,
    private route: ActivatedRoute) {

    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
    this.getOrderNo();
    this.storeIn.inTimeNg = this._common.getTodayObj();
  }
  getOrderNo(): void {
    this._storeinNewService.getOrderNo().then((data) => {
      this.storeIn.orderNo = data['data'];
    });
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
      this.myOptionsSup = this.suppliers;
    });
    this._userService.getUsers().then((data) => {
      this.users = data;
    });

    this._orgService.getAll().then((data) => {
      const that = this;
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['deptName'] });
      });
      this.myOptions = optData;
    });

    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });
    this._dicService.getDicByName('入库类型', (data) => { this.inType = data; });
    this._dicService.getDicByName('产品类别', (data) => { this.goodsType = data; });
  }

  //选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      if (!_.some(this.selectedGoods, ['name', event.data.name])) {
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
        return n['name'] == event.data.name;
      });
    }
    this.isEnable = this.selectedGoods.length == 0;
    this.selectedGrid.load(this.selectedGoods);
    this.storeIn.amount = _.sumBy(this.selectedGoods, function (o) { return o['amount']; });
  }
  //刷新表格数据
  refreshTable() {
    this.selectedGrid.refresh();
    //this.storeIn.amount = _.sumBy(this.selectedGoods, function (o) { return o['amount']; });
    //this.selectedGrid.load(this.selectedGoods);
  }
  // 删除
  onDeleteConfirm(event): void {
    if (window.confirm('你确定要删除吗?')) {
      _.remove(this.selectedGoods, function (n) {
        return n['name'] == event.data.name;
      });
      this.isEnable = this.selectedGoods.length == 0;
      this.refreshTable();
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
  onEditConfirm(event): void {
    // _.remove(this.selectedGoods, function (n) {
    //   return n['id'] == event.data.id;
    // });
    // event.newData['amount'] = event.newData['price'] * event.newData['number'];
    // this.selectedGoods.push(event.newData);
    // _.each(this.selectedGoods, f => {
    //   if (f['id'] == event.data.id) {
    //     f['amount'] = _.toNumber((_.toNumber(event.newData['price']) * _.toNumber(event.newData['number'])).toFixed(2));
    //   }
    // });
    const dt = { that: this, data: event.newData };
    event.confirm.resolve();
    _.delay(function (dt) {
      const that = dt.that;
      _.each(that.selectedGoods, f => {
        if (f['name'] == event.data.name) {
          f['amount'] = _.toNumber((_.toNumber(dt.data['price']) * _.toNumber(dt.data['number'])).toFixed(2));
        }
      });
      that.selectedGrid.load(that.selectedGoods);
      that.storeIn.amount = _.sumBy(that.selectedGoods, function (o) { return o['amount']; });
    }, 50, dt);
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
    this.onSelectGoodsType(event.target.value);
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
  onSelectedOrg(orgId) {
    if (orgId) {
      this.storeIn.orgid = orgId;
      //this.storeIn.orgtext = org.name;
      const that = this;
      const orguser = _.filter(this.users, f => { return f['orgId'] == orgId; });
      this.operatorList = [];
      _.each(orguser, f => {
        that.operatorList.push({ id: f['id'], name: f['userName'] });
      })
      //that.myOptionsOper = operatorList;
    }
  }
  //选择部门
  onChangeOrg(event) {
    this.onSelectedOrg(event[0]);
  }
  onBack() {
    this._router.navigate(['/pages/store/storein']);
  }
  //确认入住
  onConfirm(): void {
    if (!this.storeIn.typeId || !this.storeIn.inTimeNg || !this.storeIn.orderNo
      || !this.storeIn.supplierIdNg || !this.storeIn.storeId
      || !this.storeIn.orgidNg || !this.storeIn.operator) {
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
    this.storeIn.inTime = this._common.getDateString(this.storeIn.inTimeNg);
    this.storeIn.orgid = _.toString(this.storeIn.orgidNg);
    this.storeIn.supplierId = _.toString(this.storeIn.supplierIdNg);
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
        that.storeIn.amount = 0;
        that.selectedGoods = [];
        that.isEnable = true;
        that.selectedGrid.load(that.selectedGoods);
        that.getOrderNo();
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
