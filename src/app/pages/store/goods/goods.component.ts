import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { GoodsService } from './goods.services';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import { DicService } from '../../sys/dic/dic.services';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Config } from '../../../providers/config';
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
  title = '产品信息';
  query: string = '';

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
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      typeName: {
        title: '类别',
        type: 'string',
        filter: false,
      },
      name: {
        title: '产品名称',
        type: 'string',
        filter: false,
      },
      goodsBrand: {
        title: '品牌',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '产品型号',
        type: 'string',
        filter: false,
      },
      goodsCode: {
        title: '产品代码',
        type: 'string',
        filter: false,
      },
      goodsNo: {
        title: '产品编码',
        type: 'string',
        filter: false,
      },
      minAmount: {
        title: '最低库存',
        type: 'number',
        filter: false
      },
      remark: {
        title: '产品说明',
        type: 'string',
        filter: false
      },
      price: {
        title: '参考价格',
        type: 'number',
        filter: false,
      },
    }
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
      type: 'input',
      label: '品牌',
      name: 'goodsBrand',
      placeholder: '输入产品品牌',
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
    }
  ];

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private modalService: NgbModal,
    private goodsService: GoodsService,
    private _common: Common,
    private _dicService: DicService,
    private _router: Router,
    public _config: Config,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.onGetGoodsType();
    this.getDataList();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'name', search: query },
      { field: 'goodsBrand', search: query },
      { field: 'goodsNo', search: query },
      { field: 'unit', search: query },
    ], false);
  }

  getDataList(): void {
    const that = this;
    this.loading = true;
    this.goodsService.getGoodss().then((data) => {
      // _.each(data,(d)=>{
      //   const url = that._config.server + 'Files/' + d['imageName'];
      //   d['imageName'] = `<a target="_blank" href=${ url }>${ d['imageName'] } </a>`;
      // });
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  onCreate(): void {
    //this._router.navigate(['/pages/store/goodsnew']);
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增产品信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.goodsService.create(JSON.parse(result)).then((data) => {
        closeBack();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: "新增成功。", time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    }
  }

  onEdit(event) {
    //this._router.navigate(['/pages/store/goodsnew'], { queryParams: { id: event.data.id } });
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改产品信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.goodsService.update(event.data.id, JSON.parse(result)).then((data) => {
        closeBack();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: "修改成功。", time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    };
  }

  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.goodsService.delete(event.data.id).then((data) => {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: "删除成功。", time: new Date().getTime() });
        this.getDataList();
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
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
