import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
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

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  loading = false;
  title = '表单定义';
  query: string = '';
  newSettings = {};
  settings = {
    pager: {
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
  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};
  source: LocalDataSource = new LocalDataSource();

  formname: string;
  canAdd: boolean;

  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _common: Common,
    private _state: GlobalState) {
    this.toastyConfig.position = 'top-center';
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
        that.getFormField();
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
          }
        }
        resolve();
      }, (err) => {
        this.toastOptions.msg = err
        this.toastyService.error(this.toastOptions)
      });
    })
  }

  getTableField(): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(this.tableView['ViewName']).then((data) => {
      if (data.Data) {
        const viewList = _.orderBy(data.Data, 'OrderInd', 'asc');
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
      this.toastOptions.msg = err
      this.toastyService.error(this.toastOptions)
    });
  }

  getFormField(): void {
    this.formService.getFormsFieldByName(this.formView['ViewName']).then((data) => {
      if (data.Data) {
        const formFieldList = _.orderBy(data.Data, 'OrderInd', 'asc');
        this.setFormField(formFieldList);
      }
      this.loading = false;
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
      this.onSearch('');
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
      let formValue = JSON.parse(result);
      _.each(this.configAdd, f => {
        if (f.type === 'datepicker' && formValue[f.name]) {
          formValue[f.name] = this._common.getDateString(formValue[f.name]);
        }
      });
      console.log(formValue);
      that.formService.create(that.formView['ViewName'], formValue).then((data) => {
        closeBack();
        this.toastOptions.msg = "新增成功。"
        this.toastyService.success(this.toastOptions)
        that.getDataList();
      },
        (err) => {
          this.toastOptions.msg = err
          this.toastyService.error(this.toastOptions)
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

    let eventdata = event.data;
    _.each(this.configUpdate, f => {
      if (f.type === 'datepicker' && eventdata[f.name]) {
        const dv = eventdata[f.name];
        if (_.isString(dv)) {
          eventdata[f.name] = this._common.getDateObject(dv);
        }
      }
    });

    modalRef.componentInstance.formValue = eventdata;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formViewData = JSON.parse(result);
      const cfgupdate = _.filter(that.configUpdate, function (o) { return o['disabled'] == true; });
      _.each(cfgupdate, d => {
        if (that.updateData[d.name]) {
          formViewData[d.name] = that.updateData[d.name];
        }

      });

      _.each(this.configUpdate, f => {
        if (f.type === 'datepicker' && formViewData[f.name]) {
          const dv = formViewData[f.name];
          if (_.isObject(dv)) {
            formViewData[f.name] = this._common.getDateString(dv);
          }
        }
      });

      console.log(formViewData);
      that.formService.update(that.formView['ViewName'], formViewData).then((data) => {
        closeBack();
        this.toastOptions.msg = "修改成功。"
        this.toastyService.success(this.toastOptions)
        that.getDataList();
      },
        (err) => {
          this.toastOptions.msg = err
          this.toastyService.error(this.toastOptions)
        }
      )
    };
  }

  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.formService.delete(this.tableView['ViewName'], event.data.Id).then((data) => {
        this.toastOptions.msg = "删除成功。"
        this.toastyService.success(this.toastOptions)
        this.getDataList();
      }, (err) => {
        this.toastOptions.msg = err
        this.toastyService.error(this.toastOptions)
      });
    }
  }

}
