import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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

import { ToastyModule } from 'ng2-toasty';
import { TreeModule } from 'angular-tree-component';
import { LoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';
import { AuthGuard } from '../../providers/guard.service';
import { routing } from './basedata.routing';
import { BaseDataComponent } from './basedata.component';
import { FormComponent } from './form/form.component';
import { PartsComponent } from './parts/parts.component';
import { PartsComboComponent } from './partscombo/partscombo.component';
import { PartsItemComponent } from './partsitem/partsitem.component';
import { DicComponent } from './dic/dic.component';
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
    LoadingModule,
    Ng2SmartTableModule,
    ToastyModule.forRoot(),
    NgbModule.forRoot()
  ],
  declarations: [BaseDataComponent, FormComponent, DicComponent, PartsComponent, PartsComboComponent, PartsItemComponent],
  providers: [GlobalState, Config, HttpService, AppState, AuthGuard, Common]
})
export class BaseDataModule {}
