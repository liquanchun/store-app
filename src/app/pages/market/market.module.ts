import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { Select2Module } from 'ng2-select2';
import { NgaModule } from '../../theme/nga.module';
import { DynamicFormModule } from '../../theme/components/dynamic-form/dynamic-form.module';

import { Config } from '../../providers/config';
import { GlobalState } from '../../global.state';
import { AppState } from '../../app.service';
import { HttpService } from '../../providers/httpClient';
import { Common } from '../../providers/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { ToastyModule } from 'ng2-toasty';
import { TreeModule } from 'angular-tree-component';
import { LoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';
import { AuthGuard } from '../../providers/guard.service';
import { routing } from './market.routing';
import { MarketComponent } from './market.component';
import { CarstoreComponent } from './carstore/carstore.component';
import { FormComponent } from './form/form.component';
import { EditFormComponent } from './editform/editform.component';
import { ShowFormComponent } from './showform/showform.component';
import { SearchFormComponent } from './searchform/searchform.component';
import { CarstoreNewComponent } from './carstorenew/carstorenew.component';
import { CarsaleComponent } from './carsale/carsale.component';
import { CarSaleNewComponent } from './carsalenew/carsalenew.component';

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
    Select2Module,
    Ng2SmartTableModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    MarketComponent,
    FormComponent,
    CarstoreComponent,
    EditFormComponent,
    CarstoreNewComponent,
    ShowFormComponent,
    SearchFormComponent,
    CarsaleComponent,
    CarSaleNewComponent,
  ],
  providers: [GlobalState, Config, HttpService, AppState, AuthGuard, Common]
})
export class MarketModule { }