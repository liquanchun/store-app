import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class PartsService {
  constructor(private _httpService: HttpService) {}

  getParts() {
    return this._httpService.getDataServer2('data/set_parts');
  }

  create(model: any) {
    delete model.Id;
    return this._httpService.create2('data/set_parts', model);
  }

  update(model: any) {
    return this._httpService.create2('data/set_parts', model);
  }

  delete(id: any) {
    return this._httpService.delete2('delete2/set_parts', id);
  }
}
