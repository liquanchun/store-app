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
import * as $ from "jquery";
import * as _ from "lodash";
import async from "async";
import { LocalDataSource } from "ng2-smart-table";
import { DicService } from "../../sys/dic/dic.services";
import { FormService } from "../form/form.services";
import { GlobalState } from "../../../global.state";

@Component({
  selector: "app-carsalecashnew",
  templateUrl: "./carsalecashnew.component.html",
  styleUrls: ["./carsalecashnew.component.scss"],
  providers: [DicService, FormService]
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
    BookId: 0
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
  partItem = [];
  //销售顾问
  saleman: any;
  customerId: number;
  carIncomeId: number;
  chineseMoney: string = "";

  gmxz: any;
  gmzz: any;
  fkfs: any;
  bxgs: any;
  //弹出框表格
  popCarItemGrid: LocalDataSource = new LocalDataSource();
  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _dicService: DicService,
    private formService: FormService,
    private _router: Router,
    private route: ActivatedRoute
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
          that.formService.getForms("car_part_item").then(
            data => {
              that.popCarItemGrid = data.Data;
              callback(null, 5);
            },
            err => {}
          );
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
    const fee1 = this.add(this.carsale.NewCarFee,this.carsale.InsureFee);
    const fee2 = this.add(this.carsale.BuyTaxFee,this.carsale.FinanceSerFee);
    const fee3 = this.add(this.carsale.DecorateFee,this.carsale.TakeAllFee);
    const fee4 = this.add(this.carsale.TakeCareFee,this.carsale.IntimateFee);
    const fee5 = this.add(this.carsale.GlassSerFee,this.carsale.CardCashFee);

    const fee6 = this.add(fee1,fee2);
    const fee7 = this.add(fee3,fee4);
    const fee8 = this.add(fee5,this.carsale.OtherFee);
    const fee9 = this.add(fee6,fee7);
    const fee10 = this.add(fee8,fee9);
    this.carsale.ShouldAllFee = _.round(fee10,2);

    if (this.carsale.BuyLicense == "分期") {
      this.carsale.LastFee = this.sub(this.carsale.NewCarFee,this.carsale.FirstFee);
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
    const sb1 = this.sub(this.carsale.ShouldAllFee,this.carsale.Deposit);
    const sb2 = this.sub(sb1,this.carsale.LastFee);
    const sb3 = this.sub(sb2,this.carsale.OldChangeFee);
    const sb4 = this.sub(sb3,this.carsale.OtherFee2);
    this.carsale.RealAllFee = _.round(sb4,2);

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
          msg: err,
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
        this.formService
          .create("car_booking_item", f)
          .then(function(data) {}, err => {
            console.log(err);
          });
      }
    });
  }

  onSearchItem(query: string = "") {
    this.popCarItemGrid.setFilter(
      [
        { field: "PartType", search: query },
        { field: "ItemName", search: query }
      ],
      false
    );
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
        return f.ItemName == event.data.ItemName;
      });
      if (f) {
        f.count++;
      } else {
        this.partItem.push({
          ItemType: "自费",
          ItemName: event.data.ItemName,
          Count: 1,
          Service: event.data.PartType,
          Price: event.data.Price
        });
      }
      this.cacalItem();
    }
  }

  //选择房间
  rowItem2Clicked(event): void {
    if (event.isSelected) {
      const f = _.find(this.partItem, f => {
        return f.ItemName == event.data.ItemName;
      });
      if (f) {
        f.count++;
      } else {
        this.partItem.push({
          ItemType: "免费",
          ItemName: event.data.ItemName,
          Count: 1,
          Service: event.data.PartType,
          Price: event.data.Price
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
      this.formService
        .delete2("car_booking_item", it["Id"])
        .then(data => {}, err => {});
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
}
