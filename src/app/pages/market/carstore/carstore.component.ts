import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import { LocalDataSource } from "ng2-smart-table";
import { FieldConfig } from "../../../theme/components/dynamic-form/models/field-config.interface";
import { NgbdModalContent } from "../../../modal-content.component";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { FormService } from "../form/form.services";
import { DicService } from "../../basedata/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { EditFormComponent } from "../editform/editform.component";
import { Common } from "../../../providers/common";
import { InvoiceComponent } from "./invoice.component";
import { HttpService } from "../../../providers/httpClient";
import { Config } from "../../../providers/config";
import * as $ from "jquery";
import * as _ from "lodash";
import * as XLSX from "xlsx";
type AOA = any[][];

@Component({
  selector: "app-carstore",
  templateUrl: "./carstore.component.html",
  styleUrls: ["./carstore.component.scss"],
  providers: [FormService, DicService]
})
export class CarstoreComponent implements OnInit {
  loading = false;
  title = "表单定义";
  query: string = "";
  newSettings = {};
  selectedid = 0;
  settings = {
    pager: {
      display: true,
      perPage: 20
    },
    mode: "external",
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {}
  };

  configInvoice: FieldConfig[] = [
    {
      type: "datepicker",
      label: "日期",
      name: "ReceiveInvoice"
    },
    {
      type: "input",
      label: "发票号",
      name: "InvoiceNo"
    }
  ];

  search = {
    CarSeries: "",
    CarTypeCode: "",
    CarType: "",
    CarTrim: "",
    CarColor: "",
    Status: "",
    SaleStatus: "未售",
    MarkTag: "",
    GuidePrice: "",
    OrderId: "",
    Vinno: "",
    CustName: ""
  };
  cartype: any = [];
  cartypeall: any = [];
  carseries: any = [];
  carcolor: any = [];
  cartrim: any = [];

  configUpdate: FieldConfig[] = [];
  configAdd: FieldConfig[] = [];

  //表格视图定义
  tableView: {};
  //表单修改时数据
  updateData: {};
  source: LocalDataSource = new LocalDataSource();

  formname: string;
  canAdd: boolean;
  canUpdate: boolean;
  canexport = true;
  //子表视图
  subViewName: any = [];
  //查询视图
  searchview: any;
  //子表查询条件
  mainTableID: number = 0;

  datalist: any;
  totalRecord: number = 0;
  remind1: number = 0;
  remind2: number = 0;

  titles: any = [];
  feilds: any = [];

  exportData: any;

  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _state: GlobalState,
    private _common: Common,
    private _httpClient: HttpService,
    private _config: Config
  ) {}
  ngOnInit() {
    this.formname = "carincome";
    this.canUpdate = false;
    this.start();
    this.mainTableID = 0;
    const that = this;

    const ser = sessionStorage.getItem("carstore_search");
    if (ser) {
      _.mapKeys(JSON.parse(ser), function(value, key) {
        that.search[key] = value;
      });
    }
    this._state.unsubscribe("print.carsalecash.invoice");
    this._state.unsubscribe("print.carsalecash.future");
    this._state.subscribe("print.carsalecash.invoice", data => {
      this.invoiceDate(data);
    });

    this._state.subscribe("print.carsalecash.future", data => {
      const formValue = {
        Id: data.id,
        Status: "现车",
        InDate: this._common.getTodayString()
      };
      if (data.text == "期货入库") {
        formValue["FuturesDate"] = this._common.getTodayString();
      }
      if (data.text == "配额入库") {
        formValue["QuotaDate"] = this._common.getTodayString();
      }

      that.formService.create("car_income", formValue).then(
        data => {
          // that.getDataList();
        },
        err => {}
      );
    });
  }
  ngOnDestory() {
    this._state.unsubscribe("print.carsalecash.invoice");
    this._state.unsubscribe("print.carsalecash.future");
  }
  start() {
    this.settings.columns = {
      button: {
        title: "操作",
        type: "custom",
        renderComponent: InvoiceComponent,
        onComponentInitFunction(instance) {
          instance.save.subscribe(row => {
            alert(`${row.orderNo} saved!`);
          });
        }
      }
    };
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function() {
        that.getFormRoles();
      });
    }
  }
  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms("form_set").then(
        data => {
          if (data.Data) {
            that.tableView = _.find(data.Data, function(o) {
              return o["ViewType"] == "table" && o["FormName"] == formname;
            });
            that.searchview = _.find(data.Data, function(o) {
              return o["ViewType"] == "search" && o["FormName"] == formname;
            });
            if (that.tableView) {
              that.title = that.tableView["Title"];
              that.canAdd = that.tableView["CanAdd"] == 1;
              if (
                !that.tableView["CanUpdate"] &&
                !that.tableView["CanDelete"]
              ) {
                that.settings["actions"] = false;
              } else {
                that.settings["actions"] = {
                  columnTitle: "操作"
                };
                if (!that.tableView["CanUpdate"]) {
                  that.settings["actions"]["edit"] = false;
                }
                if (!that.tableView["CanDelete"]) {
                  that.settings["actions"]["delete"] = false;
                }
              }

              if (
                that.tableView["ExportRoles"] &&
                sessionStorage.getItem("userId") != "admin"
              ) {
                that.canexport = sessionStorage
                  .getItem("roleIds")
                  .includes(that.tableView["ExportRoles"]);
              }
              that.getFormSetSub().then(function(data) {
                let vn = [];
                _.each(data, f => {
                  if (f["FormName"] == that.tableView["ViewName"]) {
                    vn.push(f);
                  }
                });
                that.subViewName = vn;
              });
            }
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

  //获取表单字段权限控制
  getFormRoles() {
    this.formService
      .getForms("vw_form_role/ViewName/" + this.tableView["ViewName"])
      .then(data => {
        if (data.Data) {
          this.getTableField(data.Data);
        }
      });
  }
  //检查用户角色是否拥有字段权限
  checkRole(roleData: any, fieldName: string) {
    const roleIds = sessionStorage.getItem("roleIds");
    const roleField = _.find(roleData, f => {
      return f["FieldName"] == fieldName;
    });
    //如果没有设置，或者设置了可读
    return (
      !roleField["RoleIds"] ||
      (roleField &&
        roleField["RoleIds"] &&
        roleField["CanRead"] &&
        roleField["CanRead"] == 1 &&
        roleField["RoleIds"].includes(roleIds))
    );
  }
  getTableField(roleData: any): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.tableView["ViewName"]).then(
      data => {
        if (data.Data) {
          const viewList = _.orderBy(data.Data, "OrderInd", "asc");
          _.each(viewList, d => {
            if (this.checkRole(roleData, d["FieldName"])) {
              this.settings.columns[d["FieldName"]] = {
                title: d["Title"],
                type: d["DataType"],
                filter: false
              };
              this.titles.push(d["Title"]);
              this.feilds.push(d["FieldName"]);
            }
          });

          this.newSettings = Object.assign({}, this.settings);
          this.getDataList();
        }
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

  //获取数据
  getFormSetSub() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms("form_set_sub").then(
        data => {
          if (data.Data) {
            resolve(data.Data);
          }
        },
        err => {}
      );
    });
  }
  //获取数据
  getDataList() {
    this.exportData = null;
    this.loading = true;
    this.formService.getForms(this.tableView["ViewName"]).then(
      data => {
        this.datalist = _.orderBy(data.Data, "UpdateTime", "desc");

        _.each(this.datalist, f => {
          f["button"] = f;
        });

        this.source.load(this.datalist);
        this.totalRecord = this.datalist.length;

        _.each(this.datalist, f => {
          if (
            _.findIndex(this.carseries, d => {
              return d["name"] == _.trim(f["CarSeries"]);
            }) == -1 &&
            f["CarSeries"]
          ) {
            this.carseries.push({ id: f["Id"], name: _.trim(f["CarSeries"]) });
          }
          if (
            _.findIndex(this.cartypeall, d => {
              return d["name"] == _.trim(f["CarType"]);
            }) == -1 &&
            f["CarType"]
          ) {
            this.cartypeall.push({
              id: f["Id"],
              name: _.trim(f["CarType"]),
              type: _.trim(f["CarSeries"])
            });
          }
          if (
            _.findIndex(this.cartrim, d => {
              return d["name"] == _.trim(f["CarTrim"]);
            }) == -1 &&
            f["CarTrim"]
          ) {
            this.cartrim.push({ id: f["Id"], name: _.trim(f["CarTrim"]) });
          }
          if (
            _.findIndex(this.carcolor, d => {
              return d["name"] == _.trim(f["CarColor"]);
            }) == -1 &&
            f["CarColor"]
          ) {
            this.carcolor.push({ id: f["Id"], name: _.trim(f["CarColor"]) });
          }
        });
        this.carseries = _.orderBy(this.carseries, "name", "asc");
        this.carcolor = _.orderBy(this.carcolor, "name", "asc");
        this.cartrim = _.orderBy(this.cartrim, "name", "asc");

        this.remind1 = _.size(
          _.filter(this.datalist, f => {
            return f["RemindId"] > 0;
          })
        );
        this.remind2 = _.size(
          _.filter(this.datalist, f => {
            return (
              f["StoreDays"] > 0 &&
              f["StoreRemind"] > 0 &&
              _.toNumber(f["StoreDays"]) > _.toNumber(f["StoreRemind"])
            );
          })
        );
        //this.source.setPaging(2,10);
        //this.source.setPage(5);
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    );
  }
  //获取数据
  remindData1() {
    const data = _.filter(this.datalist, f => {
      return f["RemindId"] > 0;
    });
    this.exportData = data;
    this.source.load(data);
    this.totalRecord = data.length;
  }
  //获取数据
  remindData2() {
    //库龄大于库存提醒（天）
    const data = _.filter(this.datalist, f => {
      return (
        f["SaleStatus"] != "已开票" &&
        f["StoreDays"] > 0 &&
        f["StoreRemind"] > 0 &&
        _.toNumber(f["StoreDays"]) > _.toNumber(f["StoreRemind"])
      );
    });
    this.exportData = data;
    this.source.load(data);
    this.totalRecord = data.length;
  }
  //设置过滤字段
  onSearch(query: string = "") {
    if (this.tableView && this.tableView["SearchField"]) {
      let filterArr = [];
      _.each(_.split(this.tableView["SearchField"], ","), d => {
        filterArr.push({ field: d, search: query });
      });
      this.source.setFilter(filterArr, false);
      this.totalRecord = this.source.count();
    }
  }
  //高级查询
  onSearchAll(query: any) {
    if (_.isObject(query) && _.keys(query).length > 0) {
      this.loading = true;
      console.log("查询条件：" + JSON.stringify(query));
      this.formService.getFormsByPost(this.tableView["ViewName"], query).then(
        data => {
          this.datalist = data.Data;
          this.source.load(data.Data);
          this.totalRecord = data.Data.length;
          this.loading = false;
        },
        err => {
          this.loading = false;
        }
      );
    }
  }
  onCreate(): void {
    this.checkRoles("EditRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权新增车辆信息。",
          time: new Date().getTime()
        });
      } else {
        this.router.navigate(["/pages/market/carstorenew", 0]);
      }
    });
  }

  onEdit(event) {
    this.checkRoles("EditRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权修改增车辆信息。",
          time: new Date().getTime()
        });
      } else {
        const id = event.data.Id;
        this.router.navigate(["/pages/market/carstorenew", id]);
      }
    });
  }

  onDelete(event) {
    if (window.confirm("你确定要删除吗?")) {
      this.checkRoles("EditRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权删除车辆信息。",
            time: new Date().getTime()
          });
        } else {
          this.formService.delete("car_income", event.data.Id).then(
            data => {
              this._state.notifyDataChanged("messagebox", {
                type: "success",
                msg: "删除成功。",
                time: new Date().getTime()
              });
              this.getDataList();
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
      });
    }
  }

  onSelected(event) {
    this.mainTableID = event.data.Id;
  }

  checkRoles(power) {
    const that = this;
    return new Promise((resolve, reject) => {
      const roleIds = sessionStorage.getItem("roleIds");
      const roleName = that.tableView[power];
      if (roleName) {
        that.formService.getForms("sys_role").then(
          data => {
            const roles = data.Data;
            const rl = _.find(roles, f => {
              return f["RoleName"] == roleName;
            });
            if (rl && roleIds.includes(rl["Id"])) {
              resolve(1);
            } else {
              resolve(0);
            }
          },
          err => {}
        );
      } else {
        resolve(1);
      }
    });
  }

  invoiceDate(record) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = "收到发票";
    modalRef.componentInstance.config = this.configInvoice;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formValue = JSON.parse(result);
      let dt = _.find(this.datalist, f => {
        return f["Id"] == this.mainTableID;
      });
      _.each(this.configInvoice, f => {
        if (f.type === "datepicker" && formValue[f.name]) {
          formValue[f.name] = this._common.getDateString(formValue[f.name]);
        }
      });

      if (dt && dt["InDate"] && formValue["ReceiveInvoice"]) {
        var oDate1 = new Date(dt["InDate"]);
        var oDate2 = new Date(formValue["ReceiveInvoice"]);
        if (oDate1.getTime() > oDate2.getTime()) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "发票日期不能小于入库日期",
            time: new Date().getTime()
          });
          return;
        }
      }

      formValue["Id"] = this.mainTableID;
      //closeBack();
      that.formService.create("car_income", formValue).then(
        data => {
          closeBack();
          that.getDataList();
        },
        err => {}
      );
    };
  }

  onSelectCarSeries() {
    this.cartype = _.orderBy(
      _.filter(this.cartypeall, f => {
        return f["type"] == this.search.CarSeries;
      }),
      "name",
      "asc"
    );
  }

  onImport() {}
  onExport() {
    const fileName = `车辆库存明细——${this._common.getTodayString2()}.xlsx`;
    const dl = this.exportData ? this.exportData : this.datalist;
    const data = [this.titles];
    _.each(dl, d => {
      const vals = [];
      _.each(this.feilds, f => {
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

  onQuery() {
    this.exportData = null;
    let qry = _.omitBy(this.search, _.isEmpty);
    sessionStorage.setItem("carstore_search", JSON.stringify(qry));
    this.onSearchAll(qry);
  }
  onClear() {
    this.search = {
      CarSeries: "",
      CarTypeCode: "",
      CarTrim: "",
      CarColor: "",
      Status: "",
      SaleStatus: "",
      MarkTag: "",
      GuidePrice: "",
      OrderId: "",
      Vinno: "",
      CarType: "",
      CustName: ""
    };
  }
}
