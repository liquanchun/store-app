import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'app-sys-function',
  templateUrl: './function.component.html',
  styleUrls: ['./function.component.scss']
})
export class FunctionComponent implements OnInit, AfterViewInit {

  private isNewRole: boolean;
  private isNewUser: boolean;

  private roles: any;
  private closeResult: string;
  
  private selectedRole: any;
  private selectedUser: any;

  private newRoleName: string;

  private smartTableData: any;

  private userForm: FormGroup;
  private userid: AbstractControl;
  private username: AbstractControl;
  private mobile: AbstractControl;
  private weixin: AbstractControl;
  private email: AbstractControl;
  private password: AbstractControl;
  private isvalid: AbstractControl;

  private submitted: boolean = false;

  private editUser: any;

  constructor(private modalService: NgbModal, fb: FormBuilder) {
    this.userForm = fb.group({
      'userid': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'mobile': ['', Validators.compose([Validators.required, Validators.minLength(11)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'weixin': [''],
      'email': [''],
      'isvalid': [''],
    });

    this.userid = this.userForm.controls['userid'];
    this.username = this.userForm.controls['username'];
    this.mobile = this.userForm.controls['mobile'];
    this.weixin = this.userForm.controls['weixin'];
    this.email = this.userForm.controls['email'];
    this.password = this.userForm.controls['password'];
    this.isvalid = this.userForm.controls['isvalid'];
  }

  ngOnInit() {
    this.isNewRole = true;
    this.roles = [{ role_id: 100000, role_name: '管理员' }, { role_id: 100002, role_name: '前台' }];
    this.smartTableData = [
      {
        id: 1,
        firstName: 'Mark',
        lastName: 'Otto',
        username: '@mdo',
        email: 'mdo@gmail.com',
        age: '28'
      },
      {
        id: 2,
        firstName: 'Jacob',
        lastName: 'Thornton',
        username: '@fat',
        email: 'fat@yandex.ru',
        age: '45'
      }];
  }

  ngAfterViewInit() {
    let that = this;
    jQuery('#myList a').click(function (e) {
      e.preventDefault();
      jQuery('#myList a').removeClass('active');
      jQuery(this).tab('show');
    });
    jQuery('tbody tr td').click(function (e) {
      e.preventDefault();
      jQuery(this).parent().parent().children('tr').children('td').removeClass('selectedcolor');
      jQuery(this).parent().children('td').addClass('selectedcolor');
      that.selectedUser = {
        user_id: jQuery(this).parent().children('td:eq(1)').text(),
        user_name: jQuery(this).parent().children('td:eq(2)').text()
      };
    });
  }

  onSubmit(values: Object): void {
    this.submitted = true;

    if (this.userForm.valid) {
      // your code goes here
      console.log(values);
      console.log({
        user_id: this.userid.value,
        user_name: this.username.value,
        mobile: this.mobile.value,
        weixin: this.weixin.value,
        email: this.email.value,
        pwd: this.password.value,
        isvalid: this.isvalid.value,
      });
      //sessionStorage.setItem('userId', this.userId.value);
    }
  }

  onSaveRole(event) {
    this.isNewRole = !this.isNewRole;
    if (this.isNewRole) {
      if (this.newRoleName) {
        // TODO
        this.roles.push({ role_id: 100004, role_name: this.newRoleName });
        this.newRoleName = '';
      } else {
        alert('角色名称不能为空。');
      }
    }
  }
  // 删除选择的角色
  onDeleteRole(content) {
    let that = this;
      _.remove(that.roles, r => r['role_id'] === that.selectedRole.role_id);
      that.selectedRole = null;
  }

  onSelectedRole(role) {
    this.selectedRole = role;
  }

  onNewUser() {
    this.isNewUser = true;
  }

  onSaveUser(event) {
    console.log(this.editUser);
    this.isNewUser = false;
  }

  onBack() {
    this.isNewUser = false;
  }
  // 删除选择的用户
  onDeleteUser(content) {
    let that = this;
  }

}
