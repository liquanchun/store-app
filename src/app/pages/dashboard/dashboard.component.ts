import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import * as _ from 'lodash';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  labelTop = {
    normal: {
      label: {
        show: true,
        position: 'center',
        formatter: '{b}',
        textStyle: {
          baseline: 'bottom'
        }
      },
      labelLine: {
        show: false
      }
    }
  };
  labelFromatter = {
    normal: {
      label: {
        formatter: function (params) {
          return 100 - params.value + '%'
        },
        textStyle: {
          baseline: 'top'
        }
      }
    },
  }
  labelBottom = {
    normal: {
      color: '#ccc',
      label: {
        show: true,
        position: 'center'
      },
      labelLine: {
        show: false
      }
    },
    emphasis: {
      color: 'rgba(0,0,0,0)'
    }
  };
  radius = [40, 55];
  chartOption1 = {
    legend: {
      x: 'center',
      y: 'center',
      data: [
        '标准房', '单人房', '全部房型', '豪华单人间', '特惠房'
      ]
    },
    title: {
      text: '各房型入住率',
      x: 'center'
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: {
          show: true,
          type: ['pie', 'funnel'],
          option: {
            funnel: {
              width: '20%',
              height: '30%',
              itemStyle: {
                normal: {
                  label: {
                    formatter: function (params) {
                      return 'other\n' + params.value + '%\n'
                    },
                    textStyle: {
                      baseline: 'middle'
                    }
                  }
                },
              }
            }
          }
        },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        type: 'pie',
        center: ['10%', '30%'],
        radius: this.radius,
        x: '0%', // for funnel
        itemStyle: this.labelFromatter,
        data: [
          { name: 'other', value: 75, itemStyle: this.labelBottom },
          { name: '标准房', value: 25, itemStyle: this.labelTop }
        ]
      },
      {
        type: 'pie',
        center: ['30%', '30%'],
        radius: this.radius,
        x: '20%', // for funnel
        itemStyle: this.labelFromatter,
        data: [
          { name: 'other', value: 76, itemStyle: this.labelBottom },
          { name: '单人房', value: 24, itemStyle: this.labelTop }
        ]
      },
      {
        type: 'pie',
        center: ['50%', '30%'],
        radius: this.radius,
        x: '40%', // for funnel
        itemStyle: this.labelFromatter,
        data: [
          { name: 'other', value: 86, itemStyle: this.labelBottom },
          { name: '全部房型', value: 14, itemStyle: this.labelTop }
        ]
      },
      {
        type: 'pie',
        center: ['70%', '30%'],
        radius: this.radius,
        x: '60%', // for funnel
        itemStyle: this.labelFromatter,
        data: [
          { name: 'other', value: 89, itemStyle: this.labelBottom },
          { name: '豪华单人间', value: 11, itemStyle: this.labelTop }
        ]
      },
      {
        type : 'pie',
        center : ['90%', '30%'],
        radius : this.radius,
        x:'80%', // for funnel
        itemStyle : this.labelFromatter,
        data : [
            {name:'other', value:73, itemStyle : this.labelBottom},
            {name:'特惠房', value:27,itemStyle : this.labelTop}
        ]
    },
    ]
  };


  hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
    '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p',
    '6p', '7p', '8p', '9p', '10p', '11p'];
  days = ['Saturday', 'Friday', 'Thursday',
    'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

  data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];

  dataNew:any;

  chartOption2 = {
    title: {
      text: '未来一周预定房间分布图',
      x: 'center'
    },
    tooltip: {
      position: 'bottom'
    },
    animation: false,
    grid: {
      height: '50%',
      y: '10%'
    },
    xAxis: {
      type: 'category',
      data: this.hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: this.days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: 'Punch Card',
      type: 'heatmap',
      data: this.data,
      label: {
        normal: {
          show: true
        }
      },
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  chartOption3 = {
    title: {
      text: '房屋状态分布图',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['空净', '空脏', '住人净', '住人脏', '维修', '预约', '预离']
    },
    series: [
      {
        name: '访问状态',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: 335, name: '空净' },
          { value: 310, name: '空脏' },
          { value: 234, name: '住人净' },
          { value: 135, name: '住人脏' },
          { value: 154, name: '维修' },
          { value: 223, name: '预约' },
          { value: 123, name: '预离' }
        ],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  chartOption4 = {
    title: {
      text: '最近一周第三方平台订单数量',
      x: 'left'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    legend: {
      x:'right',
      data: ['信用住', '美团', '去哪儿', '携程', '艺龙']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    series: [
      {
        name: '信用住',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [320, 302, 301, 334, 390, 330, 320]
      },
      {
        name: '美团',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '去哪儿',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: '携程',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [150, 212, 201, 154, 190, 330, 410]
      },
      {
        name: '艺龙',
        type: 'bar',
        stack: '总量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [820, 832, 901, 934, 1290, 1330, 1320]
      }
    ]
  };

  chartOption5 = {
    title: {
      text: '最近一周营业额',
      x: 'center'
    },
    color: ['#3398DB'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '营业额',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200, 334, 390, 330, 220]
      }
    ]
  };

  constructor(private _router: Router) {
    this.dataNew = this.data.map(function (item) {
        return [item[1], item[0], item[2] || '-'];
    });
  }
  ngOnInit() {
    const h = Math.floor($(document).innerHeight() * 0.82)
    $(".mychart").css('height', h + 'px');
  }
}
