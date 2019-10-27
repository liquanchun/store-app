import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormService } from './form.services';
import { DicService } from '../dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import async from 'async';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [FormService, DicService]
})
export class FormComponent implements OnInit {
  private toastOptions: ToastOptions = {
    title: '提示信息',
    msg: 'The message',
    showClose: true,
    timeout: 2000,
    theme: 'bootstrap'
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
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {}
  };

  //更新表单配置
  configUpdate: FieldConfig[] = [];
  //新增表单配置
  configAdd: FieldConfig[] = [];
  configAddArr: FieldConfig[] = [];
  configUpdateArr: FieldConfig[] = [];
  //表格视图定义
  tableView: {};
  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};
  //表格数据源
  source: LocalDataSource = new LocalDataSource();

  alldata: any;
  //表单名称
  formname: string;
  //是否可以新增
  canAdd: boolean;
  //记录Id
  recordId: number;

  selectedRow: any;
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _common: Common,
    private _state: GlobalState
  ) {
    this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.formname = this.route.snapshot.paramMap.get('id');
    this.start();
    this._state.subscribe('newurl', d => {
      const urls = d.split('/');
      if (urls[urls.length - 1] != this.formname) {
        this.formname = urls[urls.length - 1];
        this.start();
      }
    });
  }

  start() {
    this.configAddArr = [];
    this.configUpdateArr = [];
    this.settings.columns = {};
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function() {
        that.getTableField();
        that.getFormField();
      });
    }
  }
  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set').then(
        data => {
          if (data.Data) {
            that.tableView = _.find(data.Data, function(o) {
              return o['ViewType'] == 'table' && o['FormName'] == formname;
            });
            that.formView = _.find(data.Data, function(o) {
              return o['ViewType'] == 'form' && o['FormName'] == formname;
            });
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
                }
                if (!that.tableView['CanDelete']) {
                  that.settings['actions']['delete'] = false;
                }
              }
            }
          }
          resolve();
        },
        err => {
          this.toastOptions.msg = err;
          this.toastyService.error(this.toastOptions);
        }
      );
    });
  }

  getTableField(): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(this.tableView['ViewName']).then(
      data => {
        if (data.Data) {
          const viewList = _.orderBy(data.Data, 'OrderInd', 'asc');
          _.each(viewList, d => {
            this.settings.columns[d['FieldName']] = {
              title: d['Title'],
              type: d['DataType'],
              filter: false
            };
          });

          this.newSettings = Object.assign({}, this.settings);
          this.getDataList();
        }
        this.loading = false;
      },
      err => {
        this.loading = false;
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      }
    );
  }

  getFormField(): void {
    const that = this;
    this.formService.getFormsFieldByName(this.formView['ViewName']).then(data => {
      if (data.Data) {
        const formFieldList = _.orderBy(data.Data, 'OrderInd', 'asc');

        async.eachSeries(
          formFieldList,
          function(field, callback) {
            const config = that.setFormField(field);
            if (config['add']) {
              that.configAddArr.push(config['add']);
            }
            if (config['add']) {
              that.configUpdateArr.push(config['add']);
            }
            that.setDicByName(field).then(() => {
              callback();
            });
            // that.setSelectValue(field).then(() => {
            //   callback();
            // });
          },
          function(err) {
            if (err) {
              console.log('err');
            } else {
              that.configAdd = that.configAddArr;
              that.configUpdate = that.configUpdateArr;
            }
          }
        );
      }
    });
  }

  //设置表单字段
  setFormField(d) {
    let cfgAdd: FieldConfig;
    let cfgUpdate: FieldConfig;
    const placehd = d['DataSource'] == 'list' || _.startsWith(d['DataSource'], 'table') ? '--请选择--' : '输入' + d['Title'];

    if (d['CanAdd']) {
      cfgAdd = {
        type: d['FormType'],
        label: d['Title'],
        name: d['FieldName'],
        placeholder: placehd
      };
    }
    if (d['CanUpdate']) {
      cfgUpdate = {
        type: d['FormType'],
        label: d['Title'],
        name: d['FieldName'],
        placeholder: placehd
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
      if (_.toLower(d['Default']) == 'user') {
        cfgAdd.value = sessionStorage.getItem('userId');
      } else if (_.toLower(d['Default']) == 'date') {
        cfgAdd.value = this._common.getTodayObj();
      } else {
        cfgAdd.value = d['Default'];
      }
    }

    if (cfgAdd && cfgAdd.type == 'select') {
      cfgAdd.options = [];
    }
    if (cfgUpdate && cfgUpdate.type == 'select') {
      cfgUpdate.options = [];
    }

    if (d['DataSource'] == 'list' && d['DicName'] && d['DicName'].includes(',') > 0) {
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
      if (d['DataSource'] == 'list' && d['DicName'] && d['DicName'].includes(',') == 0) {
        //从词典中获取
        this._dicService.getDicByName(d['DicName'], list => {
          let cigAdd = _.find(this.configAddArr, f => {
            return f['name'] == d['FieldName'];
          });
          if (cigAdd) {
            cigAdd['options'] = list;
          }
          let cigUpdate = _.find(this.configUpdateArr, f => {
            return f['name'] == d['FieldName'];
          });
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
          this.formService.getForms(dataS[1]).then(
            d => {
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

              let cigAdd = _.find(this.configAddArr, f => {
                return f['name'] == field['FieldName'];
              });
              if (cigAdd) {
                cigAdd['options'] = list;
              }
              let cigUpdate = _.find(this.configUpdateArr, f => {
                return f['name'] == field['FieldName'];
              });
              if (cigUpdate) {
                cigUpdate['options'] = list;
              }
              resolve();
            },
            err => {
              let cigAdd = _.find(this.configAddArr, f => {
                return f['name'] == field['FieldName'];
              });
              if (cigAdd) {
                cigAdd['options'] = [];
              }
              let cigUpdate = _.find(this.configUpdateArr, f => {
                return f['name'] == field['FieldName'];
              });
              if (cigUpdate) {
                cigUpdate['options'] = [];
              }
            }
          );
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
    this.formService.getForms(this.tableView['ViewName']).then(
      data => {
        if (this.tableView['ViewName'] == 'car_customer') {
          const mydata = _.filter(data.Data, f => {
            return f['Creator'] == sessionStorage.getItem('userName');
          });

          if (this.tableView['OrderByField']) {
            const ordy = this.tableView['OrderByField'].split(',');
            this.source.load(_.orderBy(mydata, ordy, ['asc']));
          } else {
            this.source.load(mydata);
          }
        } else {
          if (this.tableView['OrderByField']) {
            const ordy = this.tableView['OrderByField'].split(',');
            this.source.load(_.orderBy(data.Data, ordy, ['asc']));
          } else {
            this.source.load(data.Data);
          }
        }
        this.alldata = data.Data;
        this.onSearch('');
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    );
  }
  //设置过滤字段
  onSearch(query: string = '') {
    if (this.tableView && this.tableView['SearchField']) {
      let filterArr = [];
      _.each(_.split(this.tableView['SearchField'], ','), d => {
        filterArr.push({ field: d, search: query });
      });
      this.source.setFilter(filterArr, false);
    }
  }
  onCreate(): void {
    this.checkRoles('EditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权新增客户信息。',
          time: new Date().getTime()
        });
      } else {
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
            if (f.name === 'Creator') {
              formValue[f.name] = sessionStorage.getItem('userName');
            }
          });
          console.log(formValue);
          if (formValue.CarType && this.alldata) {
            if (_.find(this.alldata, f => f['CarType'] === formValue.CarType)) {
              this.toastOptions.msg = '车型已经存在。';
              this.toastyService.warning(this.toastOptions);
              return;
            }
          }
          that.formService.create(that.formView['ViewName'], formValue).then(
            data => {
              closeBack();
              this.toastOptions.msg = '新增成功。';
              this.toastyService.success(this.toastOptions);
              that.getDataList();
            },
            err => {
              this.toastOptions.msg = err;
              this.toastyService.error(this.toastOptions);
            }
          );
        };
      }
    });
  }

  onEdit(event) {
    this.checkRoles('EditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权修改客户资料。',
          time: new Date().getTime()
        });
      } else {
        this.updateData = event.data;
        if (this.selectedRow && this.selectedRow['Creator']) {
          if (sessionStorage.getItem('userName') != this.selectedRow['Creator']) {
            this.toastOptions.msg = `该客户创建人是${this.selectedRow['Creator']}，你不能修改。`;
            this.toastyService.warning(this.toastOptions);
            return;
          }
        }
        if (this.selectedRow && _.keys(this.selectedRow).includes('CanUpdate')) {
          if (!this.selectedRow['CanUpdate']) {
            this.toastOptions.msg = '该客户销售订单已审核，不能修改。';
            this.toastyService.warning(this.toastOptions);
            return;
          }
        }

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
          const cfgupdate = _.filter(that.configUpdate, function(o) {
            return o['disabled'] == true;
          });
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
            if (f.name === 'Creator') {
              formViewData[f.name] = sessionStorage.getItem('userName');
            }
          });
          formViewData['Id'] = this.recordId;
          console.log(formViewData);
          that.formService.update(that.formView['ViewName'], formViewData).then(
            data => {
              closeBack();
              this.toastOptions.msg = '修改成功。';
              this.toastyService.success(this.toastOptions);
              that.getDataList();
            },
            err => {
              this.toastOptions.msg = err;
              this.toastyService.error(this.toastOptions);
            }
          );
        };
      }
    });
  }

  onDelete(event) {
    this.checkRoles('EditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权删除客户资料。',
          time: new Date().getTime()
        });
      } else {
        if (this.selectedRow && this.selectedRow['Creator']) {
          if (sessionStorage.getItem('userName') != this.selectedRow['Creator']) {
            this.toastOptions.msg = `该客户创建人是${this.selectedRow['Creator']}，你不能删除。`;
            this.toastyService.warning(this.toastOptions);
            return;
          }
        }
        if (this.selectedRow && _.keys(this.selectedRow).includes('CanUpdate')) {
          if (!this.selectedRow['CanUpdate']) {
            this.toastOptions.msg = '该客户销售订单已审核，不能删除。';
            this.toastyService.warning(this.toastOptions);
            return;
          }
        }
        if (window.confirm('你确定要删除吗?')) {
          this.formService.delete(this.tableView['ViewName'], event.data.Id).then(
            data => {
              this.toastOptions.msg = '删除成功。';
              this.toastyService.success(this.toastOptions);
              this.getDataList();
            },
            err => {
              this.toastOptions.msg = err;
              this.toastyService.error(this.toastOptions);
            }
          );
        }
      }
    });
  }

  onSelected(event) {
    this.recordId = event.data.Id;
    this.selectedRow = event.data;
  }

  checkRoles(power) {
    const that = this;
    return new Promise((resolve, reject) => {
      const roleIds = sessionStorage.getItem('roleIds');
      const roleName = that.tableView[power];
      if (roleName) {
        that.formService.getForms('sys_role').then(
          data => {
            const roles = data.Data;
            const rl = _.find(roles, f => {
              return f['RoleName'] == roleName;
            });
            if (rl && roleIds.includes(rl['Id'])) {
              resolve(1);
            } else {
              resolve(0);
            }
          },
          err => {}
        );
      }
      resolve(1);
    });
  }
}
