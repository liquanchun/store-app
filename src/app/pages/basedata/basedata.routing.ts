import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
import { BaseDataComponent } from './basedata.component';
const routes: Routes = [
  {
    path: '',
    component: BaseDataComponent,
    children: [
      { path: 'form/:id', component: FormComponent,canActivate:[AuthGuard]},
    ]
  }
];

export const routing = RouterModule.forChild(routes);