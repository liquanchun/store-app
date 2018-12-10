import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';
import { DepartmentOutComponent } from './departmentout/departmentout.component';
import { PersonoutComponent } from './personout/personout.component';
import { StorelistComponent } from './storelist/storelist.component';
import { SalelistComponent } from './salelist/salelist.component';
import { SalecountComponent } from './salecount/salecount.component';
const routes: Routes = [
  {
    path: '',
    component: ReportComponent,
    children: [
      { path: 'department', component: DepartmentOutComponent },
      { path: 'person', component: PersonoutComponent },
      { path: 'storelist', component: StorelistComponent },
      { path: 'salelist', component: SalelistComponent },
      { path: 'salecount', component: SalecountComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
