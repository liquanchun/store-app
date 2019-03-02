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

import { routing } from './report.routing';
import { ReportComponent } from './report.component';
import { DepartmentOutComponent } from './departmentout/departmentout.component';
import { PersonoutComponent } from './personout/personout.component';
import { StorelistComponent } from './storelist/storelist.component';
import { SalelistComponent } from './salelist/salelist.component';
import { SalecountComponent } from './salecount/salecount.component';
import { SaledailyComponent } from './saledaily/saledaily.component';
import { PartslistComponent } from './partslist/partslist.component';
import { ToastyModule } from 'ng2-toasty';
import { SysModule } from './../sys/sys.module';

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
    SysModule,
    Ng2SmartTableModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    ReportComponent,
    DepartmentOutComponent,
    PersonoutComponent,
    StorelistComponent,
    SalelistComponent,
    SalecountComponent,
    SaledailyComponent,
    PartslistComponent
  ],
  providers: [GlobalState, Config, HttpService, AppState,Common]
})
export class ReportModule {}