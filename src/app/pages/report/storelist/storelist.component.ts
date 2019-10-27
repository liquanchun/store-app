import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { OrgService } from '../../sys/components/org/org.services';
import { LocalDataSource } from 'ng2-smart-table';
import { StorelistService } from './storelist.services';
import { DicService } from '../../basedata/dic/dic.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-storelist',
  templateUrl: './storelist.component.html',
  styleUrls: ['./storelist.component.scss'],
  providers: [StorelistService, DicService, OrgService],
})
export class StorelistComponent implements OnInit {

  loading = false;
  title = '产品库存统计';
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
      goodsIdTxt: {
        title: '名称',
        type: 'string',
        filter: false,
      },
      unit: {
        title: '型号',
        type: 'string',
        filter: false,
      },
      number: {
        title: '数量',
        type: 'string',
        filter: false
      },
      storeIdTxt: {
        title: '仓库',
        type: 'string',
        filter: false,
      },
      remark: {
        title: '备注',
        type: 'string',
        filter: false
      }
    }
  };

  source: LocalDataSource = new LocalDataSource();

  storeOutData: any;
  storeOutDetailData: any;
  //查询条件
  selectedStore = '';
  //仓库
  stores: any = [];

  printOrder: any = {
    title:'北京博瑞宝库存清单',
    amount: 0,
    sumnumber:0,
    storeName:''
  };
  printOrderDetail = [];

  constructor(
    private goodsstoreService: StorelistService,
    private _dicService: DicService,
    private _common: Common,
    private _state: GlobalState) {
  }
  ngOnInit() {
    this.getDataList();
  }

  queryData() {
    if (!this.selectedStore) {
      this._state.notifyDataChanged("messagebox", { type: 'warning', msg: '查询条件不能为空。', time: new Date().getTime() });
      return;
    }
    this.printOrder.printDate = this._common.getTodayString();
    this.loading = true;
    this.goodsstoreService.getGoodsstoresById(this.selectedStore).then((data) => {
      this.loading = false;
      this.printOrderDetail = data;
      this.printOrder.amount = _.sumBy(data, function(o) { return o.amount; });
      this.printOrder.sumnumber = _.sumBy(data, function(o) { return o.number; });
      let ind = 1;
      _.each(this.printOrderDetail,(d)=>{
          d.id = ind;
          ind++;
      });
      this.source.load(this.printOrderDetail);
    }, (err) => {
      this.loading = false;
      this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
    });
  }

  onStoresChange(store) {
    if (store.target.value) {
      this.selectedStore = store.target.value;
      let str = _.find(this.stores,f => { return f['id'] == this.selectedStore ;});
      if(str){
        this.printOrder.storeName = str['name'];
      }
    }
  }

  getDataList(): void {
    this._dicService.getDicByName('仓库', (data) => { this.stores = data; });
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
      </html>`
    );
    popupWin.document.close();
  }
}
