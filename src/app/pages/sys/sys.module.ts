import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../theme/nga.module';
import { DynamicFormModule } from '../../theme/components/dynamic-form/dynamic-form.module';

import { DashboardModule } from '../../pages/dashboard/dashboard.module';

import { routing } from './sys.routing';

import { UserInfoComponent } from './userinfo/userinfo.component';
import { SysComponent } from './sys.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';
import { OrgUserComponent } from './org-user/org-user.component';
import { SetGroupComponent } from './set-group/set-group.component';
import { SetAgentComponent } from './set-agent/set-agent.component';
import { FieldRoleComponent } from './field-role/field-role.component';

import { FunctionComponent } from './components/function/function.component';
import { MenuComponent } from './components/menu/menu.component';
import { OrgComponent } from './components/org/org.component';
import { RoleComponent } from './components/role/role.component';
import { UserComponent } from './components/user/user.component';
import { SelectUserComponent } from './components/selectuser/selectuser.component';
import { FormComponent } from './form/form.component';

import { Config } from '../../providers/config';
import { GlobalState } from '../../global.state';
import { AppState } from '../../app.service';
import { HttpService } from '../../providers/httpClient';
import { Common } from '../../providers/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { TreeModule } from 'angular-tree-component';
import { LoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';
import { AuthGuard } from '../../providers/guard.service';
import { ToastyModule } from 'ng2-toasty';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgaModule,
    routing,
    DynamicFormModule,
    MultiselectDropdownModule,
    TreeModule,
    ComponentsModule,
    NgbModule,
    LoadingModule,
    DashboardModule,
    Ng2SmartTableModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    SysComponent,
    UserRoleComponent,
    RoleMenuComponent,
    FunctionComponent,
    MenuComponent,
    OrgComponent,
    RoleComponent,
    UserComponent,
    OrgUserComponent,
    SelectUserComponent,
    SetGroupComponent,
    SetAgentComponent,
    UserInfoComponent,
    FieldRoleComponent,
    FormComponent
  ],
  exports: [OrgComponent],
  providers: [GlobalState, Config, HttpService, AppState, Common, AuthGuard]
})
export class SysModule {}
