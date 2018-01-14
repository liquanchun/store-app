import {Injectable} from '@angular/core';
import {BaThemeConfigProvider, colorHelper} from '../../../theme';

@Injectable()
export class PieChartService {

  constructor(private _baConfig:BaThemeConfigProvider) {
  }

  getData() {
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    return [
      {
        color: pieColor,
        description: '今日入住人数',
        stats: '120',
        icon: 'person',
      }, {
        color: pieColor,
        description: '今日营业额',
        stats: '7,745',
        icon: 'money',
      }, {
        color: pieColor,
        description: '今日预约房间',
        stats: '21',
        icon: 'face',
      }, {
        color: pieColor,
        description: '今日新增会员',
        stats: '8',
        icon: 'refresh',
      }
    ];
  }
}
