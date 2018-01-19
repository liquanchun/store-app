import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { RoleComponent } from '../components/role/role.component';
import { UserComponent } from '../components/user/user.component';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
})
export class UserRoleComponent implements OnInit, AfterViewInit {
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };
  constructor(
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
  ) {
    this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }
  onMessage(event) {
    this.toastOptions.msg = event.msg;
    if (event.type == 'warning') {
      this.toastyService.warning(this.toastOptions);
    }
    if (event.type == 'success') {
      this.toastyService.success(this.toastOptions);
    }
    if (event.type == 'error') {
      this.toastyService.error(this.toastOptions);
    }
  }
}
