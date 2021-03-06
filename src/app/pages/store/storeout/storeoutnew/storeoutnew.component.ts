import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Common } from '../../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

import { StoreoutNewService } from './storeoutnew.services';
import { DicService } from '../../../basedata/dic/dic.services';
import { UserService } from '../../../sys/components/user/user.services';
import { OrgService } from '../../../sys/components/org/org.services';

import { GlobalState } from '../../../../global.state';
import { GoodsstoreService } from '../../goodsstore/goodsstore.services';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-storeoutnew',
  templateUrl: './storeoutnew.component.html',
  styleUrls: ['./storeoutnew.component.scss'],
  providers: [StoreoutNewService, DicService, GoodsstoreService, GoodsService, UserService, OrgService]
})
export class StoreoutNewComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  title = '新增产品出库';
  isSaved: boolean = false;
  isEnable: boolean = true;
  storeOut: any = {
    typeId: 0,
    outTime: '',
    outTimeNg: {},
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
  //出库类型
  outType: any = [];
  //用户
  users: any = [];
  //产品类别
  goodsType: any = [];
  //采购人
  operatorList = [];
  //产品信息
  goodsInfo: any = [];
  //库存信息
  goodsStoreInfo: any = [];
  //选中的产品信息
  selectedGoods: any = [];
  //选中的仓库
  checkedStoreId: number;
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
      confirmCreate: true
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      saveButtonContent: '保存',
      cancelButtonContent: '取消',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      batchno: {
        title: '批次',
        type: 'string',
        filter: false,
        editable: false
      },
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
      goodscode: {
        title: '产品代码',
        type: 'string',
        filter: false,
        editable: false
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false,
        editable: false
      },
      number: {
        title: '数量',
        type: 'number',
        filter: false
      },
      amount: {
        title: '金额',
        type: 'number',
        filter: false,
        editable: false
      },
      storenumber: {
        title: '最大出库数',
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
      goodsTypeIdTxt: {
        title: '产品类别',
        type: 'string',
        filter: false
      },
      batchNo: {
        title: '批次',
        type: 'string',
        filter: false
      },
      goodsIdTxt: {
        title: '产品名称',
        type: 'string',
        filter: false
      },
      goodsBrand: {
        title: '品牌',
        type: 'string',
        filter: false
      },
      goodsCode: {
        title: '产品编码',
        type: 'string',
        filter: false
      },
      unit: {
        title: '型号',
        type: 'string',
        filter: false
      },
      number: {
        title: '库存量',
        type: 'number',
        filter: false
      }
    }
  };
  myOptionsStore: IMultiSelectOption[];
  myOptions: IMultiSelectOption[];
  myOptionsOper: IMultiSelectOption[];
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    selectionLimit: 1,
    autoUnselect: true
  };
  mySettingsOper: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3
  };
  myTexts: IMultiSelectTexts = {
    defaultTitle: '--选择--',
    searchPlaceholder: '查询...'
  };

  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _storeoutNewService: StoreoutNewService,
    private _goodsStoreService: GoodsstoreService,
    private _goodsService: GoodsService,
    private _userService: UserService,
    private _dicService: DicService,
    private _orgService: OrgService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.getDataList();
    this.getOrderNo();
    this.storeOut.outTimeNg = this._common.getTodayObj();
  }
  getOrderNo(): void {
    this._storeoutNewService.getOrderNo().then(data => {
      this.storeOut.orderNo = data['data'];
    });
  }
  getDataList(): void {
    this._goodsStoreService.getGoodsstores().then(data => {
      this.goodsStoreInfo = _.filter(data, f => {
        return f['number'] > 0;
      });
      this.popGrid.load(this.goodsStoreInfo);
    });
    this._goodsService.getGoodss().then(data => {
      this.goodsInfo = data;
    });
    this._userService.getUsers().then(data => {
      this.users = data;
    });

    this._orgService.getAll().then(data => {
      const that = this;
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['deptName'] });
      });
      this.myOptions = optData;
    });

    this._dicService.getDicByName('仓库', data => {
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['text'] });
      });
      this.myOptionsStore = optData;
    });
    this._dicService.getDicByName('出库类型', data => {
      this.outType = data;
    });
    this._dicService.getDicByName('产品类别', data => {
      this.goodsType = data;
    });
  }

  // 选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      const goodsid = event.data.goodsId;
      const kcid = event.data.id;
      const goodsObj = _.find(this.goodsInfo, f => {
        return f['id'] == goodsid;
      });
      if (!_.some(this.selectedGoods, ['storeid', kcid])) {
        this.selectedGoods.push({
          kcid: kcid,
          goodsTypeId: goodsObj['typeId'],
          goodsId: goodsObj['id'],
          price: event.data['price'],
          name: goodsObj['name'],
          unit: goodsObj['unit'],
          goodsno: goodsObj['goodsNo'],
          goodscode: goodsObj['goodsCode'],
          number: 1,
          batchno: event.data['batchNo'],
          amount: event.data['price'],
          storenumber: event.data['number']
        });
      }
    } else {
      _.remove(this.selectedGoods, function(n) {
        return n['name'] == event.data.goodsIdTxt;
      });
    }
    this.isEnable = this.selectedGoods.length == 0;
    this.selectedGrid.load(this.selectedGoods);
    this.storeOut.amount = _.sumBy(this.selectedGoods, function(o) {
      return o['amount'];
    });
  }
  onStoreClick(event) {
    if (event.target.value && event.target.value > 0) {
      this.checkedStoreId = event.target.value;
      this.popGrid.load(
        _.filter(this.goodsStoreInfo, f => {
          return f['storeId'] == event.target.value;
        })
      );
    }
  }
  // 刷新表格数据
  refreshTable() {
    this.selectedGrid.refresh();
  }
  // 删除
  onDeleteConfirm(event): void {
    if (window.confirm('你确定要删除吗?')) {
      _.remove(this.selectedGoods, function(n) {
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
    const dt = { that: this, data: event.newData };
    const store = _.find(this.goodsStoreInfo, f => {
      return f['id'] == event.data.kcid;
    });
    if (store['number'] < _.toNumber(event.newData.number)) {
      this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '出库数量不能大于库存数量。', time: new Date().getTime() });
      event.confirm.reject();
      return;
    }
    event.confirm.resolve();
    _.delay(
      function(dt) {
        const that = dt.that;
        _.each(that.selectedGoods, f => {
          if (f['name'] == event.data.name) {
            f['amount'] = _.toNumber((_.toNumber(dt.data['price']) * _.toNumber(dt.data['number'])).toFixed(2));
            f['number'] = dt.data['number'];
            f['remark'] = dt.data['remark'];
          }
        });
        that.selectedGrid.load(that.selectedGoods);
        that.storeOut.amount = _.sumBy(that.selectedGoods, function(o) {
          return o['amount'];
        });
      },
      50,
      dt
    );
  }

  onUserRowSelect(event) {
    this.selectedRow = event.data;
  }
  showPop(event): void {
    _.delay(
      function(text) {
        $('.popover').css('max-width', '920px');
        $('.popover').css('min-width', '700px');
      },
      100,
      'later'
    );
  }

  onSearch(query: string = '') {
    this.popGrid.setFilter([{ field: 'goodsIdTxt', search: query }, { field: 'goodsTypeIdTxt', search: query }, { field: 'unit', search: query }], false);
  }
  //选择产品类型
  onSelectGoodsType(id: number) {
    if (this.checkedStoreId && this.checkedStoreId > 0) {
      this.popGrid.load(
        _.filter(this.goodsStoreInfo, f => {
          return f['typeId'] == id && f['storeId'] == this.checkedStoreId;
        })
      );
    } else {
      this.popGrid.load(
        _.filter(this.goodsStoreInfo, f => {
          return f['typeId'] == id;
        })
      );
    }
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
      this.storeOut.orgid = orgId;
      //this.storeOut.orgtext = org.name;
      const that = this;
      const orguser = _.filter(this.users, f => {
        return f['orgId'] == orgId;
      });
      this.operatorList = [];
      _.each(orguser, f => {
        that.operatorList.push({ id: f['id'], name: f['userName'] });
      });
      that.myOptionsOper = this.operatorList;
    }
  }
  //选择部门
  onChangeOrg(event) {
    this.onSelectedOrg(event[0]);
  }
  //选择部门
  onChangeStore(event) {
    if (event[0]) {
      this.checkedStoreId = event[0];
      this.popGrid.load(
        _.filter(this.goodsStoreInfo, f => {
          return f['storeId'] == event[0];
        })
      );
    }
  }
  onBack() {
    this._router.navigate(['/pages/store/storeout']);
  }
  //确认入住
  onConfirm(): void {
    if (!this.storeOut.typeId || !this.storeOut.outTimeNg || !this.storeOut.orderNo || !this.storeOut.storeId || !this.storeOut.orgidNg || !this.storeOut.operator) {
      this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '请填写完整。', time: new Date().getTime() });
      return;
    }
    if (this.selectedGoods.length == 0) {
      this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '请选择产品。', time: new Date().getTime() });
      return;
    }
    this.isSaved = true;
    const that = this;
    this.storeOut.operator = _.toNumber(this._common.ArrToString1(this.storeOut.operator));
    this.storeOut.outTime = this._common.getDateString(this.storeOut.outTimeNg);
    this.storeOut.orgid = _.toString(this.storeOut.orgidNg);
    this.storeOut.storeId = _.toString(this.storeOut.storeId);
    console.log(this.storeOut);
    console.log(this.selectedGoods);
    this._storeoutNewService
      .create({
        storeout: this.storeOut,
        storeoutList: this.selectedGoods
      })
      .then(
        function(v) {
          that._state.notifyDataChanged('messagebox', { type: 'success', msg: '保存成功。', time: new Date().getTime() });
          that.isSaved = false;
          that.storeOut.amount = 0;
          that.selectedGoods = [];
          that.isEnable = true;
          that.selectedGrid.load(that.selectedGoods);
          that.getOrderNo();
        },
        err => {
          that._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
          that.isSaved = false;
        }
      );
  }
}
