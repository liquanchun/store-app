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

import { routing } from './account.routing';
import { AccountComponent } from './account.component';
import { CusaccountComponent } from './cusaccount/cusaccount.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { PreauthComponent } from './preauth/preauth.component';
import { PremoneyComponent } from './premoney/premoney.component';

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
  ],
  declarations: [
    AccountComponent,
    CusaccountComponent,
    InvoiceComponent,
    PreauthComponent,
    PremoneyComponent,
  ],
  providers: [GlobalState, Config, HttpService, AppState,Common]
})
export class AccountModule {}