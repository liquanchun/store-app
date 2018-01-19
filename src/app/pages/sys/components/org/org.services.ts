import { Injectable } from '@angular/core';
import { HttpService } from '../../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class OrgService {
  private modelName = 'sysorg';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getOrgs(fnCallBack) {
    const that = this;
    this._httpService.getModelList(this.modelName).then(function (orgs) {
      fnCallBack(that.createTree(orgs, 0));
    });
  }

  getAll() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName, id);
  }

  deleteOrg(orgid: number, userid: number) {
    return this._httpService.delete(this.modelName + '/' + orgid , userid);
  }

  create(pId: number, name: string) {
    return this._httpService.create(this.modelName, { parentId: pId, DeptName: name });
  }

  createOrg(orgid: number, userid: string) {
    return this._httpService.create(this.modelName + '/' + orgid + '/' + userid, {});
  }
  createTree(jsons, pid) {
    const tree = [];
    const that = this;
    if (jsons) {
      _.each(jsons, function (j) {
        if (j.parentId === pid) {
          tree.push({ id: j.id, name: j.deptName, children: that.createTree(jsons, j.id) });
        }
      });
    }
    return tree;
  }

}
