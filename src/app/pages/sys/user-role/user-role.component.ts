import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { RoleComponent } from '../components/role/role.component';
import { UserComponent } from '../components/user/user.component';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
})
export class UserRoleComponent implements OnInit, AfterViewInit {

  constructor(
  ) {
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }
  onMessage(event) {
  }
}
