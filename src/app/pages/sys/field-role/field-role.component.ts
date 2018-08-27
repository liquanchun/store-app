import { Component, ViewChild, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';
import * as _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';

import { FiledService } from './field-role.services';
import { FormService } from '../form/form.services';
import { RoleService } from '../../sys/components/role/role.services';
import { GlobalState } from '../../../global.state';


@Component({
  selector: 'app-sys-fieldrole',
  templateUrl: './field-role.component.html',
  styleUrls: ['./field-role.component.scss'],
  providers: [FiledService, FormService, RoleService],
})
export class FieldRoleComponent implements OnInit, AfterViewInit {
  @Output()

  public loading = false;
  private roles: any = [];
  newSettings;
  settings = {
    pager: {
      perPage: 15
    },
    selectMode: 'multi',
    mode: 'external',
    actions: false,
    hideSubHeader: true,
    columns: {}
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '表单名',
      name: 'ViewName',
      disabled: true
    },
    {
      type: 'input',
      label: '字段名',
      name: 'FieldName',
      disabled: true
    },
    {
      type: 'check',
      label: '角色',
      name: 'RoleIds',
      check: 'checkbox',
      options: this.roles
    },
    {
      type: 'truefalse',
      label: '是否可见',
      name: 'CanRead',
    },
    {
      type: 'truefalse',
      label: '是否可修改',
      name: 'CanUpdate',
    },
  ];
  source: LocalDataSource = new LocalDataSource();
  
  //表格视图定义
  tableView: {};
  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};

  tableData: any;

  selectRows: any = [];

  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _roleService: RoleService,
    private _state: GlobalState,
    private filedService: FiledService) {
  }

  ngOnInit() {
    const that = this;
    this._roleService.getRoles().then(data => {
      _.each(data, r => {
        that.roles.push({ id: r.id, name: r.roleName });
      })
    })
    this.getViewName("formRoleTable").then(function () {
      that.getTableField();
    });
  }

  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set').then((data) => {
        if (data.Data) {
          that.tableView = _.find(data.Data, function (o) { return o['ViewType'] == 'table' && o['FormName'] == formname; });
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
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  //获取数据
  getDataList() {
    this.formService.getForms(this.tableView['ViewName']).then((data) => {
      this.source.load(data.Data);
      this.tableData = data.Data;
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  ngAfterViewInit() {

  }

  //选择房间
  rowClicked(event): void {
    if (event.isSelected) {
      this.selectRows.push(event.data);
    } else {
      _.remove(this.selectRows, function (n) {
        return n['Id'] == event.data.Id;
      });
    }
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

  onEdit() {
    const formEdit = {};
    if (this.selectRows && this.selectRows.length > 0) {
      formEdit['ViewName'] = this.selectRows[0]['ViewName'];
      formEdit['FieldName'] = this.selectRows[0]['FieldName'];
    } else {
      this._state.notifyDataChanged("messagebox", { type: 'warning', msg: '请选择要设置的记录。', time: new Date().getTime() });
      return;
    }
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '设置表单字段角色';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = formEdit;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      closeBack();
      let saveData = JSON.parse(result);
      saveData['FieldIds'] =_.toString(_.map(this.selectRows,'Id'));
      that.filedService.create('fieldrole', saveData).then((data) => {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '修改成功。', time: new Date().getTime() });
        this.getDataList();
        this.selectRows = [];
      },
        (err) => {
          this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        }
      )
    };
  }
}
