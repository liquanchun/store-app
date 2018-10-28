import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { FormService } from "../form/form.services";
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";

import * as $ from "jquery";
import * as _ from "lodash";

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
  constructor(private formService: FormService, private _state: GlobalState) {}
  ngOnInit() {
    this.getViewName("carsalebook").then(data => {
      this.getDataList();
    });
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

  //获取数据
  getDataList() {
    this.loading = true;
    this.formService.getForms("vw_car_salebook").then(
      data => {
        this.dataList = data.Data;
        if (this.dataList.length > 0) {
          console.log(this.dataList[0]);
          this.keyArr = _.keys(this.dataList[0]);
          _.remove(this.keyArr, function(f) {
            return f == "IsValid" || f == "CarIncomeId";
          })
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

  //高级查询
  onSearchAll(query: any) {
    if (_.isObject(query) && _.keys(query).length > 0) {
      console.log("查询条件：" + JSON.stringify(query));
      this.loading = true;
      this.formService.getFormsByPost("vw_car_salebook", query).then(
        data => {
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
    const data = _.find(this.dataList, f => f["CarIncomeId"] == id);
    if (val && data) {
      const save = {
        Id: data["10-Id"],
        CarIncomeId: data["CarIncomeId"]
      };
      data[key] = val;
      const field = key.split("-")[1];
      save[field] = val;
      console.log(save);
      this.formService.create("car_ledger", save).then(
        data => {
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
}
