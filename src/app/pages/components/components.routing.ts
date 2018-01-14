import { Routes, RouterModule }  from '@angular/router';

import { Components } from './components.component';
import { TreeView } from './components/treeView/treeView.component';
import { CardRenderComponent } from './cardRender/cardRender.component';
import { HouseTypeRenderComponent } from './houseTypeRender/houseType.component';
import { DateTimeComponent } from './dateTimeRender/dateTimeRender.component';
import { DatepickerViewComponent } from './datepickerView/datepickerView.component';
import { MultiselectViewComponent } from './multiselectView/multiselectView.component';
import { DateQueryComponent } from './datequery/datequery.component';
import { SearchInputComponent } from './searchinput/searchinput.component';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Components,
    children: [
      { path: 'treeview', component: TreeView },
      { path: 'cardrender', component: CardRenderComponent },
      { path: 'housetyperender', component: HouseTypeRenderComponent },
      { path: 'datetimerender', component: DateTimeComponent },
      { path: 'datepickerview', component: DatepickerViewComponent },
      { path: 'multiselect-dropdown-component', component: DatepickerViewComponent },
      { path: 'datequery', component: DateQueryComponent },
      { path: 'searchinput', component: SearchInputComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
