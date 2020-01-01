import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  Input,
  SimpleChanges
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Common } from "../../../providers/common";
import { FieldConfig } from "../../../theme/components/dynamic-form/models/field-config.interface";
import { NgbdModalContent } from "../../../modal-content.component";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { PartsService } from "../../basedata/parts/parts.services";
import { PartsComboService } from "../../basedata/partscombo/partscombo.services";
import * as $ from "jquery";
import * as _ from "lodash";
import async from "async";
import { LocalDataSource } from "ng2-smart-table";
import { DicService } from "../../basedata/dic/dic.services";
import { FormService } from "../form/form.services";
import { GlobalState } from "../../../global.state";

@Component({
  selector: "app-carsalecashnew",
  templateUrl: "./carsalecashnew.component.html",
  styleUrls: ["./carsalecashnew.component.scss"],
  providers: [DicService, FormService, PartsService, PartsComboService]
})
export class CarSaleCashNewComponent implements OnInit {
  @Input()
  showEditButton: boolean = true;
  title = "新增销售交款明细单";
  isSaved: boolean = false;
  isEnable: boolean = true;
  loading = false;
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
    BookId: 0,
    CarIncomeId: 0
  };
  customer: any = {
    Name: "",
    LinkMan: "",
    IdCard: "",
    Address: "",
    Phone: "",
    InvoiceCode: "",
    InvoiceName: "",
    CustType: ""
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
  settingsItem = {
    actions: false,
    pager: {
      perPage: 10
    },
    mode: "external",
    hideSubHeader: true,
    columns: {
      PartType: {
        title: "精品类别",
        type: "string",
        filter: false
      },
      ItemName: {
        title: "项目",
        type: "string",
        filter: false
      },
      Price: {
        title: "价格",
        type: "string",
        filter: false
      }
    }
  };

  config: FieldConfig[] = [
    {
      type: "check",
      label: "审核",
      name: "AuditResult",
      check: "radio",
      options: [
        { id: "通过", text: "通过" },
        { id: "不通过", text: "不通过" }
      ]
    },
    {
      type: "input",
      label: "审核意见",
      name: "AuditSuggest"
    }
  ];

  partItem = [];
  //销售顾问
  saleman: any;
  customerId: number;
  carIncomeId: number;
  chineseMoney: string = "";
  tableView: {};

  gmxz: any;
  gmzz: any;
  fkfs: any;
  bxgs: any;
  kfsx: any;

  settingsParts = {
    pager: {
      perPage: 10
    },
    selectMode: "multi",
    actions: false,
    mode: "external",
    hideSubHeader: true,
    columns: {
      type_name: {
        title: "分类",
        type: "string",
        filter: false
      },
      item_name: {
        title: "项目名称",
        type: "string",
        filter: false
      },
      item_no: {
        title: "项目编号",
        type: "string",
        filter: false
      },
      cost_price: {
        title: "套餐成本",
        type: "string",
        filter: false
      },
      sale_price: {
        title: "销售价",
        type: "string",
        filter: false
      },
      parttype: {
        title: "来源",
        type: "string",
        filter: false
      }
    }
  };

  settingsPartsCombo = {
    pager: {
      perPage: 10
    },
    selectMode: "multi",
    mode: "external",
    actions: false,
    hideSubHeader: true,
    columns: {
      type_name: {
        title: "分类",
        type: "string",
        filter: false
      },
      item_name: {
        title: "套餐名称",
        type: "string",
        filter: false
      },
      item_no: {
        title: "套餐编号",
        type: "string",
        filter: false
      },
      cost_price: {
        title: "套餐成本",
        type: "string",
        filter: false
      },
      sale_price: {
        title: "销售价",
        type: "string",
        filter: false
      },
      parttype: {
        title: "来源",
        type: "string",
        filter: false
      }
    }
  };
  sourcePartsCombo: LocalDataSource = new LocalDataSource();

  sourceParts: LocalDataSource = new LocalDataSource();
  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _dicService: DicService,
    private formService: FormService,
    private _router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private partsService: PartsService,
    private partsComboService: PartsComboService
  ) {}
  ngOnInit() {
    const bookid = _.toInteger(this.route.snapshot.paramMap.get("id"));
    this.carsale.BookId = bookid;
    this.carsale.OrderId = this.route.snapshot.queryParams["n"];
    if (this.route.snapshot.queryParams["id"]) {
      //修改
      this.carsale.Id = this.route.snapshot.queryParams["id"];
      this.getCarsale(bookid);
      if (this.carsale.OrderId == 1) {
        //查看详情
        this.isEnable = false;
      }
    } else {
      this.carsale.Creator = sessionStorage.getItem("userName");
      this.carsale.InvoiceDate = this._common.getTodayString();
      this.getCarsale(bookid);
    }

    this._dicService.getDicByName("购买性质", data => {
      this.gmxz = data;
    });

    this._dicService.getDicByName("购买资质", data => {
      this.gmzz = data;
    });

    this._dicService.getDicByName("付款方式", data => {
      this.fkfs = data;
    });

    this._dicService.getDicByName("保险公司", data => {
      this.bxgs = data;
    });
    this._dicService.getDicByName("销售分类", data => {
      this.kfsx = data;
    });

    this.getViewName();
    this.getPartComboDataList();

    this.getPartsDataList();
  }

  getPartComboDataList(): void {
    this.loading = true;
    this.partsComboService.getPartsCombo().then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          this.sourcePartsCombo.load(data.Data);
          console.log("sourcePartsCombo", data.Data);
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
  getPartsDataList(): void {
    this.loading = true;
    this.partsService.getParts().then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          this.sourceParts.load(data.Data);
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

  //根据视图名称获取表格和表单定义
  getViewName() {
    this.formService.getForms("form_set").then(
      data => {
        if (data.Data) {
          this.tableView = _.find(data.Data, function(o) {
            return o["ViewType"] == "table" && o["FormName"] == "carsalecash";
          });
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
  }

  getCarsale(bookid: number) {
    this.loading = true;
    const that = this;
    async.series(
      {
        one: function(callback) {
          that.formService.getForms(`car_booking/${bookid}`).then(
            data => {
              if (data && data.Data) {
                const carbook = data.Data[0];
                that.customerId = carbook.CustomerId;
                that.carIncomeId = carbook.CarIncomeId;
                that.carsale.CarIncomeId = carbook.CarIncomeId;
                that.carsale.Deposit = carbook.Deposit;
                that.carsale.NewCarFee = carbook.SalePrice;
                that.carsale.Discount = carbook.Discount;
                that.carsale.FirstFee = _.floor(
                  (that.carsale.NewCarFee * carbook.FirstFee) / 100
                );

                that.priceChange();
              }
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService.getForms(`vw_car_store/${that.carIncomeId}`).then(
            data => {
              that.carinfo = data.Data[0];
              that.carinfo["GuidePrice"] =
                that.carinfo["GuidePrice"] + that.carinfo["GuidePriceRemark"];
              that.carsale.Discount =
                that.carinfo["GuidePrice"] - that.carsale.NewCarFee;
              callback(null, 2);
            },
            err => {}
          );
        },
        three: function(callback) {
          that.formService.getForms(`car_customer/${that.customerId}`).then(
            data => {
              that.customer = data.Data[0];
              callback(null, 3);
            },
            err => {}
          );
        },
        four: function(callback) {
          if (that.carsale.Id > 0) {
            that.formService.getForms(`car_sale_cash/${that.carsale.Id}`).then(
              data => {
                if (data && data.Data) {
                  that.carsale = data.Data[0];
                  that.priceChange();
                }
                callback(null, 4);
              },
              err => {}
            );
          } else {
            callback(null, 4);
          }
        },
        five: function(callback) {
          // that.formService.getForms("car_part_item").then(
          //   data => {
          //     that.popCarItemGrid = data.Data;
          //     callback(null, 5);
          //   },
          //   err => {}
          // );
        },
        six: function(callback) {
          if (that.carsale.OrderId) {
            that.formService
              .getForms(`car_booking_item/OrderId/${that.carsale.OrderId}`)
              .then(
                data => {
                  if (data && data.Data) {
                    const bookitem = _.filter(data.Data, f => {
                      return f["ItemType"] != "自费" && f["ItemType"] != "免费";
                    });
                    if (!that.carsale.Id) {
                      _.each(bookitem, f => {
                        if (f["FieldName"] && !that.carsale[f["FieldName"]]) {
                          that.carsale[f["FieldName"]] = f["Price"];
                        }
                      });
                    }
                    that.partItem = _.filter(data.Data, f => {
                      return f["ItemType"] == "自费" || f["ItemType"] == "免费";
                    });
                  }
                  callback(null, 6);
                },
                err => {}
              );
          } else {
            callback(null, 6);
          }
        }
      },
      function(err, results) {
        that.loading = false;
      }
    );
  }

  priceChange() {
    // this.carsale.ShouldAllFee = _.round(
    //   this.carsale.NewCarFee +
    //     this.carsale.InsureFee +
    //     this.carsale.BuyTaxFee +
    //     this.carsale.FinanceSerFee +
    //     this.carsale.DecorateFee +
    //     this.carsale.TakeAllFee +
    //     this.carsale.TakeCareFee +
    //     this.carsale.IntimateFee +
    //     this.carsale.GlassSerFee +
    //     this.carsale.CardCashFee +
    //     this.carsale.OtherFee,
    //   2
    // );
    const fee1 = this.add(this.carsale.NewCarFee, this.carsale.InsureFee);
    const fee2 = this.add(this.carsale.BuyTaxFee, this.carsale.FinanceSerFee);
    const fee3 = this.add(this.carsale.DecorateFee, this.carsale.TakeAllFee);
    const fee4 = this.add(this.carsale.TakeCareFee, this.carsale.IntimateFee);
    const fee5 = this.add(this.carsale.GlassSerFee, this.carsale.CardCashFee);

    const fee6 = this.add(fee1, fee2);
    const fee7 = this.add(fee3, fee4);
    const fee8 = this.add(fee5, this.carsale.OtherFee);
    const fee9 = this.add(fee6, fee7);
    const fee10 = this.add(fee8, fee9);
    this.carsale.ShouldAllFee = _.round(fee10, 2);

    if (this.carsale.BuyLicense == "分期") {
      this.carsale.LastFee = this.sub(
        this.carsale.NewCarFee,
        this.carsale.FirstFee
      );
    }
    this.carsale.InvoiceFee = this.carsale.NewCarFee;
    // this.carsale.RealAllFee = _.round(
    //   this.carsale.ShouldAllFee -
    //     this.carsale.Deposit -
    //     this.carsale.LastFee -
    //     this.carsale.OldChangeFee -
    //     this.carsale.OtherFee2,
    //   2
    // );
    const sb1 = this.sub(this.carsale.ShouldAllFee, this.carsale.Deposit);
    const sb2 = this.sub(sb1, this.carsale.LastFee);
    const sb3 = this.sub(sb2, this.carsale.OldChangeFee);
    const sb4 = this.sub(sb3, this.carsale.OtherFee2);
    this.carsale.RealAllFee = _.round(sb4, 2);

    this.chineseMoney = this._common.changeNumMoneyToChinese(
      this.carsale.RealAllFee
    );
  }

  add(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return (
      (e = Math.pow(10, Math.max(c, d))), (this.mul(a, e) + this.mul(b, e)) / e
    );
  }

  sub(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return (
      (e = Math.pow(10, Math.max(c, d))), (this.mul(a, e) - this.mul(b, e)) / e
    );
  }

  mul(a, b) {
    var c = 0,
      d = a.toString(),
      e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) {}
    try {
      c += e.split(".")[1].length;
    } catch (f) {}
    return (
      (Number(d.replace(".", "")) * Number(e.replace(".", ""))) /
      Math.pow(10, c)
    );
  }

  onBack() {
    this._router.navigate(["/pages/market/carsalecash"]);
  }
  //确认入住
  onConfirm(): void {
    const that = this;
    this.carsale.Creator = sessionStorage.getItem("userName");
    if (this.carsale.UpdateTime) delete this.carsale.UpdateTime;
    this.carsale.IsValid = 1;
    const keys = _.keys(this.carsale);
    keys.forEach(k => {
      if (this.carsale[k] == null) {
        delete this.carsale[k];
      }
    });
    this.formService.create("car_sale_cash", this.carsale).then(
      function(data) {
        that._state.notifyDataChanged("messagebox", {
          type: "success",
          msg: "保存成功。",
          time: new Date().getTime()
        });
        that.isEnable = false;
      },
      err => {
        that._state.notifyDataChanged("messagebox", {
          type: "error",
          msg: "保存失败",
          time: new Date().getTime()
        });
      }
    );

    _.each(this.partItem, f => {
      if (f["Price"]) {
        if (f.UpdateTime) {
          delete f.UpdateTime;
        }
        f["OrderId"] = this.carsale.OrderId;
        this.formService.create("car_booking_item", f).then(
          function(data) {},
          err => {
            console.log(err);
          }
        );
      }
    });
  }

  onSearchItemParts(query: string = "") {
    this.sourceParts.setFilter(
      [
        { field: "item_name", search: query },
        { field: "item_no", search: query }
      ],
      false
    );
  }
  onSearchItemPartsCombo(query: string = "") {
    this.sourcePartsCombo.setFilter(
      [
        { field: "item_name", search: query },
        { field: "item_no", search: query }
      ],
      false
    );
  }
  onRadioChange(event) {
    console.log(event.target.value);
  }
  showPopCarItem(event): void {
    _.delay(
      function(text) {
        $(".popover").css("max-width", "620px");
        $(".popover").css("min-width", "500px");
      },
      100,
      "later"
    );
  }
  //选择房间
  rowItemClicked(event): void {
    if (event.isSelected) {
      const f = _.find(this.partItem, f => {
        return f.ItemName == event.data.item_name;
      });
      if (f) {
        f.count++;
      } else {
        this.partItem.push({
          ItemType: "自费",
          ItemName: event.data.item_name,
          Count: 1,
          Service: event.data.parttype,
          Price: event.data.sale_price
        });
      }
      console.log(this.partItem);
      this.cacalItem();
    }
  }

  //选择房间
  rowItem2Clicked(event): void {
    if (event.isSelected) {
      const f = _.find(this.partItem, f => {
        return f.ItemName == event.data.item_name;
      });
      if (f) {
        f.count++;
      } else {
        this.partItem.push({
          ItemType: "免费",
          ItemName: event.data.item_name,
          Count: 1,
          Service: event.data.parttype,
          Price: event.data.sale_price
        });
      }
      this.cacalItem();
    }
  }

  removeItem(itemname) {
    const it = _.find(this.partItem, f => {
      return f["ItemName"] == itemname;
    });
    if (it && it["Id"]) {
      this.formService.delete2("car_booking_item", it["Id"]).then(
        data => {},
        err => {}
      );
    }
    _.remove(this.partItem, f => {
      return f["ItemName"] == itemname;
    });
    this.cacalItem();
  }

  cacalItem() {
    this.carsale.ZhuangxFee = _.sumBy(
      _.filter(this.partItem, f => {
        return f["ItemType"] == "免费";
      }),
      f => {
        return f["Count"] * f["Price"];
      }
    );

    this.carsale.DecorateFee = _.sumBy(
      _.filter(this.partItem, f => {
        return f["ItemType"] == "自费";
      }),
      f => {
        return f["Count"] * f["Price"];
      }
    );
    this.priceChange();
  }

  onBuyLicense() {
    if (this.carsale.BuyLicense == "全款") {
      this.carsale.LastFee = 0;
      this.carsale.FirstFee = 0;
    }
    this.priceChange();
  }

  onAudit() {
    this.checkRoles("AuditRoles").then(d => {
      if (d == 0) {
        this._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "你无权反审核。",
          time: new Date().getTime()
        });
      } else {
        this.onAuditYes();
      }
    });
  }

  onAuditYes(): void {
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
    const carinfo = { Id: this.carIncomeId, SaleStatus: status };
    this.formService.create("car_income", carinfo).then(
      data => {},
      err => {}
    );

    const customer = {
      Id: this.customerId,
      CanUpdate: status == "已开票" ? 0 : 1
    };
    this.formService.create("car_customer", customer).then(
      data => {},
      err => {}
    );
  }

  onNoAudit() {
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
}
