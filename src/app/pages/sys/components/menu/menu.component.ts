import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { MenuService } from './menu.services';
import { RoleService } from './../role/role.services';
import { GlobalState } from '../../../../global.state';
import { FieldConfig } from '../../../../theme/components/dynamic-form/models/field-config.interface';
import { DynamicFormComponent }
  from '../../../../theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';

import * as $ from 'jquery';
import * as _ from 'lodash';

const actionMapping: IActionMapping = {
  mouse: {
    contextMenu: (tree, node, $event) => {
      $event.preventDefault();
      alert(`context menu for ${node.data.name}`);
    },
    dblClick: (tree, node, $event) => {
      if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    },
    click: (tree, node, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(tree, node, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event);
    },
  },
  keys: {
    [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`),
  },
};

@Component({
  selector: 'app-sys-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [MenuService, RoleService],
})
export class MenuComponent implements OnInit, AfterViewInit {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  private isNewMenu: boolean;

  private selectedMenu: any;

  private newMenuName: string;

  nodes = [
    {
      id: 1,
      name: 'root1',
      isExpanded: true,
      children: [
        {
          id: 2,
          name: 'child1'
        }, {
          id: 3,
          name: 'child2'
        }
      ]
    }
  ];

  customTemplateStringOptions: ITreeOptions = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    //getChildren: this.getChildren.bind(this),
    actionMapping,
    nodeHeight: 23,
    allowDrag: (node) => {
      // console.log('allowDrag?');
      return true;
    },
    allowDrop: (node) => {
      // console.log('allowDrop?');
      return true;
    },
    useVirtualScroll: true,
    animateExpand: true,
    animateSpeed: 30,
    animateAcceleration: 1.2,
  };

  config: FieldConfig[] = [
    {
      type: 'input',
      label: '菜单名称',
      name: 'MenuName',
      placeholder: '输入菜单名称',
      validation: [Validators.required, Validators.minLength(3)],
    },
    {
      type: 'input',
      label: '路径',
      name: 'MenuAddr',
      placeholder: '输入菜单路径',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '图标',
      name: 'Icon',
      placeholder: '输入菜单图标',
      validation: [Validators.required],
    },
    {
      type: 'input',
      label: '顺序',
      name: 'MenuOrder',
      placeholder: '输入菜单显示顺序',
      validation: [Validators.required],
    },
    {
      type: 'check',
      label: '角色',
      name: 'Roles',
      check: 'checkbox',
    },
    {
      label: '保存',
      name: 'submit',
      type: 'button',
      callback: function () {
        console.log('back');
      },
    },
  ];

  constructor(
    private menuService: MenuService,
    private roleService: RoleService,
    private _state: GlobalState) {

    const that = this;
    this.roleService.getRoles().then(function (roles) {
      const rl = [];
      _.each(roles, function (item) {
        rl.push({ id: item.id, name: item.roleName });
      });
      _.each(that.config, function (item, index) {
        if (item.name === 'Roles') {
          that.config[index].options = rl;
        }
      });
    });
  }
  ngOnInit() {
    this.isNewMenu = true;
    this.getNodes();
  }
  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
  }

  submit(value: { [name: string]: any }) {
    const that = this;
    const saveMenu = {
      MenuName: value.MenuName,
      MenuAddr: value.MenuAddr,
      Icon: value.Icon,
      MenuOrder: value.MenuOrder,
      ParentId: 0,
      RoleIds:value.Roles
    };
    if (this.isNewMenu) {
      saveMenu.ParentId = this.selectedMenu && this.selectedMenu.data ? this.selectedMenu.data.id : 0;
      this.menuService.create(saveMenu).then(function (menu) {
        that.getNodes();
        that.form.setDisabled('submit', false);
      }, (err) => {

      });
    } else {
      saveMenu.ParentId = this.selectedMenu && this.selectedMenu.data ? this.selectedMenu.data.parentId : 0;
      this.menuService.update(this.selectedMenu.data.id, saveMenu).then(function (menu) {
        that.getNodes();
        that.form.setDisabled('submit', false);
      }, (err) => {

      });
    }
  }

  backTop() {
    console.log('back');
  }

  getNodes() {
    const that = this;
    this.menuService.getMenus(function (menus) {
      console.log(menus);
      that.nodes = menus;
    });
  }

  onInitialized(tree) {
    tree.treeModel.expandAll();
    tree.sizeChanged();
  }

  onEvent(event) {
    if (event.eventName === 'focus') {
      this.selectedMenu = event.node;

      this.form.setValue('MenuName', this.selectedMenu.data.data.menuName);
      this.form.setValue('MenuAddr', this.selectedMenu.data.data.menuAddr);
      this.form.setValue('Icon', this.selectedMenu.data.data.icon);
      if (this.selectedMenu.data.data.roleIds) {
        this.form.setValue('Roles', this.selectedMenu.data.data.roleIds);
      }else{
        this.form.setValue('Roles', '');
      }
      this.form.setValue('MenuOrder', this.selectedMenu.data.data.menuOrder);
      this.isNewMenu = false;
    }
    console.log(event.node);
  }

  onNewMenu(tree) {
    this.form.setDisabled('submit', true);
    this.form.setValue('MenuName', '');
    this.form.setValue('MenuAddr', '');
    this.form.setValue('Icon', '');
    this.form.setValue('MenuOrder', '');
    this.isNewMenu = true;
  }
  // 删除选择的角色
  onDeleteMenu(tree) {
    const focusNode = tree.treeModel.getFocusedNode();
    if (focusNode) {
      if (focusNode.data.children.length > 0) {
        alert('选择的节点有子节点，不能删除。');
      } else {
        if (window.confirm('你确定要删除吗?')) {
          this.menuService.delete(focusNode.data.id).then(() => {
            this.getNodes();
            this.selectedMenu = null;
          });
        }
      }
    } else {
      alert('请选择你要删除的子节点。');
    }
  }

  getNode(nodeArr: any, name: string) {
    let findNode: any = {};
    _.each(nodeArr, (f) => {
      if (f.name === name) {
        findNode = f;
      }
      if (f.children) {
        return this.getNode(f.children, name);
      }
    });

    return findNode;
  }
}
