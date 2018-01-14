import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbTabset, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbdModalContent } from '../../../modal-content.component'
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { MemberService } from './member.services';
import { HouseTypeService } from '../house-type//house-type.services';
import { GlobalState } from '../../../global.state';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  providers: [MemberService, HouseTypeService],
})
export class MemberComponent implements OnInit, AfterViewInit {
  loading = false;
  query: string = '';

  settingsCard = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
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
      name: {
        title: '会员卡',
        type: 'string',
        filter: false
      },
      level: {
        title: '级别',
        type: 'number',
        filter: false
      },
      cardFee: {
        title: '卡费',
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

  settingsCardUpgrade = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
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
      oldCardTxt: {
        title: '旧卡',
        filter: false,
        type: 'string',
      },
      newCardTxt: {
        title: '新卡',
        filter: false,
        type: 'string',
      },
      needInte: {
        title: '升级所需积分',
        type: 'number',
        filter: false
      },
      takeInte: {
        title: '升级消耗积分',
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

  settingsIntegral = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
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
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      inteType: {
        title: '方式类型',
        type: 'string',
        filter: false
      },
      cardTypeTxt: {
        title: '会员卡类型',
        type: 'string',
        filter: false
      },
      dayOrFee: {
        title: '天数/金额',
        type: 'number',
        filter: false
      },
      integral: {
        title: '积分',
        type: 'number',
        filter: false
      },
      startDate: {
        title: '活动开始日期',
        type: 'string',
        filter: false
      },
      endDate: {
        title: '活动结束日期',
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

  settingsInteExchange = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
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
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      exchangeType: {
        title: '兑换类型',
        type: 'string',
        filter: false
      },
      cardTypeTxt: {
        title: '会员卡类型',
        filter: false,
        type: 'string',
      },
      giftName: {
        title: '礼品名称',
        type: 'string',
        filter: false
      },
      exchangeInte: {
        title: '所需积分',
        type: 'number',
        filter: false
      },
      startDate: {
        title: '活动开始日期',
        type: 'string',
        filter: false
      },
      endDate: {
        title: '活动结束日期',
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

  settingsInteHouse = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    hideSubHeader: true,
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
      name: {
        title: '名称',
        type: 'string',
        filter: false
      },
      takeInte: {
        title: '所需积分',
        type: 'number',
        filter: false
      },
      cardTypeTxt: {
        title: '会员卡类型',
        filter: false,
        type: 'string'
      },
      houseTypeTxt: {
        title: '兑换房型',
        type: 'string',
        filter: false
      },
      useWeeks: {
        title: '有效星期',
        type: 'string',
        filter: false
      },
      startDate: {
        title: '活动开始日期',
        type: 'string',
        filter: false
      },
      endDate: {
        title: '活动结束日期',
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

  configCard: FieldConfig[] = [
    {
      type: 'input',
      label: '会员卡',
      name: 'name',
      placeholder: '输入会员卡',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '级别',
      name: 'level',
      placeholder: '输入级别',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '卡费',
      name: 'cardFee',
      placeholder: '输入卡费',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configCardUpgrade: FieldConfig[] = [
    {
      label: '旧卡',
      name: 'oldCard',
      type: 'select',
      placeholder: '请选择',
      options: []
    },
    {
      label: '新卡',
      name: 'newCard',
      type: 'select',
      placeholder: '请选择',
      options: []
    },
    {
      type: 'input',
      label: '升级所需积分',
      name: 'needInte',
      placeholder: '输入升级所需积分',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '升级消耗积分',
      name: 'takeInte',
      placeholder: '输入升级消耗积分',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configIntegral: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '方式类型',
      name: 'type',
      placeholder: '输入方式类型',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '会员卡类型',
      name: 'cardType',
      check: 'radio',
      options: []
    },
    {
      type: 'input',
      label: '金额',
      name: 'dayOrFee',
      placeholder: '输入金额',
    },
    {
      type: 'input',
      label: '积分',
      name: 'integral',
      placeholder: '输入积分',
    },
    {
      type: 'datepicker',
      label: '活动开始日期',
      name: 'startDate',
      placeholder: '输入活动开始日期',
    },
    {
      type: 'datepicker',
      label: '活动结束日期',
      name: 'endDate',
      placeholder: '输入活动结束日期',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configInteExchange: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '兑换类型',
      name: 'exchangeType',
      placeholder: '输入兑换类型',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '会员卡类型',
      name: 'cardType',
      check: 'radio',
      options: []
    },
    {
      type: 'input',
      label: '礼品名称',
      name: 'giftName',
      placeholder: '输入礼品名称',
    },
    {
      type: 'input',
      label: '所需积分',
      name: 'exchangeInte',
      placeholder: '输入所需积分',
    },
    {
      type: 'input',
      label: '活动开始日期',
      name: 'startDate',
      placeholder: '输入活动开始日期',
    },
    {
      type: 'input',
      label: '活动结束日期',
      name: 'endDate',
      placeholder: '输入活动结束日期',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  configInteHouse: FieldConfig[] = [
    {
      type: 'input',
      label: '名称',
      name: 'name',
      placeholder: '输入名称',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '所需积分',
      name: 'takeInte',
      placeholder: '输入所需积分',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '会员卡类型',
      name: 'cardType',
      check: 'radio',
      options: []
    },
    {
      type: 'select',
      label: '兑换房型',
      name: 'houseType',
      options: []
    },
    {
      type: 'multiselect',
      label: '有效星期',
      name: 'useWeeks',
      options: []
    },
    {
      type: 'input',
      label: '活动开始日期',
      name: 'startDate',
      placeholder: '输入活动开始日期',
    },
    {
      type: 'input',
      label: '活动结束日期',
      name: 'endDate',
      placeholder: '输入活动结束日期',
    },
    {
      type: 'input',
      label: '备注',
      name: 'remark',
      placeholder: '输入备注',
    }
  ];

  sourceCard: LocalDataSource = new LocalDataSource();
  sourceCardUpgrade: LocalDataSource = new LocalDataSource();
  sourceIntegral: LocalDataSource = new LocalDataSource();
  sourceInteExchange: LocalDataSource = new LocalDataSource();
  sourceInteHouse: LocalDataSource = new LocalDataSource();
  modalConfig: any = {};

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  constructor(
    private modalService: NgbModal,
    private memberService: MemberService,
    private houseTypeService: HouseTypeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
    this.getDataList('');
  }
  ngOnInit() {
    this.modalConfig.SetCard = this.configCard;
    this.modalConfig.SetCardUpgrade = this.configCardUpgrade;
    this.modalConfig.SetIntegral = this.configIntegral;
    this.modalConfig.SetInteExchange = this.configInteExchange;
    this.modalConfig.SetInteHouse = this.configInteHouse;
  }
  ngAfterViewInit() {

  }

  getDataList(modalname): void {
    if (!modalname || modalname == 'SetCard') {
      this.loading = true;
      this.memberService.getMembers('SetCard').then((data) => {
        this.sourceCard.load(data);
        this.loading = false;
        const that = this;
        let cardT1 = _.find(this.configIntegral, function (f) { return f.name == 'cardType'; });
        let cardT2 = _.find(this.configCardUpgrade, function (f) { return f.name == 'oldCard'; });
        let cardT3 = _.find(this.configCardUpgrade, function (f) { return f.name == 'newCard'; });
        let cardT4 = _.find(this.configInteExchange, function (f) { return f.name == 'cardType'; });
        let cardT5 = _.find(this.configInteHouse, function (f) { return f.name == 'cardType'; });

        _.each(data, function (d) {
          cardT1.options.push({ id: d.id, name: d.name });
          cardT2.options.push({ id: d.id, name: d.name });
          cardT3.options.push({ id: d.id, name: d.name });
          cardT4.options.push({ id: d.id, name: d.name });
          cardT5.options.push({ id: d.id, name: d.name });
        });
      }, (err) => {
        this.loading = false;
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }

    if (!modalname || modalname == 'SetCardUpgrade') {
      this.memberService.getMembers('SetCardUpgrade').then((data) => {
        this.sourceCardUpgrade.load(data);
      });
    }

    if (!modalname || modalname == 'SetIntegral') {
      this.memberService.getMembers('SetIntegral').then((data) => {
        this.sourceIntegral.load(data);
      });
    }

    if (!modalname || modalname == 'SetInteExchange') {
      this.memberService.getMembers('SetInteExchange').then((data) => {
        this.sourceInteExchange.load(data);
      });
    }

    if (!modalname || modalname == 'SetInteHouse') {
      this.memberService.getMembers('SetInteHouse').then((data) => {
        let cardT1 = _.find(this.configInteHouse, function (f) { return f.name == 'useWeeks'; });
        cardT1.options = [
          { id: '星期一', name: '星期一' },
          { id: '星期二', name: '星期二' },
          { id: '星期三', name: '星期三' },
          { id: '星期四', name: '星期四' },
          { id: '星期五', name: '星期五' },
          { id: '星期六', name: '星期六' },
          { id: '星期日', name: '星期日' },
        ];
        this.sourceInteHouse.load(data);
      });
    }

    this.houseTypeService.getHouseTypes().then((data) => {
      let cardT1 = _.find(this.configInteHouse, function (f) { return f.name == 'houseType'; });
      _.each(data, (d) => {
        cardT1.options.push({ id: d.id, name: d.typeName });
      });
    });
  }

  onCreate(modalname, title) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.config = this.modalConfig[modalname];
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.memberService.create(modalname, JSON.parse(result)).then((data) => {
        closeBack();
        that.toastOptions.msg = "新增成功。";
        that.toastyService.success(that.toastOptions);
        that.getDataList(modalname);
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
      that.memberService.update(modalname, event.data.id, JSON.parse(result)).then((data) => {
        closeBack();
        that.toastOptions.msg = "新增成功。";
        that.toastyService.success(that.toastOptions);
        that.getDataList(modalname);
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
      this.memberService.delete(modalname, event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getDataList(modalname);
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }
}
