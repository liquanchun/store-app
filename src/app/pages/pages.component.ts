import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Routes } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { BaMenuService } from '../theme';
import { PAGES_MENU } from './pages.menu';
import { GlobalState } from './../global.state';
import { MenuService } from './sys/components/menu/menu.services';
import * as _ from 'lodash';
@Component({
  selector: 'pages',
  templateUrl: './pages.html',
  providers: [MenuService]
})
export class Pages implements OnInit {

  private menuItems: any;
  private dashboard = {
    path: 'dashboard',
    data: {
      menu: {
        title: 'general.menu.dashboard',
        icon: 'ion-android-home',
        selected: false,
        expanded: false,
        order: 0
      }
    }
  };

  constructor(private _menuService: BaMenuService,
    private _state: GlobalState,
    private _menuItemService: MenuService) {
  }

  ngOnInit() {
    const that = this;
    PAGES_MENU[0]['children'] = [];
    PAGES_MENU[0]['children'].push(that.dashboard);
    if (!that.menuItems) {
      this._menuItemService.getMenuList().then((menus) => {
        that.menuItems = menus;
        const mi2 = _.filter(menus, ['parentId', 0]);
        _.each(mi2, (m) => {
          that.showMenu(m.menuName);
        });
        that._menuService.updateMenuByRoutes(<Routes>PAGES_MENU);

      });
    }
  }

  showMenu(menu) {
    const that = this;
    if (that.menuItems) {
      const mi = _.find(that.menuItems, ['menuName', menu]);
      // console.log(mi);
      if (mi) {
        const mi2 = _.filter(that.menuItems, ['parentId', mi['id']]);
        const secondItem = [];
        _.each(mi2, (m) => {
          const childrenItem = that.getChildrenItem(m['id']);
          let uri = m['menuAddr'];
          const newMenu = {
            path: uri,
            data: {
              menu: {
                title: m['menuName'],
                icon: m['icon'],
                selected: false,
                expanded: false,
                order: m['menuOrder']
              }
            },
            children: childrenItem,
          };
          secondItem.push(newMenu);
        });
        // console.log(mi2);
        let uri = mi['menuAddr'];
        const newMenu = {
          path: uri,
          data: {
            menu: {
              title: mi['menuName'],
              icon: mi['icon'],
              selected: false,
              expanded: mi['id'] == 10005,
              order: mi['MenuOrder'],
            }
          },
          children: secondItem
        };
        PAGES_MENU[0]['children'].push(newMenu);
      }
    }
  }

  getChildrenItem(menuId) {
    const mi = _.filter(this.menuItems, ['parentId', menuId]);
    const childrenItem = [];
    _.each(mi, (m) => {
      let uri = m['menuAddr'];
      const newMenu = {
        path: uri,
        data: {
          menu: {
            title: m['menuName'],
            icon: m['icon'],
            selected: false,
            expanded: false,
            order: m['menuOrder']
          }
        }
      };
      childrenItem.push(newMenu);
    });
    return childrenItem;
  }
}
