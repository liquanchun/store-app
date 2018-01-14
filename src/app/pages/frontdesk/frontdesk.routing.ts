import { Routes, RouterModule } from '@angular/router';

import { FrontdeskComponent } from './frontdesk.component';
import { ChangworkComponent } from './changwork/changwork.component';
import { CheckinComponent } from './checkin/checkin.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CouponComponent } from './coupon/coupon.component';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [
  {
    path: '',
    component: FrontdeskComponent,
    children: [
      { path: 'changwork', component: ChangworkComponent },
      { path: 'checkin/:code', component: CheckinComponent },
      { path: 'checkin', component: CheckinComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'checkout/:code', component: CheckoutComponent },
      { path: 'coupon', component: CouponComponent },
      { path: 'schedule', component: ScheduleComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
