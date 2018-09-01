import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { DynamicFormComponent }
  from '../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EditFormService } from './editform.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import async from 'async';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-form',
  templateUrl: './editform.component.html',
  styleUrls: ['./editform.component.scss'],
  providers: [EditFormService, DicService],
})
export class EditFormComponent implements OnInit {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  loading = false;
  title = '表单定义';

  config: FieldConfig[] = [];
  //编辑配置
  configUpdate: FieldConfig[] = [];
  //新增配置
  configAdd: FieldConfig[] = [];
  configAddArr: FieldConfig[] = [];
  configUpdateArr: FieldConfig[] = [];
  //表单视图定义
  @Input() formView: {};

  //表单修改时数据
  updateData: {};

  //当前视图可否编辑
  @Input() canUpdate: boolean = true;

  //主键名称
  keyName: string;
  //父级组件
  _mainId: number;

  recordId: number;

  @Input()
  set mainTableID(id: number) {
    this._mainId = id;
    this.getDataList();
  }

  formname: string;

  constructor(
    private modalService: NgbModal,
    private formService: EditFormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private _common: Common,
    private _state: GlobalState) {
  }

  ngOnInit() {
    if (this.formView) {
      this.formname = this.formView['ViewName'];
      this.keyName = this.formView['MainTableId'];
      this.getTableField();
    }
    this.configAddArr = [];
    this.configUpdateArr = [];
  }

  getTableField(): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.formView['ViewName']).then((data) => {
      if (data.Data) {
        const formFieldList = _.orderBy(data.Data, 'OrderInd', 'asc');
        async.eachSeries(formFieldList, function (field, callback) {
          const config = that.setFormField(field);
          if (config['add']) {
            that.configAddArr.push(config['add']);
          }
          if (config['add']) {
            that.configUpdateArr.push(config['add']);
          }
          // that.setDicByName(field).then(() => {
          //   callback();
          // });
          that.setSelectValue(field).then(() => {
            callback();
          });
        }, function (err) {
          if (err) {
            console.log('err');
          } else {
            that.configAdd = that.configAddArr;
            that.configUpdate = that.configUpdateArr;
          }
        });
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  //设置表单字段
  setFormField(d) {
    let cfgAdd: FieldConfig;
    let cfgUpdate: FieldConfig;
    const placehd = d['DataSource'] == "list" || _.startsWith(d['DataSource'], 'table') ? '--请选择--' : '输入' + d['Title'];

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

    if (cfgAdd && cfgAdd.type == 'select') {
      cfgAdd.options = [];
    }
    if (cfgUpdate && cfgUpdate.type == 'select') {
      cfgUpdate.options = [];
    }

    if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') > 0) {
      //如果有列出选项列表
      const dicList = [];
      _.each(d['DicName'].split(','), d => {
        dicList.push({ id: d, text: d });
      });
      if (cfgAdd) {
        cfgAdd['options'] = dicList;
      }
      if (cfgUpdate) {
        cfgUpdate['options'] = dicList;
      }
    }

    return { add: cfgAdd, update: cfgUpdate };
  }

  //设置词典下拉列表
  setDicByName(d) {
    return new Promise((resolve, reject) => {
      if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') == 0) {
        //从词典中获取
        this._dicService.getDicByName(d['DicName'], list => {
          let cigAdd = _.find(this.configAddArr, f => { return f['name'] == d['FieldName'] });
          if (cigAdd) {
            cigAdd['options'] = list;
          }
          let cigUpdate = _.find(this.configUpdateArr, f => { return f['name'] == d['FieldName'] });
          if (cigUpdate) {
            cigUpdate['options'] = list;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  //设置下拉类别数据
  setSelectValue(field) {
    return new Promise((resolve, reject) => {
      if (_.startsWith(field['DataSource'], 'table')) {
        //从数据表中获取,DataSource设置的格式：table_tableName_Id_Name
        const dataS = field['DataSource'].split('-');
        if (dataS.length >= 4) {
          this.formService.getForms(dataS[1]).then((d) => {
            const data = d.Data;
            let list = [];
            _.each(data, dt => {
              let display = dt[dataS[3]];
              if (dataS.length >= 5) {
                display = display + '|' + dt[dataS[4]];
              }
              if (dataS.length >= 6) {
                display = display + '|' + dt[dataS[5]];
              }
              if (dataS.length >= 7) {
                display = display + '|' + dt[dataS[6]];
              }

              list.push({ id: dt[dataS[2]], text: display });
            });

            let cigAdd = _.find(this.configAddArr, f => { return f['name'] == field['FieldName'] });
            if (cigAdd) {
              cigAdd['options'] = list;
            }
            let cigUpdate = _.find(this.configUpdateArr, f => { return f['name'] == field['FieldName'] });
            if (cigUpdate) {
              cigUpdate['options'] = list;
            }
            resolve();
          }, (err) => {
            let cigAdd = _.find(this.configAddArr, f => { return f['name'] == field['FieldName'] });
            if (cigAdd) {
              cigAdd['options'] = [];
            }
            let cigUpdate = _.find(this.configUpdateArr, f => { return f['name'] == field['FieldName'] });
            if (cigUpdate) {
              cigUpdate['options'] = [];
            }
          });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  //获取数据
  getDataList() {
    if (this.formname && this.keyName && this._mainId) {
      this.formService.getForms(`${this.formname}/${this.keyName}/${this._mainId}`).then((data) => {
        if (data && data.Data)
          this.recordId = data.Data[0]['Id'];
        _.each(this.config, f => {
          let fieldValue = data.Data[0][f.name];
          if (f.type === 'datepicker' && _.isString(fieldValue)) {
            fieldValue = this._common.getDateObject(fieldValue);
          }
          this.form.setValue(f.name, fieldValue);
        });
      }, (err) => {
      });
    }
  }

  update(value: { [name: string]: any }) {
    const that = this;
    value['Id'] = this.recordId;
    _.each(this.config, f => {
      if (f.type === 'datepicker' && value[f.name]) {
        value[f.name] = this._common.getDateString(value[f.name]);
      }
    });
    console.log(value);
    this.formService.create(this.formname, value).then(function (menu) {
      that._state.notifyDataChanged("messagebox", { type: 'success', msg: '保存成功。', time: new Date().getTime() });
    }, (err) => {
      that._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }
}
