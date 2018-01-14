import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class HouseFeeService {
  constructor(private _httpService: HttpService) {
  }

  getHouseFees(modelName) {
    return this._httpService.getModelList(modelName);
  }

  create(modelName: string, model: any) {
    delete model.id;
    return this._httpService.create(modelName, model);
  }

  update(modelName: string, modelId: number, model: any) {
    return this._httpService.update(modelName, modelId, model);
  }

  delete(modelName: string, id: any) {
    return this._httpService.delete(modelName, id);
  }
}
