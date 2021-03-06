import { Injectable } from "@angular/core";
import { GlobalState } from "../global.state";
import * as _ from "lodash";
import { retry } from "rxjs/operator/retry";

@Injectable()
export class Common {
  todayAddDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return { year: year, month: month, day: day };
  }
  todayObjAddDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
  dateAddDays(d: Date, days: number) {
    d.setDate(d.getDate() + days);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return { year: year, month: month, day: day };
  }
  dateAddMonths(d: Date, months: number) {
    d.setMonth(d.getMonth() + months);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return { year: year, month: month, day: day };
  }
  getTodayObj() {
    let d = new Date();
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return { year: year, month: month, day: day };
  }
  getToday1Obj() {
    let d = new Date();
    let day = d.getDate() + 1;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    return { year: year, month: month, day: day };
  }
  getTodayString() {
    let d = new Date();
    let day = _.toString(d.getDate());
    let month = _.toString(d.getMonth() + 1);
    let year = d.getFullYear();
    return `${year}-${_.padStart(month, 2, "0")}-${_.padStart(day, 2, "0")}`;
  }
  getToday1String() {
    let d = new Date();
    let day = _.toString(d.getDate()) + 1;
    let month = _.toString(d.getMonth() + 1);
    let year = d.getFullYear();
    return `${year}-${_.padStart(month, 2, "0")}-${_.padStart(day, 2, "0")}`;
  }
  getTodayStringChinese() {
    let d = new Date();
    let day = _.toString(d.getDate());
    let month = _.toString(d.getMonth() + 1);
    let year = d.getFullYear();
    return `${year}年${_.padStart(month, 2, "0")}月${_.padStart(
      day,
      2,
      "0"
    )}日`;
  }
  getTodayString2() {
    let d = new Date();
    let day = _.toString(d.getDate());
    let month = _.toString(d.getMonth() + 1);
    let year = d.getFullYear();
    return `${year}${_.padStart(month, 2, "0")}${_.padStart(day, 2, "0")}`;
  }
  getTodayTime() {
    let d = new Date();
    let day = _.toString(d.getDate());
    let month = _.toString(d.getMonth() + 1);
    let year = d.getFullYear();
    let h= this.checkTime(d.getHours());
    let m= this.checkTime(d.getMinutes());

    return `${year}-${_.padStart(month, 2, "0")}-${_.padStart(day, 2, "0")} ${h}:${m}`;
  }
  // 获取日期格式的年份
  getDateYear(date: string): number {
    return Number.parseInt(date.split("-")[0]);
  }
  // 获取日期格式的月份
  getDateMonth(date: string): number {
    return Number.parseInt(date.split("-")[1]);
  }
  // 获取日期格式的天数
  getDateDay(date: string): number {
    return Number.parseInt(date.split("-")[2]);
  }
  //获取日期对象
  getDateObject(date: string): any {
    const year = Number.parseInt(date.split("-")[0]);
    const month = Number.parseInt(date.split("-")[1]);
    const day = Number.parseInt(date.split("-")[2]);
    return { year: year, month: month, day: day };
  }
  // 根据日期对象获取日期字符串
  getDateString(date: any): string {
    return `${date.year}-${_.padStart(date.month, 2, "0")}-${_.padStart(
      date.day,
      2,
      "0"
    )}`;
  }
  // 根据日期对象获取日期字符串(标准格式)
  getDateString2(date: any): string {
    const time = date.time ? " " + date.time : "";
    return `${date.year}-${_.padStart(date.month, 2, "0")}-${_.padStart(
      date.day,
      2,
      "0"
    )}${time}`;
  }

  getSplitDate(date: string) {
    return date.split(" ")[0];
  }
  //把数组转换为字符串
  ArrToString(arr: any) {
    let newArr = _.without(arr, 0);
    return _.join(newArr, ",");
  }
  //把数组转换为字符串
  ArrToString1(arr: any) {
    let evens = _.remove(arr, function(n) {
      return n == "";
    });
    return arr.length > 0 ? arr[0] : 0;
  }

  checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  changeNumMoneyToChinese(money) {
    var cnNums = new Array(
      "零",
      "壹",
      "贰",
      "叁",
      "肆",
      "伍",
      "陆",
      "柒",
      "捌",
      "玖"
    );
    var cnIntRadice = new Array("", "拾", "佰", "仟");
    var cnIntUnits = new Array("", "万", "亿", "兆");
    var cnDecUnits = new Array("角", "分", "毫", "厘");
    var cnInteger = "整";
    var cnIntLast = "元";
    var maxNum = 999999999999999.9999;
    var IntegerNum;
    var DecimalNum;
    var ChineseStr = "";
    var parts;
    if (money == "") {
      return "";
    }
    money = parseFloat(money);
    if (money >= maxNum) {
      alert("超出最大处理数字");
      return "";
    }
    if (money == 0) {
      ChineseStr = cnNums[0] + cnIntLast + cnInteger;
      return ChineseStr;
    }
    money = money.toString();
    if (money.indexOf(".") == -1) {
      IntegerNum = money;
      DecimalNum = "";
    } else {
      parts = money.split(".");
      IntegerNum = parts[0];
      DecimalNum = parts[1].substr(0, 4);
    }
    if (parseInt(IntegerNum, 10) > 0) {
      var zeroCount = 0;
      var IntLen = IntegerNum.length;
      for (var index = 0; index < IntLen; index++) {
        var n = IntegerNum.substr(index, 1);
        var p = IntLen - index - 1;
        var q = p / 4;
        var m = p % 4;
        if (n == "0") {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            ChineseStr += cnNums[0];
          }
          //归零
          zeroCount = 0;
          ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          ChineseStr += cnIntUnits[q];
        }
      }
      ChineseStr += cnIntLast;
    }
    if (DecimalNum != "") {
      var decLen = DecimalNum.length;
      for (var index = 0; index < decLen; index++) {
        var n = DecimalNum.substr(index, 1);
        if (n != "0") {
          ChineseStr += cnNums[Number(n)] + cnDecUnits[index];
        }
      }
    }
    if (ChineseStr == "") {
      ChineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (DecimalNum == "") {
      ChineseStr += cnInteger;
    }
    return ChineseStr;
  }
}
