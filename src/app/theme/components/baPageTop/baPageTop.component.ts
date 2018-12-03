import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbdModalContent } from '../../../modal-content.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { GlobalState } from '../../../global.state';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { UserService } from '../../../pages/sys/components/user/user.services';
import { Md5 } from 'ts-md5/dist/md5';
import * as _ from 'lodash';
@Component({
  selector: 'ba-page-top',
  templateUrl: './baPageTop.html',
  styleUrls: ['./baPageTop.scss'],
  providers: [UserService],
})
export class BaPageTop {

  public isScrolled: boolean = false;
  public isMenuCollapsed: boolean = false;
  public userId: string = '';
  public userName:string = '';
  config: FieldConfig[] = [
    {
      type: 'input',
      label: '原密码',
      name: 'oldpwd',
      placeholder: '输入原密码',
      validation: [Validators.required],
      password: true,
    },
    {
      type: 'input',
      label: '新密码',
      name: 'pwd',
      placeholder: '输入新密码',
      validation: [Validators.required],
      password: true,
    },
    {
      type: 'input',
      label: '重复新密码',
      name: 'newpwd2',
      placeholder: '输入新密码',
      validation: [Validators.required],
      password: true,
    },
  ];
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(private _router: Router,
    private modalService: NgbModal,
    private _userService: UserService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
    this.userId = sessionStorage.getItem("userId");
    this.userName = sessionStorage.getItem('userName');
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  public changpwd() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改密码';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let user = JSON.parse(result);
      user.pwd = Md5.hashStr(user.pwd).toString();
      const oldPwd = sessionStorage.getItem('pwd');

      if (Md5.hashStr(user.oldpwd).toString() != oldPwd) {
        that.toastOptions.msg = "原密码错误。";
        that.toastyService.error(that.toastOptions);
      } else {
        user.Id = sessionStorage.getItem('user_id');
        delete user.oldpwd;
        delete user.newpwd2;
        that._userService.updatePwd(user).then((data) => {
          closeBack();
          that.toastOptions.msg = "修改密码成功。";
          that.toastyService.success(that.toastOptions);
        },
          (err) => {
            that.toastOptions.msg = err;
            that.toastyService.error(that.toastOptions);
          }
        )
      }
    };
  }

  public userInfo(){
    this._router.navigate(['/pages/sys/userinfo']);
  }
  public signout() {
    //Clear userid and rediction to login page
    sessionStorage.removeItem("userId");
    this._router.navigate(['login']);
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }

  public openMenu(event: any) {
    const menu = _.trim(event.target.textContent);
    this._state.notifyDataChanged('menu.isChanged', menu);
    return false;
  }
}
