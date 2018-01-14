import { Component, Input, OnInit, AfterViewInit, DoCheck } from '@angular/core';

import { ViewCell, Cell, DefaultEditor, Editor } from 'ng2-smart-table';

import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';

import { MultiselectViewService } from './multiselectView.services';

import * as _ from 'lodash';
@Component({
    selector: 'multiselect-dropdown-component',
    template: `
    <ss-multiselect-dropdown [options]="myOptions" 
        [(ngModel)]="optionsModel"
        (ngModelChange)="onChange($event)">
    </ss-multiselect-dropdown>
  `
})
export class MultiselectViewComponent extends DefaultEditor implements DoCheck {

    optionsModel: number[];
    myOptions: IMultiSelectOption[];

    @Input() value: string | number;
    @Input() rowData: any;
    _oldDateString: string;

    constructor(private multiselectViewService: MultiselectViewService) {
        super();
        this.myOptions = this.multiselectViewService.myOptions;
    }

    ngDoCheck() {

    }
    onChange() {
        this.cell.newValue = this.optionsModel.toString();
    }
}