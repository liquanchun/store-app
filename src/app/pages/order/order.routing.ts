import { Routes, RouterModule } from '@angular/router';

import { OrderComponent } from './order.component';
import { OrderlistComponent } from './list/orderlist.component';

const routes: Routes = [
  {
    path: '',
    component: OrderComponent,
    children: [
      { path: 'orderlist', component: OrderlistComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
