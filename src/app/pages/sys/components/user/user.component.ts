import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../../modal-content.component'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import * as $ from 'jquery';
import * as _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';

import { UserService } from './user.services';
import { UserModel } from '../../models/user.model';
import { GlobalState } from '../../../../global.state';


@Component({
  selector: 'app-sys-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [UserService],
})
export class UserComponent implements OnInit, AfterViewInit {

  public loading = false;
  private roles: any = [];
  settings = {
    mode: 'external',
    actions: {
      columnTitle: '操作'
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    hideSubHeader: true,
    columns: {
      id: {
        title: 'Id',
        type: 'number',
        editable: false,
        filter: false,
        width: '30px',
      },
      userName: {
        title: '用户名',
        type: 'string',
        filter: false,
        width: '80px',
      },
      userId: {
        title: '用户ID',
        type: 'string',
        filter: false,
        width: '80px',
      },
      mobile: {
        title: '电话',
        type: 'string',
        filter: false,
        width: '80px',
      },
      weixin: {
        title: '微信',
        type: 'string',
        filter: false,
        width: '80px',
      },
      roleNames: {
        title: '角色',
        type: 'string',
        filter: false,
        width: '80px',
      },
      isValid: {
        title: '是否启用',
        type: 'bool',
        filter: false,
      },
    }
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '用户名',
      name: 'userName',
      placeholder: '输入用户名',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '用户Id',
      name: 'userId',
      placeholder: '输入用户Id',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '密码',
      name: 'pwd',
      placeholder: '输入密码',
      password: true,
    },
    {
      type: 'input',
      label: '电话',
      name: 'mobile',
      placeholder: '输入电话',
    },
    {
      type: 'input',
      label: '微信',
      name: 'weixin',
      placeholder: '输入微信',
    },
    {
      type: 'check',
      label: '角色',
      name: 'roleIds',
      check: 'checkbox',
      options: this.roles
    },
    {
      type: 'truefalse',
      label: '是否启用',
      name: 'isValid',
    },
  ];
  source: LocalDataSource = new LocalDataSource();
  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(
    private modalService: NgbModal,
    private _state: GlobalState,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private userService: UserService) {

    this.toastyConfig.position = 'top-center';
    const that = this;
    this._state.subscribe('role.dataChanged', (roles) => {
      _.each(roles, r => {
        that.roles.push({ id: r.id, name: r.roleName });
      })
    });
    this._state.subscribe('role.selectedChanged', (role) => {
      this.onSearch(role.roleName);
    });
  }

  ngOnInit() {
    this.getUserList();
  }

  getUserList() {
    this.loading = true;
    this.userService.getUsers().then((data) => {
      this.source.reset();
      this.source.load(data);
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.toastOptions.msg = err;
      this.toastyService.error(this.toastOptions);
    });
  }

  ngAfterViewInit() {
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'roleNames', search: query },
    ], false);
  }
  onNewUser() {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增用户';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      let user = JSON.parse(result);
      user.pwd = Md5.hashStr(user.pwd).toString();
      that.userService.create(user).then((data) => {
        closeBack();
        that.toastOptions.msg = "新增成功。";
        that.toastyService.success(that.toastOptions);
        that.getUserList();
      },
        (err) => {
          that.toastOptions.msg = err;
          that.toastyService.error(that.toastOptions);
        }
      )
    };
  }

  onEdit(event) {
    const that = this;
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '修改用户';
    let newConfig = this.config;
    _.remove(newConfig, f => { return f.name == 'pwd'; });
    modalRef.componentInstance.config = newConfig;
    modalRef.componentInstance.formValue = event.data;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      that.userService.update(event.data.id, JSON.parse(result)).then((data) => {
        closeBack();
        that.toastOptions.msg = "修改成功。";
        that.toastyService.success(that.toastOptions);
        that.getUserList();
      },
        (err) => {
          that.toastOptions.msg = err;
          that.toastyService.error(that.toastOptions);
        }
      )
    };
  }
  // 删除选择的用户
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.userService.delete(event.data.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getUserList();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }
}
