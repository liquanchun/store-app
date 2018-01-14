import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class CardRenderService {

  map = new Map();

  constructor(private _httpService: HttpService) {
  }

  append(key: string, val: string) {
    this.map.set(key.toString(), val);
  }
  clear() {
    this.map = new Map();
  }
}
