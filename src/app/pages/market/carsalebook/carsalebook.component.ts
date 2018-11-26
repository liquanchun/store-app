import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { FormService } from "../form/form.services";
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";

import * as $ from "jquery";
import * as _ from "lodash";
import { Common } from '../../../providers/common';

@Component({
  selector: "app-carsalebook",
  templateUrl: "./carsalebook.component2.html",
  styleUrls: ["./carsalebook.component.scss"],
  providers: [FormService, DicService]
})
export class CarSaleBookComponent implements OnInit {
  loading = false;
  title = "车辆销售台账";
  query: string = "";
  searchview: any;
  totalRecord: number = 0;

  dataList: any;
  keyArr: any;
  editKey: any = {};
  showKey: any = {};

  selectedData: any = {};

  cartypecode: any = [];
  carseries: any = [];
  cartype: any = [];
  saleman: any = [];
  buytype: any = [];
  custtype:any = [];

  search:any={
    InvoiceDate1:"",
    InvoiceDate2:"",
    CarTypeCode:"",
    CarSeries:"",
    carvinno:"",
    buytype:"",
    custtype:"",
    saleman:""
  }
  constructor(private formService: FormService, 
    private _common: Common,
    private _state: GlobalState) {}
  ngOnInit() {
    this.getViewName("carsalebook").then(data => {
      this.getDataList();
    });
    this.getCarInfo();
  }

  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms("form_set").then(
        data => {
          if (data.Data) {
            that.searchview = _.find(data.Data, function(o) {
              return o["ViewType"] == "search" && o["FormName"] == formname;
            });
          }
          resolve();
        },
        err => {
          this._state.notifyDataChanged("messagebox", {
            type: "error",
            msg: err,
            time: new Date().getTime()
          });
        }
      );
    });
  }
  getCarInfo(){
    this.formService.getForms("car_income").then(
      data => {
        const cardata = data.Data;
        _.each(cardata, f => {
          if (
            _.findIndex(this.carseries, d => {
              return d["name"] == _.trim(f["CarSeries"]);
            }) == -1
          ) {
            this.carseries.push({ id: f["Id"], name: _.trim(f["CarSeries"]) });
          }
          if (
            _.findIndex(this.cartypecode, d => {
              return d["name"] == _.trim(f["CarTypeCode"]);
            }) == -1
          ) {
            this.cartypecode.push({
              id: f["Id"],
              name: _.trim(f["CarTypeCode"]),
              type: _.trim(f["CarSeries"])
            });
          }
        });
        this.carseries = _.orderBy(this.carseries, "name", "asc");
      });
  }
  //获取数据
  getDataList() {
    this.loading = true;
    this.formService.getForms("vw_car_salebook").then(
      data => {
        this.dataList = data.Data;
        if (this.dataList.length > 0) {
          // console.log(this.dataList[0]);
          this.keyArr = _.keys(this.dataList[0]);
          _.remove(this.keyArr, function(f) {
            return f == "IsValid" || f == "CarIncomeId";
          });
          _.each(this.keyArr, f => {
            if (f.includes("-")) {
              this.editKey[f] = true;
            }
          });

          _.each(this.dataList, f => {
            if (
              _.findIndex(this.buytype, d => {
                return d["name"] == _.trim(f["26_销售结构"]);
              }) == -1
            ) {
              this.buytype.push({ id: f["Id"], name: _.trim(f["26_销售结构"]) });
            }
            if (
              _.findIndex(this.custtype, d => {
                return d["name"] == _.trim(f["25_销售分类"]);
              }) == -1
            ) {
              this.custtype.push({ id: f["Id"], name: _.trim(f["25_销售分类"]) });
            }
            if (
              _.findIndex(this.saleman, d => {
                return d["name"] == _.trim(f["24_客户信息_销售顾问"]);
              }) == -1
            ) {
              this.saleman.push({ id: f["Id"], name: _.trim(f["24_客户信息_销售顾问"]) });
            }
          });

        }
        this.totalRecord = data.Data.length;
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    );
  }

  //高级查询
  onSearchAll(query: any) {
    if (_.isObject(query) && _.keys(query).length > 0) {
      // console.log("查询条件：" + JSON.stringify(query));
      this.loading = true;
      this.formService.getFormsByPost("vw_car_salebook", query).then(
        data => {
          this.dataList = data.Data;
          if (this.dataList.length > 0) {
            // console.log(this.dataList[0]);
            this.keyArr = _.keys(this.dataList[0]);
            _.remove(this.keyArr, function(f) {
              return f == "IsValid" || f == "CarIncomeId";
            });
            _.each(this.keyArr, f => {
              if (f.includes("-")) {
                this.editKey[f] = true;
              }
            });
          }
          this.totalRecord = data.Data.length;
          this.loading = false;
        },
        err => {
          this.loading = false;
        }
      );
    }
  }
  onEdit(key) {
    this.showKey[key] = true;
  }
  onSave(event, key, id) {
    const val = $(event.target)
      .prev()
      .val();
    const cardata = _.find(this.dataList, f => f["CarIncomeId"] == id);
    if (val && cardata) {
      const save = {
        Id: cardata["10_Id"],
        CarIncomeId: cardata["CarIncomeId"]
      };
      cardata[key] = val;
      const field = key.split("-")[1];
      save[field] = val;
      // console.log(save);
      this.formService.create("car_ledger", save).then(
        data => {
          if (_.isArray(data)) {
            _.each(this.dataList, f => {
              if (f["CarIncomeId"] == cardata["CarIncomeId"]) {
                f["10_Id"] = data[0];
              }
            });
          }
          this._state.notifyDataChanged("messagebox", {
            type: "success",
            msg: "保存成功。",
            time: new Date().getTime()
          });
        },
        err => {
          this._state.notifyDataChanged("messagebox", {
            type: "error",
            msg: err,
            time: new Date().getTime()
          });
        }
      );
    }
    delete this.showKey[key];
  }

  onTdClick(event, id) {
    this.selectedData = _.find(this.dataList, f => f["CarIncomeId"] == id);
    const tr = $(event.target)
      .parent()
      .parent();
    $("td.on").removeClass("on"); //去除其他项的高亮形式

    $(tr)
      .children("td")
      .addClass("on");
  }

  onSelectCarSeries() {
    this.cartype = _.orderBy(
      _.filter(this.cartypecode, f => {
        return f["type"] == this.search.CarSeries;
      }),
      "name",
      "asc"
    );
  }

  onQuery(){
    
    let query={
      "14_新车信息_开票日期-1":"",
      "14_新车信息_开票日期-2":"",
      "17_新车信息_车型代码":"",
      "19_新车信息_底盘号":"",
      "26_销售结构":"",
      "25_销售分类":"",
      "24_客户信息_销售顾问":""
    }
    if(this.search.InvoiceDate1){
      query["14_新车信息_开票日期-1"] = this._common.getDateString(this.search.InvoiceDate1);
    }
    if(this.search.InvoiceDate2){
      query["14_新车信息_开票日期-2"] = this._common.getDateString(this.search.InvoiceDate2);
    }
    if(this.search.CarTypeCode){
      query["17_新车信息_车型代码"] = this.search.CarTypeCode;
    }
    if(this.search.carvinno){
      query["19_新车信息_底盘号"] = this.search.carvinno;
    }
    if(this.search.buytype){
      query["26_销售结构"] = this.search.buytype;
    }
    if(this.search.custtype){
      query["25_销售分类"] = this.search.custtype;
    }
    if(this.search.saleman){
      query["24_客户信息_销售顾问"] = this.search.saleman;
    }
    // console.log(query);
    this.onSearchAll(query);
  }
  onClear() {
    this.search = {
      InvoiceDate1:"",
      InvoiceDate2:"",
      CarTypeCode:"",
      CarSeries:"",
      carvinno:"",
      buytype:"",
      custtype:"",
      saleman:""
    };
  }

}
