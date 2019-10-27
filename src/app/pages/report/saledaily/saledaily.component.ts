import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { SalelistService } from "../salelist/salelist.services";
import { DicService } from "../../basedata/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";
import * as $ from 'jquery';
import * as XLSX from "xlsx";
type AOA = any[][];

@Component({
  selector: "app-saledaily",
  templateUrl: "./saledaily.component.html",
  styleUrls: ["./saledaily.component.scss"],
  providers: [SalelistService, DicService, OrgService]
})
export class SaledailyComponent implements OnInit {
  loading = false;
  title = "经销店销售日报";
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
    qy.AuditTime = this._common.getDateString(qy.AuditTime);

    console.log(qy);
    this._salelistService.getFormsBySP("sp_reportdaily",qy).then(
      data => {
        const dataSource = data.Data[0][0];
        console.log(dataSource);
        _.each(dataSource,f=>{
            const itemname = f['itemname'];
            const itemvalue = f['itemvalue'];
            $('.' + itemname).text(itemvalue);
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
    
  }
}
