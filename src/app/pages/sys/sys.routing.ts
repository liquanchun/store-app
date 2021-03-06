import { Routes, RouterModule } from '@angular/router';

import { UserRoleComponent } from './user-role/user-role.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';
import { OrgUserComponent } from './org-user/org-user.component';
import { SysComponent } from './sys.component';
import { SetGroupComponent } from './set-group/set-group.component';
import { SetAgentComponent } from './set-agent/set-agent.component';
import { UserInfoComponent } from './userinfo/userinfo.component';
import { FieldRoleComponent } from './field-role/field-role.component';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: SysComponent,
    children: [
      { path: 'form/:id', component: FormComponent, canActivate: [AuthGuard] },
      { path: 'field-role', component: FieldRoleComponent },
      { path: 'user-role', component: UserRoleComponent },
      { path: 'role-menu', component: RoleMenuComponent },
      { path: 'org-user', component: OrgUserComponent },
      { path: 'set-group', component: SetGroupComponent },
      { path: 'set-agent', component: SetAgentComponent },
      { path: 'userinfo', component: UserInfoComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
