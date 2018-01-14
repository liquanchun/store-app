import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

import * as _ from 'lodash';
@Component({
    template: `
    {{ renderValue }}
  `,
})
export class DateTimeComponent implements ViewCell, OnInit {

    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor() {

    }

    ngOnInit() {
        if (this.value) {
            if (this.value.toString().indexOf('00:00:00') > -1) {
                this.renderValue = this.value.toString().replace('T00:00:00', '');
            } else {
                this.renderValue = this.value.toString().replace('T', ' ');
            }
        }
    }

}