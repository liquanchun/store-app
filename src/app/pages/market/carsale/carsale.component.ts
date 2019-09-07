import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormService } from '../form/form.services';
import { DicService } from '../../sys/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { EditFormComponent } from '../editform/editform.component';
import { PrintButtonComponent } from './printbutton.component';
import { Common } from '../../../providers/common';
import { HttpService } from '../../../providers/httpClient';
import { Config } from '../../../providers/config';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { promise } from 'selenium-webdriver';

type AOA = any[][];
@Component({
  selector: 'app-carsale',
  templateUrl: './carsale.component.html',
  styleUrls: ['./carsale.component.scss'],
  providers: [FormService, DicService, HttpService]
})
export class CarsaleComponent implements OnInit {
  loading = false;
  title = '车辆销售';
  query: string = '';
  queryArr: any;
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
    columns: {
      button: {
        title: '操作',
        type: 'custom',
        renderComponent: PrintButtonComponent,
        onComponentInitFunction: (instance: any) => {
          instance.click.subscribe(row => {
            console.log(row);
          });
        }
      }
    }
  };
  titles: any = [];
  feilds: any = [];

  config: FieldConfig[] = [
    {
      type: 'check',
      label: '审核',
      name: 'AuditResult',
      check: 'radio',
      options: [
        {
          id: '通过',
          text: '通过'
        },
        {
          id: '不通过',
          text: '不通过'
        }
      ]
    },
    {
      type: 'input',
      label: '审核意见',
      name: 'AuditSuggest'
    }
  ];
  printSet: any = ['第一联 销售顾问', '第二联 销售计划', '第三联 财务', '第四联 客户'];

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

  carsaleData: any;
  allcarsaleData: any;
  printOrder: any = {};
  serviceItem: any;
  serviceItem1: any;
  serviceItem2: any;
  giveItem: any;
  htmlTd: any;
  htmlGiveTd: any;
  marginbottom = '20px'; //小于2个48px
  chineseMoney: string;
  notice = true;

  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _common: Common,
    private _state: GlobalState,
    private _httpClient: HttpService,
    private _config: Config
  ) {}
  ngAfterViewInit() {}
  ngOnDestroy() {}
  ngOnInit() {
    this.formname = 'carsale';
    this.canUpdate = false;
    this.start();
    this.mainTableID = 0;
    const that = this;

    this._state.unsubscribe('print.carsale.detail');
    this._state.unsubscribe('print.carsale.check');
    this._state.unsubscribe('print.carsale.audit');
    this._state.unsubscribe('print.carsale.auditnot');
    this._state.unsubscribe('print.carsale');

    this._state.subscribe('print.carsale.detail', data => {
      this.router.navigate(['/pages/market/carsalenew', this.mainTableID], {
        queryParams: {
          n: 1
        }
      });
    });

    this._state.subscribe('print.carsale.check', data => {
      this.printOrder = _.find(this.carsaleData, f => {
        return f['Id'] == data.id;
      });

      this.formService.getForms(`car_sale_cash/OrderId/${this.printOrder.OrderId}`).then(
        data => {
          if (data.Data && data.Data.length > 0) {
            this.router.navigate(['/pages/market/carsalecashnew', this.printOrder.Id], {
              queryParams: {
                n: this.printOrder.OrderId,
                id: data.Data[0].Id
              }
            });
          } else {
            this.router.navigate(['/pages/market/carsalecashnew', this.printOrder.Id], {
              queryParams: {
                n: this.printOrder.OrderId
              }
            });
          }
        },
        err => {}
      );
    });

    this._state.subscribe('print.carsale.audit', data => {
      // if (this.notice) {
      //   this.notice = false;
      this.printOrder = _.find(this.carsaleData, f => {
        return f['Id'] == data.id;
      });
      this.formService.getForms(this.tableView['ViewName']).then(data => {
        const old = _.find(data.Data, f => {
          return f['CarIncomeId'] == this.printOrder['CarIncomeId'] && f['Id'] != this.printOrder['Id'];
        });
        if (old && (old['Status'] == '订单' || old['Status'] == '已开票')) {
          this._state.notifyDataChanged('messagebox', {
            type: 'warning',
            msg: `该单车辆已被其他销售顾问创建并审核，你不能审核。`,
            time: new Date().getTime()
          });
        } else {
          this.onAudit();
        }
      });
      // }
    });

    this._state.subscribe('print.carsale.auditnot', data => {
      //this.notice = true;
      this.printOrder = _.find(this.carsaleData, f => {
        return f['Id'] == data.id;
      });
      this.onAuditNot();
    });

    this._state.subscribe('print.carsale', data => {
      this.printOrder = _.find(this.carsaleData, f => {
        return f['Id'] == data.id;
      });
      if (this.printOrder) {
        if (this.printOrder.Deposit) {
          this.chineseMoney = this._common.changeNumMoneyToChinese(this.printOrder.Deposit);
        }
        this.loading = true;
        this.getServiceItem().then(d => {
          this.loading = false;
          this.print();
        });
      }
    });

    // _.delay(function (that) {
    //   that.getDataList();
    // }, 1000 * 60, this);
  }

  start() {
    //this.settings.columns = {};
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function() {
        that.getFormRoles();
      });
    }
  }

  getServiceItem() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('car_booking_item').then(
        data => {
          if (data.Data.length > 0) {
            const zzitem = [],
              zsitem = [];
            _.each(data.Data, f => {
              if (f['OrderId'] == that.printOrder.OrderId && f['ItemType'] == '增值服务') {
                zzitem.push({
                  itemName: f['ItemName'],
                  itemType: f['ItemType'],
                  price: f['Price'],
                  service: f['Service']
                });
              }
              if (f['OrderId'] == that.printOrder.OrderId && f['ItemType'] == '赠送服务') {
                zsitem.push({
                  itemName: f['ItemName'],
                  itemType: f['ItemType'],
                  price: f['Price'],
                  service: f['Service']
                });
              }
            });

            that.serviceItem = zzitem;
            that.serviceItem1 = _.filter(zzitem, f => {
              return f['service'] && f['service'].length > 1;
            });
            that.serviceItem2 = _.filter(zzitem, f => {
              return !f['service'] || f['service'].length == 0;
            });
            if (that.serviceItem2.length % 2 != 0) {
              that.serviceItem2.push({
                itemName: '',
                itemType: '增值服务',
                price: 0,
                service: ''
              });
            }
            that.htmlTd = [];

            let index;
            for (index in that.serviceItem2) {
              let i = index * 3;
              if (i < that.serviceItem2.length) {
                that.htmlTd.push({
                  itemName1: that.serviceItem2[i].itemName,
                  price1: that.serviceItem2[i].price,
                  itemName2: i + 1 < that.serviceItem2.length ? that.serviceItem2[i + 1].itemName : '',
                  price2: i + 1 < that.serviceItem2.length ? that.serviceItem2[i + 1].price : '',
                  itemName3: i + 2 < that.serviceItem2.length ? that.serviceItem2[i + 2].itemName : '',
                  price3: i + 2 < that.serviceItem2.length ? that.serviceItem2[i + 2].price : ''
                });
              }
            }

            that.htmlGiveTd = [];
            index = 0;
            for (index in zsitem) {
              let i = index * 2;
              if (i < zsitem.length) {
                that.htmlGiveTd.push({
                  itemName1: zsitem[i].itemName,
                  service1: zsitem[i].service,
                  itemName2: i + 1 < zsitem.length ? zsitem[i + 1].itemName : '',
                  service2: i + 1 < zsitem.length ? zsitem[i + 1].service : ''
                });
              }
            }
            let bt = 0;
            if (that.htmlGiveTd.length == 0) {
              bt = 80;
            }
            if (that.htmlGiveTd.length == 1) {
              bt = 60;
            }
            if (that.htmlGiveTd.length == 2) {
              bt = 40;
            }
            if (that.printOrder.PayType == '分期付款') {
              bt = bt - 20;
            }
            that.marginbottom = bt + 'px';
            that.giveItem = zsitem;
          }
          resolve();
        },
        err => {}
      );
    });
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
            that.searchview = _.find(data.Data, function(o) {
              return o['ViewType'] == 'search' && o['FormName'] == formname;
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

              that.getFormSetSub().then(function(data) {
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
        },
        err => {
          this._state.notifyDataChanged('messagebox', {
            type: 'error',
            msg: err,
            time: new Date().getTime()
          });
        }
      );
    });
  }

  //获取表单字段权限控制
  getFormRoles() {
    this.formService.getForms('vw_form_role/ViewName/' + this.tableView['ViewName']).then(data => {
      if (data.Data) {
        this.getTableField(data.Data);
      }
    });
  }
  //检查用户角色是否拥有字段权限
  checkRole(roleData: any, fieldName: string) {
    const roleIds = sessionStorage.getItem('roleIds');
    const roleField = _.find(roleData, f => {
      return f['FieldName'] == fieldName;
    });
    //如果没有设置，或者设置了可读
    return !roleField['RoleIds'] || (roleField && roleField['RoleIds'] && roleField['CanRead'] && roleField['CanRead'] == 1 && roleField['RoleIds'].includes(roleIds));
  }
  getTableField(roleData: any): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.tableView['ViewName']).then(
      data => {
        if (data.Data) {
          const viewList = _.orderBy(data.Data, 'OrderInd', 'asc');
          _.each(viewList, d => {
            if (this.checkRole(roleData, d['FieldName'])) {
              this.settings.columns[d['FieldName']] = {
                title: d['Title'],
                type: d['DataType'],
                filter: false
              };
              this.titles.push(d['Title']);
              this.feilds.push(d['FieldName']);
            }
          });

          this.newSettings = Object.assign({}, this.settings);
          this.getDataList();
        }
        this.loading = false;
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged('messagebox', {
          type: 'error',
          msg: err,
          time: new Date().getTime()
        });
      }
    );
  }

  //获取数据
  getFormSetSub() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms('form_set_sub').then(
        data => {
          if (data.Data) {
            resolve(data.Data);
          }
        },
        err => {}
      );
    });
  }
  //获取数据
  getDataList() {
    this.loading = true;
    this.formService.getForms(this.tableView['ViewName']).then(
      data => {
        this.checkRoles('AuditRoles').then(d => {
          this.allcarsaleData = data.Data;
          this.carsaleData = data.Data;
          if (d == 0) {
            //如果没有审核权限，则只显示自己创建的单
            this.carsaleData = _.filter(data.Data, f => {
              return f['Creator'] == sessionStorage.getItem('userName') || f['Creator'] == 'admin';
            });
          }
          _.each(this.carsaleData, f => {
            f['AuditRoles'] = this.tableView['AuditRoles'];
            f['ReadRoles'] = this.tableView['ReadRoles'];
            f['EditRoles'] = this.tableView['EditRoles'];
            f['button'] = f;
          });
          this.source.load(this.carsaleData);

          this.totalRecord = data.Data.length;
          this.loading = false;
        });
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
        filterArr.push({
          field: d,
          search: query
        });
      });
      this.source.setFilter(filterArr, false);
      this.totalRecord = this.source.count();
    }
  }
  //高级查询
  onSearchAll(query: any) {
    if (_.isObject(query) && _.keys(query).length > 0) {
      this.queryArr = query;
      console.log('查询条件：' + JSON.stringify(query));
      this.loading = true;
      this.formService.getFormsByPost(this.tableView['ViewName'], query).then(
        data => {
          this.checkRoles('AuditRoles').then(d => {
            this.carsaleData = data.Data;
            if (d == 0) {
              //如果没有审核权限，则只显示自己创建的单
              this.carsaleData = _.filter(data.Data, f => {
                return f['Creator'] == sessionStorage.getItem('userName') || f['Creator'] == 'admin';
              });
            }
            _.each(this.carsaleData, f => {
              f['AuditRoles'] = this.tableView['AuditRoles'];
              f['ReadRoles'] = this.tableView['ReadRoles'];
              f['EditRoles'] = this.tableView['EditRoles'];
              f['button'] = f;
            });
            this.source.load(this.carsaleData);

            this.totalRecord = data.Data.length;
            this.loading = false;
          });
        },
        err => {
          this.loading = false;
        }
      );
    }
  }
  onCreate(): void {
    this.checkRoles('EditRoles').then(d => {
      if (d == 0) {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '你无权新增销售预订单。',
          time: new Date().getTime()
        });
      } else {
        this.router.navigate(['/pages/market/carsalenew', 0]);
      }
    });
  }
  onSave(event) {
    console.log(event);
  }
  onEdit(event) {
    const id = event.data.Id;
    this.formService.getForms(`car_booking/${id}`).then(data => {
      const carbook = data.Data[0];
      if (carbook['AuditResult'] == '通过') {
        this._state.notifyDataChanged('messagebox', {
          type: 'warning',
          msg: '已审核通过，不能修改。',
          time: new Date().getTime()
        });
        return;
      }
      if (carbook['Creator']) {
        if (sessionStorage.getItem('userName') != carbook['Creator']) {
          this._state.notifyDataChanged('messagebox', {
            type: 'warning',
            msg: `该单创建人是${carbook['Creator']}，你不能修改。`,
            time: new Date().getTime()
          });
          return;
        }
      }

      this.checkRoles('EditRoles').then(d => {
        if (d == 0) {
          this._state.notifyDataChanged('messagebox', {
            type: 'warning',
            msg: '你无权修改销售预订单。',
            time: new Date().getTime()
          });
        } else {
          this.router.navigate(['/pages/market/carsalenew', id]);
        }
      });
    });
  }

  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      const id = this.printOrder['Id'];
      this.formService.getForms(`car_booking/${id}`).then(data => {
        const carbook = data.Data[0];
        if (carbook['Creator']) {
          if (sessionStorage.getItem('userName') != carbook['Creator']) {
            this._state.notifyDataChanged('messagebox', {
              type: 'warning',
              msg: `该单创建人是${carbook['Creator']}，你不能删除。`,
              time: new Date().getTime()
            });
            return;
          }
        }

        if (carbook['AuditResult'] == '通过') {
          this._state.notifyDataChanged('messagebox', {
            type: 'warning',
            msg: '已审核通过，不能删除。',
            time: new Date().getTime()
          });
          return;
        }

        this.checkRoles('EditRoles').then(d => {
          if (d == 0) {
            this._state.notifyDataChanged('messagebox', {
              type: 'warning',
              msg: '你无权删除销售预订单。',
              time: new Date().getTime()
            });
          } else {
            this.formService.delete(this.tableView['TableName'], event.data.Id).then(
              data => {
                this._state.notifyDataChanged('messagebox', {
                  type: 'success',
                  msg: '删除成功。',
                  time: new Date().getTime()
                });
                this.getDataList();
              },
              err => {
                this._state.notifyDataChanged('messagebox', {
                  type: 'error',
                  msg: err,
                  time: new Date().getTime()
                });
              }
            );
          }
        });
      });
    }
  }

  onSelected(event) {
    this.mainTableID = event.data.Id;

    this.printOrder = _.find(this.carsaleData, f => {
      return f['Id'] == this.mainTableID;
    });
    if (this.printOrder) {
      if (this.printOrder.Deposit) {
        this.chineseMoney = this._common.changeNumMoneyToChinese(this.printOrder.Deposit);
      }
      this.getServiceItem();
    }
  }

  onAudit(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '审核预订单';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formValue = JSON.parse(result);
      formValue['Id'] = that.printOrder['Id'];
      formValue['Auditor'] = sessionStorage.getItem('userName');
      formValue['AuditTime'] = this._common.getTodayString();
      formValue['Status'] = '订单';
      console.log(formValue);

      that.formService.create('car_booking', formValue).then(
        data => {
          closeBack();
          this._state.notifyDataChanged('messagebox', {
            type: 'success',
            msg: '审核成功。',
            time: new Date().getTime()
          });
          if (formValue['AuditResult'] == '通过') {
            this.saveStatus('订单');
          }
          that.printOrder['AuditResult'] = '通过';
          that.getDataList();
        },
        err => {
          this._state.notifyDataChanged('messagebox', {
            type: 'error',
            msg: err,
            time: new Date().getTime()
          });
        }
      );
    };
  }

  onAuditNot(): void {
    let formValue = {};
    formValue['Id'] = this.printOrder['Id'];
    formValue['Status'] = ' ';
    formValue['AuditResult'] = ' ';
    formValue['AuditSuggest'] = ' ';
    formValue['Auditor'] = sessionStorage.getItem('userName');
    formValue['AuditTime'] = this._common.getTodayString();
    this.formService.create('car_booking', formValue).then(
      data => {
        this._state.notifyDataChanged('messagebox', {
          type: 'success',
          msg: '反审核成功。',
          time: new Date().getTime()
        });
        this.saveStatus('未售');
        this.getDataList();
      },
      err => {
        this._state.notifyDataChanged('messagebox', {
          type: 'error',
          msg: err,
          time: new Date().getTime()
        });
      }
    );
  }
  //修改状态
  saveStatus(status: string) {
    const that = this;
    const carinfo = {
      Id: this.printOrder.CarIncomeId,
      SaleStatus: status
    };
    this.formService.create('car_income', carinfo).then(
      data => {
        that.getDataList();
      },
      err => {}
    );
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
      } else {
        resolve(1);
      }
    });
  }

  onExport() {
    const fileName = `销售预定单——${this._common.getTodayString2()}.xlsx`;
    const data = [this.titles];
    _.each(this.carsaleData, d => {
      const vals = [];
      _.each(this.feilds, f => {
        vals.push(d[f]);
      });
      data.push(vals);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const merge = {
      s: {
        r: 0,
        c: 0
      },
      e: {
        r: 0,
        c: 1
      }
    };
    /* add merges */
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(merge);

    XLSX.writeFile(wb, fileName);
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById('printDiv').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=1098px,width=1080px');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title style="font-size: 10px;"></title>
          <style>
          table{
            width: 740px;
            border-collapse: collapse;
            font-size: 12px;
            border:1px solid black;
            table-layout: fixed;
          }
          th,td{
            border:1px solid black;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            padding:1px 3px;
          }
          .noboder td{
            border-left:none;
            border-right:none;
          }
          .noboderall td{
            border:none;
          }
          .textleft{
            text-align:left;
          }
          .textright{
            text-align:right;
          }
          .textcenter{
            text-align:center;
          }
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
}
