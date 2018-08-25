import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { UserService } from './../../sys/components/user/user.services';
import { GlobalState } from '../../../global.state';
@Component({
  selector: 'app-user-info',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss'],
  providers: [UserService],
})
export class UserInfoComponent implements OnInit, AfterViewInit {

  private user: any = { userId: '', userName: '', weixin: '', mobile: '' };

  constructor(private _userService: UserService,
    private _state: GlobalState,
  ) {
  }

  ngOnInit() {
    const userId = sessionStorage.getItem('userId');
    this._userService.getUsersById(userId).then((data) => {
      if (!data) {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: '用户不存在。', time: new Date().getTime() });
      } else {
        this.user = data;
      }
    },
      (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
  }

  onUpdate() {
    this._userService.update(this.user.id, this.user).then((data) => {
      this._state.notifyDataChanged("messagebox", { type: 'success', msg: "修改成功。", time: new Date().getTime() });
    },
      (err) => {
        this._state.notifyDataChanged("messagebox", { type: 'error', msg: err, time: new Date().getTime() });
      });
  }

  ngAfterViewInit() {

  }
}
