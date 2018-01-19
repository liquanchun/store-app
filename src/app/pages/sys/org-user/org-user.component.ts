import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
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

  private toastOptions: ToastOptions = {
    title: "提示信息",
    msg: "The message",
    showClose: true,
    timeout: 2000,
    theme: "bootstrap",
  };

  constructor(private orgService: OrgService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private _state: GlobalState,
  ) {
    this.toastyConfig.position = 'top-center';
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
    this.toastOptions.msg = event.msg;
    if (event.type == 'warning') {
      this.toastyService.warning(this.toastOptions);
    }
    if (event.type == 'success') {
      this.toastyService.success(this.toastOptions);
    }
    if (event.type == 'error') {
      this.toastyService.error(this.toastOptions);
    }
  }
  selectedUser(user) {
    // if (user.isChecked) {
    //   this.orgService.createOrg(this.orgId, user.id);
    // } else {
    //   this.orgService.deleteOrg(this.orgId, user.id);
    // }
  }
}
