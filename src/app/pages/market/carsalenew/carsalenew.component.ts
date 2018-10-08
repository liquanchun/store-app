import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  Input
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
    Remark: ""
  };
  customer: any = {
    Name: "",
    Address: "",
    Phone: "",
    LinkMan: ""
  };
  carinfo: any = {
    CarType: "",
    Vinno: "",
    Status: "",
    CarColor: "",
    CarTrim: ""
  };
  serviceItem = [
    { itemName: "精品装饰", service: "全车贴膜", price: "0" },
    { itemName: "新车保险预估", service: "全险", price: "0" },
    { itemName: "购置税预估", service: "", price: "0" },
    { itemName: "综合服务费", service: "", price: "0" },
    { itemName: "金融分期服务费", service: "", price: "0" },
    { itemName: "安心服务器预估", service: "", price: "0" },
    { itemName: "贴心服务器预估", service: "", price: "0" },
    { itemName: "玻璃保险预估", service: "", price: "0" },
  ];
  giveItem = [
    { itemName: "其他", service: "会员卡", price: "0" },
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
    selectMode: "multi",
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
    mode: "external",
    selectMode: "multi",
    hideSubHeader: true,
    columns: {
      CarSeries: {
        title: "车系",
        type: "string",
        filter: false
      },
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
    if (id == 0) {
      this.getDataList();
      this.carsale.OrderDate = this._common.getTodayStringChinese();
      this.carsale.OrderDateObj = this._common.getTodayObj();
      //获取默认订单号
      this.formService.getDataCount("car_booking").then(
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
      this._dicService.getDicByName("销售顾问", data => {
        this.saleman = data;
      });
      this.getCarsale(id);
    }
  }

  getCarsale(id: number) {
    const that = this;
    async.series(
      {
        one: function(callback) {
          that.formService.getForms("vw_car_income").then(
            data => {
              that.carinfoDataList = data.Data;
              that.popCarInfoGrid = data.Data;
              callback(null, 1);
            },
            err => {}
          );
        },
        two: function(callback) {
          that.formService.getForms("car_customer").then(
            data => {
              that.custinfoDataList = data.Data;
              that.popCusInfoGrid = data.Data;
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
        }
      },
      function(err, results) {
        console.log(results);
      }
    );
  }

  getDataList(): void {
    this.formService.getForms("vw_car_income").then(
      data => {
        this.carinfoDataList = data.Data;
        this.popCarInfoGrid = data.Data;
      },
      err => {}
    );
    this.formService.getForms("car_customer").then(
      data => {
        this.custinfoDataList = data.Data;
        this.popCusInfoGrid = data.Data;
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
      this.carsale.CustomerId = 0;
    }
  }

  //选择房间
  rowCarClicked(event): void {
    if (event.isSelected) {
      this.carsale.CarIncomeId = event.data.Id;
      this.carinfo = event.data;
    } else {
      this.carinfo.CarColor = "";
      this.carinfo.CarTrim = "";
      this.carinfo.CarType = "";
      this.carinfo.Status = "";
      this.carinfo.Vinno = "";
      this.carsale.CarIncomeId = 0;
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
        $(".popover").css("max-width", "820px");
        $(".popover").css("min-width", "600px");
      },
      100,
      "later"
    );
  }
  onSearchCus(query: string = "") {
    this.popCusInfoGrid.setFilter(
      [{ field: "name", search: query }, { field: "phone", search: query }],
      false
    );
  }
  onSearchCar(query: string = "") {
    this.popCarInfoGrid.setFilter(
      [
        { field: "Vinno", search: query },
        { field: "CarType", search: query },
        { field: "CarSeries", search: query },
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
    if (_.isObject(this.carsale.PreCarDateObj)) {
      this.carsale.PreCarDate = this._common.getDateString(
        this.carsale.PreCarDateObj
      );
    }
    const newcarsale = _.clone(this.carsale);
    delete newcarsale.PreCarDateObj;
    delete newcarsale.OrderDateObj;
    console.log(newcarsale);
    const that = this;
    this.formService.create("car_booking", newcarsale).then(
      function(data) {
        that._state.notifyDataChanged("messagebox", {
          type: "success",
          msg: "保存成功。",
          time: new Date().getTime()
        });
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
}
