import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  Input,
  SimpleChanges
} from "@angular/core";
import {
  NgbModal,
  ModalDismissReasons,
  NgbAlert
} from "@ng-bootstrap/ng-bootstrap";
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import {
  IMultiSelectOption,
  IMultiSelectSettings,
  IMultiSelectTexts
} from "angular-2-dropdown-multiselect";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { LocalDataSource } from "ng2-smart-table";
import { Common } from "../../../providers/common";
import * as $ from "jquery";
import * as _ from "lodash";
import async from "async";

import { DicService } from "../../sys/dic/dic.services";
import { FormService } from "../form/form.services";
import { GlobalState } from "../../../global.state";

@Component({
  selector: "app-carsalenew",
  templateUrl: "./carsalenew2.component.html",
  styleUrls: ["./carsalenew.component.scss"],
  providers: [DicService, FormService]
})
export class CarSaleNewComponent implements OnInit {
  @Input()
  showEditButton: boolean = true;
  title = "新增销售预定单";
  isSaved: boolean = false;
  isEnable: boolean = true;
  loading = false;
  carsale: any = {
    Id: 0,
    OrderId: "",
    OrderDate: "",
    OrderDateObj: {},
    SaleMan: "",
    DMSNo: "",
    CustomerId: "",
    CarIncomeId: "",
    SelfConfig: "",
    GuidePrice: 0,
    SalePrice: 0,
    Discount: 0,
    Deposit: 0,
    Days1: 0,
    PredictFee: 0,
    Days2: 0,
    WholeFee: 0,
    FinaceCompany: "",
    FirstFee: 0,
    Stages: 0,
    Days3: 0,
    PreCarDate: "",
    PreCarDateObj: {},
    PickCarType: "",
    PickCarMan: "",
    PickCarMobile: "",
    Remark: "",
    Count: 1,
    TakeCarSite: "北京博瑞宝汽车销售服务公司",
    TakePhone: "010-87839999",
    Creator: ""
  };
  customer: any = {
    Id: 0,
    Name: "",
    Address: "",
    Phone: "",
    LinkMan: "",
    IDCard: "",
    LicenseType: "",
    IdAddress: "",
    CustType: "",
    PostNumber: ""
  };
  carinfo: any = {
    CarType: "",
    Vinno: "",
    Status: "",
    CarColor: "",
    CarTrim: "",
    CarConfig: "",
    GuidePrice: 0,
    GuidePriceRemark: 0,
    DMSCode: ""
  };
  serviceItem = [
    {
      itemType: "增值服务",
      itemName: "精品装饰",
      fieldName: "DecorateFee",
      service: "全车贴膜",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "新车保险预估",
      fieldName: "InsureFee",
      service: "全险",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "购置税预估",
      fieldName: "BuyTaxFee",
      service: "",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "综合服务费",
      fieldName: "TakeAllFee",
      service: "",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "金融分期服务费",
      fieldName: "FinanceSerFee",
      service: "",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "安心服务器预估",
      service: "",
      fieldName: "TakeCareFee",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "贴心服务器预估",
      fieldName: "IntimateFee",
      service: "",
      price: 0
    },
    {
      itemType: "增值服务",
      itemName: "玻璃保险预估",
      fieldName: "GlassSerFee",
      service: "",
      price: 0
    }
  ];
  giveItem = [
    { itemType: "赠送服务", itemName: "其他", service: "会员卡", price: 0 }
  ];
  //销售顾问
  saleman: any;

  carinfoDataList: any;
  custinfoDataList: any;
  //弹出框表格
  popCarInfoGrid: LocalDataSource = new LocalDataSource();
  //弹出框表格
  popCusInfoGrid: LocalDataSource = new LocalDataSource();

  settingsCus = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    mode: "external",
    hideSubHeader: true,
    columns: {
      Name: {
        title: "客户名称",
        type: "string",
        filter: false
      },
      LinkMan: {
        title: "联系人",
        type: "string",
        filter: false
      },
      Phone: {
        title: "联系电话",
        type: "string",
        filter: false
      },
      IdCard: {
        title: "证件号码",
        type: "string",
        filter: false
      }
    }
  };

  settingsCar = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    pager: {
      perPage: 5
    },
    mode: "external",
    hideSubHeader: true,
    columns: {
      CarType: {
        title: "车型",
        type: "string",
        filter: false
      },
      CarTypeCode: {
        title: "车型代码",
        type: "string",
        filter: false
      },
      CarColor: {
        title: "颜色",
        type: "string",
        filter: false
      },
      CarTrim: {
        title: "内饰",
        type: "string",
        filter: false
      },
      Vinno: {
        title: "车架号",
        type: "string",
        filter: false
      },
      Status: {
        title: "状态",
        type: "string",
        filter: false
      },
      StoreSite: {
        title: "库位",
        type: "string",
        filter: false
      },
      InDate: {
        title: "入库日期",
        type: "string",
        filter: false
      },
      PreIncomeTime: {
        title: "预计到车",
        type: "string",
        filter: false
      }
    }
  };

  constructor(
    private _common: Common,
    private _state: GlobalState,
    private _dicService: DicService,
    private formService: FormService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    const id = _.toInteger(this.route.snapshot.paramMap.get("id"));
    const n = this.route.snapshot.queryParams["n"];
    if (n) {
      this.isEnable = false;
    }
    this.carsale.SaleMan = sessionStorage.getItem("userName");

    if (id == 0) {
      this.getDataList();
      this.carsale.Creator = sessionStorage.getItem("userName");
      this.carsale.OrderDate = this._common.getTodayStringChinese();
      this.carsale.OrderDateObj = this._common.getTodayObj();
      //获取默认订单号
      this.formService.getMaxId("car_booking").then(
        data => {
          if (data) {
            const cnt = _.toInteger(data.Data) + 1;
            this.carsale.OrderId =
              "YD" +
              this._common.getTodayString2() +
              _.padStart(_.toString(cnt), 4, "0");
          }
        },
        err => {}
      );
    } else {
      this.getCarsale(id);
    }
  }

  getCarsale(id: number) {
    const that = this;
    this.loading = true;
    async.series(
      {
        zero: function(callback) {
          that.formService.getForms("vw_select_car").then(
            data => {
              that.popCarInfoGrid.load(data.Data);
              callback(null, 0);
            },
            err => {}
          );
        },
        one: function(callback) {
          that.formService.getForms("vw_car_store").then(
            data => {
              that.carinfoDataList = data.Data;
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService.getForms("car_customer").then(
            data => {
              const mydata = _.filter(data.Data, f => {
                return f["Creator"] == sessionStorage.getItem("userName");
              });
              that.custinfoDataList = data.Data;
              that.popCusInfoGrid.load(mydata);
              callback(null, 2);
            },
            err => {}
          );
        },
        three: function(callback) {
          that.formService.getForms(`car_booking/${id}`).then(
            data => {
              if (data && data.Data) {
                that.carsale = data.Data[0];
                that.carsale.OrderDateObj = that._common.getDateObject(
                  that.carsale.OrderDate
                );
                that.carsale.PreCarDateObj = that._common.getDateObject(
                  that.carsale.PreCarDate
                );

                that.customer = _.find(that.custinfoDataList, f => {
                  return f["Id"] == that.carsale.CustomerId;
                });

                that.carinfo = _.find(that.carinfoDataList, f => {
                  return f["Id"] == that.carsale.CarIncomeId;
                });
                callback(null, 3);
              }
            },
            err => {}
          );
        },
        four: function(callback) {
          that.formService
            .getForms("car_booking_item/OrderId/" + that.carsale.OrderId)
            .then(
              data => {
                if (data.Data.length > 0) {
                  const zzitem = [],
                    zsitem = [];
                  _.each(data.Data, f => {
                    if (
                      f["OrderId"] == that.carsale.OrderId &&
                      f["ItemType"] == "增值服务"
                    ) {
                      zzitem.push({
                        Id: f["Id"],
                        FieldName: f["FieldName"],
                        itemName: f["ItemName"],
                        itemType: f["ItemType"],
                        price: f["Price"],
                        service: f["Service"]
                      });
                    }
                    if (
                      f["OrderId"] == that.carsale.OrderId &&
                      f["ItemType"] == "赠送服务"
                    ) {
                      zsitem.push({
                        Id: f["Id"],
                        FieldName: f["FieldName"],
                        itemName: f["ItemName"],
                        itemType: f["ItemType"],
                        price: f["Price"],
                        service: f["Service"]
                      });
                    }
                  });

                  that.serviceItem = zzitem;
                  that.giveItem = zsitem;
                }
                callback(null, 4);
              },
              err => {}
            );
        }
      },
      function(err, results) {
        that.loading = false;
        console.log(results);
      }
    );
  }

  getDataList(): void {
    this.formService.getForms("vw_car_store").then(
      data => {
        this.carinfoDataList = data.Data;
      },
      err => {}
    );
    this.formService.getForms("vw_select_car").then(
      data => {
        this.popCarInfoGrid.load(data.Data);
      },
      err => {}
    );
    this.formService.getForms("car_customer").then(
      data => {
        this.custinfoDataList = data.Data;
        this.popCusInfoGrid.load(data.Data);
      },
      err => {}
    );
  }

  //选择房间
  rowCusClicked(event): void {
    if (event.isSelected) {
      this.carsale.CustomerId = event.data.Id;
      this.customer = event.data;
    } else {
      this.customer.Address = "";
      this.customer.LinkMan = "";
      this.customer.Name = "";
      this.customer.Phone = "";
      this.customer.IDCard = "";
      this.customer.LicenseType = "";
      this.customer.IdAddress = "";
      this.customer.CustType = "";
      this.customer.PostNumber = "";
      this.carsale.CustomerId = 0;
    }
  }

  //选择房间
  rowCarClicked(event): void {
    if (event.isSelected) {
      this.carsale.CarIncomeId = event.data.Id;
      this.carinfo = event.data;
      this.carsale.GuidePrice =
        this.carinfo.GuidePrice + this.carinfo.GuidePriceRemark;
      this.carsale.SalePrice = this.carsale.GuidePrice;
    } else {
      this.carinfo.CarColor = "";
      this.carinfo.CarTrim = "";
      this.carinfo.CarType = "";
      this.carinfo.Status = "";
      this.carinfo.Vinno = "";
      this.carsale.CarIncomeId = 0;
      this.carinfo.DMSCode = "";
    }
  }

  showPopCustomer(event): void {
    _.delay(
      function(text) {
        $(".popover").css("max-width", "820px");
        $(".popover").css("min-width", "600px");
      },
      100,
      "later"
    );
  }

  showPopCarInfo(event): void {
    _.delay(
      function(text) {
        $(".popover").css("max-width", "1024px");
        $(".popover").css("min-width", "900px");
      },
      100,
      "later"
    );
  }
  onSearchCus(query: string = "") {
    this.popCusInfoGrid.setFilter(
      [
        { field: "Name", search: query },
        { field: "Phone", search: query },
        { field: "LinkMan", search: query }
      ],
      false
    );
  }

  onSearchCar(query: string = "") {
    this.popCarInfoGrid.setFilter(
      [
        { field: "Vinno", search: query },
        { field: "CarType", search: query },
        { field: "CarColor", search: query },
        { field: "Status", search: query },
        { field: "CarTypeCode", search: query }
      ],
      false
    );
  }

  onKeyPress(event: any) {
    event.returnValue = false;
    // let keyCode = event.keyCode;
    // if ((keyCode >= 48 && keyCode <= 57){
    //   event.returnValue = true;
    // } else {
    //   event.returnValue = false;
    // }
  }
  newItem() {
    this.giveItem.push({
      itemType: "赠送服务",
      itemName: "",
      service: "",
      price: 0
    });
  }
  priceChange(event) {
    this.carsale.PredictFee = _.sumBy(this.serviceItem, f => {
      return f["price"];
    });
  }
  discountChange(event) {
    this.carsale.SalePrice = this.carsale.GuidePrice - this.carsale.Discount;
  }
  saleChange(event) {
    this.carsale.Discount = this.carsale.GuidePrice - this.carsale.SalePrice;
  }
  onBack() {
    this._router.navigate(["/pages/market/carsale"]);
  }
  //确认入住
  onConfirm(): void {
    if (_.isObject(this.carsale.OrderDateObj)) {
      this.carsale.OrderDate = this._common.getDateString(
        this.carsale.OrderDateObj
      );
    }
    if (
      _.isObject(this.carsale.PreCarDateObj) &&
      this.carsale.PreCarDateObj.year
    ) {
      this.carsale.PreCarDate = this._common.getDateString(
        this.carsale.PreCarDateObj
      );
    } else {
      this._state.notifyDataChanged("messagebox", {
        type: "warning",
        msg: "交车日期不能为空。",
        time: new Date().getTime()
      });
      return;
    }
    if (this.carsale.CarIncomeId == 0) {
      this._state.notifyDataChanged("messagebox", {
        type: "warning",
        msg: "车辆信息不能为空。",
        time: new Date().getTime()
      });
      return;
    }
    if (this.carsale.CustomerId == 0) {
      this._state.notifyDataChanged("messagebox", {
        type: "warning",
        msg: "客户信息不能为空。",
        time: new Date().getTime()
      });
      return;
    }

    this.carsale.Creator = sessionStorage.getItem("userName");
    const newcarsale = _.clone(this.carsale);

    delete newcarsale.PreCarDateObj;
    delete newcarsale.OrderDateObj;
    if (newcarsale.UpdateTime) delete newcarsale.UpdateTime;

    console.log(newcarsale);
    const that = this;
    this.formService.create("car_booking", newcarsale).then(
      data => {
        that.saveItem();
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
    if (this.customer.UpdateTime) delete this.customer.UpdateTime;
    this.formService
      .create("car_customer", this.customer)
      .then(data => {}, err => {});
  }

  saveItem() {
    const that = this;
    _.each(this.serviceItem, f => {
      f["OrderId"] = this.carsale.OrderId;
      this.formService
        .create("car_booking_item", f)
        .then(function(data) {}, err => {
          console.log(err);
        });
    });
    _.each(this.giveItem, f => {
      f["OrderId"] = this.carsale.OrderId;
      this.formService
        .create("car_booking_item", f)
        .then(function(data) {}, err => {
          console.log(err);
        });
    });
  }

  checkRadio(event) {
    if (this.carsale.PayType == "现车付款") {
      this.carsale.Days2 = 0;
      this.carsale.FinaceCompany = "";
      this.carsale.FirstFee = 0;
      this.carsale.Stages = 0;
      this.carsale.Days3 = 0;
    }
    if (this.carsale.PayType == "订单车辆付款") {
      this.carsale.Days1 = 0;
      this.carsale.FinaceCompany = "";
      this.carsale.FirstFee = 0;
      this.carsale.Stages = 0;
      this.carsale.Days3 = 0;
    }
    if (this.carsale.PayType == "分期付款") {
      this.carsale.Days1 = 0;
      this.carsale.Days2 = 0;
    }
  }
}
