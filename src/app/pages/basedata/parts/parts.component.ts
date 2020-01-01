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

import { PartsService } from "./parts.services";
import { GlobalState } from "../../../global.state";
import { Common } from "../../../providers/common";

import * as $ from "jquery";
import * as _ from "lodash";

@Component({
  selector: "app-parts",
  templateUrl: "./parts.component.html",
  styleUrls: ["./parts.component.scss"],
  providers: [PartsService]
})
export class PartsComponent implements OnInit {
  loading = false;
  title = "装饰项目";
  query: string = "";

  settings = {
    pager: {
      perPage: 15
    },
    mode: "external",
    actions: {
      columnTitle: "操作"
    },
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
        title: "成本价",
        type: "string",
        filter: false
      },
      sale_price: {
        title: "销售价",
        type: "string",
        filter: false
      },
      parttype: {
        title: "套餐来源",
        type: "string",
        filter: false
      },
      createdBy: {
        title: "录入人",
        type: "string",
        filter: false
      }
    }
  };
  source: LocalDataSource = new LocalDataSource();
  config: FieldConfig[] = [
    {
      type: "select",
      label: "分类",
      name: "type_name",
      placeholder: "输入分类",
      options: [
        { id: "商品", text: "商品" },
        { id: "服务", text: "服务" }
      ],
      validation: [Validators.required]
    },
    {
      type: "input",
      label: "项目名称",
      name: "item_name",
      placeholder: "输入项目名称",
      validation: [Validators.required]
    },
    {
      type: "input",
      label: "项目编号",
      name: "item_no",
      placeholder: "输入项目编号",
      validation: [Validators.required]
    },
    {
      type: "input",
      label: "成本价",
      name: "cost_price",
      placeholder: "输入成本价",
      validation: [Validators.required]
    },
    {
      type: "input",
      label: "销售价",
      name: "sale_price",
      placeholder: "输入销售价",
      validation: [Validators.required]
    },
    {
      type: "select",
      label: "套餐来源",
      name: "parttype",
      options: [
        { id: "DN", text: "DN" },
        { id: "HZ", text: "HZ" }
      ],
      value: "DN",
      validation: [Validators.required]
    }
  ];

  constructor(
    private modalService: NgbModal,
    private partsService: PartsService,
    private _common: Common,
    private _state: GlobalState
  ) {}
  ngOnInit() {
    this.getDataList();
  }

  onSearch(query: string = "") {}

  getDataList(): void {
    this.loading = true;
    this.partsService.getParts().then(
      data => {
        this.loading = false;
        if (data.Data && data.Data.length > 0) {
          this.source.load(data.Data);
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

  onCreate(): void {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = "新增装饰项目";
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let data = JSON.parse(result);
      data["createdBy"] = sessionStorage.getItem("userName");
      that.partsService.create(data).then(
        data => {
          closeBack();
          this._state.notifyDataChanged("messagebox", {
            type: "success",
            msg: "新增成功。",
            time: new Date().getTime()
          });
          that.getDataList();
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

  onEdit(event) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = "修改装饰项目";
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let data = JSON.parse(result);
      data["createdBy"] = sessionStorage.getItem("userName");
      data["Id"] = event.data["Id"];
      that.partsService.update(data).then(
        data => {
          closeBack();
          this._state.notifyDataChanged("messagebox", {
            type: "success",
            msg: "修改成功。",
            time: new Date().getTime()
          });
          that.getDataList();
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

  onDelete(event) {
    if (window.confirm("你确定要删除吗?")) {
      this.partsService.delete(event.data.Id).then(
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
}
