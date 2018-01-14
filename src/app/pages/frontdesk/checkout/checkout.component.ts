import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import * as $ from 'jquery';
import * as _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';

import { HouseinfoService } from '../../house/houseinfo/houseinfo.services';
import { CheckinService } from './../checkin/checkin.services';
import { HouseTypeService } from '../../sys/house-type/house-type.services';
import { SetPaytypeService } from '../../sys/set-paytype/set-paytype.services';
import { DicService } from '../../sys/dic/dic.services';
import { CheckoutService } from './checkout.services';

import { GlobalState } from '../../../global.state';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-qt-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [CheckoutService, CheckinService, SetPaytypeService, DicService],
})
export class CheckoutComponent implements OnInit {
  @Input() showEditButton: boolean = true;
  title = '退房结账';
  private isSaved: boolean = false;

  private checkIn: any = {
    houseCode: '',
    cusName: '',
    cusPhone: '',
    idCard: '',
    inType: '',
    comeTypeTxt: '',
    payType: '',
    payTypeTxt:'',
    billNo: '',
    remark: '',
    houseFee: 0,
    preReceivefee: 0,
    orderNo:''
  };
  private paytype: any = [];
  private comeType: any = [];
  settingsHouse = {
    actions: {
      columnTitle: '操作',
      add: false,
      edit: false,
      delete: false,
    },
    hideSubHeader: true,
    noDataMessage: '',
    columns: {
      houseTypeTxt: {
        title: '房型',
        type: 'string',
        filter: false,
        editable: false
      },
      houseCode: {
        title: '房号',
        type: 'number',
        filter: false,
        editable: false
      },
      houseFee: {
        title: '房费',
        type: 'number',
        filter: false,
        editable: false
      },
      days: {
        title: '入住天数',
        type: 'number',
        filter: false
      },
      cusName: {
        title: '客人姓名',
        type: 'string',
        filter: false
      },
      idCard: {
        title: '客人身份证',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  houseType = [];
  //选择房间表格
  selectedGrid: LocalDataSource = new LocalDataSource();
  //链接过来的房间号
  private checkInCode: string;

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(
    private _state: GlobalState,
    private _checkoutService: CheckoutService,
    private _checkinService: CheckinService,
    private _setPaytypeService: SetPaytypeService,
    private _dicService: DicService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private route: ActivatedRoute) {

    this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    this.getDataList();
    this.checkInCode = this.route.snapshot.params['code'];
    if(this.checkInCode){
      this.onSearch(this.checkInCode);
    }
  }

  onSearch(code: string): void {
    this._checkoutService.getCheckouts(code).then((data) => {
      if (!data) {
        this.toastOptions.msg = '房间不存在。';
        this.toastyService.error(this.toastOptions);
      } else {
        this.checkIn = data['orderList'][0];
        this.checkIn.houseCode = code;
        this.checkIn.payType = 0;
        this.selectedGrid.load(data['orderDetailList']);
      }
    },
      (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
  }

  getDataList(): void {
    this._setPaytypeService.getSetPaytypes().then((data) => {
      const that = this;
      _.each(data, function (d) {
        if (d.name != '预授权') {
          that.paytype.push({ id: d.id, name: d.name });
        }
      });
    });

    this._dicService.getDicByName('客源', (data) => { this.comeType = data; });
  }

  onSaveConfirm(event): void {
    event.confirm.resolve();
  }

  //确认入住
  onConfirm(): void {
    const that = this;
    if(!this.checkIn.orderNo){
      that.toastOptions.msg = "无订单号";
      that.toastyService.warning(that.toastOptions);
      return;
    }
    if(!this.checkIn.payType){
      that.toastOptions.msg = "请选择支付方式";
      that.toastyService.warning(that.toastOptions);
      return;
    }

    this.isSaved = true;
    let cusaccount = {
      houseCode:this.checkIn.houseCode,
      cusName:this.checkIn.cusName,
      itemName:this.checkIn.inType,
      orderNo:this.checkIn.orderNo,
      number:1,
      amount:this.checkIn.houseFee,
      payType:this.checkIn.payType,
      workNum:1,
      remark:this.checkIn.remark
    }
    this._checkoutService.create(cusaccount).then(
      function (v) {
        that.toastOptions.msg = "保存成功。";
        that.toastyService.success(that.toastOptions);
        that.isSaved = false;
        that.checkIn.cusName = '';
        that.checkIn.cusPhone = '';
        that.checkIn.idCard = '';
        that.checkIn.inType = '';
        that.checkIn.remark = '';
        that.checkIn.houseFee = '';
        that.checkIn.preReceivefee = '';
        that.checkIn.payType = '';
        that.checkIn.billNo = '';
        that.checkIn.houseCode = '';
        that.checkIn.orderNo = '';
        that.checkIn.comeTypeTxt = '';
        that.checkIn.payTypeTxt ='';
        that.selectedGrid.empty();
        that.selectedGrid.reset();
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

