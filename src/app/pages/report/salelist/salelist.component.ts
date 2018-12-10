import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { SalelistService } from "./salelist.services";
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";
import * as XLSX from "xlsx";
type AOA = any[][];

@Component({
  selector: "app-salelist",
  templateUrl: "./salelist.component.html",
  styleUrls: ["./salelist.component.scss"],
  providers: [SalelistService, DicService, OrgService]
})
export class SalelistComponent implements OnInit {
  loading = false;
  title = "销售明细表";
  query: string = "";

  newSettings = {};
  settings = {
    pager: {
      perPage: 15
    },
    actions: false,
    hideSubHeader: true,
    columns: {
      CarSeries: {
        title: "车系",
        type: "string",
        filter: false
      }
    }
  };
  dataList: any;
  source: LocalDataSource = new LocalDataSource();
  selectedStore: any = {
    AuditTime_1: {},
    AuditTime_2: {}
  };
  stores: any;
  constructor(
    private _salelistService: SalelistService,
    private _dicService: DicService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.selectedStore.AuditTime_1 = this._common.getTodayObj();
    this.selectedStore.AuditTime_2 = this._common.getToday1Obj();
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
    qy.AuditTime_1 = this._common.getDateString(qy.AuditTime_1);
    qy.AuditTime_2 = this._common.getDateString(qy.AuditTime_2);

    this._salelistService.getFormsByPost("vw_saledetail", qy).then(
      data => {
        this.loading = false;
        const saleman = _.uniq(_.map(data.Data, "SaleMan"));
        const carseries = _.uniq(_.map(data.Data, "CarSeries"));
        console.log(saleman);
        _.each(saleman, f => {
          this.settings.columns[_.toString(f)] = {
            title: f,
            type: "string",
            filter: false
          };
        });
        if (_.size(data.Data) > 0) {
          this.settings.columns["小计"] = {
            title: "小计",
            type: "string",
            filter: false
          };
        }

        let dataall = [];
        _.each(carseries, f => {
          let dataobj = { CarSeries: _.toString(f) };

          _.each(saleman, s => {
            dataobj[_.toString(s)] = _.sum(
              _.map(
                _.filter(data.Data, r => {
                  return (
                    r["CarSeries"] == _.toString(f) &&
                    r["SaleMan"] == _.toString(s)
                  );
                }),
                "cnt"
              )
            );
          });

          dataobj["小计"] = _.sum(
            _.map(
              _.filter(data.Data, r => {
                return r["CarSeries"] == _.toString(f);
              }),
              "cnt"
            )
          );

          dataall.push(dataobj);
        });

        let rowheji = { CarSeries: "合计" };
        _.each(saleman, s => {
          rowheji[_.toString(s)] = _.sum(_.map(dataall, _.toString(s)));
        });

        rowheji["小计"] = _.sumBy(dataall, "小计");
        dataall.push(rowheji);
        this.dataList = dataall;
        this.newSettings = Object.assign({}, this.settings);
        this.source.load(dataall);
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
    this._dicService.getDicByName("仓库", data => {
      this.stores = data;
    });
  }

  onExport() {
    if (this.dataList && _.size(this.dataList) > 0) {
      const t1 = this._common.getDateString(this.selectedStore.AuditTime_1);
      const t2 = this._common.getDateString(this.selectedStore.AuditTime_2);
      
      const fileName = `销售明细单（${t1}至${t2}）.xlsx`;
      const title =_.union(['车系'],_.drop(_.keys(this.dataList[0])));
      const data = [title];
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
