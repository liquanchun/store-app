import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
import { MarketComponent } from './market.component';
const routes: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      { path: 'form/:id', component: FormComponent,canActivate:[AuthGuard]},
    ]
  }
];

export const routing = RouterModule.forChild(routes);
