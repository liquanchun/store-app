import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';

@Injectable()
export class CheckinService {
  private modelName = 'YxOrder';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getCheckins() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName , id);
  }
  create(checkin: any) {
    return this._httpService.create(this.modelName, checkin);
  }

}
