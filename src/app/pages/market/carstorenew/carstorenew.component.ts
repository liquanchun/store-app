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
import { DynamicForm2Component }
  from '../../../theme/components/dynamic-form/containers/dynamic-form2/dynamic-form2.component';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-carstorenew',
  templateUrl: './carstorenew.component.html',
  styleUrls: ['./carstorenew.component.scss'],
  providers: [FormService, DicService],
})
export class CarstoreNewComponent implements OnInit {
  @ViewChild(DynamicForm2Component) form: DynamicForm2Component;

  loading = false;
  title = '表单定义';

  config: FieldConfig[] = [];

  configUpdate: FieldConfig[] = [];
  configAdd: FieldConfig[] = [];

  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};
  source: LocalDataSource = new LocalDataSource();

  tablename: string;
  formname: string;
  canUpdate: boolean = true;

  //子表视图
  subViewName: any = [];
  //子表查询条件
  mainTableID: number = 0;
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.formname = 'carincome';
    this.mainTableID = _.toInteger(this.route.snapshot.paramMap.get('id'));
    if (this.mainTableID > 0) {
      this.canUpdate = false;
    }
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function () {
        that.getTableField();
      });
    }

    this.getFormSetSub().then(function (data) {
      that.subViewName = data;
    });
  }

  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set').then((data) => {
        if (data.Data) {
          that.formView = _.find(data.Data, function (o) { return o['ViewType'] == 'form' && o['FormName'] == formname; });
          if (that.formView) {
            that.tablename = that.formView['ViewName'];
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
    this.formService.getFormsFieldByName(that.formView['ViewName']).then((data) => {
      if (data.Data) {
        const formFieldList = _.orderBy(data.Data, 'OrderInd', 'asc');
        this.setFormField(formFieldList);
        this.getDataList();
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
          let cigUpdate = _.find(this.configUpdate, f => { return f['name'] == d['FieldName'] });
          if (cigUpdate) {
            cigUpdate['options'] = list;
          }
        });
      }

      if (_.startsWith(d['DataSource'], 'table')) {
        //从数据表中获取,DataSource设置的格式：table_tableName_Id_Name
        const dataS = d['DataSource'].split('-');
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

              list.push({ id: dt[dataS[2]], name: display });
            });

            let cigAdd = _.find(this.configAdd, f => { return f['name'] == d['FieldName'] });
            if (cigAdd) {
              cigAdd['options'] = list;
            }
            let cigUpdate = _.find(this.configUpdate, f => { return f['name'] == d['FieldName'] });
            if (cigUpdate) {
              cigUpdate['options'] = list;
            }
          }, (err) => {
            let cigAdd = _.find(this.configAdd, f => { return f['name'] == d['FieldName'] });
            if (cigAdd) {
              cigAdd['options'] = [];
            }
            let cigUpdate = _.find(this.configUpdate, f => { return f['name'] == d['FieldName'] });
            if (cigUpdate) {
              cigUpdate['options'] = [];
            }
          });
        }
      }

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

      if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') > 0) {
        //如果有列出选项列表
        const dicList = [];
        _.each(d['DicName'].split(','), d => {
          dicList.push({ id: d, name: d });
        });
        cfgAdd.options = dicList;
        cfgUpdate.options = dicList;
      }
      if (_.startsWith(d['DataSource'], 'table')) {
        cfgAdd.options = [];
        cfgUpdate.options = [];
      }
      if (cfgAdd && _.toLower(d['FieldName']) != 'id') {
        this.configAdd.push(cfgAdd);
      }
      if (cfgUpdate && _.toLower(d['FieldName']) != 'id') {
        this.configUpdate.push(cfgUpdate);
      }

      this.config = this.configUpdate;
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
    if (this.tablename && this.mainTableID) {
      this.formService.getForms(`${this.tablename}/${this.mainTableID}`).then((data) => {
        if (data && data.Data)
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

  onUpdate(value: { [name: string]: any }) {
    const that = this;
    value['Id'] = this.mainTableID;
    _.each(this.config, f => {
      if (f.type === 'datepicker' && value[f.name]) {
        value[f.name] = this._common.getDateString(value[f.name]);
      }
    });

    console.log(value);
    this.formService.create(this.tablename, value).then(function (data) {
      if (_.isArray(data) && data.length == 1) {
        that.mainTableID = _.toInteger(data[0]);
        that.canUpdate = false;
      }
      that._state.notifyDataChanged("messagebox", { type: 'success', msg: '保存成功。', time: new Date().getTime() });
    }, (err) => {
      that._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }
}
