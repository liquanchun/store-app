import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GlobalState } from '../../global.state';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import * as _ from 'lodash';
@Component({
  selector: 'basedata',
  template: `<ng2-toasty></ng2-toasty><router-outlet></router-outlet>`,
})
export class BaseDataComponent implements OnInit {
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  time: string;
  constructor(private _state: GlobalState,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
  ) {
    this.toastyConfig.position = 'top-center';
    this._state.subscribe('messagebox', (options) => {
      console.log('options');
      console.log(options);
      console.log('this.time');
      console.log(this.time);

      if (this.time != options.time) {
        this.time = options.time;
        this.toastOptions.msg = options.msg;
        if (options.type == 'error') {
          this.toastOptions.timeout = 10 * 1000;
        }

        switch (options.type) {
          case 'default': this.toastyService.default(this.toastOptions); break;
          case 'info': this.toastyService.info(this.toastOptions); break;
          case 'success': this.toastyService.success(this.toastOptions); break;
          case 'wait': this.toastyService.wait(this.toastOptions); break;
          case 'error': this.toastyService.error(this.toastOptions); break;
          case 'warning': this.toastyService.warning(this.toastOptions); break;
        }
        _.delay(function (text) {
          $("#toasty.toasty-position-top-center").css("top", "60px");
        }, 100, 'later');
      }
    });
  }

  ngOnInit() {
  }
}