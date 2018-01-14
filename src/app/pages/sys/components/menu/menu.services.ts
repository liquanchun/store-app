import { Injectable } from '@angular/core';
import { HttpService } from '../../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class MenuService {
  private modelName = 'sysmenu';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getMenus(fnCallBack) {
    const that = this;
    this._httpService.getModelList(this.modelName).then(function (menus) {
      console.log(menus);
      fnCallBack(that.createTree(menus, 0));
    });
  }

  getMenuList() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName, id);
  }

  create(munu: any) {
    return this._httpService.create(this.modelName, munu);
  }

  update(modelId: any, model: any) {
    return this._httpService.update(this.modelName, modelId, model);
  }

  createTree(jsons, pid) {
    const tree = [];
    const that = this;
    if (jsons) {
      _.each(jsons, function (j) {
        if (j.parentId === pid) {
          tree.push({ id: j.id, name: j.menuName, children: that.createTree(jsons, j.id), data: j });
        }
      });
    }
    return tree;
  }

}
