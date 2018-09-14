import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
import { MarketComponent } from './market.component';
import { CarstoreComponent } from './carstore/carstore.component';
import { CarstoreNewComponent } from './carstorenew/carstorenew.component';
import { CarsaleComponent } from './carsale/carsale.component';
const routes: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      { path: 'form/:id', component: FormComponent,canActivate:[AuthGuard]},
      { path: 'carstore', component: CarstoreComponent},
      { path: 'carstorenew/:id', component: CarstoreNewComponent},
      { path: 'carsale', component: CarsaleComponent},
    ]
  }
];

export const routing = RouterModule.forChild(routes);
