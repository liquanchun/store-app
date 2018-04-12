import { Component, ViewChild, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import { NgbdModalContent } from '../../../../modal-content.component'
import { OrgService } from '../../components/org/org.services';
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
  providers: [UserService, OrgService],
})
export class UserComponent implements OnInit, AfterViewInit {

  @Input() editable: boolean = true;
  @Input() checkable: boolean = false;
  @Output()
  message = new EventEmitter();

  public loading = false;
  private roles: any = [];
  newSettings;
  settings = {
    pager: {
      perPage: 15
    },
    selectMode: '',
    mode: 'external',
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
      userName: {
        title: '用户名',
        type: 'string',
        filter: false,
      },
      userId: {
        title: '用户ID',
        type: 'string',
        filter: false,
      },
      orgIdTxt: {
        title: '所属部门',
        type: 'string',
        filter: false,
      },
      mobile: {
        title: '电话',
        type: 'string',
        filter: false,
      },
      tel: {
        title: '分机',
        type: 'string',
        filter: false,
      },
      works: {
        title: '岗位',
        type: 'string',
        filter: false,
      },
      title: {
        title: '分机',
        type: 'string',
        filter: false,
      },
      roleNames: {
        title: '角色',
        type: 'string',
        filter: false,
      },
      isValid: {
        title: '是否启用',
        type: 'bool',
        filter: false,
      }
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
      label: '分机',
      name: 'tel',
      placeholder: '输入分机',
    },
    {
      type: 'input',
      label: '岗位',
      name: 'works',
      placeholder: '输入岗位',
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

  userData: any;
  selectOrg: any;
  orgList: any;

  selectUser: any = [];

  constructor(
    private modalService: NgbModal,
    private _state: GlobalState,
    private _orgService: OrgService,
    private userService: UserService) {

    const that = this;
    this._state.subscribe('role.dataChanged', (roles) => {
      _.each(roles, r => {
        that.roles.push({ id: r.id, name: r.roleName });
      })
    });
    this._state.subscribe('role.selectedChanged', (role) => {
      this.onSearchRole(role.roleName);
    });
    this._state.subscribe('org.selectedChanged', (org) => {
      this.selectOrg = org.data;
      this.onSearchOrg(org.data.id);
    });
  }

  ngOnInit() {
    if (this.checkable) {
      this.settings.selectMode = 'multi';
      this.settings['actions'] = false;
      this.newSettings = Object.assign({}, this.settings)
    } else {
      this.settings['actions'] = {
        columnTitle: '操作',
        edit: true,
        delete: true
      };
      this.newSettings = Object.assign({}, this.settings);
    }
    this.getUserList();
  }

  getUserList() {
    this.loading = true;
    this.userService.getUsers().then((data) => {
      this.source.reset();
      this.source.load(data);
      this.userData = data;
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.message.emit({ type: 'error', msg: err });
    });
    this._orgService.getAll().then((data) => {
      this.orgList = data;
    });
  }

  ngAfterViewInit() {

  }
  //选择房间
  rowClicked(event): void {
    if (this.checkable) {
      if (event.isSelected) {
        this.selectUser.push({ id: event.data.id, name: event.data.userName });
      } else {
        _.remove(this.selectUser, function (n) {
          return n['id'] == event.data.id;
        });
      }
    }
  }

  onSearchRole(orgid: number) {
    this.source.reset();
    this.source.load(_.filter(this.userData, f => { return f['roleNames'].indexOf(orgid) > -1; }));
  }
  onSearchOrg(orgid: number) {
    this.source.reset();
    this.source.load(_.filter(this.userData, f => { return f['orgId'] == orgid; }));
  }
  onSearch(query: string = '') {
    this.source.setFilter([
      { field: 'userName', search: query },
    ], false);
  }
  onSetOrgClick(org) {
    const that = this;
    if (this.selectUser) {
      let userIds = [];
      _.each(this.selectUser, f => { userIds.push(f.id); });
      that._orgService.createOrg(org.id, _.toString(userIds)).then((data) => {
        that.message.emit({ type: 'success', msg: "设置成功。" });
        that.getUserList();
      });
    } else {
      that.message.emit({ type: 'warning', msg: "请勾选要设置的用户。" });
    }
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
        that.message.emit({ type: 'success', msg: "新增成功。" });
        that.getUserList();
      },
        (err) => {
          that.message.emit({ type: 'error', msg: err });
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
        that.message.emit({ type: 'success', msg: "修改成功。" });
        that.getUserList();
      },
        (err) => {
          that.message.emit({ type: 'error', msg: err });
        }
      )
    };
  }
  // 删除选择的用户
  onDelete(event) {
    if (window.confirm('你确定要删除吗?')) {
      this.userService.delete(event.data.id).then((data) => {
        this.message.emit({ type: 'success', msg: "删除成功。" });
        this.getUserList();
      }, (err) => {
        this.message.emit({ type: 'error', msg: err });
      });
    }
  }
}
