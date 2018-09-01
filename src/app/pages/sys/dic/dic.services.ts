import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class DicService {
  private modelName = 'sysdic';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getDics(fnCallBack) {
    const that = this;
    this._httpService.getModelList(this.modelName).then(function (dics) {
      console.log(dics);
      fnCallBack(that.createTree(dics, 0));
    });
  }

  async getDicListAsync(name) {
    return new Promise((resolve, reject) => {
      let dicList = [];
      this._httpService.getModelList(this.modelName).then(function (data) {
        const parentData = _.find(data, (f) => { return f['dicName'] == name; });
        if (parentData) {
          const filteData = _.filter(data, (f) => { return f['parentId'] == parentData['id']; });
          _.each(filteData, function (d) {
            dicList.push({ id: d.id, text: d.dicName, color: d.remark });
          });
        }
      });
      resolve(dicList);
    })

  }

  getDicByName(name, fnCallBack) {
    let dicList = [];
    this._httpService.getModelList(this.modelName).then(function (data) {
      const parentData = _.find(data, (f) => { return f['dicName'] == name; });
      if (parentData) {
        const filteData = _.filter(data, (f) => { return f['parentId'] == parentData['id']; });
        _.each(filteData, function (d) {
          dicList.push({ id: d.id, text: d.dicName, color: d.remark });
        });
        fnCallBack(dicList);
      }
    });
  }
  delete(id: any) {
    return this._httpService.delete(this.modelName, id);
  }
  create(pId: number, name: string) {
    return this._httpService.create(this.modelName, { parentId: pId, DicName: name });
  }

  createTree(jsons, pid) {
    const tree = [];
    const that = this;
    if (jsons) {
      _.each(jsons, function (j) {
        if (j.parentId === pid) {
          tree.push({ id: j.id, name: j.dicName, children: that.createTree(jsons, j.id) });
        }
      });
    }
    return tree;
  }

}
