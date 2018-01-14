import { Routes, RouterModule } from '@angular/router';

import { UserRoleComponent } from './user-role/user-role.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';
import { OrgUserComponent } from './org-user/org-user.component';
import { DicComponent } from './dic/dic.component';
import { HouseTypeComponent } from './house-type/house-type.component';
import { HouseFeeComponent } from './house-fee/house-fee.component';
import { MemberComponent } from './member/member.component';
import { SysComponent } from './sys.component';
import { SetGroupComponent } from './set-group/set-group.component';
import { SetAgentComponent } from './set-agent/set-agent.component';
import { SetPaytypeComponent } from './set-paytype/set-paytype.component';
import { UserInfoComponent } from './userinfo/userinfo.component';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: SysComponent,
    children: [
      { path: 'user-role', component: UserRoleComponent },
      { path: 'role-menu', component: RoleMenuComponent },
      { path: 'org-user', component: OrgUserComponent },
      { path: 'dic', component: DicComponent },
      { path: 'house-type', component: HouseTypeComponent },
      { path: 'house-fee', component: HouseFeeComponent },
      { path: 'member', component: MemberComponent },
      { path: 'set-group', component: SetGroupComponent },
      { path: 'set-agent', component: SetAgentComponent },
      { path: 'set-paytype', component: SetPaytypeComponent },
      { path: 'userinfo', component: UserInfoComponent },
    ]
  },
];

export const routing = RouterModule.forChild(routes);
