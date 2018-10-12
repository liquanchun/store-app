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
  loading= false;
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

  //销售顾问
  saleman: any;
  customerId: number;
  carIncomeId: number;
  chineseMoney: string = "";

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
  }

  getCarsale(bookid: number) {
    const that = this;
    async.series(
      {
        zero: function(callback) {
          that.formService
            .getForms(`car_booking_item/OrderId/${that.carsale.OrderId}`)
            .then(
              data => {
                if (data && data.Data) {
                  const bookitem = data.Data;
                  _.each(bookitem, f => {
                    if (f["FieldName"]) {
                      that.carsale[f["FieldName"]] = f["Price"];
                    }
                  });
                }
                callback(null, 0);
              },
              err => {}
            );
        },
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
                that.carsale.FirstFee = carbook.FirstFee;

                that.priceChange();
              }
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService.getForms(`vw_car_income/${that.carIncomeId}`).then(
            data => {
              that.carinfo = data.Data[0];
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
              },
              err => {}
            );
          }
          callback(null, 4);
        }
      },
      function(err, results) {
      }
    );
  }

  priceChange() {
    this.carsale.ShouldAllFee =
      this.carsale.NewCarFee -
      this.carsale.FirstFee +
      this.carsale.InsureFee +
      this.carsale.BuyTaxFee +
      this.carsale.FinanceSerFee +
      this.carsale.DecorateFee +
      this.carsale.TakeAllFee +
      this.carsale.TakeCareFee +
      this.carsale.IntimateFee +
      this.carsale.GlassSerFee +
      this.carsale.CardCashFee +
      this.carsale.OtherFee;

    this.carsale.LastFee = this.carsale.FirstFee;
    this.carsale.InvoiceFee = this.carsale.NewCarFee;
    this.carsale.RealAllFee =
      this.carsale.ShouldAllFee - this.carsale.Deposit - this.carsale.LastFee;
    this.chineseMoney = this._common.changeNumMoneyToChinese(
      this.carsale.RealAllFee
    );
  }
  onBack() {
    this._router.navigate(["/pages/market/carsalecash"]);
  }
  //确认入住
  onConfirm(): void {
    const that = this;
    this.carsale.Creator = sessionStorage.getItem("userName");
    this.formService.create("car_sale_cash", this.carsale).then(
      function(data) {
        that._state.notifyDataChanged("messagebox", {
          type: "success",
          msg: "保存成功。",
          time: new Date().getTime()
        });
        that.isEnable = false;
        that.saveStatus();
      },
      err => {
        that._state.notifyDataChanged("messagebox", {
          type: "error",
          msg: err,
          time: new Date().getTime()
        });
      }
    );
  }

  //修改状态
  saveStatus() {
    const that = this;
    const carinfo = { Id: this.carIncomeId, Status: "已开票" };
    this.formService.create("car_income", carinfo).then(data => {}, err => {});
  }
}
