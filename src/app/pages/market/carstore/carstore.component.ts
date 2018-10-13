import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormService } from '../form/form.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { EditFormComponent } from '../editform/editform.component';
import { Common } from '../../../providers/common';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-carstore',
  templateUrl: './carstore.component.html',
  styleUrls: ['./carstore.component.scss'],
  providers: [FormService, DicService],
})
export class CarstoreComponent implements OnInit {

  loading = false;
  title = '表单定义';
  query: string = '';
  newSettings = {};
  settings = {
    pager: {
      display: true,
      perPage: 20
    },
    mode: 'external',
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
  //表单修改时数据
  updateData: {};
  source: LocalDataSource = new LocalDataSource();

  formname: string;
  canAdd: boolean;
  canUpdate: boolean;
  //子表视图
  subViewName: any = [];
  //查询视图
  searchview: any;
  //子表查询条件
  mainTableID: number = 0;

  totalRecord: number = 0;
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.formname = 'carincome';
    this.canUpdate = false;
    this.start();
    this.mainTableID = 0;
    const that = this;

  }

  start() {
    this.settings.columns = {};
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function () {
        that.getFormRoles();
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
          that.searchview = _.find(data.Data, function (o) { return o['ViewType'] == 'search' && o['FormName'] == formname; });
          if (that.tableView) {
            that.title = that.tableView['Title'];
            that.canAdd = that.tableView['CanAdd'] == 1;

            if (!that.tableView['CanUpdate'] && !that.tableView['CanDelete']) {
              that.settings['actions'] = false;
            } else {
              that.settings['actions'] = {
                columnTitle: '操作'
              };
              if (!that.tableView['CanUpdate']) {
                that.settings['actions']['edit'] = false;
              };
              if (!that.tableView['CanDelete']) {
                that.settings['actions']['delete'] = false;
              };
            }

            that.getFormSetSub().then(function (data) {
              let vn = [];
              _.each(data, f => {
                if (f['FormName'] == that.tableView['ViewName']) {
                  vn.push(f);
                }
              });
              that.subViewName = vn;
            });
          }
        }
        resolve();
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    })
  }

  //获取表单字段权限控制
  getFormRoles() {
    this.formService.getForms('vw_form_role/ViewName/' + this.tableView['ViewName']).then((data) => {
      if (data.Data) {
        this.getTableField(data.Data);
      }
    });
  }
  //检查用户角色是否拥有字段权限
  checkRole(roleData: any, fieldName: string) {
    const roleIds = sessionStorage.getItem('roleIds');
    const roleField = _.find(roleData, f => { return f['FieldName'] == fieldName; });
    //如果没有设置，或者设置了可读
    return !roleField['RoleIds']
      || roleField
      && roleField['RoleIds']
      && roleField['CanRead']
      && roleField['CanRead'] == 1
      && roleField['RoleIds'].includes(roleIds);
  }
  getTableField(roleData: any): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.tableView['ViewName']).then((data) => {
      if (data.Data) {
        const viewList = _.orderBy(data.Data, 'OrderInd', 'asc');
        _.each(viewList, d => {
          if (this.checkRole(roleData, d['FieldName'])) {
            this.settings.columns[d['FieldName']] = {
              title: d['Title'],
              type: d['DataType'],
              filter: false,
            };
          }
        });

        this.newSettings = Object.assign({}, this.settings);
        this.getDataList();
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  //获取数据
  getFormSetSub() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set_sub').then((data) => {
        if (data.Data) {
          resolve(data.Data);
        }
      }, (err) => {
      });
    });
  }
  //获取数据
  getDataList() {
    this.loading = true;
    this.formService.getForms(this.tableView['ViewName']).then((data) => {
      this.source.load(_.orderBy(data.Data, 'UpdateTime', 'desc'));
      this.totalRecord = data.Data.length;
      //this.source.setPaging(2,10);
      //this.source.setPage(5);
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
      this.totalRecord = this.source.count();
    }
  }
  //高级查询
  onSearchAll(query: any) {
    if (_.isObject(query) && _.keys(query).length > 0) {
      this.loading = true;
      console.log('查询条件：' + JSON.stringify(query));
      this.formService.getFormsByPost(this.tableView['ViewName'], query).then((data) => {
        this.source.load(data.Data);
        this.totalRecord = data.Data.length;
        this.loading = false;
      }, (err) => {
        this.loading = false;
      });
    }
  }
  onCreate(): void {
    this.router.navigate(['/pages/market/carstorenew', 0]);
  }

  onEdit(event) {
    const id = event.data.Id;
    this.router.navigate(['/pages/market/carstorenew', id]);
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

  onSelected(event) {
    this.mainTableID = event.data.Id;
  }
}
