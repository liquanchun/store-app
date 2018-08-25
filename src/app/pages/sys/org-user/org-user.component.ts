import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { BaThemeConfigProvider } from '../../../theme';
import { OrgComponent } from '../components/org/org.component';
import { UserComponent } from '../components/user/user.component';
import { OrgService } from '../components/org/org.services';
import { GlobalState } from '../../../global.state';
@Component({
  selector: 'app-org-user',
  templateUrl: './org-user.component.html',
  styleUrls: ['./org-user.component.scss'],
  providers: [OrgService],
})
export class OrgUserComponent implements OnInit, AfterViewInit {
  private orgId: number;

  constructor(private orgService: OrgService,
    private _state: GlobalState,
  ) {
    const that = this;
    this._state.subscribe('org.selectedChanged', (org) => {
      if (org && org.data) {
        that.orgId = org.data.id;
      }
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }
  onMessage(event) {
  }
  selectedUser(user) {

  }
}
