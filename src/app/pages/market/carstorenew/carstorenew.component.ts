import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
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
import { EditFormComponent } from "../editform/editform.component";
import { Common } from "../../../providers/common";
import async from "async";
import { DynamicForm2Component } from "../../../theme/components/dynamic-form/containers/dynamic-form2/dynamic-form2.component";
import * as $ from "jquery";
import * as _ from "lodash";
import { resolve } from "url";
import { reject } from "q";

@Component({
  selector: "app-carstorenew",
  templateUrl: "./carstorenew.component.html",
  styleUrls: ["./carstorenew.component.scss"],
  providers: [FormService, DicService]
})
export class CarstoreNewComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicForm2Component)
  form: DynamicForm2Component;
  @ViewChild(EditFormComponent)
  editComponent: EditFormComponent;
  loading = false;
  title = "车辆入库";
  config: FieldConfig[] = [];
  configAddArr: FieldConfig[] = [];
  configUpdateArr: FieldConfig[] = [];
  //表单视图定义
  formView: {};
  //表单修改时数据
  updateData: {};
  //下拉列表值
  selectData: {};
  source: LocalDataSource = new LocalDataSource();

  tablename: string;
  formname: string;
  canUpdate: boolean = false;

  settingsCar = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    mode: "external",
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
        title: "车系代码",
        type: "string",
        filter: false
      },
      Config: {
        title: "配置",
        type: "string",
        filter: false
      }
    }
  };

  //弹出框表格
  popCarInfoGrid: LocalDataSource = new LocalDataSource();

  //子表视图
  subViewName: any;
  //子表查询条件
  mainTableID: number = 0;
  cartypeList: any;
  carseriesList: any = [];

  @ViewChild("popContentCar")
  tplRef: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private formService: FormService,
    private _dicService: DicService,
    private route: ActivatedRoute,
    private router: Router,
    private _common: Common,
    private _state: GlobalState,
    private vcRef: ViewContainerRef
  ) {}
  ngAfterViewInit() {}
  ngOnInit() {
    this.formname = "carincome";
    this.mainTableID = _.toInteger(this.route.snapshot.paramMap.get("id"));
    //this.canUpdate = this.mainTableID > 0;
    const that = this;
    if (this.formname) {
      this.getViewName(this.formname).then(function() {
        that.getFormRoles();
      });
    }

    this.selectData = {};
    this.updateData = {};

    this.formService.getForms("car_type").then(
      data => {
        this.cartypeList = data.Data;
        this.popCarInfoGrid.load(data.Data);
        _.each(this.cartypeList, f => {
          if (!_.includes(this.carseriesList, f["CarSeries"])) {
            this.carseriesList.push({
              id: f["CarSeries"],
              text: f["CarSeries"]
            });
          }
        });
      },
      err => {}
    );
  }

  //根据视图名称获取表格和表单定义
  getViewName(formname: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.formService.getForms("form_set").then(
        data => {
          if (data.Data) {
            that.formView = _.find(data.Data, function(o) {
              return o["ViewType"] == "form" && o["FormName"] == formname;
            });
            if (that.formView) {
              that.tablename = that.formView["TableName"];

              // that.getFormSetSub().then(function (data) {
              //   let vn = [];
              //   _.each(data, f => {
              //     if (f['FormName'] == that.formView['ViewName']) {
              //       vn.push(f);
              //       that.subViewName = f;
              //     }
              //   });
              // });
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
      .getForms("vw_form_role/ViewName/" + this.formView["ViewName"])
      .then(data => {
        if (data.Data) {
          this.getFormField(data.Data);
        }
      });
  }
  //检查用户角色是否拥有字段权限
  checkRole(roleData: any, fieldName: string, canString: string) {
    const roleIds = sessionStorage.getItem("roleIds");
    const roleField = _.find(roleData, f => {
      return f["FieldName"] == fieldName;
    });
    //如果没有设置，或者设置了可读
    return (
      !roleField["RoleIds"] ||
      (roleField &&
        roleField["RoleIds"] &&
        roleField[canString] &&
        roleField[canString] == "1" &&
        roleField["RoleIds"].includes(roleIds))
    );
  }

  getFormField(roleData: any): void {
    this.loading = true;
    const that = this;
    //获取table定义
    this.formService.getFormsFieldByName(that.tablename).then(
      data => {
        if (data.Data) {
          const formFieldList = _.orderBy(data.Data, "OrderInd", "asc");

          async.eachSeries(
            formFieldList,
            function(field, callback) {
              if (that.checkRole(roleData, field["FieldName"], "CanRead")) {
                const cfg = that.setFormField(field);
                if (
                  cfg["add"] &&
                  that.checkRole(roleData, field["FieldName"], "CanAdd")
                ) {
                  that.configAddArr.push(cfg["add"]);
                }
                if (
                  cfg["update"] &&
                  that.checkRole(roleData, field["FieldName"], "CanUpdate")
                ) {
                  that.configUpdateArr.push(cfg["update"]);
                }
                //that.setDicByName(field);
                that.setSelectValue(field).then(() => {
                  callback();
                });
              }
            },
            function(err) {
              if (err) {
                console.log("err");
              } else {
                if (that.mainTableID > 0) {
                  that.config = that.configUpdateArr;
                } else {
                  that.config = that.configAddArr;
                }
                console.log(that.config);
                that.getDataList();
              }
            }
          );
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

  //设置表单字段
  setFormField(d) {
    let cfgAdd: FieldConfig;
    let cfgUpdate: FieldConfig;
    const placehd =
      d["DataSource"] == "list" || _.startsWith(d["DataSource"], "table")
        ? "--请选择--"
        : "输入" + d["Title"];

    if (d["CanAdd"]) {
      cfgAdd = {
        type: d["FormType"],
        label: d["Title"],
        name: d["FieldName"],
        width: d["Width"],
        width2: d["Width2"],
        placeholder: placehd,
        config: { placeholder: placehd }
      };
    }
    if (d["CanUpdate"]) {
      cfgUpdate = {
        type: d["FormType"],
        label: d["Title"],
        name: d["FieldName"],
        width: d["Width"],
        width2: d["Width2"],
        placeholder: placehd,
        config: { placeholder: placehd }
      };
    } 
    if (d["IsRequest"]) {
      if (cfgAdd) {
        cfgAdd.validation = [Validators.required];
      }
      if (cfgUpdate) {
        cfgUpdate.validation = [Validators.required];
      }
    }

    if (d["Default"] && cfgAdd) {
      if (_.toLower(d["Default"]) == "user") {
        cfgAdd.value = sessionStorage.getItem("userId");
      } else if (_.toLower(d["Default"]) == "date") {
        cfgAdd.value = this._common.getTodayObj();
      } else {
        cfgAdd.value = d["Default"];
      }
    }

    if (
      d["DataSource"] == "list" &&
      d["DicName"] &&
      d["DicName"].includes(",") > 0
    ) {
      //如果有列出选项列表
      const dicList = [];
      _.each(d["DicName"].split(","), d => {
        dicList.push({ id: d, text: d });
      });
      if(cfgAdd){
        cfgAdd["options"] = dicList;
        cfgAdd.config.minimumResultsForSearch = Infinity;
      }
      if(cfgUpdate){
        cfgUpdate["options"] = dicList;
        cfgUpdate.config.minimumResultsForSearch = Infinity;
      }
    }

    return { add: cfgAdd, update: cfgUpdate };
  }

  //设置词典下拉列表
  setDicByName(d) {
    return new Promise((resolve, reject) => {
      if (
        d["DataSource"] == "list" &&
        d["DicName"] &&
        d["DicName"].includes(",") == 0
      ) {
        //从词典中获取
        this._dicService.getDicByName(d["DicName"], list => {
          let cigAdd = _.find(this.configAddArr, f => {
            return f["name"] == d["FieldName"];
          });
          if (cigAdd) {
            cigAdd["options"] = list;
          }

          let cigUpdate = _.find(this.configUpdateArr, f => {
            return f["name"] == d["FieldName"];
          });
          if (cigUpdate) {
            cigUpdate["options"] = list;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  //设置下拉类别数据
  setSelectValue(field) {
    return new Promise((resolve, reject) => {
      if (_.startsWith(field["DataSource"], "table")) {
        //从数据表中获取,DataSource设置的格式：table_tableName_Id_Name
        const dataS = field["DataSource"].split("-");
        if (dataS.length >= 4) {
          this.formService.getForms(dataS[1]).then(
            d => {
              const data = d.Data;
              let list = [];
              _.each(data, dt => {
                let display = dt[dataS[3]];
                if (dataS.length >= 5) {
                  display = display + "|" + dt[dataS[4]];
                }
                if (dataS.length >= 6) {
                  display = display + "|" + dt[dataS[5]];
                }
                if (dataS.length >= 7) {
                  display = display + "|" + dt[dataS[6]];
                }

                list.push({ id: dt[dataS[2]], text: display });
              });

              let cigAdd = _.find(this.config, f => {
                return f["name"] == field["FieldName"];
              });
              if (cigAdd) {
                cigAdd["options"] = list;
              }
              let cigUpdate = _.find(this.configUpdateArr, f => {
                return f["name"] == field["FieldName"];
              });
              if (cigUpdate) {
                cigUpdate["options"] = list;
              }
              resolve();
            },
            err => {
              let cigAdd = _.find(this.config, f => {
                return f["name"] == field["FieldName"];
              });
              if (cigAdd) {
                cigAdd["options"] = [];
              }
              let cigUpdate = _.find(this.configUpdateArr, f => {
                return f["name"] == field["FieldName"];
              });
              if (cigUpdate) {
                cigUpdate["options"] = [];
              }
            }
          );
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
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
    if (this.tablename && this.mainTableID > 0) {
      this.formService.getForms(`${this.tablename}/${this.mainTableID}`).then(
        data => {
          if (data && data.Data)
            _.each(this.config, f => {
              let fieldValue = data.Data[0][f.name];
              if (fieldValue) {
                if (f.type === "datepicker" && _.isString(fieldValue)) {
                  fieldValue = this._common.getDateObject(fieldValue);
                }
                f.value = fieldValue;
                this.updateData[f.name] = fieldValue;
              }
            });
        },
        err => {}
      );
    }
  }

  checkVinno(vinno, orderid) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (that.mainTableID > 0) {
        resolve(1);
      }
      that.formService.getForms(`car_income/vinno/${vinno}`).then(
        data => {
          if (data && data.Data.length == 1) {
            resolve(0);
          } else {
            that.formService.getForms(`car_income/orderid/${orderid}`).then(
              data => {
                if (data && data.Data.length == 1) {
                  resolve(0);
                } else {
                  resolve(1);
                }
              },
              err => {}
            );
          }
        },
        err => {}
      );
    });
  }

  onUpdate(value: { [name: string]: any }) {
    const that = this;
    this.checkVinno(value["Vinno"], value["OrderId"]).then(d => {
      if (d == 1) {
        value["Id"] = this.mainTableID;
        _.each(this.config, f => {
          if (f.type === "datepicker" && value[f.name]) {
            value[f.name] = this._common.getDateString(value[f.name]);
          }
          //如果表单值未找到
          if (!value[f.name]) {
            if (this.selectData[f.name]) {
              //下拉列表中
              value[f.name] = this.selectData[f.name];
            } else if (this.updateData[f.name]) {
              //修改时列表中
              value[f.name] = this.updateData[f.name];
            } else {
              delete value[f.name];
            }
          }
        });

        console.log(value);
        if (value.UpdateTime) delete value.UpdateTime;
        this.formService.create(this.tablename, value).then(
          function(data) {
            if (_.isArray(data) && data.length == 1) {
              that.mainTableID = _.toInteger(data[0]);
              //that.canUpdate = true;
            }
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
      } else {
        that._state.notifyDataChanged("messagebox", {
          type: "warning",
          msg: "车架号或订单号已经存在，不能新增。",
          time: new Date().getTime()
        });
      }
    });
  }

  onChange(e) {
    if (e.target.innerText.includes("车系")) {
      this.popCarInfoGrid.load(
        _.filter(this.cartypeList, f => {
          return f["CarSeries"] == e.target.value;
        })
      );
    }
    this.selectData[e.target.name] = e.target.value;
  }
  onNew() {
    _.each(this.config, f => {
      f.value = "";
    });
    this.mainTableID = 0;
  }
  onBack() {
    this.router.navigate(["/pages/market/carstore"]);
  }

  //选择房间
  rowCarClicked(event): void {
    const fields = ["CarSeries","CarType", "CarTypeCode", "Config", "GuidePrice"];
    _.each(fields, fd => {
      _.each(this.config, f => {
        if (f["name"] == fd) {
          f["value"] = event.data[fd];
        }
      });
    });
  }
  showPopCar(event): void {
    _.delay(
      function(text) {
        $(".popover").css("max-width", "820px");
        $(".popover").css("min-width", "600px");
      },
      100,
      "later"
    );
  }
  onSearchCar(query: string = "") {
    this.popCarInfoGrid.setFilter(
      [
        { field: "CarSeries", search: query },
        { field: "CarType", search: query },
        { field: "TypeCode", search: query },
        { field: "Config", search: query }
      ],
      false
    );
  }
}
