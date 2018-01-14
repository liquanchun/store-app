import { Component, OnInit, AfterViewInit,Input,Output,EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { OrgService } from './org.services';
import { GlobalState } from '../../../../global.state';

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
  selector: 'app-sys-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
  providers: [OrgService],
})
export class OrgComponent implements OnInit, AfterViewInit {

  @Input() editable: boolean = true;
  @Output() selected = new EventEmitter();

  private isNewOrg: boolean;

  private selectedOrg: any;

  private newOrgName: string;

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

  constructor(private modalService: NgbModal,
    fb: FormBuilder,
    private orgService: OrgService,
    private _state: GlobalState) {


  }
  ngOnInit() {
    this.isNewOrg = true;
    this.getNodes();
  }
  ngAfterViewInit() {

  }

  getNodes() {
    const that = this;
    this.orgService.getOrgs(function (orgs) {
      that.nodes = orgs;
    });
  }

  onInitialized(tree) {
    tree.treeModel.expandAll();
  }

  onEvent(event) {
    if (event.eventName === 'focus') {
      this.selectedOrg = event.node;
      this.selected.emit(event.node.data);
      this._state.notifyDataChanged('org.selectedChanged', this.selectedOrg);
    }
  }

  onSaveOrg(tree) {
    const that = this;
    this.isNewOrg = !this.isNewOrg;
    if (this.isNewOrg) {
      if (this.newOrgName) {
        // TODO
        const focusNode = tree.treeModel.getFocusedNode();
        if (focusNode) {
          this.orgService
            .create(focusNode.data.id, this.newOrgName)
            .then(function (role) {
              that.getNodes();
              that.newOrgName = '';
            }, (err) => {
              alert(`保存失败。${err}`);
            });
        } else {
          alert('请选择父节点。');
        }
      } else {
        alert('子节点名称不能为空。');
      }
    }
  }
  // 删除选择的角色
  onDeleteOrg(tree) {
    const focusNode = tree.treeModel.getFocusedNode();
    if (focusNode) {
      if (focusNode.data.children.length > 0) {
        alert('选择的节点有子节点，不能删除。');
      } else {
        const that = this;
        const confirm = {
          message: `${focusNode.data.name}节点`,
          callback: () => {
            that.orgService.delete(focusNode.data.id).then(() => {
              that.getNodes();
              that.selectedOrg = null;
            });
          },
        };
        that._state.notifyDataChanged('delete.confirm', confirm);
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
