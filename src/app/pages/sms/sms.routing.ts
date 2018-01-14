import { Routes, RouterModule } from '@angular/router';

import { SmsComponent } from './sms.component';
import { SendrecordComponent } from './sendrecord/sendrecord.component';
import { SendsetComponent } from './sendset/sendset.component';
import { TemplateComponent } from './template/template.component';
const routes: Routes = [
  {
    path: '',
    component: SmsComponent,
    children: [
      { path: 'sendrecord', component: SendrecordComponent },
      { path: 'sendset', component: SendsetComponent },
      { path: 'template', component: TemplateComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
