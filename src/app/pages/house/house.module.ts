import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { NgaModule } from '../../theme/nga.module';
import { DynamicFormModule } from '../../theme/components/dynamic-form/dynamic-form.module';

import { Config } from '../../providers/config';
import { GlobalState } from '../../global.state';
import { AppState } from '../../app.service';
import { HttpService } from '../../providers/httpClient';
import { Common } from '../../providers/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { TreeModule } from 'angular-tree-component';
import { LoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';

import { routing } from './house.routing';
import { HouseComponent } from './house.component';
import { CleanComponent } from './clean/clean.component';
import { CusgoodsComponent } from './cusgoods/cusgoods.component';
import { HouseinfoComponent } from './houseinfo/houseinfo.component';
import { HousestateComponent } from './housestate/housestate.component';
import { RepairComponent } from './repair/repair.component';
import { StatelogComponent } from './statelog/statelog.component';
import { ButtonViewComponent } from './cusgoods/buttonview.component';
import {ToastyModule} from 'ng2-toasty';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgaModule,
    routing,
    DynamicFormModule,
    MultiselectDropdownModule,
    TreeModule,
    ComponentsModule,
    NgbModule,
    LoadingModule,
    Ng2SmartTableModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    HouseComponent,
    CleanComponent,
    CusgoodsComponent,
    HouseinfoComponent,
    HousestateComponent,
    RepairComponent,
    StatelogComponent,
    ButtonViewComponent,
  ],
  entryComponents: [ButtonViewComponent],
  providers: [GlobalState, Config, HttpService, AppState,Common]
})
export class HouseModule {}