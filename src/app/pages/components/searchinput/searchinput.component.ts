import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';

import { ViewCell, Cell, DefaultEditor, Editor } from 'ng2-smart-table';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalState } from '../../../global.state';
import * as _ from 'lodash';
@Component({
    selector: 'search-input',
    template: `
    <div class="input-group" style="height:32px;">
        <input #search type="text" [(value)]="searchValue" style="padding:3px;" class="form-control searchinput" (keydown.enter)="onSearch(search.value)" placeholder="Search for..." aria-label="Search for...">
        <span class="input-group-btn btn-group">
            <button class="btn btn-secondary" (click)="onSearch(search.value)" type="button"><i class="fa fa-search" aria-hidden="true"></i> 查询</button>
        </span>
    </div>
  `
})

export class SearchInputComponent {

    @Output()
    searchClick = new EventEmitter();

    searchValue = '';

    constructor(private _state: GlobalState) {
        this._state.subscribe("newurl", (d) => {
            this.searchValue = '';
        })
    }

    @Input()
    set defaultValue(value: string) {
        console.log('searchValue' + value);
        this.searchValue = value;
    }
    get defaultValue(): string { return this.searchValue; }

    onSearch(value) {
        this.searchClick.emit(value);
    }
}