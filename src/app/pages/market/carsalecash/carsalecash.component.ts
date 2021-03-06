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
import { PrintCashComponent } from "./printcash.component";
import { Common } from "../../../providers/common";
import { HttpService } from "../../../providers/httpClient";
import { Config } from "../../../providers/config";

import * as $ from "jquery";
import * as _ from "lodash";
import * as XLSX from "xlsx";
import async from "async";
import { reject } from "q";
type AOA = any[][];

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

  configInvoice: FieldConfig[] = [
    {
      type: "datepicker",
      label: "日期",
      name: "ReceiveInvoice"
    }
  ];

  config: FieldConfig[] = [
    {
      type: "check",
      label: "审核",
      name: "AuditResult",
      check: "radio",
      options: [{ id: "通过", text: "通过" }, { id: "不通过", text: "不通过" }]
    },
    {
      type: "input",
      label: "审核意见",
      name: "AuditSuggest"
    }
  ];

  titles: any = [];
  feilds: any = [];
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
  carbooking: any = {
    PayType: "",
    PreCarDate: "",
    Days1: 0,
    Days2: 0,
    Days3: 0,
    Stages: 0,
    CarIncomeId: 0,
    CustomerId: 0
  };
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
    OtherFee3: 0,
    SaleMan: ""
  };
  customer: any = {
    Name: "",
    LinkMan: "",
    IdCard: "",
    Address: "",
    Phone: "",
    InvoiceCode: "",
    InvoiceName: "",
    PostNumber: ""
  };
  carinfo: any = {
    CarType: "",
    Vinno: "",
    Status: "",
    CarColor: "",
    CarTrim: "",
    GuidePrice: 0,
    WholePrice: 0,
    OrderId: ""
  };
  printSet: any = [
    "第一联 财务",
    "第二联 销售顾问",
    "第三联 销售计划",
    "第四联 留档"
  ];
  printPartSet: any = [
    "第一联 财务收款",
    "第二联 精品部安装使用",
    "第三联 销售存档"
  ];

  chineseMoney: string;
  partItemDN: any = [];
  partItemDY: any = [];
  partAmountDN: number = 0;
  partAmountDY: number = 0;

  //签订合同当天
  todayObj = {};
  todayStr = "";
  //现车付款日期
  haveCarDate = {};
  //预计交车日期
  prepaycardate = {};
  //首付款日期
  firstDate = {};
  //贷款缴清最后日期
  lastDate = {};
  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _common: Common,
    private _state: GlobalState,
    private _httpClient: HttpService,
    private _config: Config
  ) {}
  ngOnDestroy() {
    this._state.unsubscribe("print.carsalecash.detail");
    this._state.unsubscribe("print.carsalecash.audit");
    this._state.unsubscribe("print.carsalecash.auditnot");
    this._state.unsubscribe("print.carsalecash");
  }
  ngOnInit() {
    this.formname = "carsalecash";
    this.canUpdate = false;
    this.start();
    this.mainTableID = 0;
    const that = this;
    this.todayObj = this._common.getTodayObj();
    this.todayStr = this._common.getTodayTime();

    this._state.unsubscribe("print.carsalecash.detail");
    this._state.unsubscribe("print.carsalecash.audit");
    this._state.unsubscribe("print.carsalecash.auditnot");
    this._state.unsubscribe("print.carsalecash");
    
    this._state.subscribe("print.carsalecash.detail", data => {
      this.checkRoles("AuditRoles").then(d => {
        if (d == 1) {
          this.carsale = _.find(this.carsaleData, f => {
            return f["Id"] == data.id;
          });
          this.router.navigate(
            ["/pages/market/carsalecashnew", this.carsale.BookingId],
            {
              queryParams: { n: 1, id: data.id }
            }
          );
        } else {
          this.checkRoles("ReadRoles").then(d => {
            if (d == 0) {
              this._state.notifyDataChanged("messagebox", {
                type: "warning",
                msg: "你无权查看销售结单。",
                time: new Date().getTime()
              });
            } else {
              this.carsale = _.find(this.carsaleData, f => {
                return f["Id"] == data.id;
              });
              this.router.navigate(
                ["/pages/market/carsalecashnew", this.carsale.BookingId],
                {
                  queryParams: { n: 1, id: data.id }
                }
              );
            }
          });
        }
      });
    });

    this._state.subscribe("print.carsalecash.audit", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      this.checkRoles("AuditRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权审核。",
            time: new Date().getTime()
          });
        } else {
          this.onAudit();
        }
      });
    });

    this._state.subscribe("print.carsalecash.auditnot", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      this.checkRoles("AuditRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权反审核。",
            time: new Date().getTime()
          });
        } else {
          this.onAuditNot();
        }
      });
    });

    this._state.subscribe("print.carsalecash", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });

      this.checkRoles("ReadRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权打印。",
            time: new Date().getTime()
          });
        } else {
          if (this.carsale) {
            if (this.carsale.RealAllFee) {
              this.chineseMoney = this._common.changeNumMoneyToChinese(
                this.carsale.RealAllFee
              );
            }
            this.loading = true;
            this.getCarsale(this.carsale.BookingId, this.print);
            // _.delay(
            //   function(that) {
            //     that.print();
            //   },
            //   800,
            //   this
            // );
          }
        }
      });
    });

    this._state.subscribe("print.carsalecash2", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      this.checkRoles("ReadRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权打印。",
            time: new Date().getTime()
          });
        } else {
          if (this.carsale) {
            this.loading = true;
            this.getPartItem().then(d => {
              this.loading = false;
              if (data.dn == "DN") {
                if (this.partItemDN.length == 0) {
                  this._state.notifyDataChanged("messagebox", {
                    type: "warning",
                    msg: "该单无店内精品配件。",
                    time: new Date().getTime()
                  });
                } else {
                  that.print2("printDivPartDN");
                }
              }

              if (data.dn == "HZ") {
                if (this.partItemDY.length == 0) {
                  this._state.notifyDataChanged("messagebox", {
                    type: "warning",
                    msg: "该单无合作店精品配件。",
                    time: new Date().getTime()
                  });
                } else {
                  that.print2("printDivPartHZ");
                }
              }
            });
          }
        }
      });
    });

    this._state.subscribe("print.carsalecash3", data => {
      this.carsale = _.find(this.carsaleData, f => {
        return f["Id"] == data.id;
      });
      this.checkRoles("ReadRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权打印。",
            time: new Date().getTime()
          });
        } else {
          if (this.carsale) {
            this.loading = true;
            this.getPartItem().then(d => {
              this.loading = false;
              that.print3();
            });
          }
        }
      });
    });
  }

  invoiceDate(id) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = "收到发票";
    modalRef.componentInstance.config = this.configInvoice;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formValue = JSON.parse(result);
      _.each(this.configInvoice, f => {
        if (f.type === "datepicker" && formValue[f.name]) {
          formValue[f.name] = this._common.getDateString(formValue[f.name]);
        }
      });
      formValue["Id"] = id;
      console.log(formValue);

      that.formService.create("car_sale_cash", formValue).then(
        data => {
          closeBack();
          that.getDataList();
        },
        err => {}
      );
    };
  }
  getPartItem() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService
        .getForms(`car_booking_item/OrderId/${that.carsale.OrderId}`)
        .then(
          data => {
            if (data && data.Data) {
              that.partItemDN = _.orderBy(
                _.filter(data.Data, f => {
                  return (
                    f["IsValid"] == 1 &&
                    f["Service"] == "DN" &&
                    (f["ItemType"] == "自费" || f["ItemType"] == "免费")
                  );
                }),
                "ItemType",
                "desc"
              );

              that.partAmountDN = _.sumBy(that.partItemDN, f => {
                return f["Count"] * f["Price"];
              });
              that.partItemDY = _.orderBy(
                _.filter(data.Data, f => {
                  return (
                    f["IsValid"] == 1 &&
                    f["Service"] == "HZ" &&
                    (f["ItemType"] == "自费" || f["ItemType"] == "免费")
                  );
                }),
                "ItemType",
                "desc"
              );
              that.partAmountDY = _.sumBy(that.partItemDY, f => {
                return f["Count"] * f["Price"];
              });
            }
            resolve();
          },
          err => {}
        );
    });
  }
  getCarsale(bookid: number, print: any) {
    const that = this;
    async.series(
      {
        one: function(callback) {
          that.formService.getForms(`car_booking/${bookid}`).then(
            data => {
              if (data && data.Data) {
                that.carbooking = data.Data[0];
                that.prepaycardate = that._common.getDateObject(
                  that.carbooking.PreCarDate
                );
                if (that.carbooking.PayType == "") {
                  that.haveCarDate = that._common.todayAddDays(
                    that.carbooking.Days1
                  );
                } else {
                  that.haveCarDate = that._common.todayAddDays(
                    that.carbooking.Days2
                  );
                }
                that.firstDate = that._common.todayAddDays(
                  that.carbooking.Days3
                );
                that.lastDate = that._common.dateAddMonths(
                  that._common.todayObjAddDays(that.carbooking.Days3),
                  that.carbooking.Stages
                );
              }
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService
            .getForms(`vw_car_store/${that.carbooking.CarIncomeId}`)
            .then(
              data => {
                that.carinfo = data.Data[0];
                that.carinfo["GuidePrice"] =
                  that.carinfo["GuidePrice"] + that.carinfo["GuidePriceRemark"];
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
        if (print) {
          that.loading = false;
          print();
        }
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
  getDataList() {
    this.loading = true;
    this.formService.getForms(this.tableView["ViewName"]).then(
      data => {
        this.checkRoles("AuditRoles").then(d => {
          this.carsaleData = data.Data;
          if (d == 0) {
            //如果没有审核权限，则只显示自己创建的单
            this.carsaleData = _.filter(data.Data, f => {
              return (
                f["Creator"] == sessionStorage.getItem("userName") ||
                f["Creator"] == "admin"
              );
            });
          }
          _.each(this.carsaleData, f => {
            f["button"] = f;
          });
          this.source.load(this.carsaleData);
          this.totalRecord = data.Data.length;
          this.loading = false;
        });
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
          this.checkRoles("AuditRoles").then(d => {
            this.carsaleData = data.Data;
            if (d == 0) {
              //如果没有审核权限，则只显示自己创建的单
              this.carsaleData = _.filter(data.Data, f => {
                return (
                  f["Creator"] == sessionStorage.getItem("userName") ||
                  f["Creator"] == "admin"
                );
              });
            }
            _.each(this.carsaleData, f => {
              f["button"] = f;
            });
            this.source.load(this.carsaleData);
            this.totalRecord = data.Data.length;
            this.loading = false;
          });
        },
        err => {
          this.loading = false;
        }
      );
    }
  }

  onEdit(event) {
    this.formService.getForms(`car_sale_cash/${this.carsale.Id}`).then(data => {
      const carbook = data.Data[0];
      this.checkRoles("EditRoles").then(d => {
        if (d == 0) {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "你无权修改结算单。",
            time: new Date().getTime()
          });
        } else {
          const id = event.data.Id;
          if (carbook["AuditResult"] == "通过") {
            this._state.notifyDataChanged("messagebox", {
              type: "warning",
              msg: "已审核通过，不能修改。",
              time: new Date().getTime()
            });
            return;
          }
          if (carbook["Creator"]) {
            if (sessionStorage.getItem("userName") != carbook["Creator"]) {
              this._state.notifyDataChanged("messagebox", {
                type: "warning",
                msg: `该单创建人是${carbook["Creator"]}，你不能编辑。`,
                time: new Date().getTime()
              });
              return;
            }
          }

          this.router.navigate(
            ["/pages/market/carsalecashnew", event.data.BookingId],
            {
              queryParams: { n: this.carsale.OrderId, id: event.data.Id }
            }
          );
        }
      });
    });
  }

  onDelete(event) {
    this.formService.getForms(`car_sale_cash/${this.carsale.Id}`).then(data => {
      const carbook = data.Data[0];
      if (window.confirm("你确定要删除吗?")) {
        if (carbook["AuditResult"] == "通过") {
          this._state.notifyDataChanged("messagebox", {
            type: "warning",
            msg: "已审核通过，不能删除。",
            time: new Date().getTime()
          });
          return;
        }

        this.checkRoles("EditRoles").then(d => {
          if (d == 0) {
            this._state.notifyDataChanged("messagebox", {
              type: "warning",
              msg: "你无权删除结算单。",
              time: new Date().getTime()
            });
          } else {
            if (carbook["AuditResult"] == "通过") {
              this._state.notifyDataChanged("messagebox", {
                type: "warning",
                msg: "已审核通过，不能删除。",
                time: new Date().getTime()
              });
              return;
            }
            if (carbook["Creator"]) {
              if (sessionStorage.getItem("userName") != carbook["Creator"]) {
                this._state.notifyDataChanged("messagebox", {
                  type: "warning",
                  msg: `该单创建人是${carbook["Creator"]}，你不能删除。`,
                  time: new Date().getTime()
                });
                return;
              }
            }

            this.formService
              .delete(this.tableView["TableName"], event.data.Id)
              .then(
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
    });
  }

  onAudit(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = "审核交款单";
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let formValue = JSON.parse(result);
      formValue["Id"] = that.carsale["Id"];
      formValue["Auditor"] = sessionStorage.getItem("userName");
      formValue["AuditTime"] = this._common.getTodayString();
      console.log(formValue);

      that.formService.create("car_sale_cash", formValue).then(
        data => {
          closeBack();
          this._state.notifyDataChanged("messagebox", {
            type: "success",
            msg: "审核成功。",
            time: new Date().getTime()
          });
          if (formValue["AuditResult"] == "通过") {
            that.saveStatus("已开票");
          } else {
            that.getDataList();
          }
        },
        err => {
          this._state.notifyDataChanged("messagebox", {
            type: "error",
            msg: err,
            time: new Date().getTime()
          });
        }
      );
    };
  }

  //修改状态
  saveStatus(status: string) {
    const that = this;
    const carinfo = { Id: this.carbooking.CarIncomeId, SaleStatus: status };
    this.formService.create("car_income", carinfo).then(data => {}, err => {});

    const customer = {
      Id: this.carbooking.CustomerId,
      CanUpdate: status == "已开票" ? 0 : 1
    };
    this.formService.create("car_customer", customer).then(
      data => {
        that.getDataList();
      },
      err => {}
    );
  }

  onAuditNot(): void {
    let formValue = {};
    formValue["Id"] = this.carsale["Id"];
    formValue["AuditResult"] = " ";
    formValue["AuditSuggest"] = " ";
    formValue["Auditor"] = sessionStorage.getItem("userName");
    formValue["AuditTime"] = this._common.getTodayString();
    this.formService.create("car_sale_cash", formValue).then(
      data => {
        this._state.notifyDataChanged("messagebox", {
          type: "success",
          msg: "反审核成功。",
          time: new Date().getTime()
        });
        this.saveStatus("订单");
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

  onSelected(event) {
    this.mainTableID = event.data.Id;

    this.carsale = _.find(this.carsaleData, f => {
      return f["Id"] == this.mainTableID;
    });
    if (this.carsale) {
      if (this.carsale.RealAllFee) {
        this.chineseMoney = this._common.changeNumMoneyToChinese(
          this.carsale.RealAllFee
        );
      }
      this.getCarsale(this.carsale.BookingId, null);
    }
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

  onExport() {
    const fileName = `销售结算单——${this._common.getTodayString2()}.xlsx`;
    const data = [this.titles];
    _.each(this.carsaleData, d => {
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
          .nowarptable{
            table-layout: fixed;
          }
          .valueText{
            text-align:center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .textcenter{
            text-align:center;
          }
          .textright{
            text-align:right;
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

  print2(dn) {
    let printContents, popupWin;
    printContents = document.getElementById(dn).innerHTML;
    popupWin = window.open(
      "",
      "_blank",
      "top=0,left=0,height=1098px,width=900px"
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
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .textright{
            text-align:right;
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

  print3() {
    let printContents, popupWin;
    printContents = document.getElementById("printContact").innerHTML;
    popupWin = window.open(
      "",
      "_blank",
      "top=0,left=0,height=1098px,width=900px"
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
          .clearfix{
            clear: both;
          }
          .valueText{
            text-align:center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .textright{
            text-align:right;
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
