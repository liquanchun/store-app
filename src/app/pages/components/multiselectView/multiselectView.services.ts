import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';
import * as _ from 'lodash';

@Injectable()
export class MultiselectViewService {

  myOptions = [];

  constructor(private _httpService: HttpService) {
  }

  append(key: string, val: string) {
    this.myOptions.push({ id: key, name: val });
  }
  clear() {
    this.myOptions = [];
  }
}
