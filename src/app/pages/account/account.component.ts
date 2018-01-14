import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GlobalState } from '../../global.state';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'account',
  template: `<router-outlet></router-outlet>`,
})
export class AccountComponent implements OnInit {
  constructor(private _state: GlobalState) {
  }

  ngOnInit() {
  }
}