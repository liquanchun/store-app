import { Routes, RouterModule } from '@angular/router';

import { HouseComponent } from './house.component';
import { CleanComponent } from './clean/clean.component';
import { CusgoodsComponent } from './cusgoods/cusgoods.component';
import { HouseinfoComponent } from './houseinfo/houseinfo.component';
import { HousestateComponent } from './housestate/housestate.component';
import { RepairComponent } from './repair/repair.component';
import { StatelogComponent } from './statelog/statelog.component';

const routes: Routes = [
  {
    path: '',
    component: HouseComponent,
    children: [
      { path: 'houseclean', component: CleanComponent },
      { path: 'cusgoods', component: CusgoodsComponent },
      { path: 'info', component: HouseinfoComponent },
      { path: 'housestate', component: HousestateComponent },
      { path: 'repair', component: RepairComponent },
      { path: 'statelog', component: StatelogComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
