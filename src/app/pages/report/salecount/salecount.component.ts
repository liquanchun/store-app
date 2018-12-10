import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { OrgService } from "../../sys/components/org/org.services";
import { LocalDataSource } from "ng2-smart-table";
import { SalelistService } from "../salelist/salelist.services";
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";
import * as _ from "lodash";

@Component({
  selector: "app-salecount",
  templateUrl: "./salecount.component.html",
  styleUrls: ["./salecount.component.scss"],
  providers: [SalelistService, DicService, OrgService]
})
export class SalecountComponent implements OnInit {
  loading = false;
  title = "销售统计表";
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
        title: "车型",
        type: "string",
        filter: false
      }
    }
  };

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

    this._salelistService.getFormsByPost("vw_salecount", qy).then(
      data => {
        this.loading = false;
        

        this.newSettings = Object.assign({}, this.settings);
        this.source.load(data.Data);
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
}