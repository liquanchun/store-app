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
import { FileUploadModule } from 'ng2-file-upload';

import { TreeModule } from 'angular-tree-component';
import { LoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';
import { StoreinPrintComponent } from './storein/storeinprint.component';
import { StoreoutPrintComponent } from './storeout/storeioutprint.component';

import { routing } from './store.routing';
import { StoreComponent } from './store.component';
import { AdddelComponent } from './adddel/adddel.component';
import { GoodsComponent } from './goods/Goods.component';
import { GoodsstoreComponent } from './goodsstore/Goodsstore.component';
import { StoreexcComponent } from './storeexc/Storeexc.component';
import { StoreinComponent } from './storein/Storein.component';
import { StoreoutComponent } from './storeout/Storeout.component';
import { SupplierComponent } from './supplier/Supplier.component';
import { StoreinNewComponent } from './storein/storeinnew/storeinnew.component';
import { StoreoutNewComponent } from './storeout/storeoutnew/storeoutnew.component';
import { GoodsNewComponent } from './goods/goodsnew/goodsnew.component';
import { CustomEditorComponent } from './goods/custom-editor.component';
import { SysModule } from './../sys/sys.module';
import { ToastyModule } from 'ng2-toasty';
@NgModule({
  imports: [
    CommonModule,
    FileUploadModule,
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
    SysModule,
    ToastyModule.forRoot()
  ],
  declarations: [
    StoreComponent,
    AdddelComponent,
    GoodsComponent,
    GoodsstoreComponent,
    StoreexcComponent,
    StoreinComponent,
    StoreoutComponent,
    SupplierComponent,
    StoreinNewComponent,
    StoreoutNewComponent,
    StoreinPrintComponent,
    StoreoutPrintComponent,
    CustomEditorComponent,
    GoodsNewComponent
  ],
  entryComponents: [StoreinPrintComponent, StoreoutPrintComponent,CustomEditorComponent],
  providers: [GlobalState, Config, HttpService, AppState, Common]
})
export class StoreModule { }