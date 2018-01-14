import {Injectable} from '@angular/core';

@Injectable()
export class TodoService {

  private _todoList = [
    { text: '王珊珊今天请假' },
    { text: '昨天302房间客户丢失衣物' },
    { text: '今日英语网公司来访' },
    { text: '409房间淋浴房坏了' },
    { text: '老坛酸菜牛肉面库存不足' },
  ];

  getTodoList() {
    return this._todoList;
  }
}
