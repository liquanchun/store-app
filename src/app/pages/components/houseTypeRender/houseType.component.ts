import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';
import { GlobalState } from '../../../global.state';
import { HouseTypeRenderService } from './houseType.services';

import * as _ from 'lodash';
@Component({
    template: `
    {{ renderValue }}
  `,
})
export class HouseTypeRenderComponent implements ViewCell, OnInit {
    map = new Map();

    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor(private _state: GlobalState,
        private listRenderService: HouseTypeRenderService) {
        this.map = this.listRenderService.map;
    }

    ngOnInit() {
        this.renderValue = this.map.get(this.value);
    }

}