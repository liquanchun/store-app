import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';

import { PartsComboService } from './partscombo.services';
import { PartsComboLinkService } from './partscombolink.services';
import { PartsService } from '../parts/parts.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';
import { FormTrueFalseComponent } from '../../../theme/components/dynamic-form/components/form-truefalse/form-truefalse.component';

@Component({
  selector: 'app-partscombo',
  templateUrl: './partscombo.component.html',
  styleUrls: ['./partscombo.component.scss'],
  providers: [PartsComboService, PartsService, PartsComboLinkService]
})
export class PartsComboComponent implements OnInit {
  loading = false;
  title = '装饰套餐信息';
  query: string = '';
  isShowAdd = false;
  isSaved: boolean = false;
  isEnable: boolean = false;
  selectedItem = [];

  settingsParts = {
    pager: {
      perPage: 50
    },
    selectMode: 'multi',
    actions: false,
    mode: 'external',
    hideSubHeader: true,
    columns: {
      type_name: {
        title: '分类',
        type: 'string',
        filter: false
      },
      item_name: {
        title: '项目名称',
        type: 'string',
        filter: false
      },
      item_no: {
        title: '项目编号',
        type: 'string',
        filter: false
      },
      parttype: {
        title: '套餐来源',
        type: 'string',
        filter: false
      }
    }
  };
  sourceParts: LocalDataSource = new LocalDataSource();

  settings = {
    pager: {
      perPage: 15
    },
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      type_name: {
        title: '分类',
        type: 'string',
        filter: false
      },
      item_name: {
        title: '套餐名称',
        type: 'string',
        filter: false
      },
      item_no: {
        title: '套餐编号',
        type: 'string',
        filter: false
      },
      partslistname: {
        title: '套餐项目',
        type: 'string',
        filter: false
      },
      partslistno: {
        title: '套餐编号',
        type: 'string',
        filter: false
      },
      cost_price: {
        title: '套餐成本',
        type: 'string',
        filter: false
      },
      sale_price: {
        title: '销售价',
        type: 'string',
        filter: false
      },
      parttype: {
        title: '套餐来源',
        type: 'string',
        filter: false
      },
      createdBy: {
        title: '录入人',
        type: 'string',
        filter: false
      }
    }
  };
  source: LocalDataSource = new LocalDataSource();
  partscombo = {
    Id: 0,
    type_name: '',
    item_name: '',
    item_no: '',
    parttype: '',
    cost_price: 0,
    sale_price: 0
  };
  partscomboList = [];
  selectitemlist = '';
  partslinkid = '';

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '分类',
      name: 'type_name',
      placeholder: '输入分类',
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: '套餐名称',
      name: 'item_name',
      placeholder: '输入套餐名称',
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: '套餐编号',
      name: 'item_no',
      placeholder: '输入套餐编号',
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: '套餐项目',
      name: 'item_list',
      placeholder: '输入套餐项目',
      validation: [Validators.required]
    },
    {
      type: 'select',
      label: '套餐来源',
      name: 'parttype',
      options: ['DN', 'HZ'],
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: '成本价',
      name: 'cost_price',
      placeholder: '输入成本价',
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: '销售价',
      name: 'sale_price',
      placeholder: '输入销售价',
      validation: [Validators.required]
    }
  ];

  constructor(
    private modalService: NgbModal,
    private partscomboService: PartsComboService,
    private partsService: PartsService,
    private partslinkService: PartsComboLinkService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.getDataList();
    this.getPartsDataList();
  }

  onSearch(query: string = '') {}

  onGetParts() {}
  getDataList(): void {
    this.loading = true;
    this.partscomboService.getPartsCombo().then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          this.source.load(data.Data);
        }
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
      }
    );
  }

  getPartsDataList(): void {
    this.loading = true;
    this.partsService.getParts().then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          this.sourceParts.load(data.Data);
        }
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
      }
    );
  }

  onCreate(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增装饰套餐';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let data = JSON.parse(result);
      data['createdBy'] = sessionStorage.getItem('userName');
      that.partscomboService.create(data).then(
        data => {
          closeBack();
          this._state.notifyDataChanged('messagebox', { type: 'success', msg: '新增成功。', time: new Date().getTime() });
          that.getDataList();
        },
        err => {
          this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
        }
      );
    };
  }

  onEdit(event) {
    // const that = this;
    // const modalRef = this.modalService.open(NgbdModalContent);
    // modalRef.componentInstance.title = '修改装饰套餐';
    // modalRef.componentInstance.config = this.config;
    // modalRef.componentInstance.formValue = event.data;
    // modalRef.componentInstance.saveFun = (result, closeBack) => {
    //   let data = JSON.parse(result);
    //   data['createdBy'] = sessionStorage.getItem('userName');
    //   that.partscomboService.update(data).then(
    //     data => {
    //       closeBack();
    //       this._state.notifyDataChanged('messagebox', { type: 'success', msg: '修改成功。', time: new Date().getTime() });
    //       that.getDataList();
    //     },
    //     err => {
    //       this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
    //     }
    //   );
    // };
    this.partscombo = event.data;
    this.partscomboList = event.data.partslistname;
    this.partslinkid = event.data.partslinkid;
    this.selectitemlist = event.data.partslistname;
    if (event.data.partslistname) {
      const ids = _.split(event.data.partslistid, ',');
      const names = _.split(event.data.partslistname, ',');
      for (let i = 0; i < ids.length; i++) {
        if (!_.some(this.selectedItem, ['parts_id', ids[i]])) {
          this.selectedItem.push({
            parts_id: ids[i],
            item_name: names[i]
          });
        }
      }
      this.partscombo['selectedPartsIds'] = _.join(_.map(this.selectedItem, 'parts_id'), ',');
    }
    this.isShowAdd = true;
  }

  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.partscomboService.delete(event.data.Id).then(
        data => {
          this._state.notifyDataChanged('messagebox', { type: 'success', msg: '删除成功。', time: new Date().getTime() });
          this.getDataList();
        },
        err => {
          this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
        }
      );
    }
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

  // 选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      if (!_.some(this.selectedItem, ['parts_id', event.data.Id])) {
        this.selectedItem.push({
          parts_id: event.data['Id'],
          item_name: event.data['item_name']
        });
      }
    } else {
      _.remove(this.selectedItem, function(n) {
        return n['parts_id'] == event.data.Id;
      });
    }
    this.selectitemlist = _.join(_.map(this.selectedItem, 'item_name'), ',');
    this.partscombo['selectedPartsIds'] = _.join(_.map(this.selectedItem, 'parts_id'), ',');
  }

  open() {
    this.partscombo.Id = 0;
    this.isShowAdd = true;
  }

  onBack() {
    this.isShowAdd = false;
  }
  onConfirm() {
    if (this.selectedItem.length == 0) {
      this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '请选择项目！', time: new Date().getTime() });
      return;
    }
    if (!this.partscombo.type_name || !this.partscombo.item_no || !this.partscombo.item_name || !this.partscombo.sale_price || !this.partscombo.cost_price) {
      this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '请填写完整！', time: new Date().getTime() });
      return;
    }
    this.partscombo['createdBy'] = sessionStorage.getItem('userName');
    if (this.partscombo['Id'] == 0) {
      delete this.partscombo.Id;
    }
    this.partscomboService.create(this.partscombo).then(
      data => {
        this._state.notifyDataChanged('messagebox', { type: 'success', msg: '新增成功。', time: new Date().getTime() });
        this.getDataList();
      },
      err => {
        this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
      }
    );
  }
}
