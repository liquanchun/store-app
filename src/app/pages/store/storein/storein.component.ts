import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { LocalDataSource } from 'ng2-smart-table';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StoreinService } from './storein.services';
import { SupplierService } from '../supplier/supplier.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-storein',
  templateUrl: './storein.component.html',
  styleUrls: ['./storein.component.scss'],
  providers: [StoreinService, DicService, SupplierService],
})
export class StoreinComponent implements OnInit {

  loading = false;
  title = '入库查询';
  query: string = '';

  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '明细',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '作废',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      orderNo: {
        title: '入库单号',
        type: 'string',
        filter: false,
      },
      typeIdTxt: {
        title: '入库类型',
        type: 'string',
        filter: false,
      },
      inTime: {
        title: '采购日期',
        type: 'string',
        filter: false,
      },
      billNo: {
        title: '采购单号',
        type: 'string',
        filter: false,
      },
      storeIdTxt: {
        title: '仓库',
        type: 'string',
        filter: false,
      },
      supplierIdTxt: {
        title: '供应商',
        type: 'string',
        filter: false,
      },
      orgIdTxt: {
        title: '采购部门',
        type: 'string',
        filter: false
      },
      operatorTxt: {
        title: '采购人',
        type: 'string',
        filter: false
      },
      amount: {
        title: '订单金额',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      },
      createdBy: {
        title: '录入人',
        type: 'string',
        filter: false
      },
      createdAt: {
        title: '录入时间',
        type: 'string',
        filter: false
      },
      status: {
        title: '状态',
        type: 'string',
        filter: false
      },
    }
  };

  settingsGoods = {
    actions: false,
    hideSubHeader: true,
    noDataMessage: '',
    columns: {
      goodsTypeIdTxt: {
        title: '产品类别',
        type: 'string',
        filter: false
      },
      goodsIdTxt: {
        title: '名称',
        type: 'string',
        filter: false
      },
      goodscode: {
        title: '编号',
        type: 'string',
        filter: false,
      },
      number: {
        title: '数量',
        type: 'number',
        filter: false,
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false,
      },
      amount: {
        title: '金额',
        type: 'number',
        filter: false
      }
    }
  };

  source: LocalDataSource = new LocalDataSource();
  selectedGrid: LocalDataSource = new LocalDataSource();

  storeInData: any;
  storeInDetailData: any;

  //仓库
  stores: any = [];
  //入库类型
  inType: any = [];
  //供应商
  suppliers: any = [];
  //组织架构
  orgName: any = '';

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(
    private storeinService: StoreinService,
    private _dicService: DicService,
    private _common: Common,
    private _router: Router,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _supplierService: SupplierService,
    private modalService: NgbModal,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'billNo', search: query },
      { field: 'operatorTxt', search: query },
      { field: 'supplierIdTxt', search: query },
      { field: 'createdBy', search: query },
      { field: 'typeIdTxt', search: query },
    ], false);
  }
  showPopOrg(event): void {
    _.delay(function (text) {
      $(".popover").css("max-width", "320px");
      $(".popover").css("min-width", "200px");
    }, 100, 'later');
  }
  //查看明细
  onEdit(event) {

  }
  //作废
  onDelete(event) {
    if (window.confirm('你确定要作废吗?')) {
      if (event.data.status == '作废') {
        this.toastOptions.msg = "该入库单已经作废，不能操作。";
        this.toastyService.warning(this.toastOptions);
        return;
      }
      this.storeinService.cancel(event.data.id).then((data) => {
        this.toastOptions.msg = "作废成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

  onSelectedOrg(org) {
    if (org) {
      this.orgName = org.name;
      this.source.setFilter([
        { field: 'orgIdTxt', search: org.name },
      ], false);
    }
  }
  onInTypeChange(inType) {
    if (inType.target.value) {
      this.source.load(_.filter(this.storeInData, f => { return f['typeId'] == inType.target.value }));
    } else {
      this.source.load(this.storeInData);
    }
  }

  onStoresChange(store) {
    if (store.target.value) {
      this.source.load(_.filter(this.storeInData, f => { return f['storeId'] == store.target.value }));
    } else {
      this.source.load(this.storeInData);
    }
  }

  onSupplierChange(supp) {
    if (supp.target.value) {
      this.source.load(_.filter(this.storeInData, f => { return f['supplierId'] == supp.target.value }));
    } else {
      this.source.load(this.storeInData);
    }
  }

  open(event, content) {
    const orderNo = event.data.orderNo;
    const orderDetail = _.filter(this.storeInDetailData, (f) => { return f['orderno'] == orderNo; });
    this.selectedGrid.load(orderDetail);

    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
    _.delay(function (text) {
      $(".modal-dialog").css("max-width", "645px");
    }, 100, 'later');
  }

  getDataList(): void {
    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });
    this._dicService.getDicByName('入库类型', (data) => { this.inType = data; });
    this._supplierService.getSuppliers().then((data) => {
      const that = this;
      _.each(data, f => {
        that.suppliers.push({ id: f.id, name: f.name });
      })
    });

    this.loading = true;
    this.storeinService.getStoreins().then((data) => {
      if (data) {
        const that = this;
        this.storeInDetailData = data['storeInDetailList'];
        this.storeInData = data['storeInList'];
        _.each(this.storeInData, f => { f['inTime'] = that._common.getSplitDate(f['inTime']); });
        this.source.load(this.storeInData);
        this.loading = false;
      }
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }

  print() {

    let printContents, popupWin;
    printContents = document.getElementById('printDiv').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>采购入库单</title>
          <style>
          //........Customized style.......
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }
  //新增入库
  newStorein(): void {
    this._router.navigate(['/pages/store/storeinnew']);
  }
}
