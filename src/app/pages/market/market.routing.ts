import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
import { MarketComponent } from './market.component';
import { CarstoreComponent } from './carstore/carstore.component';
import { CarstoreNewComponent } from './carstorenew/carstorenew.component';
import { CarsaleComponent } from './carsale/carsale.component';
import { CarSaleNewComponent } from './carsalenew/carsalenew.component';
import { CarSaleBookComponent } from './carsalebook/carsalebook.component';
import { CarSaleCashComponent } from './carsalecash/carsalecash.component';
import { CarSaleCashNewComponent } from './carsalecashnew/carsalecashnew.component';
const routes: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      { path: 'form/:id', component: FormComponent,canActivate:[AuthGuard]},
      { path: 'carstore', component: CarstoreComponent},
      { path: 'carstorenew/:id', component: CarstoreNewComponent},
      { path: 'carsale', component: CarsaleComponent},
      { path: 'carsalenew/:id', component: CarSaleNewComponent},
      { path: 'carsalecash', component: CarSaleCashComponent},
      { path: 'carsalecashnew/:id', component: CarSaleCashNewComponent},
      { path: 'carsalebook', component: CarSaleBookComponent},
    ]
  }
];

export const routing = RouterModule.forChild(routes);
