import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { PartslistService } from "./partslist.services";
import { DicService } from "../../basedata/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";
import * as XLSX from "xlsx";
type AOA = any[][];

@Component({
  selector: "app-partslist",
  templateUrl: "./partslist.component.html",
  styleUrls: ["./partslist.component.scss"],
  providers: [PartslistService, DicService, OrgService]
})
export class PartslistComponent implements OnInit {
  loading = false;
  title = "装饰单明细表";
  query: string = "";

  newSettings = {};
  settings = {
    pager: {
      perPage: 15
    },
    actions: false,
    hideSubHeader: true,
    columns: {}
  };
  titles: any = [];
  dataList: any;
  source: LocalDataSource = new LocalDataSource();
  selectedStore: any = {
    Date_1: {},
    Date_2: {}
  };
  stores: any;
  constructor(
    private _partslistService: PartslistService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.selectedStore.Date_1 = this._common.getTodayObj();
    this.selectedStore.Date_2 = this._common.getToday1Obj();
    this.queryData(this.selectedStore);
  }

  queryData(query: any) {
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
    qy.Date_1 = this._common.getDateString(qy.Date_1);
    qy.Date_2 = this._common.getDateString(qy.Date_2);

    this._partslistService.getFormsByPost("vw_partsdetail", qy).then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          const keys = _.keys(data.Data[0]);
          _.each(keys, f => {
            if (f != "Date") {
              this.titles.push(f);
              this.settings.columns[f] = {
                title: f,
                type: "string",
                filter: false
              };
            }
          });
          this.newSettings = Object.assign({}, this.settings);
          this.dataList = data.Data;
          this.source.load(data.Data);
        }
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
    if (this.dataList && _.size(this.dataList) > 0) {
      const t1 = this._common.getDateString(this.selectedStore.Date_1);
      const t2 = this._common.getDateString(this.selectedStore.Date_2);

      const fileName = `装饰单明细（${t1}至${t2}）.xlsx`;
      const data = [this.titles];
      _.each(this.dataList, d => {
        const vals = [];
        _.each(_.keys(this.dataList[0]), f => {
          vals.push(d[f]);
        });
        data.push(vals);
      });

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      /* save to file */
      XLSX.writeFile(wb, fileName);
    }
  }
}
