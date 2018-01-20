import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularEchartsModule } from 'ngx-echarts';
import { OrgService } from '../sys/components/org/org.services';
import { StoreinService } from './../store/storein/storein.services';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html',
  providers: [OrgService, StoreinService],
})
export class Dashboard implements OnInit {

  colorList = ['#c487ee', '#deb140', '#49dff0', '#034079', '#6f81da', '#BFEFFF', '#98FB98', '#9F79EE', '#7CCD7C', '#737373', '#008B00'];
  //部门D部门
  echartData = [{
    value: 2154,
    name: '部门1'
  }, {
    value: 3854,
    name: '部门2'
  }, {
    value: 3515,
    name: '部门3'
  }, {
    value: 3515,
    name: '部门4'
  }, {
    value: 3854,
    name: '部门5'
  }];
  rich = {
    yellow: {
      color: "#ffc72b",
      fontSize: 23,
      padding: [1, 4],
      align: 'center'
    },
    total: {
      color: "#ffc72b",
      fontSize: 40,
      align: 'center'
    },
    white: {
      color: "#000",
      align: 'center',
      fontSize: 14,
      padding: [12, 0],
      margin: [5, 0]
    },
    blue: {
      color: '#49dff0',
      fontSize: 16,
      align: 'center'
    },
    hr: {
      borderColor: '#0b5263',
      width: '100%',
      borderWidth: 1,
      height: 0,
    }
  };

  StoreInOption1 = {
    title: {
      text: '各部门采购采购单占比',
      x: 'center',
      textStyle: {
        color: '#268bd2',
        fontSize: '22',
        fontWeight: 'normal',
      },
      subtext: '统计'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      selectedMode: false,
      show: false,
      formatter: function (name) {
        var total = 123130; //各科正确率总和
        var averagePercent; //综合正确率
        // this.echartData.forEach(function (value, index, array) {
        //     total += value.value;
        // });
        return '{total|' + total + '}';
      },
      data: [this.echartData[0].name],
      left: 'center',
      top: 'center',
      icon: 'none',
      align: 'center',
      textStyle: {
        color: "#268bd2",
        fontSize: 16,
        rich: this.rich
      },
    },
    series: [{
      name: '总部门数量',
      type: 'pie',
      radius: ['35%', '50%'],
      hoverAnimation: false,
      color: ['#c487ee', '#deb140', '#49dff0', '#034079', '#6f81da'],
      label: {
        normal: {
          formatter: function (params, ticket, callback) {
            return '{white|' + params.name + '}\n{hr|}\n{yellow|' + params.value + '}\n{blue|' + params.percent + '%}';
          },
          rich: this.rich
        },
      },
      labelLine: {
        normal: {
          length: 57,
          length2: 0,
          lineStyle: {
            color: '#268bd2'
          }
        }
      },
      data: this.echartData
    }]
  };

  StoreInOptionmonth = {
    color: ['#deb140', '#01F2FF', '#A635FF', '#009AFF'],
    title: {
      text: '采购单月份对比',
      x: 'center',
      textStyle: {
        fontSize: '22',
        color: '#268bd2',
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      x: 'center',
      top: 'bottom',
      textStyle: {
        color: '#268bd2',
      },
      data: ['部门A', '部门B', '部门C', '部门D'],
    },
    grid: {
      left: '1%',
      right: '8%',
      top: '16%',
      bottom: '6%',
      containLabel: true
    },
    toolbox: {
      "show": false,
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      "axisLine": {
        lineStyle: {
          color: '#C6C4C4',
          width: 0.5
        }

      },
      "axisTick": {
        "show": false
      },
      axisLabel: {
        textStyle: {
          color: '#268bd2',
          fontSize: '16'
        }
      },
      boundaryGap: false,
      data: ['17年7月', '17年8月', '17年9月', '17年10月', '17年11月', '17年12月', '18年1月']
    },
    yAxis: {
      "axisLine": {
        lineStyle: {
          color: '##C6C4C4'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#DAD9D9'
        }
      },
      "axisTick": {
        "show": false
      },
      axisLabel: {
        textStyle: {
          color: '#268bd2',
          fontSize: '16'
        }
      },
      type: 'value'
    },
    series: [{
      name: '部门A',
      smooth: true,
      type: 'line',
      symbolSize: 8,
      symbol: 'circle',
      data: [90, 50, 39, 50, 120, 82, 80],
      itemStyle: {
        normal: {
          lineStyle: {
            width: 4,
          }
        }
      }
    }, {
      name: '部门B',
      smooth: true,
      type: 'line',
      symbolSize: 8,
      symbol: 'circle',
      data: [70, 50, 50, 87, 90, 80, 70],
      itemStyle: {
        normal: {
          lineStyle: {
            width: 4,
          }
        }
      }
    }, {
      name: '部门C',
      smooth: true,
      type: 'line',
      symbolSize: 8,
      symbol: 'circle',
      data: [290, 200, 20, 132, 15, 200, 90],
      itemStyle: {
        normal: {
          lineStyle: {
            width: 4,
          }
        }
      }
    }, {
      name: '部门D',
      smooth: true,
      type: 'line',
      symbolSize: 8,
      symbol: 'circle',
      data: [240, 20, 120, 142, 115, 210, 190],
      itemStyle: {
        normal: {
          lineStyle: {
            width: 4,
          }
        }
      }
    }]
  }

  orgList: any;

  constructor(private _router: Router,
    private _orgService: OrgService,
    private _storeinService: StoreinService,
  ) {

  }
  ngOnInit() {
    this.getStoreInList();
    this.getStoreInMonth();
  }
  getStoreInList(): void {
    this._storeinService.getStoreinsByOrg().then((data) => {
      this.StoreInOption1 = Object.assign({}, this.StoreInOption1);
      this.echartData = data;
      this.StoreInOption1.series[0].data = this.echartData;
      this.StoreInOption1.series[0].color = _.take(this.colorList, this.echartData.length);
    })
  }
  getStoreInMonth(): void {
    this._storeinService.getStoreinsByMonth().then((data) => {
      this.StoreInOptionmonth = Object.assign({}, this.StoreInOptionmonth);
      const keys = _.keys(data);
      this.StoreInOptionmonth.legend.data = keys;
      this.StoreInOptionmonth.color = _.take(this.colorList, keys.length);
      this.StoreInOptionmonth.xAxis.data = _.keys(data[keys[0]]);

      let series = [];
      for (let i = 0; i < keys.length; i++) {
        let value0S = [];
        const value0 = _.values(data[keys[i]]);
        _.each(value0, f => { value0S.push(f); });

        series.push({
          name: keys[i],
          smooth: true,
          type: 'line',
          symbolSize: 8,
          symbol: 'circle',
          data: _.values(value0S),
          itemStyle: {
            normal: {
              lineStyle: {
                width: 4,
              }
            }
          }
        });
      }
      this.StoreInOptionmonth.series = series;
    })
  }
}
