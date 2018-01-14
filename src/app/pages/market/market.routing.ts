import { Routes, RouterModule } from '@angular/router';

import { MarketComponent } from './market.component';
import { BookComponent } from './book/book.component';
import { MemberComponent } from './member/member.component';
import { CustomerComponent } from './customer/customer.component';

const routes: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      { path: 'book', component: BookComponent },
      { path: 'member', component: MemberComponent },
      { path: 'customer', component: CustomerComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
