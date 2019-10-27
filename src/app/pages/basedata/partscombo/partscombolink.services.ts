import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class PartsComboLinkService {
  constructor(private _httpService: HttpService) {}

  getPartsCombo() {
    return this._httpService.getDataServer2('data/set_parts_link');
  }

  create(model: any) {
    delete model.Id;
    return this._httpService.create2('data/set_parts_link', model);
  }

  update(model: any) {
    return this._httpService.create2('data/set_parts_link', model);
  }

  delete(id: any) {
    return this._httpService.delete2('data/set_parts_link', id);
  }
}
