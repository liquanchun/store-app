import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormService } from './form.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [FormService, DicService],
})
export class FormComponent implements OnInit {

  loading = false;
  title = '表单定义';
  query: string = '';
  newSettings = {};
  settings = {
    pager: {
      perPage: 20
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
    columns: {}
  };

  configUpdate: FieldConfig[] = [];
  configAdd: FieldConfig[] = [];

  //表格视图定义
  tableView: {};
  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};
  source: LocalDataSource = new LocalDataSource();

  formname: string;
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.formname = this.route.snapshot.paramMap.get('id');
    this.start();

    this._state.subscribe("newurl", (d) => {
      const urls = d.split('/');
      if (urls[urls.length - 1] != this.formname) {
        this.formname = urls[urls.length - 1];
        this.start();
      }
    })
  }

  start() {
    this.settings.columns = {};
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function () {
        that.getTableField();
      });
    }
  }
  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set').then((data) => {
        if (data.Data) {
          that.tableView = _.find(data.Data, function (o) { return o['ViewType'] == 'table' && o['FormName'] == formname; });
          that.formView = _.find(data.Data, function (o) { return o['ViewType'] == 'form' && o['FormName'] == formname; });
          if (that.tableView) {
            that.title = that.tableView['Title'];
          }
        }
        resolve();
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    })
  }

  getTableField(): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsField().then((data) => {
      if (data.Data) {
        const viewList = _.orderBy(_.filter(data.Data, function (o) { return o['ViewName'] == that.tableView['ViewName']; }), 'OrderInd', 'asc');
        _.each(viewList, d => {
          this.settings.columns[d['FieldName']] = {
            title: d['Title'],
            type: d['DataType'],
            filter: false,
          };
        });

        this.newSettings = Object.assign({}, this.settings);
        this.getDataList();

        const formFieldList = _.orderBy(_.filter(data.Data, function (o) { return o['ViewName'] == that.formView['ViewName']; }), 'OrderInd', 'asc');
        this.setFormField(formFieldList);
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  //设置表单字段
  setFormField(formFieldList) {
    this.configAdd = [];
    this.configUpdate = [];
    _.each(formFieldList, d => {

      let cfgAdd: FieldConfig;
      let cfgUpdate: FieldConfig;

      if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') == 0) {
        //从词典中获取
        this._dicService.getDicByName(d['DicName'], list => {
          let cigAdd = _.find(this.configAdd, f => { return f['name'] == d['FieldName'] });
          if (cigAdd) {
            cigAdd['options'] = list;
          }
          let cigUpdate = _.find(this.configAdd, f => { return f['name'] == d['FieldName'] });
          if (cigUpdate) {
            cigUpdate['options'] = list;
          }
        });
      }

      const placehd = d['DataSource'] == "list" ? '--请选择--' : '输入' + d['Title'];

      if (d['CanAdd']) {
        cfgAdd = {
          type: d['FormType'],
          label: d['Title'],
          name: d['FieldName'],
          placeholder: placehd,
        };
      }
      if (d['CanUpdate']) {
        cfgUpdate = {
          type: d['FormType'],
          label: d['Title'],
          name: d['FieldName'],
          placeholder: placehd,
        };
      } else {
        cfgUpdate = {
          type: d['FormType'],
          label: d['Title'],
          name: d['FieldName'],
          placeholder: placehd,
          disabled: true
        };
      }
      if (d['IsRequest']) {
        if (cfgAdd) {
          cfgAdd.validation = [Validators.required];
        }
        if (cfgUpdate) {
          cfgUpdate.validation = [Validators.required];
        }
      }
      if (d['Default'] && cfgAdd) {
        cfgAdd.value = d['Default'];
      }

      if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') > 0) {
        //如果有列出选项列表
        const dicList = [];
        _.each(d['DicName'].split(','), d => {
          dicList.push({ id: d, name: d });
        });
        cfgAdd['options'] = dicList;
        cfgUpdate['options'] = dicList;
      }

      if (cfgAdd) {
        this.configAdd.push(cfgAdd);
      }
      if (cfgUpdate) {
        this.configUpdate.push(cfgUpdate);
      }
    });
  }

  //获取数据
  getDataList() {
    this.formService.getForms(this.tableView['ViewName']).then((data) => {
      this.source.load(data.Data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }
  //设置过滤字段
  onSearch(query: string = '') {
    if (this.tableView && this.tableView['SearchField']) {
      let filterArr = [];
      _.each(_.split(this.tableView['SearchField'], ','), (d) => {
        filterArr.push({ field: d, search: query });
      });
      this.source.setFilter(filterArr, false);
    }
  }
  onCreate(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增' + this.title;
    modalRef.componentInstance.config = this.configAdd;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.formService.create(that.formView['ViewName'], JSON.parse(result)).then((data) => {
        closeBack();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '新增成功。', time: new Date().getTime() });
        that.getDataList();
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    }
  }

  onEdit(event) {
    this.updateData = event.data;
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改' + this.title;
    modalRef.componentInstance.config = this.configUpdate;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formViewData = JSON.parse(result);
      const cfgupdate = _.filter(that.configUpdate, function (o) { return o['disabled'] == true; });
      _.each(cfgupdate, d => {
        if (that.updateData[d.name]) {
          formViewData[d.name] = that.updateData[d.name];
        }
      });
      that.formService.update(that.formView['ViewName'], formViewData).then((data) => {
        closeBack();
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '修改成功。', time: new Date().getTime() });
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
      this.formService.delete(this.tableView['ViewName'], event.data.Id).then((data) => {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '删除成功。', time: new Date().getTime() });
        this.getDataList();
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    }
  }

}
