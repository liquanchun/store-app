import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TreeModule } from 'ng2-tree';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { routing } from './components.routing';
import { Components } from './components.component';
import { TreeView } from './components/treeView/treeView.component';
import { CardRenderComponent } from './cardRender/cardRender.component';
import { HouseTypeRenderComponent } from './houseTypeRender/houseType.component';
import { DateTimeComponent } from './dateTimeRender/dateTimeRender.component';
import { DatepickerViewComponent } from './datepickerView/datepickerView.component';
import { MultiselectViewComponent } from './multiselectView/multiselectView.component';
import { DateQueryComponent } from './datequery/datequery.component';
import { SearchInputComponent } from './searchinput/searchinput.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    NgbModule,
    TreeModule,
    MultiselectDropdownModule,
    routing
  ],
  entryComponents: [DatepickerViewComponent, MultiselectViewComponent],
  declarations: [
    Components,
    TreeView,
    CardRenderComponent,
    HouseTypeRenderComponent,
    DateTimeComponent,
    DatepickerViewComponent,
    MultiselectViewComponent,
    DateQueryComponent,
    SearchInputComponent
  ],
  exports: [CardRenderComponent,
    HouseTypeRenderComponent,
    DateTimeComponent,
    MultiselectViewComponent,
    DatepickerViewComponent,
    DateQueryComponent,
    SearchInputComponent
  ]
})
export class ComponentsModule { }
