import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { OrgService } from '../../sys/components/org/org.services';
import { LocalDataSource } from 'ng2-smart-table';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PersonOutService } from './personout.services';
import { DicService } from '../../basedata/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import { UserService } from '../../sys/components/user/user.services';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-personout',
  templateUrl: './personout.component.html',
  styleUrls: ['./personout.component.scss'],
  providers: [PersonOutService, DicService, OrgService, UserService],
})
export class PersonoutComponent implements OnInit {

  loading = false;
  title = '个人领料统计';
  query: string = '';

  settings = {
    pager: {
      perPage: 15
    },
    actions: false,
    hideSubHeader: true,
    columns: {
      id: {
        title: '序号',
        type: 'string',
        filter: false,
      },
      outTime: {
        title: '领用日期',
        type: 'string',
        filter: false,
      },
      name: {
        title: '工具名称',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '工具型号',
        type: 'string',
        filter: false,
      },
      dicName: {
        title: '仓库',
        type: 'string',
        filter: false,
      },
      number: {
        title: '领用数量',
        type: 'string',
        filter: false
      },
      price: {
        title: '价格',
        type: 'string',
        filter: false
      },
      amount: {
        title: '领用金额',
        type: 'string',
        filter: false
      },
      remark: {
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
  //查询条件
  startDate = '';
  endDate = '';
  operator = '';
  selectedOrg = [];

  //仓库
  stores: any = [];

  myOptions: IMultiSelectOption[];
  myOptionsOper: IMultiSelectOption[];
  mySettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    selectionLimit: 1,
    autoUnselect: true,
  };
  myTextsOrg: IMultiSelectTexts = {
    defaultTitle: '--选择部门--',
    searchPlaceholder: '查询...'
  }

  mySettingsOper: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
  };
  myTexts: IMultiSelectTexts = {
    defaultTitle: '--选择--',
    searchPlaceholder: '查询...'
  }

  //用户
  users: any = [];

  printOrder: any = {
    title:'北京博瑞宝领用清单一览表',
    operator: '',
    amount: 0,
    startDate:'',
    endDate:'',
    printDate:''
  };
  printOrderDetail = [];

  constructor(
    private storeoutService: PersonOutService,
    private _dicService: DicService,
    private _common: Common,
    private _router: Router,
    private _orgService: OrgService,
    private _userService: UserService,
    private modalService: NgbModal,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  queryData() {
    if (!this.startDate || !this.endDate || !this.selectedOrg || !this.operator) {
      this._state.notifyDataChanged("messagebox", { type: 'warning', msg: '查询条件不能为空。', time: new Date().getTime() });
      return;
    }
    let queryModel = { 
       startDate:this._common.getDateString(this.startDate),
       endDate:this._common.getDateString(this.endDate), 
       selectedOrg: _.toNumber(this._common.ArrToString1(this.selectedOrg)), 
       operator: _.toNumber(this._common.ArrToString1(this.operator))
    };
    let user = _.find(this.users,f => { return f['id'] == queryModel.operator ;});
    if(user){
      this.printOrder.operator = user['userName'];
    }
    this.printOrder.startDate = queryModel.startDate;
    this.printOrder.endDate = queryModel.endDate;
    this.printOrder.printDate = this._common.getTodayString();

    this.loading = true;
    this.storeoutService.getStoreoutsByPara(queryModel).then((data) => {
      this.loading = false;
      this.printOrderDetail = data;
      this.printOrder.amount = _.sumBy(data, function(o) { return o.amount; });

      this.source.load(data);
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  onSelectedOrg(event) {
    if (event && event.length > 0) {
      const that = this;
      const orguser = _.filter(this.users, f => { return f['orgId'] == event[0]; });
      let operatorList = [];
      _.each(orguser, f => {
        operatorList.push({ id: f['id'], name: f['userName'] });
      })
      that.myOptionsOper = operatorList;
    }
  }

  getDataList(): void {
    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });

    this._orgService.getAll().then((data) => {
      const that = this;
      const optData = [];
      _.each(data, f => {
        optData.push({ id: f['id'], name: f['deptName'] });
      });
      this.myOptions = optData;
    });

    this._userService.getUsers().then((data) => {
      this.users = data;
    });

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
            width: 1000px;
            border-collapse: collapse;
          }
          
          .secondtable {
            width: 1000px;
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
            width: 1000px;
          }
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }
}
