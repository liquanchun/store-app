import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import { DynamicFormComponent }
  from '../../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';
import { Common } from '../../../../providers/common';
//import { FileUploader } from "ng2-file-upload";
import { Config } from '../../../../providers/config';
import { Observable } from 'rxjs/Rx';  
import { Http, RequestOptions, Headers, Response } from '@angular/http';  
import * as $ from 'jquery';
import * as _ from 'lodash';

import { DicService } from '../../../basedata/dic/dic.services';
import { SupplierService } from '../../supplier/supplier.services';
import { UserService } from '../../../sys/components/user/user.services';
import { OrgService } from '../../../sys/components/org/org.services';

import { GlobalState } from '../../../../global.state';
import { GoodsService } from '../../goods/goods.services';
import { retry } from 'rxjs/operator/retry';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-goodsnew',
  templateUrl: './goodsnew.component.html',
  styleUrls: ['./goodsnew.component.scss'],
  providers: [DicService, GoodsService, SupplierService, UserService, OrgService],
})
export class GoodsNewComponent implements OnInit {

  title = '新增产品入库';
  isSaved: boolean = false;
  isEnable: boolean = false;
  private goodsid = 0;
  private isNewMenu: boolean = true;

  private goods: any = {
    name: '',
    typeId: '',
    unit: '',
    goodsCode: '',
    goodsNo: '',
    minAmount: '',
    remark: '',
    price: '',
    imageName: ''
  };
  private typeList: any;
  private fileName: string;
  //public uploader: FileUploader;

  constructor(
    private http: Http,
    private modalService: NgbModal,
    private goodsService: GoodsService,
    private _common: Common,
    private _dicService: DicService,
    private _router: Router,
    private route: ActivatedRoute,
    public config: Config,
    private _state: GlobalState) {
  }
  //http://localhost:3000/upload  
  //url: this.config.server + "api/uploads",
  ngOnInit() {
    // this.uploader = new FileUploader({
    //   url: "http://localhost:3000/upload ",
    //   method: "POST",
    //   itemAlias: "uploadedfile"
    // });

    this.goodsid = this.route.snapshot.queryParams['id'];
    this.isNewMenu = !(this.goodsid > 0);
    if (this.goodsid > 0) {
      this.title = "修改产品信息";
      this.getGoodsById(this.goodsid);
    }
    this.onGetGoodsType();
  }

  getGoodsById(id) {
    this.goodsService.getGoodsById(id).then(data => {
      console.log(data);
      this.goods = data;
    });
  }
  onConfirm() {
    const that = this;
    if (!this.goods.goodsCode || !this.goods.goodsNo || !this.goods.name || !this.goods.typeId) {
      this._state.notifyDataChanged("messagebox", { type: 'warning', msg: '请填写完整。', time: new Date().getTime() });
      return;
    }
    this.isSaved = true;
    if (this.isNewMenu) {
      this.goodsService.create(this.goods).then(function (menu) {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '保存成功。', time: new Date().getTime() });
        that.isSaved = false;
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        that.isSaved = false;
      });
    } else {
      this.goodsService.update(this.goodsid, this.goods).then(function (menu) {
        this._state.notifyDataChanged("messagebox", { type: 'success', msg: '保存成功。', time: new Date().getTime() });
        that.isSaved = false;
      }, (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
        that.isSaved = false;
      });
    }
  }

  onGetGoodsType() {
    this._dicService.getDicByName('产品类别', (data) => {
      this.typeList = data;
    });
  }
  selectedFileOnChanged(event: any) {
    // 打印文件选择名称
    this.fileName = event.target.value;
    this.uploadFile();
  }

  onBack() {
    this._router.navigate(['/pages/store/goods']);
  }

  uploadFile() {
    // const that = this;
    // //上传跨域验证
    // this.uploader.queue[0].withCredentials = false;
    // //成功之后的回调函数
    // this.uploader.queue[0].onSuccess = function (response, status, headers) {
    //   if (status == 200) {
    //     // 上传文件后获取服务器返回的数据
    //     //let tempRes = JSON.parse(response);
    //     that.goods.imageName = response;
    //     console.log(that.goods.imageName);
    //     //picId.src = response.replace('"', '').replace('"', '');
    //     //nguploader.value = "";
    //     that.toastOptions.title = "提示信息";
    //     that.toastOptions.msg = "上传成功。";
    //     that.toastyService.success(that.toastOptions);
    //   }
    // };
    // this.uploader.queue[0].upload(); // 开始上传
  }

}
