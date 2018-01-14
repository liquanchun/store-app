import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../modal-content.component'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SendsetService } from './sendset.services';
import { GlobalState } from '../../../global.state';
import { Common } from '../../../providers/common';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-sendset',
  templateUrl: './sendset.component.html',
  styleUrls: ['./sendset.component.scss'],
  providers: [SendsetService],
})

export class SendsetComponent implements OnInit, AfterViewInit {

  title = '短信设置';
  query: string = '';
  smsurl: string = '';
  account = 100;
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  constructor(
    private modalService: NgbModal,
    private sendsetService: SendsetService,
    private _common: Common,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
      this.toastyConfig.position = 'top-center';
  }
  ngOnInit() {
    this.getDataList();
  }
  ngAfterViewInit() {

  }
  getDataList(): void {
    this.sendsetService.getSendsets().then((data) => {
      const ss = _.first(data);
      if (ss) {
        this.smsurl = ss.ipAddress;
      }
    }, (err) => {
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }

  saveSet() {
    const that = this;
    that.sendsetService.create({ iPAddress: this.smsurl }).then((data) => {
      that.toastOptions.msg = "保存成功。";
      that.toastyService.success(that.toastOptions);
    },
      (err) => {
        that.toastOptions.msg = err;
        that.toastyService.error(that.toastOptions);
      }
    )
  }
}
