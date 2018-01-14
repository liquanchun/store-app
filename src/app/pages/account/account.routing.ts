import { Routes, RouterModule } from '@angular/router';

import { AccountComponent } from './account.component';
import { CusaccountComponent } from './cusaccount/cusaccount.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { PreauthComponent } from './preauth/preauth.component';
import { PremoneyComponent } from './premoney/premoney.component';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      { path: 'cusacc', component: CusaccountComponent },
      { path: 'invoice', component: InvoiceComponent },
      { path: 'preauth', component: PreauthComponent },
      { path: 'premoney', component: PremoneyComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
