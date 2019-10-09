import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { SaleMonthService } from "./salemonth.services";
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";

@Component({
  selector: "app-salemonth",
  templateUrl: "./salemonth.component.html",
  styleUrls: ["./salemonth.component.scss"],
  providers: [SaleMonthService, DicService, OrgService]
})
export class SaleMonthComponent implements OnInit {
  loading = false;
  title = "销售月统计表";
  q = {
    carser:'',
    yearmonth:''
  }

  //车系
  carseries: any = [
    '7系',
    '6系',
    '5系',
    '4系',
    '3系',
    '2系',
    '1系',
    'X6',
    'X5',
    'X4',
    'X3',
    'X2',
    'X1',
    'I3',
  ];
  //销售月份
  salemon: any = [];

  printOrder: any = {
    title: "博瑞宝汽车销售与材料收发动态表",
    amount: 0,
    sumnumber: 0,
    storeName: ""
  };
  printOrderDetail = [];
  title1 =['汽车车型','前期库存','本期入库','本期出库','本期库存'];
  title2 = ['车数','金额','购入车数','购入金额','估入车数','估入金额','冲估车数','冲估金额','车数','金额','车数','金额'];


  dataList:any = [];
  constructor(
    private saleMonthService: SaleMonthService,
    private _dicService: DicService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
      this.getDataList();
    this.printOrder.printDate = this._common.getTodayString();
  }
  queryData() {
    if(!this.q.yearmonth || !this.q.carser){
       this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "车系和销售年月不能为空。",
          time: new Date().getTime()
        });
        return;
    }
    this.loading = true;
    let qt = {paras:this.q.carser +','+ this.q.yearmonth.replace('年','-').replace('月','')};
    this.saleMonthService.getFormsBySP('sp_reportmonth3',qt).then(
      data => {
        this.loading = false;
        this.dataList = []; 
        _.each(data.Data[0][0], d=>{
            let val = _.values(d);
            let obj = {};
            for (let index = 0; index < val.length; index++) {
              obj[index] = val[index];
            }
            this.dataList.push(obj);
        });
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged("messagebox", {
          type: "error",
          msg: err,
          time: new Date().getTime()
        });
      }
    );
  }

  queryData2() {
    if(!this.q.yearmonth || !this.q.carser){
       this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "车系和销售年月不能为空。",
          time: new Date().getTime()
        });
        return;
    }
    this.loading = true;
    let qt = {paras:this.q.carser +','+ this.q.yearmonth.replace('年','-').replace('月','')};
    this.saleMonthService.getFormsBySP('sp_reportmonth_call',qt).then(
      data => {
        this.loading = false;
      },
      err => {
        this.loading = false;
        this._state.notifyDataChanged("messagebox", {
          type: "error",
          msg: err,
          time: new Date().getTime()
        });
      }
    );
  }
  
  getDataList(): void {
    
    this.saleMonthService.getFormsBySP('sp_getsalemonth',{carseries:'X5'}).then(data=>{
      let dateList = data.Data[0][0];
      let yearmonth = [];
      _.each(dateList, d=>{
          let str = d.InvoiceDate.substr(0,4) + '年' + d.InvoiceDate.substr(5,2) + '月';
          if(!yearmonth.includes(str)){
            yearmonth.push(str);
          }
      });
      this.salemon = yearmonth;
    });
  }

  print() {
    let printContents, popupWin;
    printContents = document.getElementById("printDiv").innerHTML;
    popupWin = window.open(
      "",
      "_blank",
      "top=0,left=0,height=978px,width=1080px"
    );
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title style="font-size: 30px;"></title>
          <style>
          
            table{
              width: 1040px;
              font-size: 12px;
              border:1px solid black;
              border-collapse: collapse;
            }
            td{
              border:1px solid black;
              padding:4px 7px;
              text-align: center;
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
        <body onload="print.portrait = false; window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
}
