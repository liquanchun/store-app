import { Component } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import { UserService } from "../../pages/sys/components/user/user.services";
import {
  ToastyService,
  ToastyConfig,
  ToastOptions,
  ToastData
} from "ng2-toasty";
import { HttpService } from "./../../providers/httpClient";
import { Md5 } from "ts-md5/dist/md5";
import * as _ from "lodash";
@Component({
  selector: "login",
  templateUrl: "./login.html",
  styleUrls: ["./login.scss"],
  providers: [UserService]
})
export class Login {
  public form: FormGroup;
  public loginUserId: AbstractControl;
  public loginPassword: AbstractControl;
  public submitted: boolean = false;

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap"
  };

  constructor(
    private _router: Router,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _userService: UserService,
    private _httpService: HttpService,
    fb: FormBuilder
  ) {
    this.toastyConfig.position = "top-center";
    this.form = fb.group({
      loginUserId: [
        "",
        Validators.compose([Validators.required, Validators.minLength(4)])
      ],
      loginPassword: [
        "",
        Validators.compose([Validators.required, Validators.minLength(4)])
      ]
    });

    this.loginUserId = this.form.controls["loginUserId"];
    this.loginPassword = this.form.controls["loginPassword"];
  }

  public onSubmit(values: Object): void {
    if (this.form.valid) {
      this.submitted = true;
      if (!this.loginUserId.value || !this.loginPassword.value) {
        this.toastOptions.msg = "用户ID或密码不能为空。";
        this.toastyService.error(this.toastOptions);
        return;
      }
      const token = {
        UserId: this.loginUserId.value,
        Pwd: Md5.hashStr(this.loginPassword.value).toString()
      };
      //进行授权验证
      this._userService.userAuth("tokenauth/login", token).then(data => {
        if (data.data) {
          this._httpService.setToken(data.data.accessToken);
          this.checkUserInfo();
        } else {
          this.toastOptions.msg = data.msg;
          this.toastyService.error(this.toastOptions);
        }
      });
    }
  }

  checkUserInfo() {
    this._userService.getUsersById(this.loginUserId.value).then(
      data => {
        if (!data) {
          this.toastOptions.msg = "用户不存在。";
          this.toastyService.error(this.toastOptions);
        } else {
          const mima = data["pwd"];
          const pd = Md5.hashStr(this.loginPassword.value).toString();
          if (mima == pd) {
            sessionStorage.setItem("user_id", data["id"])
            sessionStorage.setItem("pwd", pd);
            sessionStorage.setItem("userName", data["userName"]);
            sessionStorage.setItem("userId", this.loginUserId.value);
            sessionStorage.setItem("roleIds", _.trim(data["roleIds"], ","));

            this.toastOptions.msg = "登录成功。";
            this.toastyService.success(this.toastOptions);
            this._router.navigate(["/pages/dashboard"]);
          } else {
            this.toastOptions.msg = "密码错误。";
            this.toastyService.error(this.toastOptions);
          }
        }
        this.submitted = false;
      },
      err => {
        this.submitted = false;
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      }
    );
  }
}
