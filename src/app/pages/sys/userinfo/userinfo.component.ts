import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { UserService } from './../../sys/components/user/user.services';

@Component({
  selector: 'app-user-info',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss'],
  providers: [UserService],
})
export class UserInfoComponent implements OnInit, AfterViewInit {

  private user: any = { userId: '', userName: '', weixin: '', mobile: '' };
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(private _userService: UserService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, ) {
    this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    const userId = sessionStorage.getItem('userId');
    this._userService.getUsersById(userId).then((data) => {
      if (!data) {
        this.toastOptions.msg = '用户不存在。';
        this.toastyService.error(this.toastOptions);
      } else {
        this.user = data;
      }
    },
      (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
  }

  onUpdate() {
    this._userService.update(this.user.id, this.user).then((data) => {
      this.toastOptions.msg = '修改成功。';
      this.toastyService.info(this.toastOptions);
    },
      (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
  }

  ngAfterViewInit() {

  }
}
