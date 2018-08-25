import { Routes, RouterModule } from '@angular/router';

import { MarketComponent } from './market.component';
const routes: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
    ]
  }
];

export const routing = RouterModule.forChild(routes);
