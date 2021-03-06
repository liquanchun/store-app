import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import * as _ from "lodash";
@Injectable()
export class GlobalState {
  private _data = new Subject<Object>();
  private _dataStream$ = this._data.asObservable();

  private _subscriptions: Map<string, Array<Function>> = new Map<
    string,
    Array<Function>
  >();

  constructor() {
    this._dataStream$.subscribe(data => this._onEvent(data));
  }

  notifyDataChanged(event, value) {
    let current = this._data[event];
    if (current !== value) {
      this._data[event] = value;

      this._data.next({
        event: event,
        data: this._data[event]
      });
    }
  }
  unsubscribe(event: string) {
    if (this._subscriptions.has(event)) {
      this._subscriptions.delete(event);
    }
  }
  subscribe(event: string, callback: Function) {
    let subscribers = this._subscriptions.get(event) || [];
    const fct = _.find(subscribers, f => {
      return f == callback;
    });
    if (!fct) {
      subscribers.push(callback);

      this._subscriptions.set(event, subscribers);
    }
  }

  _onEvent(data: any) {
    let subscribers = this._subscriptions.get(data["event"]) || [];
    if (_.size(subscribers) > 1) {
      //_.drop(subscribers, _.size(subscribers) - 1);
      subscribers = _.take(subscribers);
    }
    subscribers.forEach(callback => {
      callback.call(null, data["data"]);
    });
  }
}
