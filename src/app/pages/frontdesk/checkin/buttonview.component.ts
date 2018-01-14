import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import { ReadIdCardService } from './idcardread.services';
import * as _ from 'lodash';
@Component({
  selector: 'button-view',
  template: `
	    <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-success btn-sm tablebutton" (click)="onClick()">{{ renderValue }}</button>
      </div>
    `,
  providers: [ReadIdCardService],
})

export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  code: string;
  constructor(
    private _state: GlobalState,
    private _readIdCardService: ReadIdCardService,
  ) { }

  ngOnInit() {
    this.renderValue = _.split(this.value, '_')[0];
    this.code = _.split(this.value, '_')[1]
  }

  onClick() {
    // this._readIdCardService.getIDcard().then((data) => {
    //   data.code = this.code;
    //   this._state.notifyDataChanged('read.idcard', data);
    // });
    let data = this._readIdCardService.getIDcard();
    data['code'] = this.code;
    this._state.notifyDataChanged('read.idcard', data);
  }
}