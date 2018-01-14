import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GlobalState } from '../../global.state';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'order',
  template: `<router-outlet></router-outlet>`,
})
export class OrderComponent implements OnInit {
  constructor(private _state: GlobalState) {
  }

  ngOnInit() {
  }
}