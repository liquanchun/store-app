import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';

@Injectable()
export class ReadIdCardService {
  constructor(private _httpService: HttpService) {
  }

  getIDcard() {
    return  {name:'李全春',idcard:'420983198010168113'};
  }

}