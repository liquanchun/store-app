import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularEchartsModule } from 'ngx-echarts';
import { OrgService } from '../sys/components/org/org.services';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html',
  providers: [OrgService],
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
      fontSize: 30,
      padding: [5, 4],
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
      padding: [21, 0]
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

  chartOption1 = {
    title: {
      text: '各部门采购采购单占比',
      x: 'center',
      textStyle: {
        color: '#268bd2',
        fontSize: '22',
        fontWeight: 'normal'
      }
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
          length: 55,
          length2: 0,
          lineStyle: {
            color: '#268bd2'
          }
        }
      },
      data: this.echartData
    }]
  };

  optionmonth = {
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
      x: 300,
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
          color: '#04CEDC',
          width: 1
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
      data: ['2017年7月', '2017年8月', '2017年9月', '2017年10月', '2017年11月', '2017年12月', '2018年1月']
    },
    yAxis: {
      "axisLine": {
        lineStyle: {
          color: '#268bd2'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#05415D'
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
  ) {

  }
  ngOnInit() {

  }
  getOrgList() {
    this._orgService.getAll().then((data) => {
      this.orgList = _.filter(data, f => { return f.parentId > 0; });
      this.echartData = [];
      const that = this;
      _.each(this.orgList,f =>{
          //that.echartData.push({});
      });
    });
  }
}
