import {Injectable} from '@angular/core'

@Injectable()
export class BaMsgCenterService {

  private _notifications = [
    {
      text: '新增房间预订，房间309，单号YD2302434444',
      time: '1 分钟之前'
    },
    {
      text: '钟点房308房到点提醒，剩余10分钟。',
      time: '2 分钟之前'
    },
    {
      text: '方便面库存不足。',
      time: '5 分钟之前'
    },
  ];

  public getNotifications():Array<Object> {
    return this._notifications;
  }
}
