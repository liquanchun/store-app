import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { NgbdModalContent } from '../../../../modal-content.component'
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import * as _ from 'lodash';
import { RoleService } from './role.services';

import { RoleModel } from '../../models/role.model';
import { GlobalState } from '../../../../global.state';

@Component({
  selector: 'app-sys-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers: [RoleService],
})
export class RoleComponent implements OnInit, AfterViewInit {
  private roles: any;
  
  private selectedRole: any;

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '角色',
      name: 'roleName',
      placeholder: '输入角色',
    }
  ];

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
    private roleService: RoleService) {
      this.toastyConfig.position = 'top-center';
  }

  ngOnInit() {
    this.getRoles();
  }

  ngAfterViewInit() {

  }

  getRoles(): void {
    const that = this;
    this.roleService.getRoles().then(function (roles) {
      that.roles = roles;
      that._state.notifyDataChanged('role.dataChanged', roles);
    });
  }

  onNewRole() {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.title = '新增房间信息';
    modalRef.componentInstance.config = this.config;
    modalRef.componentInstance.saveFun = (result, closeBack) => {
      const roleobj = JSON.parse(result);
      this.roleService.create(roleobj.roleName).then((data) => {
          closeBack();
          this.toastOptions.msg = "新增成功。";
          this.toastyService.success(this.toastOptions);
          this.getRoles();
        },
        (err) => {
          this.toastOptions.msg = err;
          this.toastyService.error(this.toastOptions);
        }
      )
    };
  }

  // 删除选择的角色
  onDeleteRole() {

    if (window.confirm('你确定要删除吗?')) {
      this.roleService.delete(this.selectedRole.id).then((data) => {
        this.toastOptions.msg = "删除成功。";
        this.toastyService.success(this.toastOptions);
        this.getRoles();
      }, (err) => {
        this.toastOptions.msg = err;
        this.toastyService.error(this.toastOptions);
      });
    }
  }

  onSelectedRole(role) {
    this.selectedRole = role;
    this._state.notifyDataChanged('role.selectedChanged', role);
  }
}
