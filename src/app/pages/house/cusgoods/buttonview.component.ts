import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';

import * as _ from 'lodash';
@Component({
  selector: 'button-view',
  template: `
	    <div *ngIf="show == 'true'" class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-success btn-sm tablebutton" (click)="onClick()">{{ renderValue }}</button>
      </div>
    `,
})

export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  private id: any;
  private show: any;
  constructor(
    private _state: GlobalState,
  ) {

   }

  ngOnInit() {
    this.renderValue = _.split(this.value, '_')[0];
    this.id = _.split(this.value, '_')[1];
    this.show = _.split(this.value, '_')[2];
  }

  onClick() {
    this._state.notifyDataChanged('cusgoods.click', this.id);
  }
}