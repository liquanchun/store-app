import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class PartsComboService {
  constructor(private _httpService: HttpService) {}

  getPartsCombo() {
    return this._httpService.getDataServer2('data/vw_set_parts_combo');
  }

  create(model: any) {
    return this._httpService.create2('partscombo', model);
  }

  update(model: any) {
    return this._httpService.create2('partscombo', model);
  }

  delete(id: any) {
    return this._httpService.delete2('delete2/set_parts_combo', id);
  }
}
