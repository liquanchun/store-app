import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ShowFormService } from './showform.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import async from 'async';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-show-form',
  templateUrl: './showform.component.html',
  styleUrls: ['./showform.component.scss'],
  providers: [ShowFormService, DicService],
})
export class ShowFormComponent implements OnInit {
  title = '表单定义';
  //表单视图定义
  @Input() formView: {};

  //主键名称
  keyName: string;
  //父级组件
  _mainId: number;

  @Input()
  set mainTableID(id: number) {
    this._mainId = id;
    this.getDataList();
  }

  formname: string;
  formFieldList: any;
  constructor(
    private formService: ShowFormService,
    private _state: GlobalState) {
  }

  ngOnInit() {
    if (this.formView) {
      this.formname = this.formView['ViewName'];
      this.keyName = this.formView['MainTableId'];
      this.title = this.formView['Title'];
      this.formService.getFormsFieldByName(this.formname).then((data) => {
        if (data.Data) {
          const fieldList = _.orderBy(data.Data, 'OrderInd', 'asc');
          this.getFormRoles(fieldList);
        }
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
    }
  }

  //获取表单字段权限控制
  getFormRoles(fieldList) {
    this.formService.getForms('vw_form_role/ViewName/' + this.formname).then((data) => {
      if (data.Data) {
        let newFileList = [];
        _.each(fieldList, f => {
          if (this.checkRole(data.Data, f['FieldName'])) {
            newFileList.push(f);
          }
        });
        this.formFieldList = newFileList;
        this.getDataList();
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

  //获取数据
  getDataList() {
    _.each(this.formFieldList, f => {
      f.Default = '';
    });

    if (this.formname && this.keyName && this._mainId > 0) {
      this.formService.getForms(`${this.formname}/${this.keyName}/${this._mainId}`).then((data) => {
        if (data && data.Data && data.Data.length > 0) {
          _.each(this.formFieldList, f => {
            let fieldValue = data.Data[0][f.FieldName];
            if (fieldValue) {
              f.Default = fieldValue;
            }
          });
        }
      }, (err) => {
      });
    }
  }

}
