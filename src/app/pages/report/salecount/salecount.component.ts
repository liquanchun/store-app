import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { SalelistService } from "../salelist/salelist.services";
import { DicService } from "../../basedata/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";
import * as XLSX from "xlsx";
type AOA = any[][];

@Component({
  selector: "app-salecount",
  templateUrl: "./salecount.component.html",
  styleUrls: ["./salecount.component.scss"],
  providers: [SalelistService, DicService, OrgService]
})
export class SalecountComponent implements OnInit {
  loading = false;
  title = "综合报表";
  dataList = {};
  daystr = "";
  monstr = "";
  yearstr = "";

  selectedStore: any = {
    AuditTime: {}
  };
  constructor(
    private _salelistService: SalelistService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.selectedStore.AuditTime = this._common.getTodayObj();
    this.queryData(this.selectedStore);
    this.dataList["当日订单"] = 0;
    this.dataList["当日开票"] = 0;
    this.dataList["当日销售收入"] = 0;
    this.dataList["当日进销差"] = 0;
    this.dataList["当日水平业务毛利"] = 0;
    this.dataList["当日综合毛利"] = 0;

    this.dataList["月累计订单"] = 0;
    this.dataList["月累计开票"] = 0;
    this.dataList["月累计销售收入"] = 0;
    this.dataList["月累计进销差"] = 0;
    this.dataList["月累计水平业务毛利"] = 0;
    this.dataList["月累计综合毛利"] = 0;

    this.dataList["年累计订单"] = 0;
    this.dataList["年累计开票"] = 0;
    this.dataList["年累计销售收入"] = 0;
    this.dataList["年累计进销差"] = 0;
    this.dataList["年累计水平业务毛利"] = 0;
    this.dataList["年累计综合毛利"] = 0;
  }

  queryData(query: any) {
    this.dataList["当日订单"] = 0;
    this.dataList["当日开票"] = 0;
    this.dataList["当日销售收入"] = 0;
    this.dataList["当日进销差"] = 0;
    this.dataList["当日水平业务毛利"] = 0;
    this.dataList["当日综合毛利"] = 0;

    this.dataList["月累计订单"] = 0;
    this.dataList["月累计开票"] = 0;
    this.dataList["月累计销售收入"] = 0;
    this.dataList["月累计进销差"] = 0;
    this.dataList["月累计水平业务毛利"] = 0;
    this.dataList["月累计综合毛利"] = 0;

    this.dataList["年累计订单"] = 0;
    this.dataList["年累计开票"] = 0;
    this.dataList["年累计销售收入"] = 0;
    this.dataList["年累计进销差"] = 0;
    this.dataList["年累计水平业务毛利"] = 0;
    this.dataList["年累计综合毛利"] = 0;
    if (!this.selectedStore) {
      this._state.notifyDataChanged("messagebox", {
        type: "warning",
        msg: "查询条件不能为空。",
        time: new Date().getTime()
      });
      return;
    }
    this.loading = true;
    const qy = _.clone(query);
    qy.AuditTime = this._common.getDateString(qy.AuditTime);

    this.daystr = `${this._common.getDateObject(qy.AuditTime).year}年${
      this._common.getDateObject(qy.AuditTime).month
    }月${this._common.getDateObject(qy.AuditTime).day}日`;
    this.monstr = `${this._common.getDateObject(qy.AuditTime).year}年${
      this._common.getDateObject(qy.AuditTime).month
    }月`;
    this.yearstr = `${this._common.getDateObject(qy.AuditTime).year}年`;

    this._salelistService.getForms("vw_reportall").then(
      data => {
        console.log(data.Data);
        // 日报表
        const dayDt = _.filter(data.Data, f => {
          return f["dt"] == qy.AuditTime;
        });
        _.each(dayDt, f => {
          this.dataList[f["title"]] = f["cnt"];
        });

        // 月报表
        const monDt = _.filter(data.Data, f => {
          return (
            this._common.getDateObject(f["dt"]).year ==
              this._common.getDateObject(qy.AuditTime).year &&
            this._common.getDateObject(f["dt"]).month ==
              this._common.getDateObject(qy.AuditTime).month
          );
        });

        _.each(monDt, f => {
          let tit = _.replace(f["title"], "当日", "月累计");
          this.dataList[tit] += f["cnt"];
        });

        // 年报表
        const yearDt = _.filter(data.Data, f => {
          return (
            this._common.getDateObject(f["dt"]).year ==
            this._common.getDateObject(qy.AuditTime).year
          );
        });
        _.each(yearDt, f => {
          let tit = _.replace(f["title"], "当日", "年累计");
          this.dataList[tit] += f["cnt"];
        });
        const keysarr = _.keys(this.dataList);
        _.each(keysarr, f => {
          if (_.isNumber(this.dataList[_.toString(f)])) {
            this.dataList[_.toString(f)] = _.round(
              this.dataList[_.toString(f)],
              2
            );
          }
        });
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

  onExport() {
    const t1 = this._common.getDateString(this.selectedStore.AuditTime);

    const fileName = `综合统计表（${t1}）.xlsx`;
    const title = [this.daystr, "", "", this.monstr, "", "", this.yearstr, ""];
    const title2 = ["项目", "包含", "", "项目", "包含", "", "项目", "包含"];
    const data = [title, title2];

    data.push([
      "当日订单",
      this.dataList["当日订单"],
      "",
      "月累计订单",
      this.dataList["月累计订单"],
      "",
      "年累计订单",
      this.dataList["年累计订单"]
    ]);
    data.push([
      "当日开票",
      this.dataList["当日开票"],
      "",
      "月累计开票",
      this.dataList["月累计开票"],
      "",
      "年累计开票",
      this.dataList["年累计开票"]
    ]);
    data.push([
      "当日销售收入",
      this.dataList["当日销售收入"],
      "",
      "月累计销售收入",
      this.dataList["月累计销售收入"],
      "",
      "年累计销售收入",
      this.dataList["年累计销售收入"]
    ]);
    data.push([
      "当日进销差",
      this.dataList["当日进销差"],
      "",
      "月累计进销差",
      this.dataList["月累计进销差"],
      "",
      "年累计进销差",
      this.dataList["年累计进销差"]
    ]);
    data.push([
      "当日水平业务毛利",
      this.dataList["当日水平业务毛利"],
      "",
      "月累计水平业务毛利",
      this.dataList["月累计水平业务毛利"],
      "",
      "年累计水平业务毛利",
      this.dataList["年累计水平业务毛利"]
    ]);
    data.push([
      "当日综合毛利",
      this.dataList["当日综合毛利"],
      "",
      "月累计综合毛利",
      this.dataList["月累计综合毛利"],
      "",
      "年累计综合毛利",
      this.dataList["年累计综合毛利"]
    ]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    /* save to file */
    XLSX.writeFile(wb, fileName);
  }
}
