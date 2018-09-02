import { Component, OnInit, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { DynamicFormComponent }
  from '../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SearchFormService } from './searchform.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import async from 'async';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-search-form',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.scss'],
  providers: [SearchFormService, DicService],
})
export class SearchFormComponent implements OnInit {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  loading = false;
  title = '表单定义';

  config: FieldConfig[] = [];
  //新增配置
  configAdd: FieldConfig[] = [];
  configAddArr: FieldConfig[] = [];
  _formView: any;
  //表单视图定义
  @Input()
  set formView(view: any) {
    if (view) {
      this._formView = view;
      this.formname = this._formView['ViewName'];
      this.getTableField();
    }
  }

  @Output()
  searchClick = new EventEmitter();
  //下拉列表
  selectData: {};

  formname: string;

  constructor(
    private modalService: NgbModal,
    private formService: SearchFormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private _common: Common,
    private _state: GlobalState) {
  }

  ngOnInit() {
    if (this._formView) {
      this.formname = this._formView['ViewName'];
      this.getTableField();
    }
    this.configAddArr = [];
    //下拉列表
    this.selectData = {};
  }

  getTableField(): void {
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.formname).then((data) => {
      if (data.Data) {
        const formFieldList = _.orderBy(data.Data, 'OrderInd', 'asc');
        async.eachSeries(formFieldList, function (field, callback) {
          const config = that.setFormField(field);
          that.configAddArr.push(config);
          that.setSelectValue(field).then(() => {
            callback();
          });
        }, function (err) {
          if (err) {
            console.log('err');
          } else {
            that.configAddArr.push({
              type: 'button',
              name: '查询',
            })
            that.config = that.configAddArr;
          }
        });
      }
    }, (err) => {
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  //设置表单字段
  setFormField(d) {
    let cfgAdd: FieldConfig;
    const placehd = d['DataSource'] == "list" || _.startsWith(d['DataSource'], 'table') ? '--请选择--' : '输入' + d['Title'];

    cfgAdd = {
      type: d['FormType'],
      label: d['Title'],
      name: d['FieldName'],
      placeholder: placehd,
      config: { placeholder: placehd }
    };

    if (d['Default'] && cfgAdd) {
      if (_.toLower(d['Default']) == "user") {
        cfgAdd.value = sessionStorage.getItem('userId');
      } else if (_.toLower(d['Default']) == "date") {
        cfgAdd.value = this._common.getTodayObj();
      } else {
        cfgAdd.value = d['Default'];
      }
    }

    if (cfgAdd && cfgAdd.type == 'select') {
      cfgAdd.options = [];
    }

    if (d['DataSource'] == "list" && d['DicName'] && d['DicName'].includes(',') > 0) {
      //如果有列出选项列表
      const dicList = [];
      _.each(d['DicName'].split(','), d => {
        dicList.push({ id: d, text: d });
      });
      if (cfgAdd) {
        cfgAdd['options'] = dicList;
        cfgAdd.config.minimumResultsForSearch = Infinity;
      }
    }

    return cfgAdd;
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
            resolve();
          }, (err) => {
            let cigAdd = _.find(this.configAddArr, f => { return f['name'] == field['FieldName'] });
            if (cigAdd) {
              cigAdd['options'] = [];
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

  changed(e: any) {
    if (_.isArray(e.data) && e.data.length > 0) {
      const element = e.data[0].element;
      const field = $(element).parent().parent().prev().val();
      this.selectData[field] = e.value;
    }
  }
  onClear() {
    _.each(this.config, f => {
      f.value = '';
    });
  }
  onSearch(value: { [name: string]: any }) {
    const that = this;
    _.each(this.config, f => {
      if (f.type === 'datepicker' && value[f.name]) {
        value[f.name] = this._common.getDateString(value[f.name]);
      }
      //如果表单值未找到
      if (!value[f.name]) {
        if (this.selectData[f.name]) {
          //下拉列表中
          value[f.name] = this.selectData[f.name];
        }
      }
      if (!value[f.name]) {
        delete value[f.name];
      }
    });
    delete value['查询'];
    this.searchClick.emit(value);
  }
}
