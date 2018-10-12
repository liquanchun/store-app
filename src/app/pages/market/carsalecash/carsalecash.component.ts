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
import { DicService } from "../../sys/dic/dic.services";
import { GlobalState } from "../../../global.state";
import { PrintCashComponent } from "./printcash.component";
import { Common } from "../../../providers/common";

import * as $ from "jquery";
import * as _ from "lodash";
import async from "async";
@Component({
  selector: "app-carsalecash",
  templateUrl: "./carsalecash.component.html",
  styleUrls: ["./carsalecash.component.scss"],
  providers: [FormService, DicService]
})
export class CarSaleCashComponent implements OnInit {
  loading = false;
  title = "销售交款明细";
  query: string = "";
  newSettings = {};
  settings = {
    pager: {
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
    columns: {
      button: {
        title: "操作",
        type: "custom",
        renderComponent: PrintCashComponent,
        onComponentInitFunction(instance) {
          instance.save.subscribe(row => {
            alert(`${row.orderNo} saved!`);
          });
        }
      }
    }
  };

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
  //子表视图
  subViewName: any = [];
  //查询视图
  searchview: any;
  //子表查询条件
  mainTableID: number = 0;
  totalRecord: number = 0;

  carsaleData: any;
  carbooking: any;
  carsale: any = {
    Id: 0,
    OrderId: "",
    InvoiceDate: "",
    BuyType: "",
    BuyLicense: "",
    CustAttr: "",
    PayType: "",
    InsureCompany: "",
    Discount: 0,
    NewCarFee: 0,
    FirstFee: 0,
    InsureFee: 0,
    BuyTaxFee: 0,
    FinanceSerFee: 0,
    DecorateFee: 0,
    TakeAllFee: 0,
    TakeCareFee: 0,
    IntimateFee: 0,
    GlassSerFee: 0,
    CardCashFee: 0,
    OtherFee: 0,
    ShouldAllFee: 0,
    InvoiceFee: 0,
    Deposit: 0,
    OldChangeFee: 0,
    LastFee: 0,
    OtherFee2: 0,
    RealAllFee: 0,
    Remark: "",
    Creator: "",
    BaoxianFee: 0,
    ZhuangxFee: 0,
    Commission: 0,
    MaintainFee: 0,
    GasFee: 0,
    OtherFee3: 0
  };
  customer: any = {
    Name: "",
    LinkMan: "",
    IdCard: "",
    Address: "",
    Phone: "",
    InvoiceCode: "",
    InvoiceName: ""
  };
  carinfo: any = {
    CarType: "",
    Vinno: "",
    Status: "",
    CarColor: "",
    CarTrim: "",
    GuidePrice: 0,
    WholePrice: 0
  };
  chineseMoney: string;
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.formname = "carsalecash";
    this.canUpdate = false;
    this.start();
    this.mainTableID = 0;
    const that = this;

    this._state.subscribe("print.carsalecash.detail", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      this.router.navigate(
        ["/pages/market/carsalecashnew", this.carsale.BookingId],
        {
          queryParams: { n: 1, id: data.id }
        }
      );
    });

    this._state.subscribe("print.carsalecash", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      console.log(this.carsale);
      if (this.carsale) {
        if (this.carsale.RealAllFee) {
          this.chineseMoney = this._common.changeNumMoneyToChinese(
            this.carsale.RealAllFee
          );
        }
        this.getCarsale(this.carsale.BookingId);
        _.delay(
          function(that) {
            that.print();
          },
          500,
          this
        );
      }
    });
  }

  getCarsale(bookid: number) {
    const that = this;
    async.series(
      {
        one: function(callback) {
          that.formService.getForms(`car_booking/${bookid}`).then(
            data => {
              if (data && data.Data) {
                that.carbooking = data.Data[0];
              }
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService
            .getForms(`vw_car_income/${that.carbooking.CarIncomeId}`)
            .then(
              data => {
                that.carinfo = data.Data[0];
                callback(null, 2);
              },
              err => {}
            );
        },
        three: function(callback) {
          that.formService
            .getForms(`car_customer/${that.carbooking.CustomerId}`)
            .then(
              data => {
                that.customer = data.Data[0];
                callback(null, 3);
              },
              err => {}
            );
        }
      },
      function(err, results) {
        console.log(results);
      }
    );
  }

  start() {
    //this.settings.columns = {};
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
  getDataList() {
    this.loading = true;
    this.formService.getForms(this.tableView["ViewName"]).then(
      data => {
        this.carsaleData = data.Data;
        _.each(this.carsaleData, f => {
          f["button"] = f["Id"];
        });

        this.source.load(this.carsaleData);
        this.totalRecord = data.Data.length;
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    );
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
      console.log("查询条件：" + JSON.stringify(query));
      this.loading = true;
      this.formService.getFormsByPost(this.tableView["ViewName"], query).then(
        data => {
          this.carsaleData = data.Data;
          _.each(this.carsaleData, f => {
            f["button"] = f["Id"];
          });
  
          this.source.load(this.carsaleData);
          this.totalRecord = data.Data.length;
          this.loading = false;
        },
        err => {
          this.loading = false;
        }
      );
    }
  }

  onEdit(event) {
    const id = event.data.Id;
    this.router.navigate(
      ["/pages/market/carsalecashnew", event.data.BookingId],
      {
        queryParams: { n: this.carsale.OrderId, id: event.data.Id }
      }
    );
  }

  onDelete(event) {
    if (window.confirm("你确定要删除吗?")) {
      this.formService.delete(this.tableView["ViewName"], event.data.Id).then(
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
  }

  onSelected(event) {
    this.mainTableID = event.data.Id;

    this.carsale = _.find(this.carsaleData, f => {
      return f["Id"] == this.mainTableID;
    });
    console.log(this.carsale);
    if (this.carsale) {
      if (this.carsale.RealAllFee) {
        this.chineseMoney = this._common.changeNumMoneyToChinese(
          this.carsale.RealAllFee
        );
      }
      this.getCarsale(this.carsale.BookingId);
    }
  }

  print() {
    let printContents, popupWin;
    printContents = document.getElementById("printDiv").innerHTML;
    popupWin = window.open(
      "",
      "_blank",
      "top=0,left=0,height=1098px,width=1080px"
    );
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title style="font-size: 12px;"></title>
          <style>
          table{
            width: 740px;
            border-collapse: collapse;
            font-size: 14px;
            border:1px solid black;
          }
          p{
            font-size: 14px;
          }
          th,td{
            border:1px solid black;
            padding:3px;
          }
          .valueText{
            text-align:center;
          }
          .noboder td{
            border-left:none;
            border-right:none;
          }
          .noboderall td{
            border:none;
          }
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
}
