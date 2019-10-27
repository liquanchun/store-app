import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { AuthGuard } from '../../providers/guard.service';
import { BaseDataComponent } from './basedata.component';
import { DicComponent } from './dic/dic.component';
import { PartsItemComponent } from './partsitem/partsitem.component';
const routes: Routes = [
  {
    path: '',
    component: BaseDataComponent,
    children: [
      { path: 'form/:id', component: FormComponent, canActivate: [AuthGuard] },
      { path: 'dic', component: DicComponent },
      { path: 'partsitem', component: PartsItemComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
