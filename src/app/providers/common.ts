import { Injectable } from '@angular/core';
import { GlobalState } from '../global.state';
import * as _ from 'lodash';
import { retry } from 'rxjs/operator/retry';

@Injectable()
export class Common {
    getTodayObj() {
        let d = new Date()
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        return { "year": year, "month": month, "day": day };
    }
    getTodayString() {
        let d = new Date()
        let day = _.toString(d.getDate());
        let month = _.toString(d.getMonth() + 1);
        let year = d.getFullYear();
        return `${year}-${_.padStart(month, 2, '0')}-${_.padStart(day, 2, '0')}`
    }
    // 获取日期格式的年份
    getDateYear(date: string): number {
        return Number.parseInt(date.split('-')[0]);
    }
    // 获取日期格式的月份
    getDateMonth(date: string): number {
        return Number.parseInt(date.split('-')[1]);
    }
    // 获取日期格式的天数
    getDateDay(date: string): number {
        return Number.parseInt(date.split('-')[2]);
    }
    //获取日期对象
    getDateObject(date: string): any {
        const year = Number.parseInt(date.split('-')[0]);
        const month = Number.parseInt(date.split('-')[1]);
        const day = Number.parseInt(date.split('-')[2]);
        return { "year": year, "month": month, "day": day };
    }
    // 根据日期对象获取日期字符串
    getDateString(date: any): string {
        return `${date.year}-${_.padStart(date.month, 2, '0')}-${_.padStart(date.day, 2, '0')}`
    }
    // 根据日期对象获取日期字符串(标准格式)
    getDateString2(date: any): string {
        const time = date.time ? ' ' + date.time : '';
        return `${date.year}-${_.padStart(date.month, 2, '0')}-${_.padStart(date.day, 2, '0')}${time}`
    }

    getSplitDate(date:string){
        return date.split(' ')[0];
    }
}