import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { OrgService } from '../../sys/components/org/org.services';
import { LocalDataSource } from 'ng2-smart-table';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { StoreoutService } from './storeout.services';
import { DicService } from '../../basedata/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import { StoreoutPrintComponent } from './storeioutprint.component';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-storeout',
  templateUrl: './storeout.component.html',
  styleUrls: ['./storeout.component.scss'],
  providers: [StoreoutService, DicService, OrgService]
})
export class StoreoutComponent implements OnInit {
  loading = false;
  title = '出库查询';
  query: string = '';

  settings = {
    pager: {
      perPage: 15
    },
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '明细',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '作废',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      orderNo: {
        title: '出库单号',
        type: 'string',
        filter: false
      },
      typeIdTxt: {
        title: '出库类型',
        type: 'string',
        filter: false
      },
      outTime: {
        title: '出库日期',
        type: 'string',
        filter: false
      },
      storeIdTxt: {
        title: '仓库',
        type: 'string',
        filter: false
      },
      orgIdTxt: {
        title: '领料部门',
        type: 'string',
        filter: false
      },
      operatorTxt: {
        title: '领料人',
        type: 'string',
        filter: false
      },
      amount: {
        title: '订单金额',
        type: 'string',
        filter: false
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      },
      createdBy: {
        title: '录入人',
        type: 'string',
        filter: false
      },
      createdAt: {
        title: '录入时间',
        type: 'string',
        filter: false
      },
      status: {
        title: '状态',
        type: 'string',
        filter: false
      },
      button: {
        title: '打印',
        type: 'custom',
        renderComponent: StoreoutPrintComponent,
        onComponentInitFunction(instance) {
          instance.save.subscribe(row => {
            alert(`${row.orderNo} saved!`);
          });
        }
      }
    }
  };

  settingsGoods = {
    actions: false,
    hideSubHeader: true,
    noDataMessage: '',
    columns: {
      batchno: {
        title: '批次',
        type: 'string',
        filter: false
      },
      goodsTypeIdTxt: {
        title: '产品类别',
        type: 'string',
        filter: false
      },
      goodsIdTxt: {
        title: '名称',
        type: 'string',
        filter: false
      },
      goodsBrand: {
        title: '品牌',
        type: 'string',
        filter: false
      },
      unit: {
        title: '型号',
        type: 'string',
        filter: false
      },
      number: {
        title: '数量',
        type: 'number',
        filter: false
      },
      price: {
        title: '单价',
        type: 'number',
        filter: false
      },
      amount: {
        title: '金额',
        type: 'number',
        filter: false
      },
      remarl: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  source: LocalDataSource = new LocalDataSource();
  selectedGrid: LocalDataSource = new LocalDataSource();

  storeOutData: any;
  storeOutDetailData: any;

  //仓库
  stores: any = [];
  //出库类型
  inType: any = [];
  //组织架构
  orgName: any = '';

  selectedSup = [];
  selectedOrg = [];

  myOptionsSup: IMultiSelectOption[];
  myOptions: IMultiSelectOption[];
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    selectionLimit: 1,
    autoUnselect: true
  };
  myTextsOrg: IMultiSelectTexts = {
    defaultTitle: '--选择部门--',
    searchPlaceholder: '查询...'
  };

  printOrder: any = {
    orderNo: '',
    typeIdTxt: '',
    outTime: '',
    orgIdTxt: '',
    operatorTxt: '',
    createdBy: '',
    supplierIdTxt: '',
    amount: 0
  };
  printOrderDetail = [];

  constructor(
    private storeoutService: StoreoutService,
    private _dicService: DicService,
    private _common: Common,
    private _router: Router,
    private _orgService: OrgService,
    private modalService: NgbModal,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this._state.subscribe('print.storeout', data => {
      this.printOrder = _.find(this.storeOutData, f => {
        return f['id'] == data.id;
      });
      if (this.printOrder) {
        this.printOrderDetail = _.filter(this.storeOutDetailData, f => {
          return f['orderno'] == this.printOrder.orderNo;
        });
        _.delay(
          function(that) {
            that.print();
          },
          300,
          this
        );
      }
    });
    this.getDataList();
  }
  ngOnDestory() {
    this._state.unsubscribe('print.storeout');
  }
  onSearch(query: string = '') {
    this.source.setFilter(
      [{ field: 'OrderNo', search: query }, { field: 'operatorTxt', search: query }, { field: 'createdBy', search: query }, { field: 'typeIdTxt', search: query }],
      false
    );
  }
  showPopOrg(event): void {
    _.delay(
      function(text) {
        $('.popover').css('max-width', '380px');
        $('.popover').css('min-width', '300px');
      },
      100,
      'later'
    );
  }
  //查看明细
  onEdit(event) {}
  //作废
  onDelete(event) {
    if (window.confirm('你确定要作废吗?')) {
      if (event.data.status == '作废') {
        this._state.notifyDataChanged('messagebox', { type: 'warning', msg: '该出库单已经作废，不能操作。', time: new Date().getTime() });
        return;
      }
      this.storeoutService.cancel(event.data.id).then(
        data => {
          this._state.notifyDataChanged('messagebox', { type: 'success', msg: '作废成功。', time: new Date().getTime() });
          this.getDataList();
        },
        err => {
          this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
        }
      );
    }
  }

  onSelectedOrg(org) {
    if (org) {
      this.orgName = org.name;
      this.source.setFilter([{ field: 'orgIdTxt', search: org.name }], false);
    }
  }
  onInTypeChange(inType) {
    if (inType.target.value) {
      this.source.load(
        _.filter(this.storeOutData, f => {
          return f['typeId'] == inType.target.value;
        })
      );
    } else {
      this.source.load(this.storeOutData);
    }
  }

  onStoresChange(store) {
    if (store.target.value) {
      this.source.load(
        _.filter(this.storeOutData, f => {
          return f['storeId'] == store.target.value;
        })
      );
    } else {
      this.source.load(this.storeOutData);
    }
  }

  onChangeOrg(event) {
    if (event && event.length > 0) {
      this.source.load(
        _.filter(this.storeOutData, f => {
          return f['orgId'] == event[0];
        })
      );
    } else {
      this.source.load(this.storeOutData);
    }
  }
  open(event, content) {
    const orderNo = event.data.orderNo;
    const orderDetail = _.filter(this.storeOutDetailData, f => {
      return f['orderno'] == orderNo;
    });
    this.selectedGrid.load(orderDetail);

    this.modalService.open(content).result.then(result => {}, reason => {});
    _.delay(
      function(text) {
        $('.modal-dialog').css('max-width', '945px');
      },
      100,
      'later'
    );
  }

  getDataList(): void {
    this._dicService.getDicByName('仓库', data => {
      this.stores = data;
    });
    this._dicService.getDicByName('出库类型', data => {
      this.inType = data;
    });

    this._orgService.getAll().then(data => {
      const that = this;
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['deptName'] });
      });
      this.myOptions = optData;
    });

    this.loading = true;
    this.storeoutService.getStoreouts().then(
      data => {
        this.loading = false;
        if (data && data['storeOutDetailList']) {
          const that = this;
          this.storeOutDetailData = data['storeOutDetailList'];
          this.storeOutData = data['storeOutList'];
          _.each(this.storeOutData, f => {
            f['outTime'] = that._common.getSplitDate(f['outTime']);
            f['button'] = f['id'];
          });
          this.source.load(this.storeOutData);
        }
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged('messagebox', { type: 'error', msg: err, time: new Date().getTime() });
      }
    );
  }

  print() {
    let printContents, popupWin;
    printContents = document.getElementById('printDiv').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=978px,width=1080px');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title style="font-size: 30px;"></title>
          <style>
          title{
            
          }
          .firstTable td {
            border: none;
            padding: 8px;
          }
          
          .firstTable {
            width: 680px;
            border-collapse: collapse;
          }
          
          .secondtable {
            width: 680px;
            border-collapse: collapse;
          }
          
          .secondtable td {
            padding: 8px;
            border: 1px solid black;
          }
          
          .secondtable thead {
            font-weight: bold;
          }
          
          .secondtable .footer {
            font-weight: bold;
          }
          p{
            text-align: center;
            font-size:30px;
            width: 680px;
          }
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
  //新增出库
  newStoreout(): void {
    this._router.navigate(['/pages/store/storeoutnew']);
  }
}
