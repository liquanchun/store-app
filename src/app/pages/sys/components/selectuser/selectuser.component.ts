import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BaThemeConfigProvider } from '../../../../theme';
import { UserService } from '../user/user.services';
import { GlobalState } from '../../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'app-sys-selectuser',
  templateUrl: './selectuser.html',
  styleUrls: ['./selectuser.scss'],
  providers: [UserService],
})
export class SelectUserComponent implements OnInit {

  @Output() foo = new EventEmitter<string>();

  private dashboardColors = this._baConfig.get().colors.dashboard;

  private userList: any;
  private newTodoText: string = '';
  private usersfilter: any;
  private orgId: number;
  constructor(private _baConfig: BaThemeConfigProvider,
    private userService: UserService,
    private _state: GlobalState) {

    const that = this;
    this.getUserList();
    this._state.subscribe('org.selectedChanged', (org) => {
      if (org && org.data) {
        that.orgId = org.data.id;
        _.each(that.userList, function (u, i) {
          if (u['orgId'] && u['orgId'] === org.data.id) {
            that.userList[i].isChecked = true;
          }
        });
      }
    });
  }

  ngOnInit() {

  }

  getUserList() {
    const that = this;
    this.userService.getUsers().then(function (users) {
      that.userList = users;
      that.usersfilter = users;
      that.userList.forEach((item) => {
        item.color = that._getRandomColor();
      });
    });
  }

  getNotDeleted() {
    return this.userList;
  }

  addToDoItem($event) {
    if (($event.which === 1 || $event.which === 13) && this.newTodoText.trim() != '') {

      this.userList.unshift({
        text: this.newTodoText,
        color: this._getRandomColor(),
      });
      this.newTodoText = '';
    }
  }

  nodeChecked($event, user) {
    const that = this;
    user.isChecked = $event.target.checked;
    if (this.orgId) {
      _.each(this.userList, function (u, i) {
        if (u['userId'] === user.userId) {
          that.userList[i].orgId = user.isChecked ? that.orgId : 0;
        }
      });
    }
    this.foo.emit(user);
  }

  onKey(event: any) { // without type info
    this.userList = _.filter(this.usersfilter, function (o) {
      return o['userName'] && o['userName'].indexOf(event.target.value) > -1
        || o['userId'] && o['userId'].indexOf(event.target.value) > -1
        || o['mobile'] && o['mobile'].indexOf(event.target.value) > -1
        || o['weixin'] && o['weixin'].indexOf(event.target.value) > -1;
    });
  }

  _getRandomColor() {
    const colors = Object.keys(this.dashboardColors).map(key => this.dashboardColors[key]);

    const i = Math.floor(Math.random() * (colors.length - 1));
    return colors[i];
  }
}
